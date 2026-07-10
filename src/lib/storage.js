// lib/storage.js
// Firebase Storage helper for student application file uploads.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a document (passport, transcript, payment screenshot, etc.) for a student.
 * Path: applications/{uid}/{kind}-{timestamp}-{filename}. Documents (passport, picture,
 * transcripts, etc.) are shared across all of a student's applications, so `kind` is
 * just the document key; payment screenshots are still per-application, so callers pass
 * a per-application `kind` (e.g. `payment-${appId}`) to keep those from colliding.
 * Returns { url, name, uploadedAt } for storing on the profile (or application) doc.
 */
export async function uploadApplicationFile(uid, kind, file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF, JPG, or PNG files are allowed.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File must be smaller than 5MB.');
  }

  const path = `applications/${uid}/${kind}-${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  return { url, name: file.name, uploadedAt: new Date().toISOString() };
}
