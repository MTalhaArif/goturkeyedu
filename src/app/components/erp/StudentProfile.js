"use client";
// Student profile in the legacy layout: left summary card + tabs (Profile, Fees, Exam,
// Documents, Documents & QR, Timeline) + the legacy top-right action icons
// (edit, collect fees, login credentials, disable/enable, more).

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { STUDENT_FIELD_GROUPS } from "@/lib/erp/schema";
import { listAll, listWhere, updateRow, deleteRow, fullName } from "@/lib/erp/data";
import { esc } from "@/lib/erp/templating";
import { Btn, Badge, Modal, Table, Grid, Field, FieldInput, displayValue, inputStyle, fmtDate, printHtml, C } from "./ui";
import { StudentFeesPanel } from "./Fees";
import { StudentDocumentsPanel } from "./Documents";

const nameOf = (opts, key, id) => (opts[key] || []).find(r => r.id === id)?.name || "";

const iconBtn = { border: "none", background: "transparent", cursor: "pointer", fontSize: 18, padding: "6px 8px", borderRadius: 8 };

export function avatarFor(s) {
  if (s.photo?.url) return <img src={s.photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  return <span style={{ fontSize: 56 }}>{/female/i.test(s.gender || "") ? "👩" : "👨"}</span>;
}

export default function StudentProfile({ student, opts, onClose, onChanged, onEdit, initialTab = "profile" }) {
  const [tab, setTab] = useState(initialTab);
  const [s, setS] = useState(student);
  const [disableOpen, setDisableOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [siblings, setSiblings] = useState([]);
  const save = async patch => { await updateRow("students", s.id, patch); setS(p => ({ ...p, ...patch })); };

  useEffect(() => {
    if (!s.siblingIds?.length) return;
    listAll("students").then(all => setSiblings(all.filter(x => s.siblingIds.includes(x.id)))).catch(() => {});
  }, [s.siblingIds]);

  const sessionName = nameOf(opts, "sessions", s.sessionId);
  const className = `${nameOf(opts, "classes", s.classId)}${sessionName ? ` (${sessionName})` : ""}`;

  const enable = async () => { if (confirm("Enable this student?")) { await save({ status: "active", disableReasonId: "", disableDate: "", disableNote: "" }); onChanged?.(); } };
  const remove = async () => {
    if (!confirm(`Permanently delete ${fullName(s)} and their fee records? Issued documents stay verifiable.`)) return;
    for (const f of await listWhere("student_fees", "studentId", "==", s.id)) await deleteRow("student_fees", f.id);
    for (const p of await listWhere("fee_payments", "studentId", "==", s.id)) await deleteRow("fee_payments", p.id);
    await deleteRow("students", s.id); onChanged?.(); onClose();
  };
  const printProfile = () => {
    const rows = STUDENT_FIELD_GROUPS.flatMap(g => [`<tr><th colspan="2" style="text-align:left;background:#f3f4f6;padding:6px">${esc(g.title)}</th></tr>`, ...g.fields.map(f => `<tr><td style="padding:4px 6px;width:35%">${esc(f.label)}</td><td style="padding:4px 6px">${esc(typeof displayValue(f, s[f.key], opts) === "string" ? displayValue(f, s[f.key], opts) : s[f.key]?.name || "")}</td></tr>`)]).join("");
    printHtml(fullName(s), `<h2>${esc(fullName(s))} — ${esc(s.admissionNo || "")}</h2><table border="1" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px">${rows}</table>`);
  };

  const TABS = [["profile", "Profile"], ["fees", "Fees"], ["exam", "Exam"], ["documents", "Documents"], ["qr", "Documents & QR"], ["timeline", "Timeline"]];

  return (
    <Modal title={`Student — ${fullName(s)}`} width={1250} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 300px) 1fr", gap: 20, alignItems: "start" }} className="gt-profile-grid">
        <style>{`@media (max-width: 820px) { .gt-profile-grid { grid-template-columns: 1fr !important; } }`}</style>

        {/* Left summary card */}
        <div style={{ border: `1px solid ${C.line}`, borderTop: `3px solid #f59e0b`, borderRadius: 12, padding: 18 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 10px", background: C.soft, border: `4px solid ${C.line}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>{avatarFor(s)}</div>
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{fullName(s)}</div>
          {[["Admission No", s.admissionNo], ["Roll Number", s.rollNo], ["Class", className], ["Section", nameOf(opts, "sections", s.sectionId)], ["RTE", s.rte || "No"], ["Gender", (s.gender || "").toLowerCase()], ["Status", s.status === "disabled" ? "Disabled" : "Active"]]
            .filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 0", borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
                <b>{k}</b><span style={{ color: k === "Status" && v === "Disabled" ? "#dc2626" : "#0891b2", textAlign: "right" }}>{v}</span>
              </div>
            ))}
          {siblings.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, fontSize: 13 }}>
              <b>Siblings</b>
              {siblings.map(x => <div key={x.id} style={{ marginTop: 4 }}>{fullName(x)} <span style={{ color: C.muted }}>({x.admissionNo})</span></div>)}
            </div>
          )}
        </div>

        {/* Right: tabs + action icons */}
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap", gap: 6, padding: "0 8px" }}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {TABS.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: "12px 16px", border: "none", background: "none", borderBottom: tab === id ? "3px solid #f59e0b" : "3px solid transparent", fontWeight: 600, color: tab === id ? C.ink : C.muted, cursor: "pointer", fontSize: 14 }}>{label}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <button title="Edit" aria-label="Edit" onClick={onEdit} style={iconBtn}>✏️</button>
              <button title="Collect Fees" aria-label="Collect Fees" onClick={() => setTab("fees")} style={{ ...iconBtn, fontWeight: 800 }}>$</button>
              <button title="Login Details" aria-label="Login Details" onClick={() => setLoginOpen(true)} style={iconBtn}>🔑</button>
              {s.status === "disabled"
                ? <button title="Enable" aria-label="Enable" onClick={enable} style={iconBtn}>👍</button>
                : <button title="Disable" aria-label="Disable" onClick={() => setDisableOpen(true)} style={iconBtn}>👎</button>}
              <button title="More" aria-label="More" onClick={() => setMenuOpen(o => !o)} style={{ ...iconBtn, fontWeight: 800 }}>⋮</button>
              {menuOpen && (
                <div onMouseLeave={() => setMenuOpen(false)} style={{ position: "absolute", right: 0, top: 40, background: "white", border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", zIndex: 5, minWidth: 200, overflow: "hidden" }}>
                  {[["🖨 Print Profile", printProfile], ["🔏 Issue Document", () => setTab("qr")], ["📎 Upload Document", () => setTab("documents")], ["🗑 Delete Student", remove]].map(([l, fn]) => (
                    <button key={l} onClick={() => { setMenuOpen(false); fn(); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "white", cursor: "pointer", fontSize: 14, color: l.includes("Delete") ? "#dc2626" : C.ink }}>{l}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: 16 }}>
            {tab === "profile" && <ProfileTab s={s} opts={opts} />}
            {tab === "fees" && <StudentFeesPanel student={s} />}
            {tab === "exam" && <ExamTab s={s} />}
            {tab === "documents" && <UploadsPanel s={s} save={save} />}
            {tab === "qr" && <StudentDocumentsPanel student={s} />}
            {tab === "timeline" && <TimelinePanel s={s} save={save} />}
          </div>
        </div>
      </div>

      {disableOpen && <DisableModal opts={opts} onClose={() => setDisableOpen(false)} onSave={async v => { await save({ status: "disabled", ...v }); setDisableOpen(false); onChanged?.(); }} />}
      {loginOpen && <LoginModal s={s} onClose={() => setLoginOpen(false)} onSaved={patch => setS(p => ({ ...p, ...patch }))} />}
    </Modal>
  );
}

// ── Profile tab: every field, including empty ones (as the legacy page shows them) ──
function ProfileTab({ s, opts }) {
  const row = (label, value, key) => (
    <tr key={key || label} style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td style={{ padding: "9px 6px", width: "45%", color: "#334155" }}>{label}</td>
      <td style={{ padding: "9px 6px" }}>{value}</td>
    </tr>
  );
  const [details, parents, address, misc] = STUDENT_FIELD_GROUPS;
  const section = (title, children) => (
    <div style={{ marginTop: 18, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: C.soft, padding: "10px 14px", fontSize: 16, fontWeight: 600, borderBottom: `1px solid ${C.line}` }}>{title}</div>
      <div style={{ padding: "4px 14px" }}>{children}</div>
    </div>
  );
  const fieldRows = g => g.fields.filter(f => !["firstName", "lastName", "photo"].includes(f.key)).map(f => row(f.label, displayValue(f, s[f.key], opts), f.key));
  const photo = (p, label) => (
    <div style={{ textAlign: "center", fontSize: 12, color: C.muted }}>
      <div style={{ width: 96, height: 96, borderRadius: "50%", border: `4px solid ${C.line}`, background: C.soft, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px" }}>
        {p?.url ? <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 11 }}>NO IMAGE<br />AVAILABLE</span>}
      </div>{label}
    </div>
  );
  return (
    <>
      <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}><tbody>{fieldRows(details)}</tbody></table>
      {s.status === "disabled" && <div style={{ marginTop: 10, fontSize: 13, color: "#dc2626" }}>Disabled on {fmtDate(s.disableDate)} — {nameOf(opts, "disable_reasons", s.disableReasonId)} {s.disableNote}</div>}
      {section("Address Detail", <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}><tbody>{fieldRows(address)}</tbody></table>)}
      {section("Parent / Guardian Details", (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <table style={{ flex: 1, minWidth: 260, fontSize: 14, borderCollapse: "collapse" }}><tbody>{fieldRows(parents)}</tbody></table>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingTop: 10 }}>{photo(s.fatherPhoto, "Father")}{photo(s.motherPhoto, "Mother")}{photo(s.guardianPhoto, "Guardian")}</div>
        </div>
      ))}
      {section("Miscellaneous Details", <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}><tbody>{fieldRows(misc)}</tbody></table>)}
      {s.legacy && Object.keys(s.legacy).length > 0 && section("Other Legacy Fields", (
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}><tbody>{Object.entries(s.legacy).map(([k, v]) => row(k, String(v)))}</tbody></table>
      ))}
    </>
  );
}

