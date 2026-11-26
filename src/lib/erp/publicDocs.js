// lib/erp/publicDocs.js — server-only lookup for the public verification pages.
// Uses the Admin SDK: erp_* collections are not readable by anonymous clients.
import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";

const CODE_RE = /^[0-9a-f]{6,64}$/i;
const TYPE_RE = /^\d{1,5}$/;

export async function findDocument(code, type) {
  if (!CODE_RE.test(code || "") || !TYPE_RE.test(type || "")) return null;
  const snap = await adminDb.collection("erp_documents").doc(`${code.toLowerCase()}_${type}`).get();
  if (!snap.exists) return null;
  const d = snap.data();
  // Only what the rendered document needs — never the internal student id etc.
  return { code: d.code, type: d.type, content: d.content || {} };
}

export async function findTypesForCode(code) {
  if (!CODE_RE.test(code || "")) return [];
  const snap = await adminDb.collection("erp_documents").where("code", "==", code.toLowerCase()).limit(10).get();
  return snap.docs.map(d => d.data().type);
}

export async function publicSettings() {
  const snap = await adminDb.collection("erp_settings").doc("general").get();
  const s = snap.exists ? snap.data() : {};
  const pick = ["schoolName", "address", "website", "email", "gsm", "documentNotice", "documentNoticeTr", "headerLogoLeft", "headerLogoCenter", "headerLogoRight"];
  return Object.fromEntries(pick.filter(k => s[k] != null).map(k => [k, s[k]]));
}
