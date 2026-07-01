"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "./context/LanguageContext";

const regionData = {
  MARMARA: {
    desc: "The Marmara Region is Turkey's smallest but most densely populated region. It covers approximately 8.5% of Turkey's surface area. Istanbul, Turkey's cultural and economic capital, is located here. The region is surrounded by the Black Sea to the north, the Aegean Sea to the southwest, and the Sea of Marmara to the south.",
    cities: ["İstanbul", "Çanakkale", "Balıkesir", "Bursa", "Edirne", "Kocaeli", "Tekirdağ", "Sakarya", "Bilecik"],
    unis: 34
  },
  AEGEAN: {
    desc: "The Aegean Region is named after the Aegean Sea. It borders Marmara to the north, Central Anatolia to the east, the Mediterranean to the south and the Aegean Sea to the west. Known for its olive groves, vineyards, and ancient ruins, it hosts Turkey's third-largest city, İzmir.",
    cities: ["İzmir", "Muğla", "Denizli", "Aydın", "Afyon", "Kütahya", "Uşak", "Manisa"],
    unis: 25
  },
  "BLACK SEA": {
    desc: "The Black Sea Region covers the Black Sea coast from the Georgian border to the east of the Sakarya Plain. It is known for its lush green landscape, tea plantations, and hazelnut production. The southern boundary passes through the southern skirts of the North Anatolian Mountains.",
    cities: ["Trabzon", "Rize", "Artvin", "Bolu", "Karabük", "Amasya", "Samsun", "Zonguldak", "Sinop", "Kastamonu", "Giresun"],
    unis: 18
  },
  "CENTRAL ANATOLIA": {
    desc: "Located in the central part of Anatolia, this is one of Turkey's seven geographical regions. Ankara, Turkey's capital city, is located here. The region is called 'Central Anatolia' due to its location in the heart of Turkey. It has a dry continental climate and is known for its vast steppes.",
    cities: ["Ankara", "Konya", "Eskişehir", "Nevşehir", "Sivas", "Kayseri", "Kırşehir", "Aksaray", "Niğde", "Yozgat", "Çorum"],
    unis: 22
  },
  MEDITERRANEAN: {
    desc: "The Mediterranean Region lies along the Mediterranean coast in the south of Anatolia. It has a warm Mediterranean climate and is known for tourism, cotton production, and citrus fruits. Major cities include Antalya, one of Turkey's prime tourist destinations, and Adana, an important industrial hub.",
    cities: ["Antalya", "Mersin", "Adana", "Hatay", "Isparta", "Burdur", "Kahramanmaraş", "Osmaniye"],
    unis: 15
  },
  "SOUTHEASTERN ANATOLIA": {
    desc: "Southeastern Anatolia Region is one of Turkey's seven geographical regions. It borders Syria to the south and Iraq to the southeast. The region is historically rich, home to Göbeklitepe — the world's oldest known temple — and Gaziantep, famed for its unique cuisine, especially baklava.",
    cities: ["Gaziantep", "Şanlıurfa", "Mardin", "Adıyaman", "Diyarbakır", "Batman", "Siirt", "Şırnak"],
    unis: 12
  },
  "EASTERN ANATOLIA": {
    desc: "Eastern Anatolia is Turkey's largest geographical region, but one of its most sparsely populated. It borders Georgia and Armenia to the northeast, Iran to the east, and Iraq to the southeast. Known for its dramatic highlands, Mount Ararat (Turkey's highest peak), Lake Van, and harsh winters.",
    cities: ["Kars", "Erzurum", "Van", "Bitlis", "Ağrı", "Malatya", "Elazığ", "Bingöl", "Tunceli", "Muş"],
    unis: 10
  }
};

const heroSlides = [
  { titleKey: "heroTitle1", subKey: "heroSub1", bg: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(200,0,0,0.3) 100%), url('/hero.png')" },
  { titleKey: "heroTitle2", subKey: "heroSub2", bg: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(26,35,126,0.4) 100%), url('/hero.png')" },
  { titleKey: "heroTitle3", subKey: "heroSub3", bg: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,120,60,0.4) 100%), url('/explore.png')" },
  { titleKey: "heroTitle4", subKey: "heroSub4", bg: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(150,50,0,0.4) 100%), url('/explore.png')" },
  { titleKey: "heroTitle5", subKey: "heroSub5", bg: "linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(26,35,126,0.4) 100%), url('/hero.png')" },
];

