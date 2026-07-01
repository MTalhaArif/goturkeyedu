"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
export default function ClimatePage() {
  return (
    <InfoPageLayout title="Climate" breadcrumb="Discover Türkiye" icon="🌤️" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Türkiye experiences a variety of climates due to its large size and diverse geography. Whatever season you prefer, you'll find it somewhere in Türkiye!
      </p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
        {[{s:"🌸",name:"Spring",desc:"Warm & mild, 15–22°C"},{s:"☀️",name:"Summer",desc:"Hot & dry, 28–38°C"},{s:"🍂",name:"Autumn",desc:"Mild & colorful, 12–22°C"},{s:"❄️",name:"Winter",desc:"Cold & snowy, -2–8°C"}].map(s=>(
          <div key={s.name} style={{textAlign:"center",padding:"20px 14px",background:"rgba(26,35,126,0.04)",borderRadius:12,border:"1px solid var(--border)"}}>
            <div style={{fontSize:36,marginBottom:8}}>{s.s}</div>
            <div style={{fontWeight:700,color:"var(--secondary)",marginBottom:4}}>{s.name}</div>
            <div style={{fontSize:12,color:"var(--text-muted)"}}>{s.desc}</div>
          </div>
        ))}
      </div>
      {[
        {title:"Mediterranean & Aegean Coast",icon:"🌊",body:"The coastal areas along the Aegean and Mediterranean seas enjoy a classic Mediterranean climate with hot, dry summers and mild, wet winters. Cities like İzmir and Antalya have over 300 sunny days per year. Ideal for students who love warm weather and outdoor activities."},
        {title:"İstanbul & Marmara Region",icon:"🌉",body:"İstanbul has a humid subtropical climate. Summers are warm and humid (25–32°C), winters are cool and rainy with occasional snow (2–8°C). Spring and autumn are pleasant. The city can be unpredictable — it's common to experience all four seasons in one week!"},
        {title:"Central Anatolia (Ankara)",icon:"🏙️",body:"Central Anatolia has a semi-arid continental climate. Summers are hot and dry (30–35°C), while winters are cold with significant snowfall (-5 to 5°C). Ankara, being at higher altitude, gets notably colder winters than the coasts."},
        {title:"Black Sea Region",icon:"🌿",body:"The Black Sea coast receives the most rainfall in Türkiye, resulting in lush green landscapes year-round. The climate is mild and humid. Cities like Trabzon and Rize are known for tea plantations and stunning green scenery."},
        {title:"Eastern Anatolia",icon:"🏔️",body:"Eastern Anatolia has a harsh continental climate with very cold winters (temperatures can drop to -30°C in the northeast) and warm summers. This region is known for its dramatic mountain landscapes and is popular for winter sports."},
      ].map((item,i)=>(
        <div key={i} style={{marginBottom:22,padding:"22px 26px",background:i%2===0?"rgba(26,35,126,0.025)":"white",borderRadius:12,border:"1px solid var(--border)"}}>
          <h3 style={{color:"var(--secondary)",fontSize:18,marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{item.icon}</span> {item.title}
          </h3>
          <p style={{color:"var(--text-muted)",lineHeight:1.85,fontSize:15}}>{item.body}</p>
        </div>
      ))}
    </InfoPageLayout>
  );
}
