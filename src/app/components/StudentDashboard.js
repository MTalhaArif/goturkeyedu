"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { getUserProfile, upsertUser, getApplication, upsertApplication, updateApplicationStage } from "@/lib/firestore";
import { uploadApplicationFile } from "@/lib/storage";
import { universities } from "@/app/data/universities";

const STATE_STEPS = ["documents_pending", "payment_pending", "payment_submitted", "payment_verified", "offer_made", "accepted"];
const FOUNDATION_STEPS = ["documents_pending", "under_review", "offer_made", "accepted"];

// The full document checklist a student can upload. `requiredFor` lists which target
// education levels need this document as a prior-credential/identity requirement before
// "Submit Documents" is enabled — everything else (language proficiency, other) is optional.
const DOCUMENT_TYPES = [
  { key: "passport", labelKey: "sdDocPassport", requiredFor: ["associate", "bachelor", "master", "doctorate"] },
  { key: "picture", labelKey: "sdDocPicture", requiredFor: ["associate", "bachelor", "master", "doctorate"], isImage: true },
  { key: "highSchool1", labelKey: "sdDocHighSchool1", requiredFor: ["associate", "bachelor"] },
  { key: "highSchool2", labelKey: "sdDocHighSchool2", requiredFor: ["associate", "bachelor"] },
  { key: "bachelorDegree", labelKey: "sdDocBachelorDegree", requiredFor: ["master"] },
  { key: "bachelorTranscript", labelKey: "sdDocBachelorTranscript", requiredFor: ["master"] },
  { key: "masterDegree", labelKey: "sdDocMasterDegree", requiredFor: ["doctorate"] },
  { key: "masterTranscript", labelKey: "sdDocMasterTranscript", requiredFor: ["doctorate"] },
  { key: "languageProficiency", labelKey: "sdDocLanguageProficiency", requiredFor: [] },
  { key: "other", labelKey: "sdDocOther", requiredFor: [] },
];

function emptyDocuments() {
  return Object.fromEntries(DOCUMENT_TYPES.map(d => [d.key, null]));
}

function findUniversityType(name) {
  if (!name) return null;
  const match = universities.find(u => u.name.toLowerCase() === name.toLowerCase());
  return match ? match.type : null;
}

