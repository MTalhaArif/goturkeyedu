"use client";
import Link from "next/link";
import { useState } from "react";

const sitemap = [
  {
    category: "Main",
    icon: "🏠",
    links: [
      { href: "/", label: "Home" },
      { href: "/contact", label: "Contact Us" },
      { href: "/tryos", label: "TR-YÖS Exam" },
    ],
  },
  {
    category: "Why Türkiye",
    icon: "🇹🇷",
    links: [
      { href: "/why-turkiye/10-reasons", label: "10 Reasons to Study in Türkiye" },
      { href: "/why-turkiye/higher-education-system", label: "Higher Education System" },
    ],
  },
  {
    category: "Discover Türkiye",
    icon: "🌍",
    links: [
      { href: "/discover/turkiye-at-a-glance", label: "Türkiye at a Glance" },
      { href: "/discover/culture", label: "Culture" },
      { href: "/discover/cities", label: "Cities" },
      { href: "/discover/climate", label: "Climate" },
      { href: "/discover/food-culture", label: "Food Culture" },
      { href: "/discover/transportation", label: "Transportation" },
      { href: "/discover/tips-for-students", label: "Tips for Students" },
      { href: "/discover/learning-turkish", label: "Learning Turkish" },
    ],
  },
  {
    category: "Universities & Programs",
    icon: "🎓",
    links: [
      { href: "/StudyinTurkey/Universities", label: "Universities List" },
      { href: "/StudySearch/List", label: "Program & University Search" },
    ],
  },
  {
    category: "For Students",
    icon: "👩‍🎓",
    links: [
      { href: "/for-students/scholarships", label: "Scholarships" },
      { href: "/for-students/visa-residence", label: "Visa & Residence" },
      { href: "/for-students/healthcare", label: "Healthcare Services" },
      { href: "/for-students/accommodation", label: "Accommodation" },
      { href: "/for-students/work-opportunities", label: "Work Opportunities" },
      { href: "/for-students/recognition", label: "Recognition & Equivalence" },
      { href: "/for-students/qa-videos", label: "Q&A Videos" },
      { href: "/for-students/cohe-news", label: "CoHE News" },
      { href: "/for-students/faq", label: "FAQ" },
      { href: "/for-students/what-students-say", label: "What Students Say" },
    ],
  },
  {
    category: "Account",
    icon: "🔐",
    links: [
      { href: "/login", label: "Student Sign In" },
      { href: "/register", label: "Student Register" },
    ],
  },
];

function SitemapLink({ href, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <li>
      <Link
        href={href}
        style={{
          color: hovered ? "#E03C31" : "#64748b",
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: hovered ? "6px 14px" : "6px 10px",
          borderRadius: 7,
          background: hovered ? "rgba(224,60,49,0.06)" : "transparent",
          transition: "all 0.2s",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={{ color: "#E03C31", fontSize: 12 }}>›</span> {label}
      </Link>
    </li>
  );
}

export default function SitemapPage() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 60, paddingBottom: 80 }}>
      <div className="container">
        {/* Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
          borderRadius: 16,
          padding: "40px 48px",
          marginBottom: 48,
          color: "white",
        }}>
          <h1 style={{ fontSize: 36, marginBottom: 10 }}>🗺️ Sitemap</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>A complete overview of all pages on the GoTurkey education portal.</p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
          {sitemap.map((section) => (
            <div key={section.category} style={{
              background: "white",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}>
              <h2 style={{
                fontSize: 17,
                color: "#1a237e",
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: "2px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span>{section.icon}</span> {section.category}
              </h2>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {section.links.map((link) => (
                  <SitemapLink key={link.href} href={link.href} label={link.label} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
