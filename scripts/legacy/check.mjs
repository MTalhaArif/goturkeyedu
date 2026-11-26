#!/usr/bin/env node
// Read-only health check of the migrated ERP data (Admin SDK, .env.local credentials).
//   node scripts/legacy/check.mjs [searchName]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const env = {};
for (const m of fs.readFileSync(path.join(root, ".env.local"), "utf8").matchAll(/^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\r\n]*)/gm)) {
  let v = m[2].trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); env[m[1]] = v;
}
initializeApp({ credential: env.FIREBASE_SERVICE_ACCOUNT_JSON ? cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON)) : cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: String(env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") }) });
const db = getFirestore();
console.log("project:", env.FIREBASE_PROJECT_ID || "(from JSON)", "| client config project:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
for (const c of ["erp_students", "erp_documents", "erp_classes", "erp_sections", "erp_categories", "erp_fee_payments"]) {
  console.log(c.padEnd(20), (await db.collection(c).count().get()).data().count);
}
const name = (process.argv[2] || "KHALIL").toUpperCase();
const snap = await db.collection("erp_students").get();
const hits = snap.docs.filter(d => String(d.data().fullName || "").toUpperCase().includes(name)).slice(0, 3);
for (const d of hits) { const { legacy, ...x } = d.data(); console.log("\n", d.id, JSON.stringify(x).slice(0, 900)); }
const admins = await db.collection("users").where("role", "==", "super_admin").get();
for (const a of admins.docs) {
  let email = a.data().email;
  try { email = (await getAuth().getUser(a.id)).email; } catch {}
  console.log("\nsuper_admin profile:", a.id, email, "status:", a.data().status || "(none)");
}
