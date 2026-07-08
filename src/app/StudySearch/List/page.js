"use client";
import { useState } from "react";
import { universities, uniqueCities } from "../../data/universities";
import { useLanguage } from "@/app/context/LanguageContext";

export default function StudySearchList() {
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedLang, setSelectedLang] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [expandedUni, setExpandedUni] = useState(null);

  const filtered = universities.filter(u => {
    const cityMatch = !selectedCity || u.city === selectedCity;
    const typeMatch = !selectedType || u.type === selectedType;
    const progMatch = !programSearch || u.programs.some(p => p.toLowerCase().includes(programSearch.toLowerCase())) || u.name.toLowerCase().includes(programSearch.toLowerCase());
    return cityMatch && typeMatch && progMatch;
  });

  const getFilteredPrograms = (uni) => {
    if (!programSearch) return uni.programs;
    return uni.programs.filter(p => p.toLowerCase().includes(programSearch.toLowerCase()));
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: 40, paddingBottom: 80 }}>
      <div className="container">
        {/* Page Banner */}
        <div style={{ background: "linear-gradient(135deg, var(--secondary) 0%, #283593 100%)", borderRadius: 16, padding: "35px 48px", marginBottom: 36, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>{t.searchPageTitle}</h1>
            <p style={{ opacity: 0.82, fontSize: 15 }}>{t.searchPageSubtitle}</p>
          </div>
          <div style={{ display: "flex", gap: 30 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "var(--accent)" }}>{universities.length}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{t.universitiesStatLabel}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: "var(--accent)" }}>{filtered.reduce((s, u) => s + u.programs.length, 0)}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{t.programsStatLabel}</div>
            </div>
          </div>
        </div>

        <div className="finder-layout" style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 28 }}>
          {/* FILTERS */}
          <div className="finder-sidebar" style={{ background: "white", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", alignSelf: "start", position: "sticky", top: 80 }}>
            <h3 style={{ color: "var(--secondary)", borderBottom: "2px solid var(--border)", paddingBottom: 14, marginBottom: 22, fontSize: 17 }}>🔍 {t.filtersHeading}</h3>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.programUniLabel}</label>
              <input type="text" placeholder={t.programSearchPlaceholder} className="form-input" value={programSearch} onChange={e => setProgramSearch(e.target.value)} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.educationLevel}</label>
              <select className="form-select" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
                <option value="">{t.allLevelsOption}</option>
                <option value="associate">{t.associateDegree}</option>
                <option value="bachelor">{t.bachelorsDegree}</option>
                <option value="master">{t.mastersDegree}</option>
                <option value="doctorate">{t.doctorate}</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.teachingLanguageLabel}</label>
              <select className="form-select" value={selectedLang} onChange={e => setSelectedLang(e.target.value)}>
                <option value="">{t.allLanguagesOption}</option>
                <option value="english">{t.langEnglish}</option>
                <option value="turkish">{t.langTurkish}</option>
                <option value="arabic">{t.langArabic}</option>
                <option value="french">{t.langFrench}</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 7, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.cityLabel}</label>
              <select className="form-select" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                <option value="">{t.allCities}</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 10, fontSize: 13, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.universityTypeLabel}</label>
              {[["", t.allTypes], ["State", t.stateUniversityOption], ["Foundation", t.foundationPrivateOption]].map(([val, label]) => (
                <label key={val} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", fontSize: 14, marginBottom: 8, color: selectedType === val ? "var(--primary)" : "var(--text-main)", fontWeight: selectedType === val ? 700 : 400 }}>
                  <input type="radio" name="type" checked={selectedType === val} onChange={() => setSelectedType(val)} /> {label}
                </label>
              ))}
            </div>

            <button className="btn-primary" style={{ width: "100%", marginBottom: 10 }} onClick={() => { setSelectedCity(""); setSelectedType(""); setSelectedLevel(""); setSelectedLang(""); setProgramSearch(""); }}>
              {t.clearAllFiltersBtn}
            </button>

            <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.quickCitySearchLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["İstanbul", "Ankara", "İzmir", "Bursa", "Konya", "Antalya", "Eskişehir", "Trabzon"].map(city => (
                  <button key={city} onClick={() => setSelectedCity(city === selectedCity ? "" : city)} style={{ background: selectedCity === city ? "var(--primary)" : "rgba(26,35,126,0.06)", color: selectedCity === city ? "white" : "var(--secondary)", border: "none", padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, color: "var(--secondary)" }}>{t.searchResults}</h2>
                {(programSearch || selectedCity || selectedType) && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    {programSearch && `${t.programUniLabel}: "${programSearch}"`} {selectedCity && `| ${t.cityLabel}: ${selectedCity}`} {selectedType && `| ${t.universityTypeLabel}: ${selectedType === "State" ? t.stateUni : t.foundationUni}`}
                  </p>
                )}
              </div>
              <span style={{ background: "var(--primary)", color: "white", padding: "6px 18px", borderRadius: 30, fontWeight: 700, fontSize: 14 }}>
                {filtered.length} {filtered.length === 1 ? t.universityFoundLabel : t.universitiesFoundLabel}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "white", borderRadius: 16 }}>
                <div style={{ fontSize: 54, marginBottom: 18 }}>🎓</div>
                <h3 style={{ color: "var(--secondary)", marginBottom: 10 }}>{t.noResultsFoundTitle}</h3>
                <p style={{ color: "var(--text-muted)" }}>{t.noResultsFoundMsg}</p>
                <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => { setSelectedCity(""); setSelectedType(""); setProgramSearch(""); }}>{t.clearAllFiltersBtn}</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {filtered.map(uni => {
                  const programs = getFilteredPrograms(uni);
                  const isExpanded = expandedUni === uni.id;
                  return (
                    <div key={uni.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: isExpanded ? "1.5px solid var(--primary)" : "1.5px solid transparent", transition: "all 0.3s" }}>
                      {/* Uni Header */}
                      <div style={{ background: "var(--secondary)", padding: "18px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, cursor: "pointer" }} onClick={() => setExpandedUni(isExpanded ? null : uni.id)}>
                        <div>
                          <h3 style={{ color: "white", fontSize: 17, marginBottom: 5 }}>{uni.name}</h3>
                          <div style={{ display: "flex", gap: 18, fontSize: 12.5, color: "rgba(255,255,255,0.72)", flexWrap: "wrap" }}>
                            <span>📍 {uni.city}</span>
                            <span>🏢 {uni.type === "State" ? t.stateUni : t.foundationUni}</span>
                            <span>🌐 {uni.website}</span>
                            <span>🎓 {uni.programs.length} {t.programsSuffixLabel}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ background: "rgba(255,179,0,0.2)", color: "#ffb300", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,179,0,0.3)" }}>
                            {uni.type === "State" ? t.stateUni : t.foundationUni}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>▼</span>
                        </div>
                      </div>

                      {/* Address bar */}
                      <div style={{ padding: "10px 26px", background: "rgba(26,35,126,0.03)", borderBottom: "1px solid var(--border)", fontSize: 12.5, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>📌 {uni.address}</span>
                        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                          <a href={`https://${uni.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{t.visitWebsiteLabel} ↗</a>
                        </div>
                      </div>

                      {/* Programs Table - always visible summary */}
                      <div style={{ padding: "18px 26px" }}>
                        {!isExpanded ? (
                          <div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {programs.slice(0, 8).map((p, i) => (
                                <span key={i} style={{ background: "rgba(26,35,126,0.07)", color: "var(--secondary)", padding: "4px 11px", borderRadius: 5, fontSize: 12.5, fontWeight: 500 }}>{p}</span>
                              ))}
                              {programs.length > 8 && (
                                <button onClick={() => setExpandedUni(uni.id)} style={{ background: "rgba(224,60,49,0.08)", color: "var(--primary)", border: "none", padding: "4px 11px", borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>+{programs.length - 8}</button>
                              )}
                            </div>
                            <button className="btn-primary" style={{ marginTop: 14, fontSize: 13, padding: "8px 20px" }} onClick={() => setExpandedUni(uni.id)}>{t.viewAllProgramsBtn}</button>
                          </div>
                        ) : (
                          <div>
                            <h4 style={{ color: "var(--secondary)", marginBottom: 14, fontSize: 15 }}>{t.allProgramsLabel} ({programs.length})</h4>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                              <thead>
                                <tr style={{ background: "rgba(26,35,126,0.05)" }}>
                                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--secondary)", fontWeight: 700, borderBottom: "2px solid var(--border)" }}>{t.programNameCol}</th>
                                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--secondary)", fontWeight: 700, borderBottom: "2px solid var(--border)" }}>{t.degreeCol}</th>
                                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--secondary)", fontWeight: 700, borderBottom: "2px solid var(--border)" }}>{t.languageCol}</th>
                                  <th style={{ padding: "10px 14px", textAlign: "left", color: "var(--secondary)", fontWeight: 700, borderBottom: "2px solid var(--border)" }}>{t.actionCol}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {programs.map((prog, i) => (
                                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "white" : "rgba(26,35,126,0.015)" }}>
                                    <td style={{ padding: "12px 14px", fontWeight: 500 }}>{prog}</td>
                                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontSize: 13 }}>{t.bachelorsDegree}</td>
                                    <td style={{ padding: "12px 14px" }}>
                                      <span style={{ background: "rgba(0,120,60,0.1)", color: "#006633", padding: "2px 9px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                                        {["Engineering","Computer","Electrical","Civil","Mechanical"].some(k => prog.includes(k)) ? t.langEnglish : `${t.langTurkish} / ${t.langEnglish}`}
                                      </span>
                                    </td>
                                    <td style={{ padding: "12px 14px" }}>
                                      <button style={{ background: "var(--primary)", color: "white", border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                                        {t.applyNow}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                              <a href={`https://${uni.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, padding: "8px 20px", border: "2px solid var(--secondary)", color: "var(--secondary)", borderRadius: 8, fontWeight: 600, display: "inline-block" }}>
                                {t.universityWebsiteBtn} ↗
                              </a>
                              <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }} onClick={() => setExpandedUni(null)}>{t.collapseBtn} ▲</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
