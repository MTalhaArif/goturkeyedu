export const runtime = "nodejs";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyCallerRole, ApiAuthError } from "@/lib/apiAuth";

// Creates a new Sub-Agency account, owned by the calling Agency. Agency only —
// a Super Admin cannot create a Sub-Agency directly (only an Agency creates its own).
// Agency sets the password directly (no SMTP integration yet to email a generated one).
export async function POST(request) {
  try {
    const { uid: callerUid } = await verifyCallerRole(request, ["agency"]);

    const { email, name, password, phone, address, city } = await request.json();
    if (!email || !name || !password) {
      return Response.json({ error: "email, name, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const userRecord = await adminAuth.createUser({ email, password, displayName: name });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      phone: phone || "",
      address: address || "",
      city: city || "",
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
    if (err.code === "auth/invalid-password" || err.code === "auth/weak-password") {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    return Response.json({ error: "Failed to create sub-agency." }, { status: 500 });
  }
}
