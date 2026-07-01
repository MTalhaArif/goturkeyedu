"use client";
import InfoPageLayout from "../../components/InfoPageLayout";
import { useState } from "react";

const categories = [
  { label: "Academic Life", questions: [
    { q: "What is university life like in Türkiye?", duration: "3:24" },
    { q: "How do I choose between universities?", duration: "4:11" },
    { q: "What is the grading system at Turkish universities?", duration: "2:58" },
    { q: "Can I transfer credits from my home university?", duration: "3:42" },
    { q: "What support services do universities offer?", duration: "2:30" },
  ]},
  { label: "Living in Türkiye", questions: [
    { q: "How much does it cost to live in Türkiye as a student?", duration: "4:05" },
    { q: "How do I find accommodation?", duration: "3:18" },
    { q: "What is the food like in Türkiye?", duration: "2:44" },
    { q: "Is Türkiye safe for international students?", duration: "3:31" },
    { q: "How do I open a bank account in Türkiye?", duration: "4:22" },
  ]},
  { label: "Admission & Visa", questions: [
    { q: "What documents do I need to apply?", duration: "3:55" },
    { q: "How do I apply for a student visa?", duration: "5:12" },
    { q: "What is the TR-YÖS exam?", duration: "4:48" },
    { q: "How do I get a student residence permit?", duration: "6:02" },
    { q: "Can I get a scholarship to study in Türkiye?", duration: "4:37" },
  ]},
];

export default function QAVideosPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  return (
    <InfoPageLayout title="Question & Answer Videos" breadcrumb="For Students" icon="🎬" sidebar={false}>
      <p style={{color:"var(--text-muted)",fontSize:16,lineHeight:1.9,marginBottom:36,borderLeft:"4px solid var(--primary)",paddingLeft:20}}>
        Find answers to common questions about studying in Türkiye through our video series featuring real students and university advisors.
      </p>
      <div className="qa-layout">
        <div className="qa-categories">
          {categories.map((cat, i) => (
            <button key={i} className={`qa-cat-btn${activeCategory === i ? " active" : ""}`} onClick={() => setActiveCategory(i)}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="qa-list">
          {categories[activeCategory].questions.map((item, j) => (
            <div key={j} className="qa-item">
              <div className="qa-play">▶</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14.5}}>{item.q}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:3}}>Duration: {item.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