// ── Exam tab ──────────────────────────────────────────────────────────────────────
function ExamTab({ s }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all([listWhere("exam_results", "studentId", "==", s.id), listAll("exam_schedules"), listAll("exam_groups"), listAll("subjects"), listAll("grades"), listWhere("online_exam_results", "studentId", "==", s.id), listAll("online_exams")])
      .then(([results, schedules, groups, subjects, grades, online, onlineExams]) => setD({ results, schedules, groups, subjects, grades, online, onlineExams }))
      .catch(e => setD({ error: e.message }));
  }, [s.id]);
  if (!d) return <div>Loading…</div>;
  if (d.error) return <div style={{ color: "#dc2626" }}>{d.error}</div>;
  const sch = id => d.schedules.find(x => x.id === id) || {};
  const grade = p => d.grades.find(g => p >= Number(g.percentFrom || 0) && p <= Number(g.percentUpto || 100))?.name || "";
  return (
    <>
      <h4 style={{ margin: "0 0 8px" }}>Exam Result</h4>
      <Table columns={[
        { label: "Exam Group", render: r => d.groups.find(g => g.id === sch(r.examScheduleId).examGroupId)?.name || "" },
        { label: "Exam", render: r => sch(r.examScheduleId).exam },
        { label: "Subject", render: r => d.subjects.find(x => x.id === sch(r.examScheduleId).subjectId)?.name || "" },
        { label: "Max Marks", render: r => sch(r.examScheduleId).maxMarks },
        { label: "Marks Obtained", render: r => r.absent ? "ABS" : r.marks },
        { label: "Grade", render: r => { const m = Number(sch(r.examScheduleId).maxMarks) || 0; return m && !r.absent ? grade((Number(r.marks) / m) * 100) : ""; } },
      ]} rows={d.results} empty="No exam result found." />
      <h4 style={{ margin: "20px 0 8px" }}>Online Exam</h4>
      <Table columns={[
        { label: "Exam", render: r => d.onlineExams.find(e => e.id === r.onlineExamId)?.title || "" },
        { label: "Date", render: r => fmtDate(r.attemptDate) }, { label: "Score", render: r => `${r.score ?? ""}%` }, { label: "Result", render: r => r.result },
      ]} rows={d.online} empty="No online exam attempts." />
    </>
  );
}

