"use client";
import InfoPageLayout from "../../components/InfoPageLayout";
export default function LearningTurkishPage() {
  return (
    <InfoPageLayout title="Learning Turkish" breadcrumb="Discover Türkiye" icon="🗣️" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Turkish is the 5th most widely spoken language in the world, spoken by over 80 million people. Learning Turkish will open new doors in your academic, professional, and social life in Türkiye.
      </p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32}}>
        {[["5th","Most spoken language worldwide"],["80M+","Native speakers"],["1 Year","Language prep course at uni"]].map(([val,label])=>(
          <div key={label} style={{textAlign:"center",padding:"20px",background:"rgba(26,35,126,0.05)",borderRadius:12}}>
            <div style={{fontSize:28,fontWeight:900,color:"var(--primary)",fontFamily:"var(--font-heading)"}}>{val}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>
      {[
        {icon:"🎓",title:"University Language Preparation Programs",body:"Most Turkish universities offer a one-year Turkish Language Preparation Program (Türkçe Hazırlık Programı) for international students who will study in Turkish-medium programs. During this year, students learn Turkish at an intensive pace — typically reaching B2 level — before starting their academic studies."},
        {icon:"📚",title:"TÖMER (Turkish Language Courses)",body:"TÖMER (Türkçe Öğretim Merkezi) centers are official Turkish language teaching centers operated by state universities. They offer Turkish courses at all levels (A1 to C2) for international students. Courses are offered both online and in-person across Türkiye."},
        {icon:"📱",title:"Apps and Online Resources",body:"You can start learning Turkish before arriving in Türkiye using apps like Duolingo, Pimsleur, or Memrise. YouTube channels like 'Learn Turkish with Selin' offer free comprehensive lessons. The TRT (Turkish public broadcaster) also offers free language learning resources."},
        {icon:"🗣️",title:"Language Exchange",body:"One of the best ways to learn Turkish is through language exchange (dil değişimi) with Turkish students. Many universities have language exchange programs. Join university social clubs or use apps like Tandem or HelloTalk to find Turkish conversation partners."},
        {icon:"📝",title:"Turkish Proficiency Exams",body:"The TYS (Turkish Proficiency Exam) and TÖMER exams certify your level of Turkish. These certificates are required for admission to Turkish-medium programs. The TÖMER certificate issued by official TÖMER centers is accepted by all Turkish universities."},
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
