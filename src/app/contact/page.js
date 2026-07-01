"use client";
import InfoPageLayout from "../components/InfoPageLayout";
import { useLanguage } from "../context/LanguageContext";

const dict = {
  EN: {
    title: "Contact Us",
    breadcrumb: "Home",
    desc: "Have a question? Our support team is here to help you on your journey to studying in Türkiye.",
    addressTitle: "Head Office",
    address: "Molla Gürani Neighborhood, Tomrukçu Street, Nevin Apartment, No: 51/3 Fatih / İSTANBUL / TÜRKİYE",
    phone: "Phone",
    email: "Email",
    formTitle: "Send us a Message",
    nameLabel: "Your Name",
    emailLabel: "Email Address",
    subjectLabel: "Subject",
    messageLabel: "Message",
    sendBtn: "Send Message"
  },
  TR: {
    title: "Bize Ulaşın",
    breadcrumb: "Ana Sayfa",
    desc: "Bir sorunuz mu var? Destek ekibimiz Türkiye'de eğitim yolculuğunuzda size yardımcı olmak için burada.",
    addressTitle: "Merkez Ofis",
    address: "Molla Gürani Mahallesi, Tomrukçu Sokak, Nevin Apartmanı, No: 51/3 Fatih / İSTANBUL / TÜRKİYE",
    phone: "Telefon",
    email: "E-posta",
    formTitle: "Bize Mesaj Gönderin",
    nameLabel: "Adınız",
    emailLabel: "E-posta Adresi",
    subjectLabel: "Konu",
    messageLabel: "Mesaj",
    sendBtn: "Mesaj Gönder"
  },
  AR: {
    title: "اتصل بنا",
    breadcrumb: "الرئيسية",
    desc: "هل لديك سؤال؟ فريق الدعم لدينا هنا لمساعدتك في رحلتك للدراسة في تركيا.",
    addressTitle: "المكتب الرئيسي",
    address: "حي ملا غوراني، شارع تومروكتشو، شقة نيفين، رقم: 51/3 الفاتح / إسطنبول / تركيا",
    phone: "هاتف",
    email: "البريد الإلكتروني",
    formTitle: "أرسل لنا رسالة",
    nameLabel: "اسمك",
    emailLabel: "البريد الإلكتروني",
    subjectLabel: "الموضوع",
    messageLabel: "الرسالة",
    sendBtn: "إرسال الرسالة"
  }
};

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict.EN;

  return (
    <InfoPageLayout title={t.title} breadcrumb={t.breadcrumb} icon="📞" sidebar={false}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:40,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        {t.desc}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
        {/* Contact Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "rgba(26,35,126,0.03)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>📍</div>
            <h4 style={{ color: "var(--secondary)", marginBottom: 8 }}>{t.addressTitle}</h4>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>{t.address}</p>
          </div>
          <div style={{ background: "rgba(26,35,126,0.03)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>☎️</div>
            <h4 style={{ color: "var(--secondary)", marginBottom: 8 }}>{t.phone}</h4>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>+90 555 175 32 26</p>
          </div>
          <div style={{ background: "rgba(26,35,126,0.03)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>✉️</div>
            <h4 style={{ color: "var(--secondary)", marginBottom: 8 }}>{t.email}</h4>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>goturkeyandstudytr@gmail.com</p>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: "white", padding: 32, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 20, marginBottom: 24 }}>{t.formTitle}</h3>
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase" }}>{t.nameLabel}</label>
                <input type="text" className="form-input" required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase" }}>{t.emailLabel}</label>
                <input type="email" className="form-input" required />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase" }}>{t.subjectLabel}</label>
              <input type="text" className="form-input" required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase" }}>{t.messageLabel}</label>
              <textarea className="form-input" rows="5" required style={{ resize: "vertical" }}></textarea>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: "14px 28px", fontSize: 15 }}>
              {t.sendBtn}
            </button>
          </form>
        </div>
      </div>
    </InfoPageLayout>
  );
}