const qaVideos = [
  { cat: "Recognition and Equivalence", questions: [
    "What is recognition and equivalence?",
    "How do I apply for recognition of my diploma?",
    "Which institutions do recognition in Türkiye?",
    "What documents are required for equivalence?",
    "How long does the equivalence process take?",
    "Can I work in Türkiye with a foreign diploma?",
    "Is recognition required for postgraduate studies?",
    "What is YÖK's role in recognition?"
  ]},
  { cat: "Türkiye Scholarships", questions: [
    "What scholarships are available for international students?",
    "How do I apply for Türkiye Scholarships?",
    "What does the Türkiye Scholarship cover?",
    "What are the eligibility requirements?"
  ]},
  { cat: "Healthcare Services", questions: [
    "What healthcare services are available for students?",
    "Is health insurance mandatory for students?",
    "How do I register at a public hospital?"
  ]}
];

const students = [
  { name: "Ekrem Zajmi", faculty: "Faculty of Political Sciences", country: "KOSOVO", quote: "Studying in Türkiye has been a transformative experience. The academic environment is world-class, and the Turkish people are incredibly welcoming. I have gained both knowledge and lifelong friendships." },
  { name: "Meriem Amrane", faculty: "Faculty of Engineering", country: "ALGERIA", quote: "The quality of education here is outstanding. My professors are highly knowledgeable and the facilities are modern. I also love the cultural richness of Türkiye — there is always something new to discover." },
  { name: "Soo Yeon Park", faculty: "Faculty of Languages History and Geography", country: "KOREA", quote: "Türkiye is a perfect blend of East and West. As a language student, immersing myself in Turkish culture while studying has been invaluable. The country's history is alive everywhere you look." },
  { name: "Noaman Naseev", faculty: "Electrical and Electronics Engineering", country: "PAKISTAN", quote: "The engineering programs here are very well structured. I am gaining practical experience alongside my theoretical studies. Türkiye's growing tech sector also provides excellent internship opportunities." },
  { name: "Peace Doka", faculty: "Faculty of Veterinary Medicine", country: "SOUTH SUDAN", quote: "I chose Türkiye for its excellent veterinary program and I have not been disappointed. The clinical training facilities are top-notch and the international student community is very supportive." }
];

