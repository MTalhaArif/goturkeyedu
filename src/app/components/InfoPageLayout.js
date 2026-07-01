"use client";
import { useLanguage } from "../context/LanguageContext";

export default function InfoPageLayout({ title, breadcrumb, icon, children, sidebar }) {
  const { t } = useLanguage();
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Banner */}
      <div style={{ background: "linear-gradient(135deg, var(--secondary) 0%, #283593 100%)", padding: "48px 0 36px", color: "white" }}>
        <div className="container">
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 10 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.65)" }}>Home</a> › {breadcrumb || title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 42 }}>{icon}</span>
            <h1 style={{ fontSize: 36, margin: 0 }}>{title}</h1>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: sidebar ? "1fr 290px" : "1fr", gap: 36 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "44px 50px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
            {children}
          </div>
          {sidebar && (
            <div>
              {/* Quick Links */}
              <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 20 }}>
                <h3 style={{ color: "var(--secondary)", fontSize: 16, marginBottom: 18, borderBottom: "2px solid var(--border)", paddingBottom: 12 }}>
                  {t.usefulInfo}
                </h3>
                {[
                  ["/for-students/faq", t.faq],
                  ["/for-students/scholarships", t.scholarships],
                  ["/for-students/visa-residence", t.visaResidence],
                  ["/for-students/healthcare", t.healthcareServices],
                  ["/for-students/accommodation", t.accommodation],
                  ["/for-students/work-opportunities", t.workOpportunities],
                  ["/for-students/recognition", t.recognition],
                ].map(([href, label]) => (
                  <a key={href} href={href} style={{ display: "block", padding: "9px 14px", borderRadius: 7, color: "var(--text-main)", fontSize: 13.5, fontWeight: 500, borderLeft: "3px solid transparent", marginBottom: 2, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.background = "rgba(224,60,49,0.05)"; e.target.style.borderLeftColor = "var(--primary)"; e.target.style.color = "var(--primary)"; }}
                    onMouseLeave={e => { e.target.style.background = "none"; e.target.style.borderLeftColor = "transparent"; e.target.style.color = "var(--text-main)"; }}>
                    › {label}
                  </a>
                ))}
              </div>
              {/* Apply CTA */}
              <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, #a01010 100%)", borderRadius: 16, padding: 28, color: "white", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
                <h3 style={{ marginBottom: 10, fontSize: 17 }}>Ready to Apply?</h3>
                <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 18 }}>Start your application journey today</p>
                <a href="/register" style={{ display: "block", background: "white", color: "var(--primary)", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14 }}>Apply Now →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
