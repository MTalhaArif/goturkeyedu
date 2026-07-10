"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { getUserProfile, upsertUser, createApplication, getApplicationsByStudent, updateApplication, updateApplicationStage } from "@/lib/firestore";
import { uploadApplicationFile } from "@/lib/storage";
import { universities } from "@/app/data/universities";

const STATE_STEPS = ["documents_pending", "payment_pending", "payment_submitted", "payment_verified", "offer_made", "accepted"];
const FOUNDATION_STEPS = ["documents_pending", "under_review", "offer_made", "accepted"];

// The full document checklist a student uploads once — shared across every application
// they create, since a passport or high-school transcript doesn't change per university.
// `requiredFor` lists which target education levels need this document before a fresh
// application can skip straight past "documents_pending".
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

/** Whether the student's shared document set is missing anything required for their education level. */
function computeMissingRequiredDocs(documents, educationLevel) {
  const level = educationLevel || "bachelor";
  return DOCUMENT_TYPES.some(d => d.requiredFor.includes(level) && !documents?.[d.key]);
}

function nextStageAfterDocuments(universityType) {
  return universityType === "State" ? "payment_pending" : "under_review";
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
  const [applications, setApplications] = useState([]);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(null); // document key or `payment:{appId}` currently uploading
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("goturkey_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "student") { router.push("/login"); return; }

    (async () => {
      const p = await getUserProfile(u.uid);
      if (p && !p.documents) p.documents = emptyDocuments();
      let apps = await getApplicationsByStudent(u.uid);

      // Arriving from an "Apply Now" click (StudySearch/List) while already logged in —
      // create a new application for this university/program (or reuse a matching one on
      // repeat clicks). The shared document set already covers this application, so its
      // starting stage skips "documents_pending" if that set already satisfies the
      // student's education level.
      const queryUniversity = searchParams.get("university");
      const queryProgram = searchParams.get("program");
      let landOnAppId = null;

      if (queryUniversity) {
        const existing = apps.find(a =>
          a.universityName?.toLowerCase() === queryUniversity.toLowerCase() &&
          (a.programName || "") === (queryProgram || "")
        );
        if (existing) {
          landOnAppId = existing.id;
        } else {
          const universityType = findUniversityType(queryUniversity);
          const docsReady = !computeMissingRequiredDocs(p?.documents, p?.educationLevel);
          const initial = {
            universityName: queryUniversity,
            programName: queryProgram || null,
            universityType,
            stage: docsReady ? nextStageAfterDocuments(universityType) : "documents_pending",
            paymentScreenshot: null,
            offer: null,
            adminNotes: "",
          };
          const created = await createApplication(u.uid, initial);
          const newApp = { id: created.id, studentUid: u.uid, ...initial };
          apps = [...apps, newApp];
          landOnAppId = newApp.id;
        }
      }

      setUser(u);
      setProfile(p);
      setProfileForm(p);
      setApplications(apps);
      setLoading(false);
      if (landOnAppId) {
        setActiveTab("applications");
        setExpandedAppId(landOnAppId);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("goturkey_user");
    router.push("/login");
  };

  const saveProfile = async () => {
    const updated = {
      phone: profileForm.phone || "",
      country: profileForm.country || "",
      nationality: profileForm.nationality || "",
      educationLevel: profileForm.educationLevel || "",
    };
    await upsertUser(user.uid, updated);
    setProfile(prev => ({ ...prev, ...updated }));
    setEditingProfile(false);
  };

  const patchApplication = (appId, patch) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, ...patch } : a));
  };

  const handleDocUpload = async (docKey, file) => {
    if (!file) return;
    setError("");
    setUploading(docKey);
    try {
      const uploaded = await uploadApplicationFile(user.uid, docKey, file);
      const updatedDocuments = { ...profile.documents, [docKey]: uploaded };
      await upsertUser(user.uid, { documents: updatedDocuments });
      setProfile(prev => ({ ...prev, documents: updatedDocuments }));
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setUploading(null);
    }
  };

  const handlePaymentUpload = async (appId, file) => {
    if (!file) return;
    setError("");
    const uploadKey = `payment:${appId}`;
    setUploading(uploadKey);
    try {
      const uploaded = await uploadApplicationFile(user.uid, `payment-${appId}`, file);
      await updateApplication(appId, { paymentScreenshot: uploaded });
      patchApplication(appId, { paymentScreenshot: uploaded });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setUploading(null);
    }
  };

  const requiredDocsMissing = computeMissingRequiredDocs(profile?.documents, profile?.educationLevel);

  // Advances every application still waiting on the shared document set — a student
  // normally only has one at "documents_pending" at a time, but nothing stops several.
  const submitDocuments = async () => {
    const pending = applications.filter(a => a.stage === "documents_pending");
    await Promise.all(pending.map(a => {
      const stage = nextStageAfterDocuments(a.universityType);
      return updateApplicationStage(a.id, stage).then(() => patchApplication(a.id, { stage }));
    }));
  };

  const submitPayment = async (app) => {
    await updateApplicationStage(app.id, "payment_submitted");
    patchApplication(app.id, { stage: "payment_submitted" });
  };

  const acceptOffer = async (app) => {
    await updateApplicationStage(app.id, "accepted");
    patchApplication(app.id, { stage: "accepted" });
  };

  if (!user || loading) {
    return <div style={{ minHeight: "100vh", background: "#f8fafc" }}></div>;
  }

  const isRtl = lang === "AR";

  const stageLabels = {
    documents_pending: t.sdStageDocumentsPending,
    payment_pending: t.sdStagePaymentPending,
    payment_submitted: t.sdStagePaymentSubmitted,
    payment_verified: t.sdStagePaymentVerified,
    under_review: t.sdStageUnderReview,
    offer_made: t.sdStageOfferMade,
    accepted: t.sdStageAccepted,
  };

  const hasPendingDocs = applications.some(a => a.stage === "documents_pending");
  const uploadedCount = DOCUMENT_TYPES.filter(d => profile.documents?.[d.key]).length;

  const renderDocumentsSection = () => (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h4 style={{ color: "var(--secondary)", fontSize: 15 }}>{t.sdTabDocuments}</h4>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{uploadedCount} / {DOCUMENT_TYPES.length} {t.sdDocsUploadedLabel}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14, marginBottom: 20 }}>
        {DOCUMENT_TYPES.map(doc => {
          const uploaded = profile.documents?.[doc.key];
          return (
            <div key={doc.key} style={{ border: `1.5px solid ${uploaded ? "#8fd9b6" : "var(--border)"}`, borderRadius: 12, padding: 12, background: uploaded ? "rgba(0,120,60,0.03)" : "#fafafa" }}>
              <div style={{ height: 80, borderRadius: 8, background: uploaded && doc.isImage ? "none" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                {uploaded && doc.isImage ? (
                  <img src={uploaded.url} alt={t[doc.labelKey]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 28, opacity: uploaded ? 0.7 : 0.35 }}>📄</span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--secondary)", marginBottom: 6, lineHeight: 1.3 }}>{t[doc.labelKey]}</div>
              {uploaded ? (
                <a href={uploaded.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>↗ {t.sdViewFileLink}</a>
              ) : (
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{t.sdNotUploadedLabel}</span>
              )}
              <label style={{ display: "block", fontSize: 11.5, color: "var(--secondary)", fontWeight: 700, cursor: "pointer", marginTop: 6 }}>
                {uploading === doc.key ? "…" : (uploaded ? t.sdReuploadBtn : t.sdUploadBtn)}
                <input type="file" accept="application/pdf,image/jpeg,image/png" style={{ display: "none" }} onChange={e => handleDocUpload(doc.key, e.target.files[0])} disabled={uploading === doc.key} />
              </label>
            </div>
          );
        })}
      </div>

      {hasPendingDocs ? (
        <button
          onClick={submitDocuments}
          disabled={requiredDocsMissing}
          className="btn-primary"
          style={{ fontSize: 13.5, padding: "9px 22px", opacity: requiredDocsMissing ? 0.5 : 1 }}
        >
          {t.sdSubmitDocumentsBtn}
        </button>
      ) : (
        <div style={{ color: "#006633", fontWeight: 600, fontSize: 13.5 }}>✅ {t.sdDocumentsSubmittedMsg}</div>
      )}
    </div>
  );

  const renderApplicationDetail = (app) => {
    const steps = app.universityType === "State" ? STATE_STEPS : FOUNDATION_STEPS;
    const stepIndex = Math.max(0, steps.indexOf(app.stage));

    return (
      <div>
        <div style={{ display: "flex", marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center", position: "relative" }}>
              {i > 0 && <div style={{ position: "absolute", top: 15, left: "-50%", width: "100%", height: 2, background: i <= stepIndex ? "var(--primary)" : "var(--border)", zIndex: 0 }} />}
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: i <= stepIndex ? "var(--primary)" : "var(--border)", color: i <= stepIndex ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, margin: "0 auto 8px", position: "relative", zIndex: 1 }}>
                {i < stepIndex ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: i === stepIndex ? 700 : 500, color: i === stepIndex ? "var(--primary)" : "var(--text-muted)" }}>{stageLabels[s]}</div>
            </div>
          ))}
        </div>

        {app.stage === "documents_pending" && <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{t.sdDocumentsPendingMsg}</p>}

        {app.stage === "payment_pending" && (
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 14 }}>{t.sdPaymentInstructionsMsg}</p>
            <label style={label}>{t.sdPaymentScreenshotLabel}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 13.5, color: app.paymentScreenshot ? "#006633" : "var(--text-muted)" }}>
                {app.paymentScreenshot ? `✅ ${app.paymentScreenshot.name}` : `⬜ ${t.sdNotUploadedLabel}`}
              </span>
              <label style={{ fontSize: 12.5, color: "var(--secondary)", fontWeight: 700, cursor: "pointer" }}>
                {uploading === `payment:${app.id}` ? "…" : (app.paymentScreenshot ? t.sdReuploadBtn : t.sdUploadBtn)}
                <input type="file" accept="image/jpeg,image/png,application/pdf" style={{ display: "none" }} onChange={e => handlePaymentUpload(app.id, e.target.files[0])} disabled={uploading === `payment:${app.id}`} />
              </label>
            </div>
            <button onClick={() => submitPayment(app)} disabled={!app.paymentScreenshot} className="btn-primary" style={{ fontSize: 13.5, padding: "9px 22px", opacity: !app.paymentScreenshot ? 0.5 : 1 }}>
              {t.sdSubmitPaymentBtn}
            </button>
          </div>
        )}

        {app.stage === "payment_submitted" && <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{t.sdPaymentSubmittedMsg}</p>}
        {app.stage === "payment_verified" && <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{t.sdPaymentVerifiedMsg}</p>}
        {app.stage === "under_review" && <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{t.sdUnderReviewMsg}</p>}

        {app.stage === "offer_made" && (
          <div style={{ background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.35)", borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: "var(--secondary)", marginBottom: 10, fontSize: 16 }}>{t.sdOfferBannerTitle}</h3>
            <p style={{ fontSize: 14, marginBottom: 8 }}>
              <strong>{app.offer?.programName}</strong> {t.sdOfferAt} <strong>{app.offer?.universityName}</strong>
            </p>
            {app.offer?.notes && (
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}><strong>{t.sdOfferNotesLabel}:</strong> {app.offer.notes}</p>
            )}
            <button onClick={() => acceptOffer(app)} className="btn-primary" style={{ fontSize: 13.5, padding: "9px 22px" }}>{t.sdAcceptOfferBtn}</button>
          </div>
        )}

        {app.stage === "accepted" && (
          <div style={{ background: "rgba(0,120,60,0.08)", border: "1px solid rgba(0,120,60,0.3)", borderRadius: 12, padding: 20, color: "#006633", fontWeight: 600, fontSize: 14 }}>
            🎉 {t.sdAcceptedMsg}
          </div>
        )}
      </div>
    );
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
            ["applications", "📋", t.sdTabApplications],
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
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={saveProfile} className="btn-primary" style={{ fontSize: 13, padding: "8px 18px" }}>{t.sdSaveBtn}</button>
                  <button onClick={() => { setProfileForm(profile); setEditingProfile(false); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{t.sdCancelBtn}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ color: "var(--secondary)", fontSize: 20 }}>{t.sdTabApplications}</h2>
              {applications.length > 0 && (
                requiredDocsMissing ? (
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{t.sdCompleteDocumentsFirstMsg}</span>
                ) : (
                  <a href="/StudySearch/List" className="btn-primary" style={{ fontSize: 13, padding: "8px 18px", textDecoration: "none" }}>{t.sdApplyAnotherBtn}</a>
                )
              )}
            </div>

            {applications.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                {t.sdNoApplicationsMsg} <a href="/StudySearch/List" style={{ color: "var(--primary)", fontWeight: 700 }}>{t.sdFindUniversityBtn}</a>
              </div>
            ) : (
              <>
                {renderDocumentsSection()}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {applications.map(app => {
                    const isExpanded = expandedAppId === app.id;
                    return (
                      <div key={app.id} style={{ border: `1.5px solid ${isExpanded ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden" }}>
                        <div
                          onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                          style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: isExpanded ? "rgba(26,35,126,0.03)" : "white", flexWrap: "wrap", gap: 10 }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--secondary)", fontSize: 15 }}>{app.universityName}</div>
                            {app.programName && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{app.programName}</div>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: app.stage === "accepted" ? "rgba(0,120,60,0.1)" : "rgba(255,179,0,0.15)", color: app.stage === "accepted" ? "#006633" : "#8a5a00" }}>
                              {stageLabels[app.stage]}
                            </span>
                            <span style={{ color: "var(--text-muted)", fontSize: 16, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
                            {renderApplicationDetail(app)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
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
