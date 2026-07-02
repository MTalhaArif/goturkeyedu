// lib/firestore.js
// Firestore collection helpers for GoTurkey Platform
// Collections: applications, universities, users, contacts, scholarships

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── COLLECTION NAMES ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  APPLICATIONS:  'applications',
  UNIVERSITIES:  'universities',
  USERS:         'users',
  CONTACTS:      'contacts',
  SCHOLARSHIPS:  'scholarships',
  DOCUMENTS:     'documents',
  NOTIFICATIONS: 'notifications',
};

// ─── GENERIC HELPERS ──────────────────────────────────────────────────────────

/** Add a new document with auto-generated ID */
export async function addDocument(collectionName, data) {
  const ref = collection(db, collectionName);
  return addDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

/** Set a document with a specific ID (creates or overwrites) */
export async function setDocument(collectionName, id, data) {
  const ref = doc(db, collectionName, id);
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Get a single document by ID */
export async function getDocument(collectionName, id) {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Get all documents in a collection */
export async function getCollection(collectionName) {
  const ref = collection(db, collectionName);
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Update specific fields of a document */
export async function updateDocument(collectionName, id, data) {
  const ref = doc(db, collectionName, id);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** Delete a document */
export async function deleteDocument(collectionName, id) {
  const ref = doc(db, collectionName, id);
  return deleteDoc(ref);
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

/** Submit a new student application */
export async function submitApplication(applicationData) {
  return addDocument(COLLECTIONS.APPLICATIONS, {
    ...applicationData,
    status: 'pending',     // pending | under_review | approved | rejected
    stage: 'submitted',
  });
}

/** Get applications filtered by status */
export async function getApplicationsByStatus(status) {
  const ref = collection(db, COLLECTIONS.APPLICATIONS);
  const q = query(ref, where('status', '==', status), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get all applications (admin) */
export async function getAllApplications() {
  return getCollection(COLLECTIONS.APPLICATIONS);
}

/** Update application status */
export async function updateApplicationStatus(id, status, notes = '') {
  return updateDocument(COLLECTIONS.APPLICATIONS, id, { status, adminNotes: notes });
}

/** Real-time listener for applications */
export function subscribeToApplications(callback) {
  const ref = collection(db, COLLECTIONS.APPLICATIONS);
  const q = query(ref, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

// ─── UNIVERSITIES ─────────────────────────────────────────────────────────────

/** Get all universities */
export async function getUniversities() {
  return getCollection(COLLECTIONS.UNIVERSITIES);
}

/** Get universities by city */
export async function getUniversitiesByCity(city) {
  const ref = collection(db, COLLECTIONS.UNIVERSITIES);
  const q = query(ref, where('city', '==', city));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Add/update a university */
export async function upsertUniversity(id, data) {
  return setDocument(COLLECTIONS.UNIVERSITIES, id, data);
}

// ─── USERS ────────────────────────────────────────────────────────────────────

/** Create or update a user profile */
export async function upsertUser(uid, data) {
  return setDocument(COLLECTIONS.USERS, uid, { ...data, uid });
}

/** Get a user by UID */
export async function getUserProfile(uid) {
  return getDocument(COLLECTIONS.USERS, uid);
}

// ─── CONTACTS ─────────────────────────────────────────────────────────────────

/** Submit a contact form message */
export async function submitContactMessage(data) {
  return addDocument(COLLECTIONS.CONTACTS, { ...data, read: false });
}

/** Get all contact messages (admin) */
export async function getContactMessages() {
  const ref = collection(db, COLLECTIONS.CONTACTS);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── SCHOLARSHIPS ─────────────────────────────────────────────────────────────

/** Get all scholarships */
export async function getScholarships() {
  return getCollection(COLLECTIONS.SCHOLARSHIPS);
}

/** Get scholarships by type */
export async function getScholarshipsByType(type) {
  const ref = collection(db, COLLECTIONS.SCHOLARSHIPS);
  const q = query(ref, where('type', '==', type), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
