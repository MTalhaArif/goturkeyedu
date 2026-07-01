"use client";
import InfoPageLayout from "@/app/components/InfoPageLayout";
export default function TipsPage() {
  return (
    <InfoPageLayout title="Tips for Students" breadcrumb="Discover Türkiye" icon="💡" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Preparing to study in a new country can be overwhelming. Here are practical tips from students who have already made the journey to Türkiye.
      </p>
      {[
        {icon:"🛬",title:"Before You Arrive",tips:["Apply for your student visa at least 2–3 months before departure","Arrange accommodation before arrival — do not rely on finding it on arrival","Get your academic documents translated and notarized in advance","Open a bank account in Türkiye within the first weeks (required for residence permit)","Learn basic Turkish phrases — locals greatly appreciate the effort"]},
        {icon:"📋",title:"Administrative Steps on Arrival",tips:["Register at your university within the deadline (usually first 2 weeks)","Apply for your Residence Permit within 30 days of visa expiry","Apply for a Turkish phone SIM card (passport required)","Obtain your Turkish tax number (Vergi Numarası) — needed for many services","Get your student ID card from your university"]},
        {icon:"🎓",title:"Academic Life",tips:["Attend orientation programs organized by your university","Join student clubs and organizations to meet people","Find a study group — Turkish students are generally very helpful","Make use of university libraries, which are open late during exam periods","Some professors may give oral exams — attendance is often mandatory"]},
        {icon:"🏙️",title:"Everyday Life",tips:["Get a transportation card (İstanbulkart in İstanbul, etc.) for discounted travel","Download apps like Yemeksepeti (food delivery) and BiTaksi (taxi)","Keep emergency numbers saved: ambulance 112, police 155","Turkish pharmacies (eczane) are widely available and pharmacists are very helpful","Currency is Turkish Lira (TRY) — ATMs are widely available everywhere"]},
      ].map((section,i)=>(
        <div key={i} style={{marginBottom:28,borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",boxShadow:"0 4px 16px rgba(0,0,0,0.05)"}}>
          <div style={{background:"var(--secondary)",padding:"16px 24px",display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:26}}>{section.icon}</span>
            <h3 style={{color:"white",fontSize:18,margin:0}}>{section.title}</h3>
          </div>
          <div style={{padding:"20px 24px",background:"white"}}>
            <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:12}}>
              {section.tips.map((tip,j)=>(
                <li key={j} style={{display:"flex",gap:12,fontSize:14.5,color:"var(--text-main)",lineHeight:1.7}}>
                  <span style={{color:"var(--primary)",fontWeight:900,fontSize:18,lineHeight:1.2,flexShrink:0}}>→</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </InfoPageLayout>
  );
}
