import { notFound } from "next/navigation";
import { getAllPrograms, getInstructionLanguage } from "@/app/data/universities";
import { getUniversityBySlug, getAllUniversitySlugs } from "@/lib/universitySlug";

export function generateStaticParams() {
  return getAllUniversitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const uni = getUniversityBySlug(slug);
  if (!uni) return {};

  const typeLabel = uni.type === "State" ? "Public" : "Private";
  const programCount = getAllPrograms(uni).length;

  return {
    title: `${uni.name} - Programs, Tuition & Admission | Go Turkey`,
    description: `${uni.name} is a ${typeLabel.toLowerCase()} university in ${uni.city}, Türkiye, offering ${programCount} programs. See Bachelor's, Master's and PhD programs, and apply through Go Turkey.`,
    alternates: {
      canonical: `/universities/${slug}`,
    },
  };
}

function ProgramList({ title, programs, uni }) {
  if (!programs || programs.length === 0) return null;
  return (
    <div style={{ marginBottom: 30 }}>
      <h2 style={{ fontSize: 20, color: "var(--secondary)", marginBottom: 14 }}>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {programs.map((name) => (
          <span
            key={name}
            style={{
              background: "rgba(26,35,126,0.06)",
              color: "var(--secondary)",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {name}
            <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.6, textTransform: "uppercase" }}>
              {getInstructionLanguage(uni, name)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function UniversityDetailPage({ params }) {
  const { slug } = await params;
  const uni = getUniversityBySlug(slug);
  if (!uni) notFound();

  const typeLabel = uni.type === "State" ? "Public University" : "Private University";
  const totalPrograms = getAllPrograms(uni).length;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        <nav style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          <a href="/" style={{ color: "var(--text-muted)" }}>Home</a> {" › "}
          <a href="/StudyinTurkey/Universities" style={{ color: "var(--text-muted)" }}>Universities</a> {" › "}
          <span>{uni.name}</span>
        </nav>

        <div
          style={{
            background: "var(--secondary)",
            borderRadius: 16,
            padding: "40px 50px",
            marginBottom: 40,
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 10 }}>{uni.name}</h1>
            <div style={{ display: "flex", gap: 18, fontSize: 14, color: "rgba(255,255,255,0.8)", flexWrap: "wrap" }}>
              <span>📍 {uni.city}</span>
              <span>🏢 {typeLabel}</span>
              <span>🌐 {uni.website}</span>
            </div>
          </div>
          <span
            style={{
              background: uni.type === "State" ? "rgba(255,179,0,0.25)" : "rgba(255,255,255,0.15)",
              color: "white",
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {typeLabel}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 30 }} className="finder-layout">
          <div style={{ background: "white", borderRadius: 16, padding: "30px 36px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 30 }}>
              📌 {uni.address}
            </p>

            <ProgramList title="Bachelor's Programs" programs={uni.programs} uni={uni} />
            <ProgramList title="Master's Programs" programs={uni.mastersPrograms} uni={uni} />
            <ProgramList title="PhD Programs" programs={uni.phdPrograms} uni={uni} />

            {totalPrograms === 0 && (
              <p style={{ color: "var(--text-muted)" }}>Program details for this university are being added.</p>
            )}
          </div>

          <aside style={{ alignSelf: "start" }}>
            <div style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 20 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "var(--accent)", lineHeight: 1 }}>{totalPrograms}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Programs offered</div>
              <a href="/register" className="btn-primary" style={{ display: "block", textAlign: "center", marginBottom: 10 }}>
                Apply Through Go Turkey
              </a>
              <a
                href={`https://${uni.website}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 13,
                  padding: "10px 20px",
                  border: "2px solid var(--secondary)",
                  color: "var(--secondary)",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Official Website ↗
              </a>
            </div>
            <a
              href={`/StudySearch/List?university=${encodeURIComponent(uni.name)}`}
              style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--secondary)", textDecoration: "underline" }}
            >
              Browse all programs at {uni.name}
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
