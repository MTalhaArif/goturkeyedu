"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
export default function CulturePage() {
  return (
    <InfoPageLayout title="Culture" breadcrumb="Discover Türkiye" icon="🎨" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Türkiye's culture is a magnificent tapestry woven from thousands of years of history, blending Eastern and Western influences into a unique and vibrant identity.
      </p>
      {[
        {title:"Arts and Architecture",icon:"🏛️",body:"Turkish architecture reflects the country's rich heritage — from ancient Greek and Roman ruins to the grand mosques and palaces of the Ottoman Empire. The Hagia Sophia, Topkapı Palace, and the Blue Mosque are UNESCO-recognized masterpieces. Contemporary Turkish art, cinema, and literature thrive in cities like İstanbul, with world-class museums and galleries."},
        {title:"Music and Dance",icon:"🎵",body:"Turkish music is a diverse blend of classical Ottoman music, folk traditions, and modern pop. Traditional instruments like the bağlama (saz), ney (flute), and davul (drum) are central to Turkish folk music. The Whirling Dervishes ceremony (Sema) of the Mevlevi Order is a UNESCO Intangible Cultural Heritage."},
        {title:"Literature",icon:"📚",body:"Turkey has a rich literary tradition dating back centuries. Nobel Prize-winning author Orhan Pamuk has brought international attention to Turkish literature. Turkish poetry, storytelling, and oral traditions remain vibrant parts of cultural life today."},
        {title:"Traditions and Customs",icon:"🌺",body:"Turkish customs emphasize hospitality, family, and community. Tea (çay) drinking is a national ritual — offered to guests everywhere. Important cultural occasions include Eid celebrations, national holidays like Republic Day (October 29), and local festivals throughout the country."},
        {title:"Handicrafts",icon:"🏺",body:"Turkey is famous for its traditional handicrafts: hand-woven carpets and kilims, Iznik tiles and ceramics, copper and silverwork, leather goods, and glass art. The Grand Bazaar in İstanbul is one of the world's oldest and largest covered markets showcasing these crafts."},
      ].map((item,i)=>(
        <div key={i} style={{marginBottom:24,padding:"22px 26px",background:i%2===0?"rgba(26,35,126,0.025)":"white",borderRadius:12,border:"1px solid var(--border)"}}>
          <h3 style={{color:"var(--secondary)",fontSize:18,marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{item.icon}</span> {item.title}
          </h3>
          <p style={{color:"var(--text-muted)",lineHeight:1.85,fontSize:15}}>{item.body}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
