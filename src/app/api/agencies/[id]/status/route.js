export const runtime = "nodejs";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyCallerRole, ApiAuthError } from "@/lib/apiAuth";

// Disables/enables an Agency account. Super Admin only. No delete endpoint exists
// anywhere in this hierarchy by design — accounts can only ever be disabled.
export async function PATCH(request, { params }) {
  try {
    await verifyCallerRole(request, ["super_admin"]);
    const { id } = await params;

    const { disabled } = await request.json();
    if (typeof disabled !== "boolean") {
      return Response.json({ error: "disabled (boolean) is required." }, { status: 400 });
    }

    const doc = await adminDb.collection("users").doc(id).get();
    if (!doc.exists || doc.data().role !== "agency") {
      return Response.json({ error: "Agency not found." }, { status: 404 });
    }

    await adminAuth.updateUser(id, { disabled });
    await adminDb.collection("users").doc(id).update({
      status: disabled ? "disabled" : "active",
      updatedAt: new Date().toISOString(),
    });

    return Response.json({ id, status: disabled ? "disabled" : "active" });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json({ error: "Failed to update agency status." }, { status: 500 });
  }
}