// ── Login credentials (replaces legacy "Parolayı Göster / Değiştir") ──────────────
function LoginModal({ s, onClose, onSaved }) {
  const [users, setUsers] = useState(null);
  const [email, setEmail] = useState(s.loginEmail || s.email || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { listWhere("portal_users", "studentId", "==", s.id).then(setUsers).catch(() => setUsers([])); }, [s.id]);
  const genPassword = () => setPassword(Array.from(crypto.getRandomValues(new Uint8Array(6)), b => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join(""));
  const submit = async () => {
    setBusy(true); setMsg("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/erp/student-login", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ studentId: s.id, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSaved({ loginUid: data.uid, loginEmail: data.email });
      setMsg(`Login ${data.created ? "created" : "updated"}. Student can sign in at /login with ${data.email} and the password shown above.`);
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Login Details — ${fullName(s)}`} width={620} onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Close</Btn><Btn onClick={submit} disabled={busy || !email || password.length < 6}>{busy ? "Saving…" : s.loginUid ? "Change Password" : "Create Login"}</Btn></>}>
      <div style={{ fontSize: 13.5, marginBottom: 14 }}>
        <b>Legacy portal accounts:</b>{" "}
        {users === null ? "…" : users.length ? users.map(u => <span key={u.id}><code>{u.username}</code> ({u.userType}) </span>) : "none"}
        <div style={{ color: C.muted, marginTop: 6 }}>Legacy passwords were not migrated (they cannot be read back). Set a new password to give the student access to the student portal.</div>
      </div>
      {s.loginUid && <div style={{ marginBottom: 12 }}><Badge>Student portal login active</Badge> <span style={{ fontSize: 13 }}>{s.loginEmail}</span></div>}
      <Grid cols={1}>
        <Field label="Login Email" required><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></Field>
        <Field label="New Password (min 6)" required>
          <div style={{ display: "flex", gap: 8 }}><input value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /><Btn kind="ghost" onClick={genPassword}>Generate</Btn></div>
        </Field>
      </Grid>
      {msg && <div style={{ marginTop: 12, fontSize: 13.5, color: msg.startsWith("Login") ? "#047857" : "#dc2626" }}>{msg}</div>}
    </Modal>
  );
}

function DisableModal({ opts, onClose, onSave }) {
  const [v, setV] = useState({ disableDate: new Date().toISOString().slice(0, 10) });
  return (
    <Modal title="Disable Student" width={520} onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => v.disableReasonId ? onSave(v) : alert("Reason is required")}>Save</Btn></>}>
      <Grid cols={1}>
        <Field label="Reason" required><select value={v.disableReasonId || ""} onChange={e => setV(p => ({ ...p, disableReasonId: e.target.value }))} style={inputStyle}><option value="">Select</option>{(opts.disable_reasons || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
        <Field label="Date"><input type="date" value={v.disableDate} onChange={e => setV(p => ({ ...p, disableDate: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Note"><textarea value={v.disableNote || ""} onChange={e => setV(p => ({ ...p, disableNote: e.target.value }))} style={inputStyle} /></Field>
      </Grid>
    </Modal>
  );
}

function UploadsPanel({ s, save }) {
  const [title, setTitle] = useState(""); const [file, setFile] = useState(null);
  const uploads = s.uploads || [];
  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
        <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyle, minWidth: 220 }} /></Field>
        <Field label="Document"><FieldInput field={{ type: "file" }} value={file} onChange={setFile} folder={`students/${s.id}`} /></Field>
        <Btn disabled={!title || !file} onClick={async () => { await save({ uploads: [...uploads, { title, file, at: new Date().toISOString() }] }); setTitle(""); setFile(null); }}>Upload Documents</Btn>
      </div>
      <Table columns={[
        { label: "Title", key: "title" },
        { label: "File Name", render: u => u.file?.url ? <a href={u.file.url} target="_blank" rel="noreferrer">{u.file.name}</a> : (u.file?.legacyPath || "") },
        { label: "Action", render: (u, i) => <Btn small kind="danger" onClick={() => confirm("Remove this document?") && save({ uploads: uploads.filter((_, j) => j !== i) })}>🗑️</Btn> },
      ]} rows={uploads} rowKey={(u, i) => i} empty="No Record Found" />
    </>
  );
}

function TimelinePanel({ s, save }) {
  const [v, setV] = useState({ date: new Date().toISOString().slice(0, 10), visible: true });
  const items = [...(s.timeline || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return (
    <>
      <Grid>
        <Field label="Title" required><input value={v.title || ""} onChange={e => setV(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Date" required><input type="date" value={v.date} onChange={e => setV(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Attach Document"><FieldInput field={{ type: "file" }} value={v.document} onChange={d => setV(p => ({ ...p, document: d }))} folder={`students/${s.id}/timeline`} /></Field>
        <Field label="Visible to this person"><input type="checkbox" checked={!!v.visible} onChange={e => setV(p => ({ ...p, visible: e.target.checked }))} /></Field>
        <Field label="Description" wide><textarea value={v.description || ""} onChange={e => setV(p => ({ ...p, description: e.target.value }))} style={inputStyle} /></Field>
      </Grid>
      <div style={{ margin: "12px 0 20px" }}><Btn disabled={!v.title} onClick={async () => { await save({ timeline: [...(s.timeline || []), v] }); setV({ date: new Date().toISOString().slice(0, 10), visible: true }); }}>Add To Timeline</Btn></div>
      {items.length === 0 && <div style={{ color: C.muted }}>No Record Found</div>}
      {items.map((it, i) => (
        <div key={i} style={{ borderLeft: `3px solid ${C.primary}`, padding: "6px 12px", marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>{it.title} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>{fmtDate(it.date)}</span></div>
          <div style={{ fontSize: 13.5 }}>{it.description}</div>
          {it.document?.url && <a href={it.document.url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>📎 {it.document.name}</a>}
        </div>
      ))}
    </>
  );
}
