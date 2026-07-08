"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { usePathname } from "next/navigation";

function Header() {
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="container">
          <div className="top-contact">
            <a href="mailto:goturkeyandstudytr@gmail.com">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              goturkeyandstudytr@gmail.com
            </a>
            <a href="tel:+905551753226">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +90 555 175 32 26
            </a>
          </div>
          <div className="top-social">
            <a href="https://www.facebook.com/studyinturkey.gov.tr/" target="_blank" rel="noreferrer" title="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://x.com/studyinturkiye_" target="_blank" rel="noreferrer" title="X">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.youtube.com/@studyinturkiyetr" target="_blank" rel="noreferrer" title="YouTube">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
            <a href="https://www.instagram.com/studyinturkiyetr" target="_blank" rel="noreferrer" title="Instagram">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <div className="top-divider"></div>
            <a href="/admin/login" className="top-auth-link" target="_blank" style={{ color: "#E03C31", fontWeight: 700 }}>Admin Portal</a>
            <a href="/register" className="top-auth-link" target="_blank">{t.signUp}</a>
            <a href="/login" className="top-auth-link" target="_blank">{t.signIn}</a>
            <a href="/contact" className="top-auth-link">{t.contact}</a>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              <option value="EN">EN</option>
              <option value="TR">TR</option>
              <option value="AR">AR</option>
              <option value="FR">FR</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="header">
        <div className="container">
          <a href="/" className="logo">
            <div className="logo-flag">🇹🇷</div>
            <div className="logo-text">
              <span className="logo-go">Go</span>
              <span className="logo-turkey">Turkey</span>
              <div className="logo-tagline">Discover your potential</div>
            </div>
          </a>

          <nav className="nav-links" dir={lang === "AR" ? "rtl" : "ltr"}>
            {/* WHY TÜRKIYE */}
            <div className="nav-item">
              <span className="nav-link-btn">{t.whyTurkiye} ▾</span>
              <div className="dropdown">
                <a href="/why-turkiye/10-reasons">{t.tenReasons}</a>
                <a href="/why-turkiye/higher-education-system">{t.turkishHigherEd}</a>
              </div>
            </div>

            {/* DISCOVER TURKIYE */}
            <div className="nav-item">
              <span className="nav-link-btn">{t.discoverTurkiye} ▾</span>
              <div className="dropdown">
                <a href="/discover/turkiye-at-a-glance">{t.turkiyeAtGlance}</a>
                <a href="/discover/culture">{t.culture}</a>
                <a href="/discover/cities">{t.cities}</a>
                <a href="/discover/climate">{t.climate}</a>
                <a href="/discover/food-culture">{t.foodCulture}</a>
                <a href="/discover/transportation">{t.transportation}</a>
                <a href="/discover/tips-for-students">{t.tipsForStudents}</a>
                <a href="/discover/learning-turkish">{t.learningTurkish}</a>
              </div>
            </div>

            {/* UNIVERSITIES */}
            <div className="nav-item">
              <span className="nav-link-btn">{t.universities} ▾</span>
              <div className="dropdown">
                <a href="/StudyinTurkey/Universities">{t.universitiesList}</a>
                <a href="/StudySearch/List">{t.programs}</a>
              </div>
            </div>

            {/* APPLY IN 5 STEPS */}
            <a href="/#item-2" className="nav-link-btn">{t.applyIn5Steps}</a>

            {/* FOR STUDENTS */}
            <div className="nav-item">
              <span className="nav-link-btn nav-highlight">{t.forStudents} ▾</span>
              <div className="dropdown dropdown-wide">
                <a href="/for-students/what-students-say">{t.whatStudentsSay}</a>
                <a href="/for-students/scholarships">{t.scholarships}</a>
                <a href="/for-students/visa-residence">{t.visaResidence}</a>
                <a href="/for-students/healthcare">{t.healthcareServices}</a>
                <a href="/for-students/accommodation">{t.accommodation}</a>
                <a href="/for-students/work-opportunities">{t.workOpportunities}</a>
                <a href="/for-students/recognition">{t.recognition}</a>
                <div className="dropdown-divider"></div>
                <a href="/for-students/qa-videos">{t.qaVideos}</a>
                <a href="/for-students/cohe-news">{t.coheNews}</a>
                <a href="/for-students/faq">{t.faq}</a>
              </div>
            </div>

            {/* TR-YOS */}
            <a href="/tryos" className="nav-link-btn nav-tryos">TR-YÖS</a>
          </nav>

          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            <a href="/">{t.home}</a>
            <a href="/#item-1">{t.whyTurkiye}</a>
            <a href="/StudyinTurkey/Universities">{t.universities}</a>
            <a href="/StudySearch/List">{t.programs}</a>
            <a href="/#item-2">{t.applyIn5Steps}</a>
            <a href="/for-students/scholarships">{t.scholarships}</a>
            <a href="/for-students/faq">{t.faq}</a>
            <a href="/tryos">TR-YÖS</a>
            <a href="/contact">{t.contact}</a>
          </div>
        )}
      </header>
    </>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 26 }}>🇹🇷</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "white", fontFamily: "var(--font-heading)" }}>
                  <span style={{ color: "#E03C31" }}>Go</span>Turkey
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Discover your potential</div>
              </div>
            </div>
            <p className="footer-text">
              Molla Gürani Neighborhood, Tomrukçu Street, Nevin Apartment, No: 51/3 Fatih / İSTANBUL / TÜRKİYE
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              <a href="tel:+905551753226" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>📞 +90 555 175 32 26</a>
              <a href="mailto:goturkeyandstudytr@gmail.com" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>✉ goturkeyandstudytr@gmail.com</a>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {["Facebook","Instagram","Twitter","YouTube"].map(s => (
                <span key={s} style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>{s}</span>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h3>{t.usefulInfo}</h3>
            <ul className="footer-links">
              {[
                ["/for-students/faq", t.faq],
                ["/for-students/scholarships", t.scholarships],
                ["/for-students/recognition", t.recognition],
                ["/for-students/healthcare", t.healthcareServices],
                ["/for-students/visa-residence", t.visaResidence],
                ["/for-students/accommodation", t.accommodation],
                ["/for-students/work-opportunities", t.workOpportunities],
                ["/sitemap", t.sitemap],
              ].map(([href, label]) => (
                <li key={href}><a href={href}>› {label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3>{t.contactUs}</h3>
            <ul className="footer-links">
              <li><a href="mailto:goturkeyandstudytr@gmail.com">› goturkeyandstudytr@gmail.com</a></li>
              <li><a href="mailto:studyinturkey@yok.gov.tr">› studyinturkey@yok.gov.tr</a></li>
              <li><a href="http://www.yok.gov.tr/" target="_blank" rel="noreferrer">› CoHE WEB PAGE</a></li>
              <li><a href="https://uluslararasi.yok.gov.tr/en" target="_blank" rel="noreferrer">› CoHE International Relations</a></li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <h4 style={{ color: "rgba(255,255,255,0.8)", marginBottom: 10, fontWeight: 600, fontSize: 15 }}>Official Links</h4>
              <ul className="footer-links">
                <li><a href="https://goturkey.gen.tr" target="_blank" rel="noreferrer">› GoTurkey.gen.tr</a></li>
                <li><a href="https://www.studyinturkiye.gov.tr" target="_blank" rel="noreferrer">› StudyInTurkiye.gov.tr</a></li>
                <li><a href="https://www.yok.gov.tr" target="_blank" rel="noreferrer">› YÖK (CoHE)</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Go Turkey. This website is managed by Go Turkey in association with YÖK (CoHE). |
            Powered by <a href="https://goturkey.gen.tr" style={{ color: "rgba(255,255,255,0.5)" }}>Holistence</a> |
            <a href="/sitemap" style={{ color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>Sitemap</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const isAdminOrAuth = pathname?.startsWith("/admin") || pathname?.startsWith("/agency") || pathname?.startsWith("/subagency") || pathname === "/login" || pathname === "/register";

  if (isAdminOrAuth) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
