"use client";
import InfoPageLayout from "../components/InfoPageLayout";
import { useLanguage } from "../context/LanguageContext";

const dict = {
  EN: {
    title: "TR-YÖS Exam",
    breadcrumb: "Examination",
    intro: "The Türkiye International Student Admission Examination (TR-YÖS) is a central exam organized by ÖSYM for international students wishing to study at higher education institutions in Türkiye.",
    structure: "Exam Structure",
    q1: "Quantitative Relations",
    q2: "Basic Mathematics",
    duration: "Duration: 100 Minutes",
    questions: "80 Questions Total",
    langOpts: "Available Languages: Turkish, German, Arabic, French, English, Russian",
    howToApply: "How to Apply",
    applySteps: [
      "Create an account on the ÖSYM TR-YÖS Application System.",
      "Fill out the application form with your personal and educational details.",
      "Upload a passport-sized photograph and a valid ID/Passport.",
      "Pay the examination fee through the designated payment channels.",
      "Download your Exam Entrance Document once available."
    ],
    applyBtn: "Access ÖSYM Portal →"
  },
  TR: {
    title: "TR-YÖS Sınavı",
    breadcrumb: "Sınav",
    intro: "Türkiye Yurtdışından Öğrenci Kabul Sınavı (TR-YÖS), Türkiye'deki yükseköğretim kurumlarında eğitim görmek isteyen uluslararası öğrenciler için ÖSYM tarafından düzenlenen merkezi bir sınavdır.",
    structure: "Sınav Yapısı",
    q1: "Sayısal İlişkiler",
    q2: "Temel Matematik",
    duration: "Süre: 100 Dakika",
    questions: "Toplam 80 Soru",
    langOpts: "Mevcut Diller: Türkçe, Almanca, Arapça, Fransızca, İngilizce, Rusça",
    howToApply: "Nasıl Başvurulur",
    applySteps: [
      "ÖSYM TR-YÖS Başvuru Sistemi üzerinde bir hesap oluşturun.",
      "Kişisel ve eğitim bilgilerinizle başvuru formunu doldurun.",
      "Vesikalık bir fotoğraf ve geçerli bir Kimlik/Pasaport yükleyin.",
      "Belirlenen ödeme kanalları aracılığıyla sınav ücretini ödeyin.",
      "Kullanıma sunulduğunda Sınav Giriş Belgenizi indirin."
    ],
    applyBtn: "ÖSYM Portalı →"
  },
  AR: {
    title: "امتحان TR-YÖS",
    breadcrumb: "الامتحانات",
    intro: "امتحان قبول الطلاب الدوليين في تركيا (TR-YÖS) هو امتحان مركزي تنظمه ÖSYM للطلاب الدوليين الراغبين في الدراسة في مؤسسات التعليم العالي في تركيا.",
    structure: "هيكل الامتحان",
    q1: "العلاقات الكمية",
    q2: "الرياضيات الأساسية",
    duration: "المدة: 100 دقيقة",
    questions: "80 سؤال إجمالاً",
    langOpts: "اللغات المتاحة: التركية، الألمانية، العربية، الفرنسية، الإنجليزية، الروسية",
    howToApply: "كيفية التقديم",
    applySteps: [
      "قم بإنشاء حساب على نظام تقديم ÖSYM TR-YÖS.",
      "املأ استمارة التقديم ببياناتك الشخصية والتعليمية.",
      "قم بتحميل صورة بحجم جواز السفر وهوية/جواز سفر صالحين.",
      "ادفع رسوم الامتحان من خلال قنوات الدفع المخصصة.",
      "قم بتنزيل وثيقة دخول الامتحان الخاصة بك بمجرد توفرها."
    ],
    applyBtn: "الوصول إلى بوابة ÖSYM →"
  }
};

export default function TryosPage() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict.EN;

  return (
    <InfoPageLayout title={t.title} breadcrumb={t.breadcrumb} icon="📝" sidebar={false}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        {t.intro}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
        {/* Exam Structure */}
        <div style={{ background: "white", padding: 32, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 22, marginBottom: 20 }}>{t.structure}</h3>
          
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1, background: "rgba(224,60,49,0.05)", padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)", marginBottom: 8 }}>40</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--secondary)" }}>{t.q1}</div>
            </div>
            <div style={{ flex: 1, background: "rgba(26,35,126,0.05)", padding: 20, borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--secondary)", marginBottom: 8 }}>40</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--secondary)" }}>{t.q2}</div>
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: 10 }}><span>⏱️</span> {t.duration}</li>
            <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: 10 }}><span>📋</span> {t.questions}</li>
            <li style={{ padding: "12px 0", display: "flex", gap: 10 }}><span>🌍</span> {t.langOpts}</li>
          </ul>
        </div>

        {/* How to Apply */}
        <div style={{ background: "white", padding: 32, borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 22, marginBottom: 24 }}>{t.howToApply}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {t.applySteps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, fontSize: 14 }}>
                  {i + 1}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, paddingTop: 2 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <a href="#" className="btn-primary" style={{ display: "block", textAlign: "center", padding: "14px" }}>
              {t.applyBtn}
            </a>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
