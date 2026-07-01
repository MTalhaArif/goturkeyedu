"use client";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useLanguage } from "../../context/LanguageContext";

const dict = {
  EN: {
    title: "10 Reasons to Study in Türkiye",
    breadcrumb: "Why Türkiye?",
    intro: "There are countless reasons to study in Türkiye, but here are the top 10 reasons that make it a unique destination for international students.",
    reasons: [
      { title: "Multicultural Life", icon: "🌍", body: "Türkiye, sitting at the crossroads of two continents, has been home to countless civilizations. This deep-rooted history creates a rich, multicultural environment where everyone can find a piece of themselves." },
      { title: "Friendly and Safe Environment", icon: "🤝", body: "Turkish hospitality is world-renowned. Students feel at home thanks to the warm and welcoming nature of the Turkish people. Cities are generally very safe with low crime rates." },
      { title: "High-Quality Education Options", icon: "🎓", body: "With 208 universities and a high standard of education, Turkish universities rank well globally. You'll receive a diploma that is recognized worldwide." },
      { title: "Affordable Living Costs", icon: "💰", body: "Compared to Europe and the US, the cost of living and tuition fees in Türkiye are highly affordable, while the standard of living remains high." },
      { title: "Student-Friendly Cities", icon: "🏙️", body: "Cities like Istanbul, Ankara, Izmir, and Eskisehir are built around student life, offering discounts on transport, cultural events, and vibrant social scenes." },
      { title: "Natural Beauties", icon: "🏞️", body: "Experience four distinct seasons. Enjoy skiing in the winter and swimming in the beautiful Mediterranean and Aegean seas during the summer." },
      { title: "Modern Technological Campuses", icon: "💻", body: "Turkish universities are equipped with the latest technology, modern laboratories, and extensive libraries to support your research and studies." },
      { title: "Rich Turkish Cuisine", icon: "🍽️", body: "Turkish food is famous globally. From kebabs to baklava, you will experience a diverse and delicious culinary journey." },
      { title: "Easy Transportation", icon: "✈️", body: "Türkiye has an excellent public transport infrastructure and is a major hub for international flights, making it easy to travel home or explore the world." },
      { title: "Learning Turkish", icon: "🗣️", body: "Turkish is one of the most widely spoken languages in the world. Learning it opens up cultural and professional opportunities across the globe." }
    ]
  },
  TR: {
    title: "Türkiye'de Okumak İçin 10 Neden",
    breadcrumb: "Neden Türkiye?",
    intro: "Türkiye'de okumak için sayısız neden var, ancak onu uluslararası öğrenciler için eşsiz bir destinasyon yapan en önemli 10 neden şunlardır:",
    reasons: [
      { title: "Çok Kültürlü Yaşam", icon: "🌍", body: "İki kıtanın kesişme noktasında yer alan Türkiye, sayısız medeniyete ev sahipliği yapmıştır. Bu köklü tarih, herkesin kendinden bir parça bulabileceği zengin, çok kültürlü bir ortam yaratır." },
      { title: "Dost Canlısı ve Güvenli Ortam", icon: "🤝", body: "Türk misafirperverliği dünyaca ünlüdür. Türk halkının sıcak ve misafirperver doğası sayesinde öğrenciler kendilerini evlerinde hissederler. Şehirler genellikle düşük suç oranlarıyla çok güvenlidir." },
      { title: "Yüksek Kaliteli Eğitim Seçenekleri", icon: "🎓", body: "208 üniversite ve yüksek eğitim standardı ile Türk üniversiteleri küresel ölçekte iyi sıralamalara sahiptir. Dünya çapında tanınan bir diploma alırsınız." },
      { title: "Uygun Yaşam Maliyetleri", icon: "💰", body: "Avrupa ve ABD ile karşılaştırıldığında, Türkiye'de yaşam maliyeti ve eğitim ücretleri oldukça uygundur, yaşam standardı ise yüksek kalır." },
      { title: "Öğrenci Dostu Şehirler", icon: "🏙️", body: "İstanbul, Ankara, İzmir ve Eskişehir gibi şehirler öğrenci hayatı etrafında inşa edilmiştir; ulaşım, kültürel etkinlikler ve canlı sosyal sahnelerde indirimler sunar." },
      { title: "Doğal Güzellikler", icon: "🏞️", body: "Dört farklı mevsimi yaşayın. Kışın kayak yapmanın, yazın ise güzel Akdeniz ve Ege denizlerinde yüzmenin keyfini çıkarın." },
      { title: "Modern Teknolojik Kampüsler", icon: "💻", body: "Türk üniversiteleri, araştırmalarınızı ve çalışmalarınızı desteklemek için en son teknoloji, modern laboratuvarlar ve kapsamlı kütüphanelerle donatılmıştır." },
      { title: "Zengin Türk Mutfağı", icon: "🍽️", body: "Türk yemekleri dünya çapında ünlüdür. Kebaplardan baklavaya kadar çeşitli ve lezzetli bir mutfak yolculuğu yaşayacaksınız." },
      { title: "Kolay Ulaşım", icon: "✈️", body: "Türkiye mükemmel bir toplu taşıma altyapısına sahiptir ve uluslararası uçuşlar için önemli bir merkezdir, bu da eve seyahat etmeyi veya dünyayı keşfetmeyi kolaylaştırır." },
      { title: "Türkçe Öğrenmek", icon: "🗣️", body: "Türkçe dünyanın en çok konuşulan dillerinden biridir. Bunu öğrenmek dünya çapında kültürel ve profesyonel fırsatların kapılarını açar." }
    ]
  },
  AR: {
    title: "10 أسباب للدراسة في تركيا",
    breadcrumb: "لماذا تركيا؟",
    intro: "هناك أسباب لا حصر لها للدراسة في تركيا، ولكن إليك أهم 10 أسباب تجعلها وجهة فريدة للطلاب الدوليين.",
    reasons: [
      { title: "حياة متعددة الثقافات", icon: "🌍", body: "تركيا، التي تقع على مفترق طرق بين قارتين، كانت موطنًا لحضارات لا حصر لها. يخلق هذا التاريخ المتجذر بيئة غنية ومتعددة الثقافات حيث يمكن للجميع العثور على جزء من أنفسهم." },
      { title: "بيئة ودية وآمنة", icon: "🤝", body: "الضيافة التركية مشهورة عالميًا. يشعر الطلاب وكأنهم في وطنهم بفضل الطبيعة الدافئة والمرحبة للشعب التركي. المدن آمنة بشكل عام مع معدلات جريمة منخفضة." },
      { title: "خيارات تعليمية عالية الجودة", icon: "🎓", body: "مع 208 جامعات ومستوى تعليمي عالٍ، تحتل الجامعات التركية مرتبة جيدة عالميًا. ستحصل على شهادة معترف بها في جميع أنحاء العالم." },
      { title: "تكاليف معيشة معقولة", icon: "💰", body: "بالمقارنة مع أوروبا والولايات المتحدة، فإن تكلفة المعيشة والرسوم الدراسية في تركيا معقولة للغاية، في حين يظل مستوى المعيشة مرتفعًا." },
      { title: "مدن صديقة للطلاب", icon: "🏙️", body: "تم بناء مدن مثل اسطنبول وأنقرة وإزمير وإسكي شهير حول الحياة الطلابية، وتقدم خصومات على وسائل النقل والفعاليات الثقافية والمشاهد الاجتماعية النابضة بالحياة." },
      { title: "جمال طبيعي", icon: "🏞️", body: "استمتع بأربعة فصول متميزة. استمتع بالتزلج في الشتاء والسباحة في بحار البحر الأبيض المتوسط وبحر إيجه الجميلة خلال الصيف." },
      { title: "حرم جامعية تكنولوجية حديثة", icon: "💻", body: "الجامعات التركية مجهزة بأحدث التقنيات والمختبرات الحديثة والمكتبات الشاملة لدعم أبحاثك ودراساتك." },
      { title: "مطبخ تركي غني", icon: "🍽️", body: "الطعام التركي مشهور عالميًا. من الكباب إلى البقلاوة، ستختبر رحلة طهي متنوعة ولذيذة." },
      { title: "نقل سهل", icon: "✈️", body: "تتمتع تركيا ببنية تحتية ممتازة للنقل العام وهي مركز رئيسي للرحلات الدولية، مما يسهل السفر إلى الوطن أو استكشاف العالم." },
      { title: "تعلم اللغة التركية", icon: "🗣️", body: "التركية هي واحدة من أكثر اللغات انتشارًا في العالم. تعلمها يفتح فرصًا ثقافية ومهنية في جميع أنحاء العالم." }
    ]
  }
};

export default function ReasonsPage() {
  const { lang } = useLanguage();
  const t = dict[lang] || dict.EN;

  return (
    <InfoPageLayout title={t.title} breadcrumb={t.breadcrumb} icon="🎯" sidebar={true}>
      <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.9, marginBottom: 36, borderLeft: "4px solid var(--primary)", paddingLeft: 20 }}>
        {t.intro}
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
        {t.reasons.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 24, padding: "28px", background: i % 2 === 0 ? "rgba(26,35,126,0.025)" : "white", borderRadius: 16, border: "1px solid var(--border)", transition: "transform 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateX(8px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <div style={{ fontSize: 40, background: "white", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid var(--border)", flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <h3 style={{ color: "var(--secondary)", fontSize: 20, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.85, fontSize: 15 }}>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}
