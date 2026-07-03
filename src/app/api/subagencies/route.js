export const runtime = "nodejs";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyCallerRole, generatePassword, ApiAuthError } from "@/lib/apiAuth";

// Creates a new Sub-Agency account, owned by the calling Agency. Agency only —
// a Super Admin cannot create a Sub-Agency directly (only an Agency creates its own).
export async function POST(request) {
  try {
    const { uid: callerUid } = await verifyCallerRole(request, ["agency"]);

    const { email, name } = await request.json();
    if (!email || !name) {
      return Response.json({ error: "email and name are required." }, { status: 400 });
    }

    const password = generatePassword();
    const userRecord = await adminAuth.createUser({ email, password, displayName: name });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: "sub_agency",
      status: "active",
      parentAgencyId: callerUid,
      createdBy: callerUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return Response.json({ uid: userRecord.uid, email, password }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    if (err.code === "auth/email-already-exists") {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return Response.json({ error: "Failed to create sub-agency." }, { status: 500 });
  }
}
