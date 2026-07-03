// lib/firebaseAdmin.js
// Server-only Firebase Admin SDK initialization — NEVER import this from a "use client" file.
// Used by Route Handlers under src/app/api/** to create/manage Firebase Auth accounts
// on behalf of Super Admin / Agency actions, which the client SDK cannot do without
// hijacking the caller's own session.
//
// Initialization is lazy (deferred until a route handler actually runs a request)
// rather than happening at module import time. Next.js evaluates route modules
// during its build-time page-data collection step regardless of whether a request
// is ever made, so an eager initializeApp() here would fail the whole site's build
// any time the FIREBASE_* service-account env vars aren't configured yet.

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApp();

  // Preferred: paste the entire downloaded service-account JSON file as one
  // env var. JSON.parse handles the private key's \n escaping correctly on
  // its own, which sidesteps the copy-paste transcription errors that come
  // from manually extracting just the private_key field into its own var.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
    }
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback: three separate env vars.
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, or all three of FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = new Proxy({}, { get: (_, prop) => getAuth(getAdminApp())[prop] });
export const adminDb = new Proxy({}, { get: (_, prop) => getFirestore(getAdminApp())[prop] });
