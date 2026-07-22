"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";

export default function VisaResidencePage() {
  return (
    <InfoPageLayout title="Visa and Residence" breadcrumb="For Students" icon="🛂" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        Before coming to Türkiye to study, you must apply for a student visa. After arriving, you will need to obtain a residence permit. This guide walks you through both processes.
      </p>

      {/* Student Visa */}
      <h2 style={{ color: "var(--secondary)", fontSize: 24, marginBottom: 20 }}>Student Visa</h2>
      <div style={{ background: "rgba(26,35,126,0.03)", borderRadius: 14, padding: "28px", marginBottom: 32, border: "1px solid var(--border)" }}>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.85, marginBottom: 20 }}>
          International students must obtain a Student Visa (D-type visa) from the Turkish Embassy or Consulate in their home country before traveling to Türkiye. A tourist visa is NOT sufficient for enrollment at a Turkish university.
        </p>
        <h4 style={{ color: "var(--secondary)", marginBottom: 14 }}>Required Documents for Student Visa:</h4>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Valid passport (valid for at least 6 months beyond the program end date)",
            "Completed visa application form",
            "Letter of Acceptance from a Turkish university",
            "Proof of sufficient financial means (bank statement)",
            "Health insurance valid in Türkiye",
            "Passport-size photographs",
            "Proof of paid application fee",
          ].map((doc, i) => (
            <li key={i} style={{ display: "flex", gap: 12, color: "var(--text-main)", fontSize: 14.5 }}>
              <span style={{ color: "var(--primary)", fontWeight: 900, marginTop: 2 }}>✓</span> {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Residence Permit */}
      <h2 style={{ color: "var(--secondary)", fontSize: 24, marginBottom: 20 }}>Residence Permit</h2>
      <div style={{ background: "rgba(26,35,126,0.03)", borderRadius: 14, padding: "28px", marginBottom: 32, border: "1px solid var(--border)" }}>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.85, marginBottom: 20 }}>
          After arriving in Türkiye on a Student Visa, you must apply for a Student Residence Permit within 30 days of your visa expiry or within 30 days after arrival. The application is made through the Directorate General of Migration Management (DGMM).
        </p>
        <h4 style={{ color: "var(--secondary)", marginBottom: 14 }}>Steps to Get Residence Permit:</h4>
        {[
          { step: "1", label: "Online Application", desc: "Apply online at e-ikamet.goc.gov.tr and book an appointment at your local DGMM office." },
          { step: "2", label: "University Registration", desc: "Register at your university and obtain the official enrollment/student certificate." },
          { step: "3", label: "Prepare Documents", desc: "Gather all required documents including your acceptance letter, health insurance, accommodation proof, and biometric photos." },
          { step: "4", label: "Attend Appointment", desc: "Attend the appointment at the DGMM office with all original documents and photocopies." },
          { step: "5", label: "Receive Permit", desc: "Your residence permit card will be mailed to your registered address, typically within 1–2 months." },
        ].map(s => (
          <div key={s.step} style={{ display: "flex", gap: 18, marginBottom: 18, alignItems: "flex-start" }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{s.step}</div>
            <div>
              <strong style={{ color: "var(--secondary)", display: "block", marginBottom: 4 }}>{s.label}</strong>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{s.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,179,0,0.1)", borderRadius: 12, padding: "18px 22px", border: "1px solid rgba(255,179,0,0.3)" }}>
        <p style={{ color: "#b35c00", fontWeight: 600, marginBottom: 6 }}>⚠️ Important Note</p>
        <p style={{ color: "#b35c00", fontSize: 14, lineHeight: 1.7 }}>The process and requirements may vary. Always check the official website of the Directorate General of Migration Management at <a href="https://www.goc.gov.tr" target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>www.goc.gov.tr</a> and the Turkish Embassy in your country for the most up-to-date information.</p>
      </div>
    </InfoPageLayout>
  );
}
