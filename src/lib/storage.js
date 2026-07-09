// lib/storage.js
// Firebase Storage helper for student application file uploads.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a document (diploma, transcript, other, payment screenshot) for a student's
 * application. Path: applications/{uid}/{kind}-{timestamp}-{filename}
 * Returns { url, name, uploadedAt } for storing on the applications/{uid} doc.
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
