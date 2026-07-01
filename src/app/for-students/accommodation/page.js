"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

export default function AccommodationPage() {
  return (
    <InfoPageLayout title="Accommodation" breadcrumb="For Students" icon="🏠" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        Finding suitable accommodation is one of the most important steps before starting your education in Türkiye. There are several options available for international students at various price points.
      </p>

      {[
        { title: "Government Dormitories (KYK)", icon: "🏢", price: "$80–$150/month", badge: "Most Affordable", badgeColor: "#2e7d32", body: "The Credit and Dormitories Institution (KYK) operates student dormitories in almost every city in Türkiye. These are the most affordable accommodation option, offering single, double, or triple rooms with cafeteria meals, internet, and security. International students can apply for KYK dormitories through their university.", details: ["Very affordable monthly rates", "Meals available in cafeteria", "Internet connection included", "Security 24/7", "Social activities and common areas", "Apply through your university's international office"] },
        { title: "University Dormitories", icon: "🎓", price: "$100–$250/month", badge: "Recommended", badgeColor: "var(--primary)", body: "Many universities operate their own dormitories on or near campus, offering convenient access to academic facilities. University dormitories often have better facilities than KYK dormitories and may include furnished rooms, common rooms, study halls, and sports facilities.", details: ["On-campus location", "Study halls and common rooms", "Close to academic buildings", "Some include meal plans", "Often prioritized for scholarship holders", "Apply directly to university"] },
        { title: "Private Dormitories", icon: "🏨", price: "$200–$500/month", badge: "Premium", badgeColor: "var(--secondary)", body: "Private student dormitories (yurt) offer higher-end facilities including en-suite bathrooms, more privacy, and additional amenities. These are operated by private companies and can be found near most universities.", details: ["Private or shared rooms", "Better privacy", "Modern amenities", "Often include cleaning service", "Near major universities", "Apply directly or through agency"] },
        { title: "Shared Apartment (Ev Arkadaşlığı)", icon: "🏘️", price: "$150–$350/month per person", badge: "Popular Choice", badgeColor: "#e65100", body: "Sharing a flat with other students is a very popular option among international students. It is more affordable than living alone and allows you to meet other students. Many students find roommates through university social media groups or platforms like Sahibinden.com.", details: ["Good balance of price and privacy", "Meet other international students", "Flexible location choice", "Kitchen access to cook your own food", "Use Sahibinden.com to search", "Contract in Turkish – get help from university"] },
      ].map((opt, i) => (
        <div key={i} style={{ marginBottom: 28, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid var(--border)" }}>
          <div style={{ background: "var(--secondary)", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{opt.icon}</span>
              <div>
                <h3 style={{ color: "white", fontSize: 18, margin: 0 }}>{opt.title}</h3>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Average: {opt.price}</span>
              </div>
            </div>
            <span style={{ background: opt.badgeColor, color: "white", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{opt.badge}</span>
          </div>
          <div style={{ padding: "22px 28px" }}>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15, marginBottom: 18 }}>{opt.body}</p>
            <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {opt.details.map((d, j) => (
                <li key={j} style={{ display: "flex", gap: 8, color: "var(--text-main)", fontSize: 13.5 }}>
                  <span style={{ color: "var(--primary)", fontWeight: 900 }}>✓</span> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      <div style={{ background: "rgba(26,35,126,0.04)", borderRadius: 14, padding: "24px 28px", marginTop: 10 }}>
        <h3 style={{ color: "var(--secondary)", marginBottom: 14, fontSize: 18 }}>💡 Tips for Finding Accommodation</h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Contact your university's International Student Office for help with accommodation before arrival",
            "Apply for university/KYK dormitories as early as possible — spots fill up quickly",
            "Join your university's international student Facebook/WhatsApp groups to find roommates",
            "Avoid signing any lease agreement without reading it carefully or getting translation help",
            "Budget for a deposit (usually 1–2 months rent) when renting a private apartment",
          ].map((tip, i) => (
            <li key={i} style={{ display: "flex", gap: 12, fontSize: 14.5, color: "var(--text-main)", lineHeight: 1.7 }}>
              <span style={{ color: "var(--primary)", fontWeight: 900, fontSize: 18, lineHeight: 1.3 }}>→</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </InfoPageLayout>
  );
}
