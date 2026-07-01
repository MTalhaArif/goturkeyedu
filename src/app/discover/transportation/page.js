"use client";
import InfoPageLayout from "../../components/InfoPageLayout";
export default function TransportationPage() {
  return (
    <InfoPageLayout title="Transportation" breadcrumb="Discover Türkiye" icon="🚌" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Türkiye has a well-developed transportation network. Students benefit from significant discounts on public transport with a valid student ID.
      </p>
      {[
        {icon:"✈️",title:"Getting to Türkiye",body:"İstanbul has two international airports: İstanbul Airport (IST) — one of the world's largest — and Sabiha Gökçen Airport (SAW). Ankara (ESB), İzmir (ADB), Antalya (AYT), and other cities also have international airports. Turkish Airlines connects Türkiye to over 120 countries. Budget airlines like Pegasus and SunExpress offer affordable domestic and European flights."},
        {icon:"🚇",title:"Metro & Tram",body:"Major cities like İstanbul, Ankara, İzmir, Bursa, and Eskişehir have extensive metro and tram networks. Students pay 50% less than regular fares with their student transport cards. İstanbul's İstanbulkart is a rechargeable smart card used on all public transport."},
        {icon:"🚌",title:"City Buses (Otobüs)",body:"Every city has an extensive bus network covering all neighborhoods. Buses are reliable, frequent, and very affordable for students. Intercity buses (otobüs) operated by companies like Metro Turizm, Ulusoy, and Kamil Koç connect all major cities at very low prices."},
        {icon:"🚂",title:"Train (Tren)",body:"Turkish State Railways (TCDD) operates train services between cities. High-speed trains (YHT) connect Ankara, İstanbul, Eskişehir, Konya, and other cities at speeds up to 250 km/h. Students receive 30–50% discounts on train tickets with a valid student ID."},
        {icon:"🚕",title:"Taxis & Ride-Hailing",body:"Yellow taxis are available in all cities and are metered. For safer, more transparent rides, use BiTaksi or InDriver apps. Uber operates in some cities. For short trips within campuses or city centers, electric scooters (Martı, Marti) are popular and affordable."},
        {icon:"🚢",title:"Ferries & Sea Buses",body:"İstanbul has an extensive ferry network across the Bosphorus and to the Princes' Islands, operated by İDO and Şehir Hatları. Ferries are a popular and scenic commuting option for students in İstanbul. Student discounts apply with İstanbulkart."},
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
