"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

export default function WorkOpportunitiesPage() {
  return (
    <InfoPageLayout title="Work Opportunities" breadcrumb="For Students" icon="💼" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        International students in Türkiye have the right to work part-time during their studies after completing their first academic year. This provides a great opportunity to gain work experience and supplement living costs.
      </p>
      {[
        { title: "Part-Time Work Rights", icon: "⏰", body: "International students who have completed at least one academic year (two semesters) can work part-time — up to 24 hours per week during the academic semester, and full-time during semester breaks. You must obtain a work permit from the Ministry of Labor and Social Security." },
        { title: "Work Permit Process", icon: "📋", body: "To obtain a work permit, you will need your employer to apply on your behalf through the Ministry of Labor's online e-permit system. Required documents include a valid student residence permit, employment contract, diploma/transcript, and passport. The process typically takes 2–4 weeks." },
        { title: "On-Campus Employment", icon: "🏫", body: "Many Turkish universities offer on-campus part-time positions for international students, such as research assistantships, teaching assistantships, library assistant roles, and administrative positions. These are often exempt from the one-year waiting period." },
        { title: "Internships", icon: "🔬", body: "Internships (staj) are an integral part of many Turkish university programs. Mandatory internships arranged by your faculty are generally not subject to work permit requirements. Voluntary internships, however, require a work permit." },
        { title: "After Graduation", icon: "🎓", body: "After graduation, international students who wish to continue working in Türkiye can apply for a regular work permit. Having studied in Türkiye and being fluent in Turkish significantly improves employment prospects in the local and regional job market." },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 24, padding: "24px 28px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span> {item.title}
          </h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
        </div>
      ))}
      <div style={{ background: "rgba(255,179,0,0.1)", borderRadius: 12, padding: "18px 22px", border: "1px solid rgba(255,179,0,0.3)" }}>
        <p style={{ color: "#b35c00", fontWeight: 600, marginBottom: 6 }}>⚠️ Important Note</p>
        <p style={{ color: "#b35c00", fontSize: 14, lineHeight: 1.7 }}>Working without a valid work permit is illegal in Türkiye and can result in deportation and ban from re-entry. Always ensure you have the proper documentation before beginning any employment.</p>
      </div>
    </InfoPageLayout>
  );
}
