// lib/apiAuth.js
// Server-only helper shared by Route Handlers to authenticate and authorize callers.
// Re-derives the caller's role from Firestore (never trusts a client-sent role claim).

import { randomBytes } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export class ApiAuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies the request's Firebase ID token and checks the caller's Firestore-stored
 * role against `allowedRoles`. Throws ApiAuthError (401/403) on any failure.
 * Returns { uid, profile } on success.
 */
export async function verifyCallerRole(request, allowedRoles) {
  const authHeader = request.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) throw new ApiAuthError(401, "Missing Authorization header.");

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch (err) {
    console.error("verifyIdToken failed:", err.code, err.message);
    throw new ApiAuthError(401, "Invalid or expired session.");
  }

  const uid = decoded.uid;
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) throw new ApiAuthError(403, "No profile found for this account.");

  const profile = snap.data();
  if (profile.status === "disabled") throw new ApiAuthError(403, "This account has been disabled.");
  if (!allowedRoles.includes(profile.role)) throw new ApiAuthError(403, "You do not have permission to perform this action.");

  return { uid, profile };
}

/** Generates a random, URL-safe password for a newly created portal account. */
export function generatePassword() {
  return randomBytes(12).toString("base64url");
}
