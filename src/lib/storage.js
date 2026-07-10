// lib/storage.js
// Firebase Storage helper for student application file uploads.

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload a document (passport, transcript, payment screenshot, etc.) for one of a
 * student's applications. Path: applications/{uid}/{appId}/{kind}-{timestamp}-{filename}
 * — nested under the same applications/{uid}/** prefix storage.rules already scopes to
 * the owning student, with each application's documents kept separate.
 * Returns { url, name, uploadedAt } for storing on that application's doc.
 */
export async function uploadApplicationFile(uid, appId, kind, file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF, JPG, or PNG files are allowed.');
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File must be smaller than 5MB.');
  }

  const path = `applications/${uid}/${appId}/${kind}-${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  return { url, name: file.name, uploadedAt: new Date().toISOString() };
}
