// lib/erp/data.js
// Client-side Firestore/Storage helpers for the ERP modules (Super Admin only —
// firestore.rules / storage.rules gate every erp_* path to Super Admin).

import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, writeBatch, serverTimestamp,
} from "firebase/firestore";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { col } from "./schema";

// Small in-memory cache so ref dropdowns and label lookups don't refetch the same
// collection for every table render. Any write to a collection invalidates it.
const cache = new Map();

export function invalidate(key) { cache.delete(key); }

// The dashboard renders from the localStorage session immediately, but Firebase Auth
// restores its login asynchronously after a page load. Reads sent before that go out
// unauthenticated and the erp_* rules refuse them — which looked like "no data".
// Every call waits for Auth first, and a missing/expired login gets a clear error.
export class SessionError extends Error {}
export async function ready() {
  await auth.authStateReady();
  if (!auth.currentUser) throw new SessionError("Your session has expired — please log out and sign in again.");
}
function explain(e) {
  if (e instanceof SessionError) return e;
  if (e?.code === "permission-denied") return new Error("Permission denied — this account is not a Super Admin, or the database rules are out of date.");
  return e;
}
async function guarded(fn) {
  await ready();
  try { return await fn(); } catch (e) { throw explain(e); }
}

export async function listAll(key, { force = false } = {}) {
  if (!force && cache.has(key)) return cache.get(key);
  const rows = await guarded(async () => (await getDocs(collection(db, col(key)))).docs.map(d => ({ id: d.id, ...d.data() })));
  cache.set(key, rows);
  return rows;
}

export async function listWhere(key, field, op, value) {
  return guarded(async () => (await getDocs(query(collection(db, col(key)), where(field, op, value)))).docs.map(d => ({ id: d.id, ...d.data() })));
}

export async function getOne(key, id) {
  return guarded(async () => { const snap = await getDoc(doc(db, col(key), id)); return snap.exists() ? { id: snap.id, ...snap.data() } : null; });
}

// Audit trail (legacy "Audit Trail Report"): every insert/update/delete made through
// the ERP is recorded in erp_audit_log. Best-effort — never blocks or fails the write.
const NOT_AUDITED = new Set(["audit_log", "user_log", "settings"]);
function audit(action, key, id) {
  if (NOT_AUDITED.has(key)) return;
  const user = auth.currentUser?.email || "unknown";
  const verb = { Insert: "New Record inserted On", Update: "Record updated On", Delete: "Record deleted On" }[action];
  addDoc(collection(db, col("audit_log")), {
    message: `${verb} ${key.replace(/_/g, " ")} id ${id}`, user, action,
    platform: typeof navigator !== "undefined" ? navigator.platform : "", agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 160) : "",
    at: new Date().toLocaleString("tr-TR"), createdAt: serverTimestamp(),
  }).catch(() => {});
  invalidate("audit_log");
}

export async function createRow(key, data) {
  invalidate(key);
  const res = await guarded(() => addDoc(collection(db, col(key)), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  audit("Insert", key, res.id);
  return res.id;
}

export async function setRow(key, id, data, { merge = true } = {}) {
  invalidate(key);
  await guarded(() => setDoc(doc(db, col(key), id), { ...data, updatedAt: serverTimestamp() }, { merge }));
  audit("Update", key, id);
  return id;
}

export async function updateRow(key, id, data) {
  invalidate(key);
  await guarded(() => updateDoc(doc(db, col(key), id), { ...data, updatedAt: serverTimestamp() }));
  audit("Update", key, id);
}

export async function deleteRow(key, id) {
  invalidate(key);
  await guarded(() => deleteDoc(doc(db, col(key), id)));
  audit("Delete", key, id);
}

/** Writes many docs with fixed ids in chunks of 400 (Firestore batch limit is 500). */
export async function bulkSet(key, rows, onProgress) {
  invalidate(key);
  await ready();
  for (let i = 0; i < rows.length; i += 400) {
    const batch = writeBatch(db);
    for (const { id, ...data } of rows.slice(i, i + 400)) {
      batch.set(doc(db, col(key), id), data, { merge: true });
    }
    await batch.commit();
    onProgress?.(Math.min(i + 400, rows.length), rows.length);
  }
}

export async function bulkDelete(key, ids) {
  invalidate(key);
  await ready();
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db);
    for (const id of ids.slice(i, i + 400)) batch.delete(doc(db, col(key), id));
    await batch.commit();
  }
}

// Settings singletons live in erp_settings/{key}.
export async function getSettings(key) {
  return guarded(async () => { const snap = await getDoc(doc(db, col("settings"), key)); return snap.exists() ? snap.data() : {}; });
}

export async function saveSettings(key, data) {
  await guarded(() => setDoc(doc(db, col("settings"), key), { ...data, updatedAt: serverTimestamp() }, { merge: true }));
}

const MAX_UPLOAD = 10 * 1024 * 1024;

/** Uploads an ERP attachment to Storage at erp/{folder}/{timestamp}-{name}; returns {url, name, path}. */
export async function uploadErpFile(folder, file) {
  if (file.size > MAX_UPLOAD) throw new Error("File must be smaller than 10MB.");
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `erp/${folder}/${Date.now()}-${safeName}`;
  await ready();
  const r = sref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "application/octet-stream" });
  return { url: await getDownloadURL(r), name: file.name, path };
}

/** Random lowercase hex verification code, same shape as the legacy codes (15 chars). */
export function newVerificationCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("").slice(0, 15);
}

export function fullName(s) {
  return [s?.firstName, s?.lastName].filter(Boolean).join(" ").trim() || s?.fullName || "";
}