const newsItems = [
  { title: "What are the Duties and Responsibilities of Council of Higher Education (CoHE)?", category: "Council of Higher Education", date: "2024-01-15", excerpt: "The Council of Higher Education (YÖK) is responsible for planning, coordinating, regulating and supervising higher education in Turkey..." },
  { title: "What is quality assurance and accreditation?", category: "Council of Higher Education", date: "2024-01-10", excerpt: "Quality assurance in Turkish higher education is overseen by the Higher Education Quality Council (YÖKAK)..." },
  { title: "2024 TR-YÖS Applications Are Now Open", category: "Council of Higher Education", date: "2024-02-01", excerpt: "International candidates can now apply for the TR-YÖS exam conducted in 52 countries at 78 centers worldwide..." },
  { title: "Higher Education Quality Council Annual Report Released", category: "Higher Education Quality Council", date: "2024-01-20", excerpt: "YÖKAK has released its annual quality assurance report, highlighting improvements in Turkish university standards..." },
  { title: "New International Student Scholarship Programs Announced", category: "Higher Education Quality Council", date: "2024-01-25", excerpt: "New scholarship opportunities for international students have been announced for the 2024-2025 academic year..." },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeRegion, setActiveRegion] = useState("MARMARA");
  const [activeStep, setActiveStep] = useState(1);
  const [activeVideoCategory, setActiveVideoCategory] = useState(0);
  const [studyForm, setStudyForm] = useState({ level: "", city: "", type: "", language: "", program: "" });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveSlide(s => (s + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleStudySearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(studyForm).toString();
    window.location.href = `/StudySearch/List?${params}`;
  };

  const regions = Object.keys(regionData);
  const steps = [
    { num: 1, titleKey: "step1Title", descKey: "step1Desc", link: "/StudySearch/List" },
    { num: 2, titleKey: "step2Title", descKey: "step2Desc", link: "/for-students/scholarships" },
    { num: 3, titleKey: "step3Title", descKey: "step3Desc", link: "/StudyinTurkey/Universities" },
    { num: 4, titleKey: "step4Title", descKey: "step4Desc", link: "/StudyinTurkey/Universities" },
    { num: 5, titleKey: "step5Title", descKey: "step5Desc", link: "/for-students/visa-residence" },
  ];

  return (
    <>
      {/* SIDE DOT NAVIGATION */}
      <div className="dot-nav">
        {["#item-1","#item-2","#item-3","#item-4","#item-5","#item-6"].map((href, i) => (
          <a key={i} href={href} title={["WHY TÜRKİYE?","5 STEPS","DISCOVERY","Q&A VIDEOS","CoHE NEWS","STUDENTS SAY"][i]}></a>
        ))}
      </div>

      {/* HERO SECTION */}
      <section id="hero" className="hero">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide ${i === activeSlide ? "active" : ""}`}
            style={{ background: slide.bg, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="hero-content">
              <h1>{t[slide.titleKey]}</h1>
              <p>{t[slide.subKey]}</p>
              <a href="#item-1" className="btn-primary" style={{ marginBottom: 20 }}>{t.exploreMore}</a>
            </div>
          </div>
        ))}

        {/* Slide Dots */}
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === activeSlide ? "active" : ""}`} onClick={() => { setActiveSlide(i); clearInterval(timerRef.current); }} />
          ))}
        </div>

        {/* FLOATING STUDY FINDER */}
        <div className="study-finder">
          <h3>🔍 {t.studyFinder}</h3>
          <form className="study-finder-form" onSubmit={handleStudySearch}>
            <select className="form-select" value={studyForm.level} onChange={e => setStudyForm(f => ({...f, level: e.target.value}))}>
              <option value="">{t.educationLevel}</option>
              <option value="associate">{t.associateDegree}</option>
              <option value="bachelor">{t.bachelorsDegree}</option>
              <option value="master">{t.mastersDegree}</option>
              <option value="doctorate">{t.doctorate}</option>
            </select>
            <select className="form-select" value={studyForm.city} onChange={e => setStudyForm(f => ({...f, city: e.target.value}))}>
              <option value="">{t.selectCity}</option>
              {["İstanbul","Ankara","İzmir","Bursa","Trabzon","Erzurum","Konya","Antalya","Gaziantep","Diyarbakır","Eskişehir","Kayseri","Samsun","Mersin","Adana"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className="form-select" value={studyForm.type} onChange={e => setStudyForm(f => ({...f, type: e.target.value}))}>
              <option value="">{t.teachingType}</option>
              <option value="formal">{t.formal}</option>
              <option value="evening">{t.eveningEd}</option>
              <option value="distance">{t.distanceLearning}</option>
            </select>
            <select className="form-select" value={studyForm.language} onChange={e => setStudyForm(f => ({...f, language: e.target.value}))}>
              <option value="">{t.studyLanguage}</option>
              <option value="english">English</option>
              <option value="turkish">Turkish</option>
              <option value="arabic">Arabic</option>
              <option value="french">French</option>
              <option value="german">German</option>
            </select>
            <input
              type="text"
              placeholder={t.programName}
              className="form-input"
              value={studyForm.program}
              onChange={e => setStudyForm(f => ({...f, program: e.target.value}))}
            />
            <button type="submit" className="btn-primary search-btn">{t.searchUniversity}</button>
          </form>
        </div>
      </section>

      {/* WHY TÜRKİYE */}
      <section id="item-1" className="section section-bg">
        <div className="container">
          <div className="section-header">
            <h2>{t.whyTurkiyeTitle}</h2>
            <p>{t.whyTurkiyeDesc}</p>
          </div>
          <div className="grid-4">
            {[
              { icon: "🌉", title: t.bridgeWorld, desc: t.bridgeWorldDesc },
              { icon: "🎓", title: t.dreamJobEd, desc: t.dreamJobEdDesc },
              { icon: "📚", title: t.comprehensiveUni, desc: t.comprehensiveUniDesc },
              { icon: "💰", title: t.qualityEconomic, desc: t.qualityEconomicDesc },
            ].map((card, i) => (
              <div key={i} className="card">
                <div className="card-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-text">{card.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="/why-turkiye/10-reasons" className="btn-secondary">{t.viewMore}</a>
          </div>
        </div>
      </section>

      {/* 5 STEPS */}
      <section id="item-2" className="section" style={{ background: "#f8fafc" }}>
        <div className="container">
          <div className="section-header">
            <h2>{t.stepsTitle}</h2>
          </div>
          {/* Step Tabs */}
          <div className="step-tabs">
            {steps.map(s => (
              <button key={s.num} className={`step-tab ${activeStep === s.num ? "active" : ""}`} onClick={() => setActiveStep(s.num)}>
                <span className="step-tab-num">{s.num}</span>
                <span className="step-tab-label">{t[s.titleKey]}</span>
              </button>
            ))}
          </div>
          {/* Active Step Content */}
          {steps.map(s => activeStep === s.num && (
            <div key={s.num} className="step-content-panel">
              <div className="step-number-big">{s.num}</div>
              <div>
                <h3 className="step-title">{t[s.titleKey]}</h3>
                <p className="step-text">{t[s.descKey]}</p>
                <a href={s.link} className="btn-primary" style={{ marginTop: 20 }}>{t.viewMore}</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCOVERY TÜRKİYE */}
      <section id="item-3" className="section section-bg">
        <div className="container">
          <div className="section-header">
            <h2>{t.discoveryTitle}</h2>
            <p>{t.discoveryDesc}</p>
          </div>
          <div className="region-tabs">
            {regions.map(region => (
              <div
                key={region}
                className={`region-tab ${activeRegion === region ? "active" : ""}`}
                onClick={() => setActiveRegion(region)}
              >
                {region}
              </div>
            ))}
          </div>
          <div className="region-content">
            <div className="region-info">
              <div className="region-header-row">
                <h3>{activeRegion} REGION</h3>
                <span className="region-uni-count">🎓 {regionData[activeRegion].unis} Universities</span>
              </div>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.8", marginBottom: 20 }}>
                {regionData[activeRegion].desc}
              </p>
              <div className="region-cities">
                {regionData[activeRegion].cities.map(city => (
                  <a key={city} href={`/discover/cities/${city.toLowerCase()}`} className="city-badge">{city}</a>
                ))}
              </div>
              <a href="/discover/cities" className="btn-primary" style={{ marginTop: 25, display: "inline-block" }}>
                {t.exploreMoreBtn}
              </a>
            </div>
            <div className="region-map-placeholder">
              <div className="region-map-img" style={{ backgroundImage: "url('/explore.png')", backgroundSize: "cover", backgroundPosition: "center", width: "100%", height: "300px", borderRadius: 12, opacity: 0.85 }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Q&A VIDEOS */}
      <section id="item-4" className="section" style={{ background: "#f8fafc" }}>
        <div className="container">
          <div className="section-header">
            <h2>{t.qaTitle}</h2>
            <p>{t.qaDesc}</p>
          </div>
          <div className="qa-layout">
            <div className="qa-categories">
              {qaVideos.map((cat, i) => (
                <button key={i} className={`qa-cat-btn ${activeVideoCategory === i ? "active" : ""}`} onClick={() => setActiveVideoCategory(i)}>
                  {cat.cat}
                </button>
              ))}
            </div>
            <div className="qa-list">
              {qaVideos[activeVideoCategory].questions.map((q, i) => (
                <div key={i} className="qa-item">
                  <div className="qa-play">▶</div>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS FROM CoHE */}
      <section id="item-5" className="section section-bg">
        <div className="container">
          <div className="section-header">
            <h2>{t.newsTitle}</h2>
            <p>{t.newsDesc}</p>
          </div>
          <div className="grid-3">
            {newsItems.map((news, i) => (
              <div key={i} className="card news-card">
                <div className="news-category">{news.category}</div>
                <div className="news-date">{news.date}</div>
                <h3 className="card-title" style={{ fontSize: 17, marginBottom: 12 }}>{news.title}</h3>
                <p className="card-text" style={{ fontSize: 14 }}>{news.excerpt}</p>
                <a href="/for-students/cohe-news" className="news-read-more">Read More →</a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <a href="/for-students/cohe-news" className="btn-secondary">{t.viewMore}</a>
          </div>
        </div>
      </section>

      {/* WHAT OUR STUDENTS SAY */}
      <section id="item-6" className="section" style={{ background: "#f8fafc" }}>
        <div className="container">
          <div className="section-header">
            <h2>{t.studentsTitle}</h2>
            <p>{t.studentsDesc}</p>
          </div>
          <div className="students-grid">
            {students.map((s, i) => (
              <div key={i} className="card testimonial-card">
                <div className="quote">"</div>
                <p className="card-text" style={{ fontStyle: "italic", lineHeight: 1.8 }}>{s.quote}</p>
                <div className="student-info">
                  <div className="student-avatar">{s.name.charAt(0)}</div>
                  <div>
                    <h4 className="student-name">{s.name}</h4>
                    <p className="student-major">{s.faculty} \ {s.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <a href="/for-students/what-students-say" className="btn-secondary">{t.viewMore}</a>
          </div>
        </div>
      </section>

      {/* TR-YÖS BANNER */}
      <section className="section tryos-banner">
        <div className="container">
          <div className="tryos-content">
            <div>
              <h2>{t.tryosTitle}</h2>
              <p>{t.tryosDesc}</p>
            </div>
            <a href="/tryos" className="btn-white">{t.applyTryos}</a>
          </div>
        </div>
      </section>

      {/* Floating Contact */}
      <a href="/contact" className="floating-contact" title="Contact Us">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </a>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
      )}
    </>
  );
}
