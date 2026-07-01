"use client";
import InfoPageLayout from "../../components/InfoPageLayout";
export default function WhatStudentsSayPage() {
  const students=[
    {name:"Ahmed Al-Mansouri",country:"Iraq 🇮🇶",uni:"Istanbul Technical University",program:"Computer Engineering",year:"3rd Year",quote:"Studying at ITU has been the best decision of my life. The engineering faculty is world-class and the campus life is incredible. İstanbul itself is a city like no other — I feel completely at home here despite being thousands of miles from Iraq.",avatar:"A"},
    {name:"Fatima Zahra El-Amrani",country:"Morocco 🇲🇦",uni:"Hacettepe University",program:"Medicine",year:"4th Year",quote:"Turkish medical education is exceptional. The hospitals where we do our clinical rotations are among the most advanced in the region. The Türkiye Scholarship covered everything — I didn't have to worry about finances at all.",avatar:"F"},
    {name:"Muhammad Bilal",country:"Pakistan 🇵🇰",uni:"Ankara University",program:"Economics",year:"2nd Year",quote:"The cost of living in Ankara is very affordable. My scholarship stipend comfortably covers my expenses. Turkish people are incredibly warm and welcoming — I've made friends from 40+ countries here.",avatar:"M"},
    {name:"Amira Hassan",country:"Egypt 🇪🇬",uni:"Ege University",program:"Architecture",year:"Final Year",quote:"İzmir is a dream city for students. The weather, the Aegean Sea, the laid-back atmosphere — and Ege University's architecture faculty is among the best. I plan to stay in Türkiye after graduation.",avatar:"A"},
    {name:"Omar Abdullah",country:"Yemen 🇾🇪",uni:"Anadolu University",program:"Business Administration",year:"3rd Year",quote:"Anadolu University in Eskişehir is known as Turkey's student city — and it's true! The city revolves around students. The university has modern facilities and very supportive international student services.",avatar:"O"},
    {name:"Nour Al-Rashid",country:"Syria 🇸🇾",uni:"Karadeniz Technical University",program:"Civil Engineering",year:"2nd Year",quote:"KTU in Trabzon is surrounded by stunning nature — mountains, sea, green valleys. The Turkish language I learned in my first year has opened so many doors socially and professionally.",avatar:"N"},
  ];
  return (
    <InfoPageLayout title="What Our Students Say" breadcrumb="For Students" icon="💬" sidebar={false}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:40,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Hear directly from international students who chose Türkiye for their higher education. Their experiences, challenges, and successes will inspire you.
      </p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:24}}>
        {students.map((s,i)=>(
          <div key={i} style={{background:"white",borderRadius:16,padding:"28px",boxShadow:"0 4px 20px rgba(0,0,0,0.07)",border:"1px solid var(--border)",position:"relative",transition:"all 0.3s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 30px rgba(0,0,0,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.07)";}}>
            <div style={{fontSize:60,color:"rgba(224,60,49,0.08)",fontFamily:"Georgia,serif",lineHeight:1,position:"absolute",top:8,left:16}}>"</div>
            <p style={{color:"var(--text-muted)",lineHeight:1.85,fontSize:14.5,marginBottom:22,paddingTop:20,fontStyle:"italic"}}>"{s.quote}"</p>
            <div style={{display:"flex",alignItems:"center",gap:14,paddingTop:16,borderTop:"1px solid var(--border)"}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:"var(--secondary)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,fontFamily:"var(--font-heading)",flexShrink:0}}>{s.avatar}</div>
              <div>
                <div style={{fontWeight:700,color:"var(--secondary)",fontSize:15}}>{s.name}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:2}}>{s.country} · {s.program}</div>
                <div style={{fontSize:11,color:"var(--primary)",fontWeight:600,marginTop:1}}>{s.uni} · {s.year}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}
