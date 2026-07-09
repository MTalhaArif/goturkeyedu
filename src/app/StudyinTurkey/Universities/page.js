"use client";
import { useState } from "react";
import { universities, uniqueCities, getAllPrograms } from "../../data/universities";
import { useLanguage } from "@/app/context/LanguageContext";


export default function UniversitiesPage() {
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchText, setSearchText] = useState("");

  const filtered = universities.filter(u => {
    const cityMatch = !selectedCity || u.city === selectedCity;
    const typeMatch = !selectedType || u.type === selectedType;
    const searchMatch = !searchText || u.name.toLowerCase().includes(searchText.toLowerCase()) || u.city.toLowerCase().includes(searchText.toLowerCase());
    return cityMatch && typeMatch && searchMatch;
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ background: "var(--secondary)", borderRadius: 16, padding: "40px 50px", marginBottom: 40, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 36, marginBottom: 10 }}>{t.universitiesPageTitle}</h1>
            <p style={{ opacity: 0.8, fontSize: 16 }}>{t.uniPageSubtitle}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "var(--accent)" }}>{filtered.length}</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{t.universitiesShownLabel}</div>
          </div>
        </div>

        <div className="finder-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 30 }}>
          {/* FILTERS SIDEBAR */}
          <div className="finder-sidebar" style={{ background: "white", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", alignSelf: "start", position: "sticky", top: 80 }}>
            <h3 style={{ color: "var(--secondary)", borderBottom: "2px solid var(--border)", paddingBottom: 15, marginBottom: 25 }}>{t.filterUniversitiesHeading}</h3>

            {/* Search */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{t.searchLabel}</label>
              <input
                type="text"
                placeholder={t.searchByNamePlaceholder}
                className="form-input"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>

            {/* Type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{t.universityTypeLabel}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["", "State", "Foundation"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                    <input type="radio" name="type" checked={selectedType === type} onChange={() => setSelectedType(type)} />
                    {type === "" ? t.allTypes : type === "State" ? t.stateUni : t.foundationUni}
                  </label>
                ))}
              </div>
            </div>

            {/* City */}
            <div style={{ marginBottom: 25 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14 }}>{t.filterByCity}</label>
              <select className="form-select" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                <option value="">{t.allCities}</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button className="btn-primary" style={{ width: "100%", marginBottom: 10 }} onClick={() => { setSelectedCity(""); setSelectedType(""); setSearchText(""); }}>
              {t.clearAllFiltersBtn}
            </button>

            {/* City Quick Filters */}
            <div style={{ marginTop: 25 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 10, fontSize: 14 }}>{t.popularCitiesLabel}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["İstanbul","Ankara","İzmir","Bursa","Antalya"].map(city => (
                  <button key={city} onClick={() => setSelectedCity(city)} style={{ background: selectedCity === city ? "var(--primary)" : "rgba(26,35,126,0.07)", color: selectedCity === city ? "white" : "var(--secondary)", border: "none", padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, color: "var(--secondary)" }}>{t.searchResults}</h2>
              <span style={{ background: "var(--primary)", color: "white", padding: "5px 18px", borderRadius: 30, fontWeight: 700, fontSize: 14 }}>
                {filtered.length} / {universities.length} Universities
              </span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "white", borderRadius: 16 }}>
                <div style={{ fontSize: 50, marginBottom: 20 }}>🔍</div>
                <h3>{t.noUniFoundTitle}</h3>
                <p style={{ color: "var(--text-muted)" }}>{t.noUniFoundMsg}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {filtered.map(uni => (
                  <div key={uni.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
                  >
                    {/* Header */}
                    <div style={{ background: "var(--secondary)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <h3 style={{ color: "white", fontSize: 19, marginBottom: 4 }}>{uni.name}</h3>
                        <div style={{ display: "flex", gap: 18, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                          <span>📍 {uni.city}</span>
                          <span>🏢 {uni.type === "State" ? t.stateUni : t.foundationUni}</span>
                          <span>🌐 {uni.website}</span>
                        </div>
                      </div>
                      <span style={{ background: uni.type === "State" ? "rgba(255,179,0,0.25)" : "rgba(255,255,255,0.15)", color: "white", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>
                        {uni.type === "State" ? t.stateUni : t.foundationUni}
                      </span>
                    </div>

                    {/* Address */}
                    <div style={{ padding: "12px 28px", background: "rgba(26,35,126,0.03)", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>
                      📌 {uni.address}
                    </div>

                    {/* Programs */}
                    <div style={{ padding: "20px 28px" }}>
                      <h4 style={{ color: "var(--secondary)", marginBottom: 14, fontSize: 15 }}>{t.availableProgramsLabel} ({getAllPrograms(uni).length})</h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                        {getAllPrograms(uni).slice(0, 8).map((prog, i) => (
                          <span key={i} style={{ background: "rgba(26,35,126,0.06)", color: "var(--secondary)", padding: "5px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500 }}>
                            {prog.name}
                          </span>
                        ))}
                        {getAllPrograms(uni).length > 8 && (
                          <span style={{ background: "rgba(224,60,49,0.08)", color: "var(--primary)", padding: "5px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                            +{getAllPrograms(uni).length - 8}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <a href={`/StudySearch/List?university=${encodeURIComponent(uni.name)}`} className="btn-primary" style={{ fontSize: 13, padding: "8px 20px" }}>
                          {t.universityList}
                        </a>
                        <a href={`https://${uni.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, padding: "8px 20px", border: "2px solid var(--secondary)", color: "var(--secondary)", borderRadius: 8, fontWeight: 600, display: "inline-block", transition: "all 0.2s" }}>
                          {t.visitWebsiteLabel} ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
