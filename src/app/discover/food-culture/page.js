"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
export default function FoodCulturePage() {
  const dishes=[{name:"Kebap",desc:"Grilled meat dishes — including Adana kebap, Urfa kebap, şiş kebap, and döner — are the heart of Turkish cuisine.",emoji:"🍢"},{name:"Pide & Lahmacun",desc:"Turkish pizza variants, pide is a boat-shaped flatbread with various toppings, lahmacun is a thin crispy flatbread with spiced minced meat.",emoji:"🫓"},{name:"Menemen",desc:"A popular Turkish breakfast dish made of eggs, tomatoes, peppers, and spices, cooked in olive oil.",emoji:"🍳"},{name:"Baklava",desc:"Layers of thin pastry filled with crushed pistachios or walnuts and soaked in sweet syrup. The finest baklava comes from Gaziantep.",emoji:"🍮"},{name:"Çay (Tea)",desc:"Turkish tea is central to social life. Served in small tulip-shaped glasses, it is offered everywhere — in homes, shops, and offices.",emoji:"🫖"},{name:"Simit",desc:"A circular bread encrusted with sesame seeds, simit is sold on every street corner and is the quintessential Turkish snack.",emoji:"🥯"}];
  return (
    <InfoPageLayout title="Food Culture" breadcrumb="Discover Türkiye" icon="🍽️" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Turkish cuisine is one of the richest in the world, ranked alongside French and Chinese cuisines. From street food to elaborate meals, food is at the center of Turkish culture and hospitality.
      </p>
      <h3 style={{color:"var(--secondary)",fontSize:20,marginBottom:20}}>Must-Try Dishes & Foods</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18,marginBottom:36}}>
        {dishes.map(d=>(
          <div key={d.name} style={{padding:"20px",background:"rgba(26,35,126,0.025)",borderRadius:12,border:"1px solid var(--border)",display:"flex",gap:14,alignItems:"flex-start"}}>
            <span style={{fontSize:36,flexShrink:0}}>{d.emoji}</span>
            <div><h4 style={{color:"var(--secondary)",marginBottom:6}}>{d.name}</h4><p style={{color:"var(--text-muted)",fontSize:14,lineHeight:1.7}}>{d.desc}</p></div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(26,35,126,0.04)",borderRadius:14,padding:"24px 28px",border:"1px solid var(--border)"}}>
        <h3 style={{color:"var(--secondary)",marginBottom:14}}>💰 Eating on a Student Budget</h3>
        <p style={{color:"var(--text-muted)",lineHeight:1.85,fontSize:15,marginBottom:16}}>Eating in Türkiye is very affordable for students. A full meal at a student cafeteria (yemekhane) costs as little as $1–2. Street food like simit, börek, and sandwiches cost under $1. Restaurants serving traditional Turkish food range from $3–8 per meal.</p>
        <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8}}>
          {["University cafeterias offer subsidized meals for students","Bazaars and local markets sell fresh produce at very low prices","Cooking at home is easy with affordable ingredients","Lokanta (traditional Turkish diners) offer daily set menus at low prices"].map((t,i)=>(
            <li key={i} style={{display:"flex",gap:10,fontSize:14,color:"var(--text-main)"}}><span style={{color:"var(--primary)",fontWeight:900}}>✓</span>{t}</li>
          ))}
        </ul>
      </div>
    </InfoPageLayout>
  );
}
