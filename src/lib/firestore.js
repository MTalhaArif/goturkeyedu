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
  STUDENTS:      'students',
};

// ─── PORTAL ACCOUNT HIERARCHY (users collection field contract) ──────────────
// users/{uid} additionally carries, for role: 'super_admin' | 'agency' | 'sub_agency':
//   status:         'active' | 'disabled'
//   parentAgencyId: string | null   // sub_agency -> its owning agency's uid
//   createdBy:      string | null   // uid of whoever created this account
//
// students/{id} (CRM records an agency/sub-agency manages, not login accounts):
//   agencyId: string  // top-level owning agency uid (rollup key)
//   ownerId:  string  // exact tenant that added it: agency uid, or sub-agency uid

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

// ─── STUDENT DASHBOARD APPLICATIONS (applications/{uid}, one per student) ─────
// Distinct from submitApplication/getApplicationsByStatus above (that scaffold
// has no callers anywhere and a mismatched shape) — this is the real, uid-keyed
// application doc the student dashboard and admin review screen both use.
// Field contract: uid, universityName, programName, universityType ('State'|'Foundation'),
// stage (see PortalDashboard.js applications tab / StudentDashboard.js for the enum),
// documents: { diploma, transcript, other[] }, paymentScreenshot, offer, adminNotes.

/** Get a student's application doc (null if they haven't started one yet) */
export async function getApplication(uid) {
  return getDocument(COLLECTIONS.APPLICATIONS, uid);
}

/** Create or update a student's application doc (uid-keyed, merges fields) */
export async function upsertApplication(uid, data) {
  return setDocument(COLLECTIONS.APPLICATIONS, uid, { ...data, uid });
}

/** Get every student application (Super Admin review list) */
export async function getAllApplicationsForAdmin() {
  return getCollection(COLLECTIONS.APPLICATIONS);
}

/** Advance/set a student's application stage, optionally merging other fields (e.g. an offer) */
export async function updateApplicationStage(uid, stage, extra = {}) {
  return updateDocument(COLLECTIONS.APPLICATIONS, uid, { ...extra, stage });
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

/** Get every self-registered student account (Super Admin applications review list) */
export async function getAllStudentUsers() {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

// ─── AGENCIES / SUB-AGENCIES (portal accounts, stored in USERS) ───────────────
// Account creation/disable-enable goes through the /api/agencies and
// /api/subagencies Route Handlers (Firebase Admin SDK) — these are read-only
// list helpers for the dashboard UI.

/** Get all Agency accounts (Super Admin view) */
export async function getAgencies() {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'agency'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get the Sub-Agency accounts belonging to one Agency */
export async function getSubAgenciesByParent(parentAgencyId) {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'sub_agency'), where('parentAgencyId', '==', parentAgencyId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get every Sub-Agency account across all agencies (Super Admin view) */
export async function getAllSubAgencies() {
  const ref = collection(db, COLLECTIONS.USERS);
  const q = query(ref, where('role', '==', 'sub_agency'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── STUDENTS (agency/sub-agency managed CRM records) ─────────────────────────

/** Add a student record. Caller must set agencyId (top-level rollup) and ownerId (exact tenant). */
export async function addStudent(data) {
  return addDocument(COLLECTIONS.STUDENTS, data);
}

/** Update a student record */
export async function updateStudent(id, data) {
  return updateDocument(COLLECTIONS.STUDENTS, id, data);
}

/** Delete a student record (this is CRM data, not a tenant account — normal delete is fine) */
export async function deleteStudent(id) {
  return deleteDocument(COLLECTIONS.STUDENTS, id);
}

/** Get every student under an Agency (its own + everything its Sub-Agencies added) */
export async function getStudentsByAgency(agencyId) {
  const ref = collection(db, COLLECTIONS.STUDENTS);
  const q = query(ref, where('agencyId', '==', agencyId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get only the students a specific tenant (Agency or Sub-Agency) added itself */
export async function getStudentsByOwner(ownerId) {
  const ref = collection(db, COLLECTIONS.STUDENTS);
  const q = query(ref, where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get every student platform-wide (Super Admin view) */
export async function getAllStudents() {
  return getCollection(COLLECTIONS.STUDENTS);
}
