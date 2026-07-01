"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";

export default function HigherEdSystemPage() {
  return (
    <InfoPageLayout title="Turkish Higher Education System" breadcrumb="Why Türkiye?" icon="🏛️" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        Türkiye's higher education system is governed by the Council of Higher Education (YÖK) and follows the principles of the Bologna Process, ensuring compatibility with the European Higher Education Area.
      </p>

      {[
        { title: "Structure of the System", icon: "📐", body: "The Turkish higher education system is structured in three cycles aligned with the Bologna Process: Bachelor's (4 years), Master's (1.5–2 years), and Doctorate (4 years). Some programs like Medicine (6 years), Dentistry (5 years), and Pharmacy (5 years) have longer durations." },
        { title: "Council of Higher Education (YÖK)", icon: "🏢", body: "The Council of Higher Education (Yükseköğretim Kurulu – YÖK) is the supreme body responsible for planning, coordinating, regulating and supervising higher education. It was established in 1981. YÖK determines the policies and principles to be followed in higher education, and the standards and requirements for degrees." },
        { title: "Number of Universities", icon: "🎓", body: "Turkey has 208 universities — 129 state universities and 79 foundation (private) universities. State universities are funded by the government and offer significantly lower tuition fees. Foundation universities are private and may offer higher tuition but often provide more scholarships." },
        { title: "Bologna Process & ECTS", icon: "📋", body: "Türkiye fully implements the Bologna Process and uses the European Credit Transfer and Accumulation System (ECTS). All students receive a Diploma Supplement upon graduation, which facilitates recognition of qualifications across Europe and beyond. Turkey's Bologna report is rated 5 out of 5." },
        { title: "Quality Assurance", icon: "✅", body: "Quality assurance in Turkish higher education is overseen by the Higher Education Quality Council (YÖKAK). Universities undergo institutional accreditation processes, and many programs hold international accreditation from organizations such as ABET, AACSB, and EQUIS." },
        { title: "Erasmus+ and Exchange Programs", icon: "🌍", body: "Türkiye is one of the most active countries in the Erasmus+ program. In addition to Erasmus+, Turkey has its own student and staff exchange programs: Mevlana (international exchanges with non-EU countries) and Farabi (domestic exchanges between Turkish universities)." },
        { title: "Academic Calendar", icon: "📅", body: "The academic year in Turkish universities typically consists of two semesters. The fall semester runs from September/October to January/February, and the spring semester from February/March to June. Some universities also offer a summer semester." },
        { title: "Language of Instruction", icon: "🗣️", body: "While many programs are conducted in Turkish, a growing number of universities offer programs fully in English, especially at postgraduate level. Some universities also offer programs in German, French, and Arabic. Students enrolled in Turkish-medium programs may be required to take a one-year Turkish language preparatory course." },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 30, padding: "24px 28px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 19, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span> {item.title}
          </h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
