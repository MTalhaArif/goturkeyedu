"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

export default function RecognitionPage() {
  return (
    <InfoPageLayout title="Recognition and Equivalence" breadcrumb="For Students" icon="📜" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        Recognition and equivalence of degrees and qualifications is an important topic for international students. Turkish universities implement the Bologna Process, which facilitates recognition across Europe and beyond.
      </p>
      {[
        { title: "Recognition of Turkish Degrees Abroad", icon: "🌍", body: "Turkish higher education qualifications are recognized in all European countries as Türkiye implements the Bologna Process. All graduates receive a Diploma Supplement alongside their degree certificate, which describes the qualifications in internationally understood terms. Turkish universities are listed in the IAU World Higher Education Database and degrees are recognized by UNESCO." },
        { title: "Recognition of Foreign Diplomas in Türkiye", icon: "📄", body: "Before enrolling in a Turkish university, international students may need to have their previous qualifications recognized. The Council of Higher Education (YÖK) handles recognition of foreign secondary school diplomas for undergraduate admission. For postgraduate admission, the university's relevant department typically evaluates the diploma." },
        { title: "Diploma Supplement", icon: "📋", body: "All Turkish universities issue a Diploma Supplement (Diploma Eki) upon graduation. This document, prepared according to the European Commission/Council of Europe/UNESCO model, provides a standardized description of the nature, level, context, content, and status of the studies that were pursued and successfully completed." },
        { title: "ECTS Credits", icon: "⭐", body: "The European Credit Transfer and Accumulation System (ECTS) is used in all Turkish universities, making it easy for students to transfer credits between Turkish and European institutions. Each academic year typically corresponds to 60 ECTS credits." },
        { title: "Equivalence Process for Diplomas", icon: "⚖️", body: "If you have studied at a foreign university and wish to continue your education in Türkiye, or if you are a Turkish citizen returning from studying abroad, you may need to apply for a diploma equivalence certificate (denklik belgesi) from YÖK. This process verifies that your qualification is equivalent to a Turkish degree." },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 24, padding: "24px 28px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span> {item.title}
          </h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
