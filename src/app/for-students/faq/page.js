"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

export default function FaqPage() {
  const faqs = [
    { q: "When can I apply to study in Türkiye?", a: "Application periods typically run from February to June for the fall semester. Some universities also accept spring semester applications between October and December. Check individual university websites for specific deadlines." },
    { q: "What are the language requirements?", a: "Programs taught in Turkish generally require a Turkish Proficiency Certificate (TÖMER). Programs in English require an IELTS (6.0+), TOEFL, or equivalent certificate. Some universities offer their own language proficiency exams." },
    { q: "Do I need TR-YÖS to apply?", a: "TR-YÖS (Turkish Universities Examination for Foreign Students) is accepted by most Turkish universities but is not always mandatory. Many universities also accept SAT, ACT, or national high school diplomas. Check the admission requirements of your specific university." },
    { q: "How much does it cost to study in Türkiye?", a: "Tuition fees at state universities range from approximately $300–$2,000 per year for international students. Foundation (private) university tuition can range from $3,000–$20,000 per year. Living costs average $400–$700 per month including accommodation, food, and transportation." },
    { q: "Are there scholarships available?", a: "Yes! Türkiye Scholarships (Türkiye Bursları) is the flagship government scholarship covering full tuition, accommodation, monthly stipend, health insurance, and a return flight. Many universities also offer their own merit-based scholarships." },
    { q: "What documents are typically required for application?", a: "Usually: a high school diploma and transcripts (translated and notarized), passport copy, standardized test scores (TR-YÖS, SAT, or equivalent), language proficiency certificate, passport photos, and a statement of purpose." },
    { q: "Can I work while studying in Türkiye?", a: "International students with a valid student residence permit may work part-time (up to 24 hours per week) during the academic year after completing their first year of study. A work permit is required and must be obtained separately." },
    { q: "Is healthcare available for international students?", a: "International students must have health insurance while studying in Türkiye. Türkiye Scholarship recipients receive health insurance as part of the scholarship. Other students can access the General Health Insurance (GHS) system or purchase private health insurance." },
    { q: "What is the cost of living in Türkiye?", a: "Türkiye is one of the most affordable study destinations in Europe and Asia. Monthly expenses typically include: accommodation (dormitory: $100–200, rental: $200–400), food ($150–250), transportation ($30–50), books/supplies ($30–50), and entertainment ($50–100)." },
    { q: "Are Turkish university degrees recognized internationally?", a: "Yes. Turkish universities implement the Bologna Process, and graduates receive a Diploma Supplement. Turkish degrees are recognized by all European countries. Many programs also hold international accreditation (ABET, AACSB, etc.)." },
    { q: "How do I get a student residence permit?", a: "After arriving in Türkiye on a student visa, apply online at e-ikamet.goc.gov.tr within 30 days. Book an appointment at your local DGMM office, attend with your documents (acceptance letter, health insurance, accommodation proof), and receive your card by mail." },
    { q: "Which cities are best for international students?", a: "İstanbul (most cosmopolitan, 50+ universities), Ankara (capital city, major research universities), İzmir (Aegean coast, relaxed lifestyle), Bursa, Konya, and Eskişehir are all highly popular with international students." },
  ];

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
