"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";

export default function HealthcarePage() {
  return (
    <InfoPageLayout title="Healthcare Services" breadcrumb="For Students" icon="🏥" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        International students studying in Türkiye have access to high-quality healthcare services. Health insurance is mandatory for obtaining a residence permit and is covered for scholarship recipients.
      </p>
      {[
        { title: "General Health Insurance (GHS)", icon: "🛡️", body: "International students who are not covered by a private health insurance or a bilateral agreement can benefit from the General Health Insurance (GHS) scheme in Türkiye. Students under 25 years old who do not have income pay a monthly premium of approximately $20. This gives access to state hospitals and contracted private hospitals." },
        { title: "University Health Centers", icon: "🏫", body: "Most Turkish universities operate on-campus health centers (sağlık merkezi) that provide free basic healthcare services to enrolled students. Services typically include general physician consultations, emergency first aid, vaccinations, and referrals to specialist hospitals." },
        { title: "State Hospitals", icon: "🏨", body: "Turkey has an extensive network of state (government) hospitals in every city. These hospitals provide comprehensive medical services at very low cost for insured patients. The quality of facilities and specialist services has improved dramatically in recent years." },
        { title: "Private Hospitals", icon: "💊", body: "Private hospitals in Türkiye generally offer higher comfort, shorter waiting times, and English-speaking staff. Many private hospitals are accredited by JCI (Joint Commission International). Private health insurance or out-of-pocket payment is required." },
        { title: "Türkiye Scholarship Health Coverage", icon: "🎓", body: "Students holding a Türkiye Scholarship automatically receive free health insurance covering treatment at state hospitals. This insurance is activated upon arrival and covers the full duration of the scholarship period. No additional premium payment is required." },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 24, padding: "24px 28px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span> {item.title}
          </h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
        </div>
      ))}
      <div style={{ background: "rgba(0,120,60,0.08)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(0,120,60,0.2)", marginTop: 8 }}>
        <h4 style={{ color: "#006633", marginBottom: 10 }}>Emergency Contact Numbers in Türkiye</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["🚑 Ambulance", "112"], ["🚒 Fire Department", "110"], ["👮 Police", "155"], ["☎️ General Emergency", "112"]].map(([label, num]) => (
            <div key={num} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: "white", borderRadius: 8, fontSize: 14 }}>
              <span>{label}</span><strong style={{ color: "var(--primary)" }}>{num}</strong>
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
