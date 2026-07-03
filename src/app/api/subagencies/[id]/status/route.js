export const runtime = "nodejs";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyCallerRole, ApiAuthError } from "@/lib/apiAuth";

// Disables/enables a Sub-Agency account. Agency only, and only for a Sub-Agency
// it actually owns (parentAgencyId must match the caller) — this is the concrete
// enforcement point for "an Agency can only touch its own Sub-Agencies."
export async function PATCH(request, { params }) {
  try {
    const { uid: callerUid } = await verifyCallerRole(request, ["agency"]);
    const { id } = await params;

    const { disabled } = await request.json();
    if (typeof disabled !== "boolean") {
      return Response.json({ error: "disabled (boolean) is required." }, { status: 400 });
    }

    const doc = await adminDb.collection("users").doc(id).get();
    if (!doc.exists || doc.data().role !== "sub_agency") {
      return Response.json({ error: "Sub-agency not found." }, { status: 404 });
    }
    if (doc.data().parentAgencyId !== callerUid) {
      return Response.json({ error: "You do not manage this sub-agency." }, { status: 403 });
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
    return Response.json({ error: "Failed to update sub-agency status." }, { status: 500 });
  }
}
