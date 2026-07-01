"use client";
import InfoPageLayout from "../../components/InfoPageLayout";

const news = [
  { date: "December 10, 2024", title: "YÖK Announces Record Number of International Students in 2024", category: "Announcement", body: "The Council of Higher Education (YÖK) announced that the number of international students studying in Türkiye has reached a record high of 240,000 students from 180 countries in the 2024-2025 academic year. This represents a 15% increase from the previous year." },
  { date: "November 28, 2024", title: "New TR-YÖS Exam Centers Added for 2025", category: "TR-YÖS", body: "YÖK has announced the addition of 12 new TR-YÖS exam centers in Africa and Central Asia for the 2025 exam season. The exam will now be available in 90 centers across 60 countries, making it more accessible to prospective international students." },
  { date: "November 15, 2024", title: "Türkiye Scholarships Application Period for 2025 Opens", category: "Scholarships", body: "Applications for the 2025 Türkiye Scholarships (Türkiye Bursları) program have officially opened. This year, 8,000 scholarships are available for international students at undergraduate, master's, and doctoral levels." },
  { date: "October 30, 2024", title: "Turkish Universities Climb in World Rankings", category: "Rankings", body: "Several Turkish universities have improved their positions in the 2024 QS World University Rankings. Middle East Technical University (METU), Istanbul Technical University, and Hacettepe University are among the top performers, with METU ranking among the top 400 globally." },
  { date: "October 14, 2024", title: "New Online Application System Launched for International Students", category: "Technology", body: "YÖK has launched a new centralized online application portal to streamline the admission process for international students. The platform allows students to apply to multiple Turkish universities through a single interface." },
];

export default function CoheNewsPage() {
  return (
    <InfoPageLayout title="CoHE News" breadcrumb="For Students" icon="📰" sidebar={true}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Latest announcements, news, and updates from the Council of Higher Education of Türkiye (YÖK).
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        {news.map((item,i)=>(
          <div key={i} style={{borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",boxShadow:"0 4px 16px rgba(0,0,0,0.05)",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";e.currentTarget.style.borderColor="var(--primary)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.05)";e.currentTarget.style.borderColor="var(--border)";}}>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:10}}>
                <span style={{background:"rgba(26,35,126,0.07)",color:"var(--secondary)",padding:"3px 10px",borderRadius:5,fontSize:12,fontWeight:700}}>{item.category}</span>
                <span style={{fontSize:12,color:"var(--text-muted)"}}>📅 {item.date}</span>
              </div>
              <h3 style={{color:"var(--secondary)",fontSize:18,marginBottom:10,lineHeight:1.4}}>{item.title}</h3>
              <p style={{color:"var(--text-muted)",fontSize:14.5,lineHeight:1.8}}>{item.body}</p>
              <a href="#" style={{display:"inline-block",marginTop:14,color:"var(--primary)",fontWeight:700,fontSize:13.5}}>Read More →</a>
            </div>
          </div>
        ))}
      </div>
    </InfoPageLayout>
  );
}
