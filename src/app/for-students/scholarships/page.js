"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
import { useLanguage } from "@/app/context/LanguageContext";

const dict = {
  EN: {
    title: "Türkiye Scholarships",
    breadcrumb: "For Students",
    intro: "Türkiye Scholarships is a government-funded, competitive scholarship program, awarded to outstanding students and researchers to pursue full-time or short-term programs at top universities in Türkiye.",
    whatItCovers: "What does the scholarship cover?",
    covers: [
      { t: "University and program placement", i: "🏛️" },
      { t: "Monthly Stipend (Varies by degree level)", i: "💵" },
      { t: "Tuition Fee", i: "🎓" },
      { t: "Once-off Return Flight Ticket", i: "✈️" },
      { t: "Health Insurance", i: "🏥" },
      { t: "Accommodation", i: "🏠" },
      { t: "One year Turkish Language Course", i: "🗣️" }
    ],
    criteria: "Application Criteria",
    criteriaList: [
      "Minimum academic achievement for Bachelor's degree applicants: 70%",
      "Minimum academic achievement for Master's and Doctorate degree applicants: 75%",
      "Minimum academic achievement for Health Science (Medicine, Dentistry and Pharmacy) applicants: 90%",
      "Age limits: Under 21 for Undergraduate, Under 30 for Master's, Under 35 for PhD"
    ],
    applyBtn: "Official Application Portal →"
  },
  TR: {
    title: "Türkiye Bursları",
    breadcrumb: "Öğrenciler İçin",
    intro: "Türkiye Bursları, Türkiye'deki en iyi üniversitelerde tam zamanlı veya kısa süreli programlar izlemek üzere seçkin öğrencilere ve araştırmacılara verilen, hükümet tarafından finanse edilen rekabetçi bir burs programıdır.",
    whatItCovers: "Burs neleri kapsıyor?",
    covers: [
      { t: "Üniversite ve program yerleştirme", i: "🏛️" },
      { t: "Aylık Burs (Derece seviyesine göre değişir)", i: "💵" },
      { t: "Öğrenim Ücreti", i: "🎓" },
      { t: "Gidiş-Dönüş Uçak Bileti (Bir Defaya Mahsus)", i: "✈️" },
      { t: "Sağlık Sigortası", i: "🏥" },
      { t: "Konaklama", i: "🏠" },
      { t: "Bir yıllık Türkçe Dil Kursu", i: "🗣️" }
    ],
    criteria: "Başvuru Kriterleri",
    criteriaList: [
      "Lisans başvuru sahipleri için minimum akademik başarı: %70",
      "Yüksek Lisans ve Doktora başvuru sahipleri için minimum akademik başarı: %75",
      "Sağlık Bilimleri (Tıp, Diş Hekimliği ve Eczacılık) başvuru sahipleri için minimum akademik başarı: %90",
      "Yaş sınırları: Lisans için 21 yaş altı, Yüksek Lisans için 30 yaş altı, Doktora için 35 yaş altı"
    ],
    applyBtn: "Resmi Başvuru Portalı →"
  },
  AR: {
    title: "المنح التركية",
    breadcrumb: "للطلاب",
    intro: "المنح التركية هي برنامج منح دراسية تنافسي ممول من الحكومة، يُمنح للطلاب والباحثين المتميزين لمتابعة برامج بدوام كامل أو قصيرة الأجل في أفضل الجامعات في تركيا.",
    whatItCovers: "ماذا تغطي المنحة؟",
    covers: [
      { t: "التنسيق الجامعي والبرنامج", i: "🏛️" },
      { t: "راتب شهري (يختلف حسب مستوى الدرجة)", i: "💵" },
      { t: "الرسوم الدراسية", i: "🎓" },
      { t: "تذكرة طيران ذهاب وعودة لمرة واحدة", i: "✈️" },
      { t: "تأمين صحي", i: "🏥" },
      { t: "السكن", i: "🏠" },
      { t: "دورة لغة تركية لمدة عام واحد", i: "🗣️" }
    ],
    criteria: "معايير التقديم",
    criteriaList: [
      "الحد الأدنى للتحصيل الأكاديمي للمتقدمين لدرجة البكالوريوس: 70%",
      "الحد الأدنى للتحصيل الأكاديمي للمتقدمين لدرجة الماجستير والدكتوراه: 75%",
      "الحد الأدنى للتحصيل الأكاديمي للمتقدمين في العلوم الصحية (الطب وطب الأسنان والصيدلة): 90%",
      "الحدود العمرية: أقل من 21 عامًا للبكالوريوس، أقل من 30 عامًا للماجستير، أقل من 35 عامًا للدكتوراه"
    ],
    applyBtn: "بوابة التقديم الرسمية →"
  }
};

export default function ScholarshipsPage() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict.EN;

  return (
    <InfoPageLayout title={t.title} breadcrumb={t.breadcrumb} icon="🎓" sidebar={true}>
      <div style={{ background: "linear-gradient(135deg, rgba(224,60,49,0.05) 0%, rgba(26,35,126,0.05) 100%)", padding: 32, borderRadius: 16, marginBottom: 40, border: "1px solid var(--border)" }}>
        <p style={{ color: "var(--secondary)", fontSize: 17, lineHeight: 1.8, fontWeight: 500, margin: 0 }}>
          {t.intro}
        </p>
      </div>

      <h3 style={{ color: "var(--secondary)", fontSize: 24, marginBottom: 24, borderBottom: "2px solid var(--border)", paddingBottom: 10 }}>
        {t.whatItCovers}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 40 }}>
        {t.covers.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: "white", padding: 20, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <div style={{ fontSize: 28, background: "rgba(224,60,49,0.05)", padding: 12, borderRadius: 12 }}>{item.i}</div>
            <div style={{ fontWeight: 600, color: "var(--secondary)" }}>{item.t}</div>
          </div>
        ))}
      </div>

      <h3 style={{ color: "var(--secondary)", fontSize: 24, marginBottom: 24, borderBottom: "2px solid var(--border)", paddingBottom: 10 }}>
        {t.criteria}
      </h3>
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {t.criteriaList.map((crit, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, color: "var(--text-muted)", background: "rgba(26,35,126,0.02)", padding: "16px 20px", borderRadius: 8 }}>
            <span style={{ color: "var(--primary)" }}>✔️</span> {crit}
          </li>
        ))}
      </ul>

      <div style={{ textAlign: "center", marginTop: 40, padding: 40, background: "rgba(26,35,126,0.03)", borderRadius: 16 }}>
        <a href="#" className="btn-primary" style={{ padding: "16px 32px", fontSize: 18 }}>{t.applyBtn}</a>
      </div>
    </InfoPageLayout>
  );
}
