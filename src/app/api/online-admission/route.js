export const runtime = "nodejs";

import { adminDb } from "@/lib/firebaseAdmin";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Public online admission form (legacy /online_admission). Writes one record into
// erp_online_admissions via the Admin SDK — anonymous clients get no Firestore access.
const MAX = 300;
const FIELDS = ["firstName", "lastName", "gender", "dob", "mobile", "email", "passportNo", "nationality", "fatherName", "motherName", "address", "formServiceId", "note"];

export async function POST(request) {
  const { allowed, retryAfterSeconds } = rateLimit(`admission:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!allowed) return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (body?.website) return Response.json({ ok: true }); // honeypot field — bots fill it, humans never see it

  const data = {};
  for (const k of FIELDS) data[k] = String(body?.[k] ?? "").trim().slice(0, k === "address" || k === "note" ? 2000 : MAX);
  if (!data.firstName || !data.lastName || !data.mobile || !data.email || !data.formServiceId) {
    return Response.json({ error: "First name, last name, mobile, email and service are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

  try {
    const service = await adminDb.collection("erp_form_services").doc(data.formServiceId).get();
    if (!service.exists || service.data().status === "inactive") return Response.json({ error: "Selected service is not available." }, { status: 400 });
    const referenceNo = `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
    await adminDb.collection("erp_online_admissions").add({
      ...data, classId: service.data().classId || "", sectionId: service.data().sectionId || "",
      referenceNo, formStatus: "submitted", paymentStatus: "unpaid", enrolled: false,
      submitDate: new Date().toISOString().slice(0, 10), createdAt: new Date(), updatedAt: new Date(),
    });
    return Response.json({ ok: true, referenceNo }, { status: 201 });
  } catch (err) {
    console.error("online admission failed:", err?.message);
    return Response.json({ error: "Could not submit the form. Please try again." }, { status: 500 });
  }
}
