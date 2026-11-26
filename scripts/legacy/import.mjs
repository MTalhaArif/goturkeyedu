#!/usr/bin/env node
// Server-side equivalent of System Settings → Legacy Data Import, using the Admin SDK
// (credentials from .env.local, held in memory only). Re-runnable: records keep their
// legacy ids and are merged, settings fields an admin already filled are kept.
//
//   node scripts/legacy/import.mjs "<extraction>/legacy-import.json" ["<extraction>/full/files"]

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const [importPath, filesDir] = process.argv.slice(2);
if (!importPath || !fs.existsSync(importPath)) { console.error('usage: node scripts/legacy/import.mjs "<legacy-import.json>" ["<files dir>"]'); process.exit(1); }

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const m of fs.readFileSync(file, "utf8").matchAll(/^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\r\n]*)/gm)) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}
const env = { ...loadEnv(path.join(root, ".env.local")), ...process.env };
const credential = env.FIREBASE_SERVICE_ACCOUNT_JSON ? cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: String(env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") });
const bucketName = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
initializeApp({ credential, storageBucket: bucketName });
const db = getFirestore();
const bucket = getStorage().bucket();

const data = JSON.parse(fs.readFileSync(importPath, "utf8"));
const legacyBase = data.legacyBase || "https://goturkey.gen.tr";

// 1) Files → Storage at legacy/<path>, public via a download token (same as getDownloadURL).
const mapDoc = db.collection("erp_settings").doc("legacy_files");
const fileMap = (await mapDoc.get()).data()?.map || {};
const CT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", pdf: "application/pdf" };
if (filesDir && fs.existsSync(filesDir)) {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  let up = 0;
  for (const f of walk(filesDir)) {
    const rel = path.relative(filesDir, f).split(path.sep).join("/");
    if (fileMap[rel]) continue;
    const token = crypto.randomUUID();
    const dest = `legacy/${rel}`;
    await bucket.upload(f, { destination: dest, metadata: { contentType: CT[rel.split(".").pop().toLowerCase()] || "application/octet-stream", metadata: { firebaseStorageDownloadTokens: token } } });
    fileMap[rel] = { url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`, name: path.basename(f), path: dest };
    up++;
  }
  await mapDoc.set({ map: fileMap, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`files: ${up} uploaded, ${Object.keys(fileMap).length} mapped`);
}

function resolveFiles(v) {
  if (Array.isArray(v)) return v.map(resolveFiles);
  if (v && typeof v === "object") {
    if (typeof v.legacyPath === "string") {
      const hit = fileMap[v.legacyPath];
      return hit ? { url: hit.url, name: v.name || hit.name, path: hit.path } : { url: `${legacyBase}/${v.legacyPath}`, name: v.name || v.legacyPath.split("/").pop(), legacyPath: v.legacyPath };
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveFiles(x)]));
  }
  if (typeof v === "string" && v.startsWith("legacy:")) return fileMap[v.slice(7)]?.url || `${legacyBase}/${v.slice(7)}`;
  return v;
}

// 2) Collections (batched, merge by legacy id).
for (const [key, rows] of Object.entries(data.collections || {})) {
  for (let i = 0; i < rows.length; i += 400) {
    const batch = db.batch();
    for (const { id, ...rest } of rows.slice(i, i + 400)) {
      batch.set(db.collection(`erp_${key}`).doc(id), { ...resolveFiles(rest), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    await batch.commit();
  }
  console.log(`${key.padEnd(24)} ${rows.length}`);
}

// 3) Settings: add legacy values only where the admin has not set anything.
for (const [key, val] of Object.entries(data.settings || {})) {
  const ref = db.collection("erp_settings").doc(key);
  const existing = (await ref.get()).data() || {};
  const merged = { ...resolveFiles(val) };
  for (const [k, v] of Object.entries(existing)) if (v !== "" && v != null && k !== "updatedAt") merged[k] = v;
  await ref.set({ ...merged, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`settings/${key}`);
}
console.log("import complete");