const card = { background: "white", borderRadius: 16, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" };
const label = { display: "block", fontWeight: 700, fontSize: 12, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" };
const value = { fontSize: 15, color: "var(--text-main)", marginBottom: 16 };

function StudentDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, setLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [application, setApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(null); // which slot is currently uploading
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("goturkey_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "student") { router.push("/login"); return; }

    (async () => {
      const p = await getUserProfile(u.uid);
      let app = await getApplication(u.uid);

      // Arriving from an "Apply Now" click (StudySearch/List) while already logged in —
      // pick up the target university/program from the URL rather than re-registering.
      const queryUniversity = searchParams.get("university");
      const queryProgram = searchParams.get("program");
      const appliedFromQuery = queryUniversity && (!app || app.stage === "documents_pending");

      const universityName = appliedFromQuery ? queryUniversity : (app?.universityName ?? p?.interestedUniversity ?? null);
      const programName = appliedFromQuery ? (queryProgram || null) : (app?.programName ?? p?.interestedProgram ?? null);

      if (appliedFromQuery) {
        await upsertUser(u.uid, { interestedUniversity: universityName, interestedProgram: programName });
        p.interestedUniversity = universityName;
        p.interestedProgram = programName;
      }

      if (!app) {
        const initial = {
          universityName,
          programName,
          universityType: findUniversityType(universityName),
          stage: "documents_pending",
          documents: emptyDocuments(),
          paymentScreenshot: null,
          offer: null,
          adminNotes: "",
        };
        await upsertApplication(u.uid, initial);
        app = { id: u.uid, ...initial };
      } else if (appliedFromQuery) {
        const patch = { universityName, programName, universityType: findUniversityType(universityName) };
        await upsertApplication(u.uid, patch);
        app = { ...app, ...patch };
      }

      setUser(u);
      setProfile(p);
      setProfileForm(p);
      setApplication(app);
      setLoading(false);
      if (appliedFromQuery) setActiveTab("documents");
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("goturkey_user");
    router.push("/login");
  };

  const saveProfile = async () => {
    const universityName = profileForm.interestedUniversity || null;
    const updated = {
      phone: profileForm.phone || "",
      country: profileForm.country || "",
      nationality: profileForm.nationality || "",
      educationLevel: profileForm.educationLevel || "",
      interestedUniversity: universityName,
      interestedProgram: profileForm.interestedProgram || null,
    };
    await upsertUser(user.uid, updated);
    setProfile(prev => ({ ...prev, ...updated }));

    // Only sync the application's target university/type before documents are submitted —
    // once the student has moved past the initial stage, changing it here shouldn't silently
    // reset an in-progress application.
    if (application?.stage === "documents_pending") {
      const patch = { universityName, programName: updated.interestedProgram, universityType: findUniversityType(universityName) };
      await upsertApplication(user.uid, patch);
      setApplication(prev => ({ ...prev, ...patch }));
    }
    setEditingProfile(false);
  };

  const handleUpload = async (kind, file) => {
    if (!file) return;
    setError("");
    setUploading(kind);
    try {
      const uploaded = await uploadApplicationFile(user.uid, kind, file);
      const patch = kind === "payment"
        ? { paymentScreenshot: uploaded }
        : { documents: { ...application.documents, [kind]: uploaded } };
      await upsertApplication(user.uid, patch);
      setApplication(prev => ({ ...prev, ...patch }));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setUploading(null);
    }
  };

  const requiredDocsMissing = () => {
    const level = profile?.educationLevel || "bachelor";
    return DOCUMENT_TYPES.some(d => d.requiredFor.includes(level) && !application.documents?.[d.key]);
  };

  const submitDocuments = async () => {
    const nextStage = application.universityType === "State" ? "payment_pending" : "under_review";
    await updateApplicationStage(user.uid, nextStage);
    setApplication(prev => ({ ...prev, stage: nextStage }));
  };

  const submitPayment = async () => {
    await updateApplicationStage(user.uid, "payment_submitted");
    setApplication(prev => ({ ...prev, stage: "payment_submitted" }));
  };

  const acceptOffer = async () => {
    await updateApplicationStage(user.uid, "accepted");
    setApplication(prev => ({ ...prev, stage: "accepted" }));
  };

  if (!user || loading || !application) {
    return <div style={{ minHeight: "100vh", background: "#f8fafc" }}></div>;
  }

  const isRtl = lang === "AR";
  const steps = application.universityType === "State" ? STATE_STEPS : FOUNDATION_STEPS;
  const stepIndex = Math.max(0, steps.indexOf(application.stage));
  const docsSubmitted = application.stage !== "documents_pending";
  const uploadedCount = DOCUMENT_TYPES.filter(d => application.documents?.[d.key]).length;

  const stageLabels = {
    documents_pending: t.sdStageDocumentsPending,
    payment_pending: t.sdStagePaymentPending,
    payment_submitted: t.sdStagePaymentSubmitted,
    payment_verified: t.sdStagePaymentVerified,
    under_review: t.sdStageUnderReview,
    offer_made: t.sdStageOfferMade,
    accepted: t.sdStageAccepted,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }} dir={isRtl ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div style={{ background: "var(--secondary)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontSize: 26 }}>🇹🇷</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white" }}><span style={{ color: "var(--accent)" }}>Go</span>Turkey</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>{t.sdWelcomeBack}, <strong>{profile?.name || user.name}</strong></span>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 13 }}>
            <option value="EN" style={{ color: "black" }}>EN</option>
            <option value="TR" style={{ color: "black" }}>TR</option>
            <option value="AR" style={{ color: "black" }}>AR</option>
            <option value="FR" style={{ color: "black" }}>FR</option>
          </select>
          <button onClick={handleLogout} style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            {t.sdLogout}
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            ["profile", "👤", t.sdTabProfile],
            ["documents", "📄", t.sdTabDocuments],
            ["status", "📊", t.sdTabStatus],
          ].map(([id, icon, tabLabel]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              background: activeTab === id ? "var(--primary)" : "white",
              color: activeTab === id ? "white" : "var(--secondary)",
              border: "1px solid " + (activeTab === id ? "var(--primary)" : "var(--border)"),
              borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14,
            }}>
              {icon} {tabLabel}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "rgba(224,60,49,0.08)", border: "1px solid rgba(224,60,49,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "var(--primary)", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "var(--secondary)", fontSize: 20 }}>{t.sdTabProfile}</h2>
              {!editingProfile && (
                <button onClick={() => setEditingProfile(true)} className="btn-primary" style={{ fontSize: 13, padding: "8px 18px" }}>{t.sdEditProfileBtn}</button>
              )}
            </div>

            {!editingProfile ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div><label style={label}>{t.sdEmailLabel}</label><div style={value}>{profile?.email}</div></div>
                <div><label style={label}>{t.sdPhoneLabel}</label><div style={value}>{profile?.phone || "—"}</div></div>
                <div><label style={label}>{t.sdCountryLabel}</label><div style={value}>{profile?.country || "—"}</div></div>
                <div><label style={label}>{t.sdNationalityLabel}</label><div style={value}>{profile?.nationality || "—"}</div></div>
                <div><label style={label}>{t.sdEducationLevelLabel}</label><div style={value}>{profile?.educationLevel || "—"}</div></div>
                <div>
                  <label style={label}>{t.sdInterestedUniversityLabel}</label>
                  <div style={value}>
                    {profile?.interestedUniversity ? `${profile.interestedUniversity}${profile.interestedProgram ? " — " + profile.interestedProgram : ""}` : (
                      <>
                        {t.sdNoUniversitySelected} — <a href="/StudySearch/List" style={{ color: "var(--primary)", fontWeight: 700 }}>{t.sdFindUniversityBtn}</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label style={label}>{t.sdPhoneLabel}</label><input className="form-input" value={profileForm.phone || ""} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
                <div><label style={label}>{t.sdCountryLabel}</label><input className="form-input" value={profileForm.country || ""} onChange={e => setProfileForm({ ...profileForm, country: e.target.value })} /></div>
                <div><label style={label}>{t.sdNationalityLabel}</label><input className="form-input" value={profileForm.nationality || ""} onChange={e => setProfileForm({ ...profileForm, nationality: e.target.value })} /></div>
                <div>
                  <label style={label}>{t.sdEducationLevelLabel}</label>
                  <select className="form-select" value={profileForm.educationLevel || ""} onChange={e => setProfileForm({ ...profileForm, educationLevel: e.target.value })}>
                    <option value="">—</option>
                    <option value="associate">{t.associateDegree}</option>
                    <option value="bachelor">{t.bachelorsDegree}</option>
                    <option value="master">{t.mastersDegree}</option>
                    <option value="doctorate">{t.doctorate}</option>
                  </select>
                </div>
                <div><label style={label}>{t.sdInterestedUniversityLabel}</label><input className="form-input" value={profileForm.interestedUniversity || ""} onChange={e => setProfileForm({ ...profileForm, interestedUniversity: e.target.value })} /></div>
                <div><label style={label}>{t.sdInterestedProgramLabel}</label><input className="form-input" value={profileForm.interestedProgram || ""} onChange={e => setProfileForm({ ...profileForm, interestedProgram: e.target.value })} /></div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={saveProfile} className="btn-primary" style={{ fontSize: 13, padding: "8px 18px" }}>{t.sdSaveBtn}</button>
                  <button onClick={() => { setProfileForm(profile); setEditingProfile(false); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{t.sdCancelBtn}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ color: "var(--secondary)", fontSize: 20, letterSpacing: "0.5px" }}>{t.sdTabDocuments.toUpperCase()}</h2>
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{uploadedCount} / {DOCUMENT_TYPES.length} {t.sdDocsUploadedLabel}</span>
            </div>

            {application.universityName && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
                {t.sdApplyingToMsg}: <strong style={{ color: "var(--secondary)" }}>{application.programName ? `${application.programName} — ` : ""}{application.universityName}</strong>
              </p>
            )}
            {!application.universityName && (
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>{t.sdSelectUniversityFirstMsg}</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16, marginBottom: 24 }}>
              {DOCUMENT_TYPES.map(doc => {
                const uploaded = application.documents?.[doc.key];
                return (
                  <div key={doc.key} style={{ border: `1.5px solid ${uploaded ? "#8fd9b6" : "var(--border)"}`, borderRadius: 12, padding: 14, background: uploaded ? "rgba(0,120,60,0.03)" : "#fafafa" }}>
                    <div style={{ height: 90, borderRadius: 8, background: uploaded && doc.isImage ? "none" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, overflow: "hidden" }}>
                      {uploaded && doc.isImage ? (
                        <img src={uploaded.url} alt={t[doc.labelKey]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 32, opacity: uploaded ? 0.7 : 0.35 }}>📄</span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--secondary)", marginBottom: 8, lineHeight: 1.3 }}>{t[doc.labelKey]}</div>
                    {uploaded ? (
                      <a href={uploaded.url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 700 }}>↗ {t.sdViewFileLink}</a>
                    ) : (
                      <span style={{ fontSize: 12.5, color: "#94a3b8" }}>{t.sdNotUploadedLabel}</span>
                    )}
                    {!docsSubmitted && (
                      <label style={{ display: "block", fontSize: 12, color: "var(--secondary)", fontWeight: 700, cursor: "pointer", marginTop: 6 }}>
                        {uploading === doc.key ? "…" : (uploaded ? t.sdReuploadBtn : t.sdUploadBtn)}
                        <input type="file" accept="application/pdf,image/jpeg,image/png" style={{ display: "none" }} onChange={e => handleUpload(doc.key, e.target.files[0])} disabled={uploading === doc.key} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {application.universityName && (
              !docsSubmitted ? (
                <button
                  onClick={submitDocuments}
                  disabled={requiredDocsMissing()}
                  className="btn-primary"
                  style={{ fontSize: 14, padding: "10px 24px", opacity: requiredDocsMissing() ? 0.5 : 1 }}
                >
                  {t.sdSubmitDocumentsBtn}
                </button>
              ) : (
                <div style={{ color: "#006633", fontWeight: 600, fontSize: 14 }}>✅ {t.sdDocumentsSubmittedMsg}</div>
              )
            )}
          </div>
        )}

        {/* STATUS TAB */}
        {activeTab === "status" && (
          <div style={card}>
            <h2 style={{ color: "var(--secondary)", fontSize: 20, marginBottom: 28 }}>{t.sdTabStatus}</h2>

            {/* Stepper */}
            <div style={{ display: "flex", marginBottom: 32 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                  {i > 0 && <div style={{ position: "absolute", top: 15, left: "-50%", width: "100%", height: 2, background: i <= stepIndex ? "var(--primary)" : "var(--border)", zIndex: 0 }} />}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: i <= stepIndex ? "var(--primary)" : "var(--border)", color: i <= stepIndex ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, margin: "0 auto 8px", position: "relative", zIndex: 1 }}>
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: i === stepIndex ? 700 : 500, color: i === stepIndex ? "var(--primary)" : "var(--text-muted)" }}>{stageLabels[s]}</div>
                </div>
              ))}
            </div>

            {/* Stage content */}
            {application.stage === "documents_pending" && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.sdDocumentsPendingMsg}</p>}

            {application.stage === "payment_pending" && (
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>{t.sdPaymentInstructionsMsg}</p>
                <label style={label}>{t.sdPaymentScreenshotLabel}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: application.paymentScreenshot ? "#006633" : "var(--text-muted)" }}>
                    {application.paymentScreenshot ? `✅ ${application.paymentScreenshot.name}` : `⬜ ${t.sdNotUploadedLabel}`}
                  </span>
                  <label style={{ fontSize: 13, color: "var(--secondary)", fontWeight: 700, cursor: "pointer" }}>
                    {uploading === "payment" ? "…" : (application.paymentScreenshot ? t.sdReuploadBtn : t.sdUploadBtn)}
                    <input type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={e => handleUpload("payment", e.target.files[0])} disabled={uploading === "payment"} />
                  </label>
                </div>
                <button onClick={submitPayment} disabled={!application.paymentScreenshot} className="btn-primary" style={{ fontSize: 14, padding: "10px 24px", opacity: !application.paymentScreenshot ? 0.5 : 1 }}>
                  {t.sdSubmitPaymentBtn}
                </button>
              </div>
            )}

            {application.stage === "payment_submitted" && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.sdPaymentSubmittedMsg}</p>}
            {application.stage === "payment_verified" && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.sdPaymentVerifiedMsg}</p>}
            {application.stage === "under_review" && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.sdUnderReviewMsg}</p>}

            {application.stage === "offer_made" && (
              <div style={{ background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.35)", borderRadius: 12, padding: 24 }}>
                <h3 style={{ color: "var(--secondary)", marginBottom: 10 }}>{t.sdOfferBannerTitle}</h3>
                <p style={{ fontSize: 15, marginBottom: 8 }}>
                  <strong>{application.offer?.programName}</strong> {t.sdOfferAt} <strong>{application.offer?.universityName}</strong>
                </p>
                {application.offer?.notes && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}><strong>{t.sdOfferNotesLabel}:</strong> {application.offer.notes}</p>
                )}
                <button onClick={acceptOffer} className="btn-primary" style={{ fontSize: 14, padding: "10px 24px" }}>{t.sdAcceptOfferBtn}</button>
              </div>
            )}

            {application.stage === "accepted" && (
              <div style={{ background: "rgba(0,120,60,0.08)", border: "1px solid rgba(0,120,60,0.3)", borderRadius: 12, padding: 24, color: "#006633", fontWeight: 600 }}>
                🎉 {t.sdAcceptedMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardInner />
    </Suspense>
  );
}
