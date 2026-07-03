export const runtime = "nodejs";

// TEMPORARY diagnostic route — reports only presence/shape of the Firebase
// Admin env vars, never their actual secret values. Delete once the
// Production env var issue is confirmed fixed.
export async function GET() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  return Response.json({
    hasProjectId: !!FIREBASE_PROJECT_ID,
    projectIdPreview: FIREBASE_PROJECT_ID ? FIREBASE_PROJECT_ID.slice(0, 6) + "..." : null,
    hasClientEmail: !!FIREBASE_CLIENT_EMAIL,
    clientEmailPreview: FIREBASE_CLIENT_EMAIL ? FIREBASE_CLIENT_EMAIL.slice(0, 12) + "..." : null,
    hasPrivateKey: !!FIREBASE_PRIVATE_KEY,
    privateKeyLength: FIREBASE_PRIVATE_KEY ? FIREBASE_PRIVATE_KEY.length : 0,
    privateKeyStartsCorrectly: FIREBASE_PRIVATE_KEY ? FIREBASE_PRIVATE_KEY.startsWith("-----BEGIN") : false,
    privateKeyFirstChar: FIREBASE_PRIVATE_KEY ? FIREBASE_PRIVATE_KEY[0] : null,
  });
}
