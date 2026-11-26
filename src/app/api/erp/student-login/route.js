export const runtime = "nodejs";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifyCallerRole, ApiAuthError } from "@/lib/apiAuth";

// Super Admin: create or reset a student-portal login for an ERP student record
// (the new equivalent of the legacy "Parolayı Göster / Değiştir"). The student signs
// in at /login; their users/{uid} profile is a normal "student" profile linked to the
// ERP record via erpStudentId.
export async function POST(request) {
  try {
    await verifyCallerRole(request, ["super_admin"]);
    const { studentId, email, password } = await request.json();
    if (!studentId || !email || !password) return Response.json({ error: "studentId, email and password are required." }, { status: 400 });
    if (String(password).length < 6) return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    const cleanEmail = String(email).trim().toLowerCase();

    const ref = adminDb.collection("erp_students").doc(String(studentId));
    const snap = await ref.get();
    if (!snap.exists) return Response.json({ error: "Student not found." }, { status: 404 });
    const s = snap.data();
    const name = s.fullName || [s.firstName, s.lastName].filter(Boolean).join(" ");

    let user = null, created = false;
    if (s.loginUid) { try { user = await adminAuth.getUser(s.loginUid); } catch { user = null; } }
    if (!user) { try { user = await adminAuth.getUserByEmail(cleanEmail); } catch { user = null; } }

    if (user) {
      // Never take over a staff/agency account that happens to share the email.
      const prof = (await adminDb.collection("users").doc(user.uid).get()).data();
      if (prof && prof.role && prof.role !== "student") return Response.json({ error: "That email belongs to a staff or agency account. Use a different email." }, { status: 409 });
      await adminAuth.updateUser(user.uid, { email: cleanEmail, password: String(password), displayName: name, disabled: s.status === "disabled" });
    } else {
      user = await adminAuth.createUser({ email: cleanEmail, password: String(password), displayName: name, disabled: s.status === "disabled" });
      created = true;
    }

    await adminDb.collection("users").doc(user.uid).set({
      uid: user.uid, email: cleanEmail, name, role: "student", status: s.status === "disabled" ? "disabled" : "active",
      erpStudentId: String(studentId), phone: s.mobile || "", nationality: s.nationality || "", updatedAt: new Date().toISOString(),
      ...(created ? { createdAt: new Date().toISOString(), registeredAt: new Date().toISOString() } : {}),
    }, { merge: true });
    await ref.set({ loginUid: user.uid, loginEmail: cleanEmail, loginUpdatedAt: new Date().toISOString() }, { merge: true });

    return Response.json({ uid: user.uid, email: cleanEmail, created });
  } catch (err) {
    if (err instanceof ApiAuthError) return Response.json({ error: err.message }, { status: err.status });
    if (err.code === "auth/email-already-exists") return Response.json({ error: "Another account already uses this email." }, { status: 409 });
    if (err.code === "auth/invalid-email") return Response.json({ error: "Invalid email address." }, { status: 400 });
    console.error("student-login failed:", err?.code, err?.message);
    return Response.json({ error: "Could not save the login." }, { status: 500 });
  }
}
