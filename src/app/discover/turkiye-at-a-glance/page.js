"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

export default function TurkiyeAtGlancePage() {
  return (
    <InfoPageLayout title="Türkiye at a Glance" breadcrumb="Discover Türkiye" icon="🇹🇷" sidebar={true}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {[
          ["85M+", "Population"],
          ["814,578 km²", "Area"],
          ["81", "Provinces"],
          ["208", "Universities"],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center", padding: "20px 16px", background: "rgba(26,35,126,0.05)", borderRadius: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-heading)" }}>{val}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>
      {[
        { title: "Geography", icon: "🗺️", body: "Türkiye is a transcontinental country located mainly in Anatolia in West Asia and East Thrace in Southeast Europe. It is bordered by the Black Sea to the north, the Mediterranean Sea to the south, and the Aegean Sea to the west. The country borders Greece and Bulgaria to the northwest, Georgia to the northeast, Armenia, Azerbaijan (exclave of Nakhchivan), and Iran to the east, and Iraq and Syria to the south." },
        { title: "History", icon: "📜", body: "The region that now constitutes Türkiye has been inhabited since the Paleolithic era and has been the cradle of many civilizations including the Hittites, Phrygians, Lydians, Greeks, Romans, Byzantines, and Ottomans. The Republic of Türkiye was established in 1923 by Mustafa Kemal Atatürk following the Turkish War of Independence after the fall of the Ottoman Empire." },
        { title: "Culture", icon: "🎨", body: "Turkish culture is a rich mosaic shaped by thousands of years of history and the blending of numerous civilizations. Turkish cuisine, music, literature, architecture, and crafts reflect this diversity. The country has produced significant contributions to global culture through its arts, cuisine, and intellectual traditions." },
        { title: "Economy", icon: "📈", body: "Türkiye has the world's 19th largest economy by GDP (PPP). Key sectors include textiles, automotive, electronics, steel, chemicals, and tourism. With a young and educated population, Türkiye is one of the world's fastest-growing emerging markets." },
        { title: "Education", icon: "🎓", body: "Türkiye's education system has undergone significant transformation in recent decades. The country has 208 universities serving over 7 million students. Türkiye has the highest number of students in the European Higher Education Area and implements the Bologna Process, ensuring its degrees are recognized internationally." },
      ].map((item, i) => (
        <div key={i} style={{ marginBottom: 24, padding: "22px 26px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 12, border: "1px solid var(--border)" }}>
          <h3 style={{ color: "var(--secondary)", fontSize: 18, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span> {item.title}
          </h3>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
