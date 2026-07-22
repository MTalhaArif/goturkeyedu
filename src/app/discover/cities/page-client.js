"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";

const cities = [
  { name: "İstanbul", emoji: "🌉", pop: "15.8M", unis: "50+", desc: "Turkey's largest city straddling two continents, İstanbul is the cultural, financial, and historical heart of the country. Home to iconic landmarks like the Hagia Sophia, Topkapı Palace, and the Grand Bazaar, it offers an unmatched mix of ancient history and modern urban life. Students enjoy a vibrant nightlife, world-class cuisine, and a thriving arts scene." },
  { name: "Ankara", emoji: "🏛️", pop: "5.7M", unis: "20+", desc: "Turkey's capital city is a modern, planned metropolis with a strong political and administrative atmosphere. Home to major government institutions, embassies, and prestigious universities like METU and Hacettepe, Ankara attracts students seeking serious academic environments with lower living costs than İstanbul." },
  { name: "İzmir", emoji: "🌊", pop: "4.4M", unis: "12+", desc: "Situated on the Aegean coast, İzmir is Turkey's third-largest city and one of its most cosmopolitan. Known for its relaxed Mediterranean lifestyle, mild climate, vibrant waterfront (Kordon), and progressive culture. Ege University is one of the most prestigious institutions here." },
  { name: "Bursa", emoji: "🏔️", pop: "3.1M", unis: "5+", desc: "The first capital of the Ottoman Empire, Bursa is a city of rich history, mountains, and thermal springs. Located at the foot of Mount Uludağ, it is known for its natural beauty, traditional crafts, and high quality of life at affordable cost." },
  { name: "Antalya", emoji: "🌴", pop: "2.6M", unis: "4+", desc: "A major tourist hub on the Mediterranean coast, Antalya is famous for its stunning beaches, ancient ruins, and year-round warm climate. Students enjoy an exceptionally high quality of life in a beautiful natural setting." },
  { name: "Eskişehir", emoji: "🎨", pop: "0.9M", unis: "3+", desc: "Known as Turkey's 'student city,' Eskişehir has a young, vibrant population with two major universities — Anadolu and Eskişehir Osmangazi. It is known for its creative arts scene, canals, trams, and an exceptionally student-friendly atmosphere." },
  { name: "Konya", emoji: "🕌", pop: "2.3M", unis: "4+", desc: "Home to the famous Mevlana Museum and the birthplace of Sufi poetry and the Whirling Dervishes tradition. Konya is a conservative city with a rich cultural heritage, large universities, and very affordable living costs." },
  { name: "Trabzon", emoji: "🌿", pop: "0.8M", unis: "2+", desc: "Located on the Black Sea coast, Trabzon is known for its lush green landscapes, waterfalls, and unique Black Sea culture. Karadeniz Technical University is one of the country's leading technical universities." },
];

export default function CitiesPage() {
  return (
    <InfoPageLayout title="Cities" breadcrumb="Discover Türkiye" icon="🏙️" sidebar={false}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 40, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        With at least one university in every city, Türkiye offers diverse study environments from bustling metropolises to tranquil coastal towns. Here are some of the most popular cities for international students.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
        {cities.map(city => (
          <div key={city.name} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", transition: "all 0.3s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"; }}>
            <div style={{ background: "var(--secondary)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 30 }}>{city.emoji}</span>
                <h3 style={{ color: "white", fontSize: 20, margin: 0 }}>{city.name}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14 }}>{city.unis} Universities</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Pop: {city.pop}</div>
              </div>
            </div>
            <div style={{ padding: "20px 24px", background: "white" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.8 }}>{city.desc}</p>
              <a href={`/StudyinTurkey/Universities?city=${encodeURIComponent(city.name)}`} style={{ display: "inline-block", marginTop: 14, color: "var(--primary)", fontWeight: 700, fontSize: 13.5 }}>
                View Universities in {city.name} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}
