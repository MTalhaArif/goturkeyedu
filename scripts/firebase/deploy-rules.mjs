#!/usr/bin/env node
// Publishes firestore.rules and storage.rules with the Firebase Admin SDK (no
// interactive `firebase login` needed). Credentials come from .env.local exactly as
// the app reads them (FIREBASE_SERVICE_ACCOUNT_JSON or the three FIREBASE_* vars) and
// are only held in memory. The currently live rulesets are saved to
// rules-backup/<timestamp>/ first so a release can be reverted.
//
//   node scripts/firebase/deploy-rules.mjs            # backup + deploy both
//   node scripts/firebase/deploy-rules.mjs --dry-run  # backup + compile check only

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  const text = fs.readFileSync(file, "utf8");
  const re = /^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\r\n]*)/gm;
  for (const m of text.matchAll(re)) {
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = { ...loadEnv(path.join(root, ".env.local")), ...process.env };
let credential;
if (env.FIREBASE_SERVICE_ACCOUNT_JSON) credential = cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON));
else credential = cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: String(env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") });
const bucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
initializeApp({ credential, storageBucket: bucket });
const rules = getSecurityRules();

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = path.join(root, "rules-backup", stamp);
fs.mkdirSync(backupDir, { recursive: true });
try {
  const live = await rules.getFirestoreRuleset();
  fs.writeFileSync(path.join(backupDir, "firestore.rules"), live.source.map(s => s.content).join("\n"));
  console.log(`backed up live Firestore rules (${live.name}) → ${path.relative(root, backupDir)}`);
} catch (e) { console.log("no live Firestore ruleset to back up:", e.message); }
try {
  const live = await rules.getStorageRuleset(bucket);
  fs.writeFileSync(path.join(backupDir, "storage.rules"), live.source.map(s => s.content).join("\n"));
  console.log(`backed up live Storage rules (${live.name})`);
} catch (e) { console.log("no live Storage ruleset to back up:", e.message); }

const fsSrc = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const stSrc = fs.readFileSync(path.join(root, "storage.rules"), "utf8");
if (dryRun) {
  // createRuleset compiles the source server-side and fails on syntax errors.
  const a = await rules.createRuleset({ name: "firestore.rules", content: fsSrc });
  const b = await rules.createRuleset({ name: "storage.rules", content: stSrc });
  console.log(`compiled OK (not released): ${a.name}, ${b.name}`);
} else {
  const f = await rules.releaseFirestoreRulesetFromSource(fsSrc);
  console.log(`released Firestore rules: ${f.name}`);
  const s = await rules.releaseStorageRulesetFromSource(stSrc, bucket);
  console.log(`released Storage rules (${bucket}): ${s.name}`);
}
