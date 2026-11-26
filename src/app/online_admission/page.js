// Public online admission (legacy goturkey.gen.tr/online_admission): choose one of the
// priced Form Services and submit personal details; staff review it under
// Student Information → Online Admission.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebaseAdmin";
import AdmissionForm from "./AdmissionForm";

export const metadata = { title: "Online Admission | Go Turkey And Study Academy", description: "Apply online to Go Turkey And Study Academy services and courses." };

async function loadServices() {
  try {
    const snap = await adminDb.collection("erp_form_services").get();
    return snap.docs.map(d => ({ id: d.id, title: d.data().title || "", price: d.data().price ?? "", status: d.data().status }))
      .filter(s => s.status !== "inactive" && s.title)
      .sort((a, b) => Number(a.id.replace(/\D/g, "")) - Number(b.id.replace(/\D/g, "")));
  } catch {
    return [];
  }
}

export default async function OnlineAdmissionPage() {
  const services = await loadServices();
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 16px 80px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Online Admission</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Select the service you are applying for and fill in your details. Our team will contact you with the next steps.</p>
      <AdmissionForm services={services} />
    </main>
  );
}
