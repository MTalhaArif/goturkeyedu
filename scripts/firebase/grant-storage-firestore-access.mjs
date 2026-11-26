#!/usr/bin/env node
// Lets Cloud Storage security rules call firestore.get() (used by storage.rules to
// check the Super Admin role) — the same IAM grant `firebase deploy --only storage`
// offers on first use: roles/firebaserules.firestoreServiceAgent for the project's
// Firebase Storage service agent. Uses the .env.local service account, in memory.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleAuth } from "google-auth-library";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const env = {};
for (const m of fs.readFileSync(path.join(root, ".env.local"), "utf8").matchAll(/^\s*([A-Z0-9_]+)\s*=\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^\r\n]*)/gm)) {
  let v = m[2].trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); env[m[1]] = v;
}
const sa = env.FIREBASE_SERVICE_ACCOUNT_JSON ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : { project_id: env.FIREBASE_PROJECT_ID, client_email: env.FIREBASE_CLIENT_EMAIL, private_key: String(env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") };
const project = sa.project_id;
const auth = new GoogleAuth({ credentials: { client_email: sa.client_email, private_key: sa.private_key }, scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
const client = await auth.getClient();
const crm = `https://cloudresourcemanager.googleapis.com/v1/projects/${project}`;

const { data: proj } = await client.request({ url: crm });
const member = `serviceAccount:service-${proj.projectNumber}@gcp-sa-firebasestorage.iam.gserviceaccount.com`;
const role = "roles/firebaserules.firestoreServiceAgent";
const { data: policy } = await client.request({ url: `${crm}:getIamPolicy`, method: "POST", data: { options: { requestedPolicyVersion: 3 } } });
const binding = (policy.bindings ||= []).find(b => b.role === role);
if (binding?.members?.includes(member)) { console.log("already granted:", role, member); process.exit(0); }
if (binding) binding.members.push(member); else policy.bindings.push({ role, members: [member] });
await client.request({ url: `${crm}:setIamPolicy`, method: "POST", data: { policy } });
console.log("granted", role, "to", member);
