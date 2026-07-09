"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
import { faqs } from "@/app/data/faq";

export default function FaqPage() {
  return (
    <InfoPageLayout title="Frequently Asked Questions" breadcrumb="For Students" icon="❓" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        Find answers to the most common questions asked by international students considering studying in Türkiye.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} i={i} />
        ))}
      </div>
    </InfoPageLayout>
  );
}

function FAQItem({ q, a, i }) {
  const [open, setOpen] = require("react").useState(i === 0);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", textAlign: "left", padding: "18px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 700, color: "var(--secondary)", fontSize: 15.5 }}>{q}</span>
        <span style={{ fontSize: 20, color: "var(--primary)", transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
      </button>
      {open && <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15, paddingBottom: 20 }}>{a}</p>}
    </div>
  );
}
