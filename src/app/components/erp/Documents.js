"use client";
// Documents & QR: official letters (student document, acceptance/invitation letters,
// top-text letters, certificates) with a verification code + QR code that resolves to
// the public page /belge_dogrulama/{code}/{type}. Stored in erp_documents with the
// deterministic id `${code}_${type}` so the public page can fetch it directly.

import { useEffect, useMemo, useState } from "react";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import { listAll, listWhere, setRow, deleteRow, getSettings, saveSettings, newVerificationCode, fullName } from "@/lib/erp/data";
import { renderDocumentHtml, qrDataUrl, verificationUrl, fillPlaceholders, studentPlaceholders, esc } from "@/lib/erp/templating";
import { Card, Btn, Badge, Modal, Table, Grid, Field, inputStyle, fmtDate, printHtml, exportCsv, C } from "./ui";

const TYPE_OPTIONS = Object.entries(DOCUMENT_TYPES).map(([id, n]) => ({ id, label: `${n.en} / ${n.tr}` }));
const LANGS = [["en", "English"], ["tr", "Türkçe"]];

export function docId(code, type) { return `${code}_${type}`; }

async function previewHtml(doc, lang, settings) {
  const qr = await qrDataUrl(verificationUrl(doc.code, doc.type), 192);
  return renderDocumentHtml(doc, lang, qr, settings);
}

// ── List of all issued documents ──────────────────────────────────────────────────
export default function Documents() {
  const [docs, setDocs] = useState(null);
  const [students, setStudents] = useState([]);
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  const load = async () => {
    const [d, s] = await Promise.all([listAll("documents", { force: true }), listAll("students")]);
    setDocs(d); setStudents(s);
  };
  useEffect(() => {
    Promise.all([listAll("documents", { force: true }), listAll("students")])
      .then(([d, s]) => { setDocs(d); setStudents(s); })
      .catch(e => { alert(e.message); setDocs([]); });
  }, []);

  const byId = useMemo(() => Object.fromEntries(students.map(s => [s.id, s])), [students]);
  const rows = (docs || [])
    .filter(d => !type || d.type === type)
    .filter(d => { const k = q.trim().toLocaleLowerCase("tr"); return !k || [d.code, d.studentName, d.studentEmail, fullName(byId[d.studentId]), byId[d.studentId]?.passportNo].some(v => String(v || "").toLocaleLowerCase("tr").includes(k)); })
    .sort((a, b) => String(b.issuedAt || "").localeCompare(String(a.issuedAt || "")));

  const cols = [
    { label: "User", render: d => <span>{fullName(byId[d.studentId]) || d.studentName} {d.studentEmail && <span style={{ color: C.muted, fontSize: 12 }}>[ {d.studentEmail} ]</span>}</span>, text: d => fullName(byId[d.studentId]) || d.studentName },
    { label: "Code", render: d => <code style={{ fontSize: 12 }}>{d.code}</code>, text: d => d.code },
    { label: "Document", render: d => DOCUMENT_TYPES[d.type]?.tr || d.type, text: d => DOCUMENT_TYPES[d.type]?.tr || d.type },
    { label: "Created At", render: d => fmtDate(d.issuedAt), text: d => d.issuedAt },
    { label: "Updated At", render: d => fmtDate(d.updatedAtText || d.issuedAt), text: d => d.updatedAtText },
    { label: "Actions", render: d => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn small kind="ghost" onClick={() => setViewing(d)} title="View / print">👁️</Btn>
        <Btn small kind="info" onClick={() => setEditing(d)} title="Edit">✏️</Btn>
        <Btn small kind="ghost" onClick={() => window.open(`/belge_dogrulama/${d.code}/${d.type}`, "_blank")} title="Public verification page">🔗</Btn>
        <Btn small kind="danger" onClick={async () => { if (confirm(`Delete document ${d.code}? Its QR code will stop verifying.`)) { await deleteRow("documents", d.id); load(); } }}>🗑️</Btn>
      </div>
    ) },
  ];

  return (
    <>
      <Card title={`Issued Documents (${rows.length})`} actions={<>
        <Btn onClick={() => setIssuing(true)}>+ Issue Document</Btn>
        <Btn kind="ghost" onClick={() => setTplOpen(true)}>Templates</Btn>
        <Btn kind="ghost" onClick={() => exportCsv("documents.csv", cols.slice(0, -1), rows)}>⬇ CSV</Btn>
      </>}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}><option value="">All document types</option>{TYPE_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, code, passport" style={{ ...inputStyle, maxWidth: 340 }} />
        </div>
        <Table columns={cols} rows={rows.slice(0, 300)} empty={docs ? "No documents." : "Loading…"} />
        {rows.length > 300 && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Showing 300 of {rows.length} — refine the search.</div>}
      </Card>
      {viewing && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
      {editing && <DocumentEditor doc={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {issuing && <IssueDocument students={students} onClose={() => setIssuing(false)} onSaved={d => { setIssuing(false); load(); setViewing(d); }} />}
      {tplOpen && <TemplatesEditor onClose={() => setTplOpen(false)} />}
    </>
  );
}

// ── Viewer with EN/TR toggle, print, QR ───────────────────────────────────────────
export function DocumentViewer({ doc, onClose }) {
  const [lang, setLang] = useState(doc.content?.en ? "en" : "tr");
  const [html, setHtml] = useState("");
  useEffect(() => {
    let alive = true;
    getSettings("general").catch(() => ({})).then(s => previewHtml(doc, lang, s)).then(h => alive && setHtml(h));
    return () => { alive = false; };
  }, [doc, lang]);
  return (
    <Modal title={`${DOCUMENT_TYPES[doc.type]?.en || "Document"} — ${doc.code}`} width={960} onClose={onClose} footer={<>
      {LANGS.filter(([l]) => doc.content?.[l]).map(([l, n]) => <Btn key={l} kind={lang === l ? "dark" : "ghost"} onClick={() => setLang(l)}>{n}</Btn>)}
      <Btn kind="ghost" onClick={() => navigator.clipboard?.writeText(verificationUrl(doc.code, doc.type))}>Copy link</Btn>
      <Btn onClick={() => printHtml(doc.code, html, "@page{size:A4;margin:12mm}")}>🖨 Print</Btn>
    </>}>
      <div dangerouslySetInnerHTML={{ __html: html || "Rendering…" }} />
    </Modal>
  );
}

// ── Structured editor for one language's content ──────────────────────────────────
function PairsEditor({ value = [], onChange, labels = ["Label", "Value"] }) {
  return (
    <div>
      {value.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input value={k} onChange={e => onChange(value.map((p, j) => j === i ? [e.target.value, p[1]] : p))} placeholder={labels[0]} style={{ ...inputStyle, flex: 1 }} />
          <input value={v} onChange={e => onChange(value.map((p, j) => j === i ? [p[0], e.target.value] : p))} placeholder={labels[1]} style={{ ...inputStyle, flex: 1.4 }} />
          <Btn small kind="danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</Btn>
        </div>
      ))}
      <Btn small kind="ghost" onClick={() => onChange([...value, ["", ""]])}>+ Row</Btn>
    </div>
  );
}

function ContentEditor({ content = {}, onChange }) {
  const set = (k, v) => onChange({ ...content, [k]: v });
  return (
    <Grid cols={2}>
      <Field label="Heading (institution line)" wide><input value={content.heading || ""} onChange={e => set("heading", e.target.value)} style={inputStyle} /></Field>
      <Field label="Number lines (e.g. Number, Tax Number)" wide><PairsEditor value={content.infoPairs} onChange={v => set("infoPairs", v)} /></Field>
      <Field label="Subject"><input value={content.subject || ""} onChange={e => set("subject", e.target.value)} style={inputStyle} /></Field>
      <Field label='Date (use "{today}" for the current date)'><input value={content.date || ""} onChange={e => set("date", e.target.value)} style={inputStyle} /></Field>
      <Field label="Title (e.g. TO WHOM IT MAY CONCERN)" wide><input value={content.title || ""} onChange={e => set("title", e.target.value)} style={inputStyle} /></Field>
      <Field label="Information table" wide><PairsEditor value={content.rows} onChange={v => set("rows", v)} /></Field>
      <Field label="Table layout"><select value={content.rowsPerLine || 1} onChange={e => set("rowsPerLine", Number(e.target.value))} style={inputStyle}><option value={1}>1 pair per line</option><option value={2}>2 pairs per line</option></select></Field>
      <Field label="Body (HTML allowed)" wide><textarea rows={10} value={content.bodyHtml || ""} onChange={e => set("bodyHtml", e.target.value)} style={{ ...inputStyle, fontFamily: "ui-monospace, monospace", fontSize: 12.5 }} /></Field>
      <Field label="Signature (one line each)" wide><textarea rows={3} value={(content.signature || []).join("\n")} onChange={e => set("signature", e.target.value.split("\n"))} style={inputStyle} /></Field>
      <Field label="Notice (bold paragraph under the QR)" wide><textarea rows={2} value={content.notice || ""} onChange={e => set("notice", e.target.value)} style={inputStyle} /></Field>
      <Field label="Footer (Address, Web, E-Mail, GSM…)" wide><PairsEditor value={content.footerPairs} onChange={v => set("footerPairs", v)} /></Field>
      <Field label="Header logos (image URLs, left → right, one per line)" wide><textarea rows={3} value={(content.logos || []).join("\n")} onChange={e => set("logos", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} style={inputStyle} /></Field>
    </Grid>
  );
}

function BilingualEditor({ value, onChange }) {
  const [lang, setLang] = useState("en");
  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {LANGS.map(([l, n]) => <Btn key={l} small kind={lang === l ? "dark" : "ghost"} onClick={() => setLang(l)}>{n}{!value?.[l] && " (empty)"}</Btn>)}
        {lang === "tr" && value?.en && !value?.tr && <Btn small kind="info" onClick={() => onChange({ ...value, tr: structuredClone(value.en) })}>Copy from English</Btn>}
      </div>
      <ContentEditor key={lang} content={value?.[lang] || {}} onChange={c => onChange({ ...(value || {}), [lang]: c })} />
    </>
  );
}

function DocumentEditor({ doc, onClose, onSaved }) {
  const [content, setContent] = useState(structuredClone(doc.content || {}));
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await setRow("documents", doc.id, { content, updatedAtText: new Date().toISOString() }); onSaved(); }
    catch (e) { alert(e.message); setSaving(false); }
  };
  return (
    <Modal title={`Edit ${doc.code}`} width={1000} onClose={onClose} footer={<>
      <Btn kind="ghost" onClick={() => setPreview(true)}>Preview</Btn><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
    </>}>
      <BilingualEditor value={content} onChange={setContent} />
      {preview && <DocumentViewer doc={{ ...doc, content }} onClose={() => setPreview(false)} />}
    </Modal>
  );
}

// ── Issue a new document ──────────────────────────────────────────────────────────
function nextNumber(infoPairs, lastNumber) {
  // Legacy numbers look like "200.99.0001310" — increment the trailing digits.
  return (infoPairs || []).map(([k, v], i) => {
    if (i !== 0) return [k, v];
    const base = lastNumber || v || "";
    const m = String(base).match(/^(.*?)(\d+)$/);
    return m ? [k, m[1] + String(Number(m[2]) + 1).padStart(m[2].length, "0")] : [k, v];
  });
}

async function buildFromTemplate(type, student, names) {
  const templates = await getSettings("document_templates").catch(() => ({}));
  const counters = await getSettings("document_counters").catch(() => ({}));
  const tpl = templates[type] || {};
  const ph = studentPlaceholders(student, names);
  const out = {};
  for (const lang of ["en", "tr"]) {
    const c = tpl[lang]; if (!c) continue;
    out[lang] = {
      ...structuredClone(c),
      // Legacy document numbers are one sequence shared by every document type.
      infoPairs: nextNumber(c.infoPairs, counters.global),
      rows: (c.rows || []).map(([k, v]) => [k, fillPlaceholders(v, ph).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")]),
      bodyHtml: fillPlaceholders(c.bodyHtml || "", ph),
    };
  }
  if (!out.en && !out.tr) out.en = { subject: DOCUMENT_TYPES[type]?.en, date: "{today}", rows: [["ID Card / Passport Number", ph.passport_no], ["Name Surname", ph.name], ["Birthdate", ph.dob], ["Nationality", ph.nationality]] };
  return out;
}

function IssueDocument({ students, onClose, onSaved, presetStudent }) {
  const [studentId, setStudentId] = useState(presetStudent?.id || "");
  const [q, setQ] = useState("");
  const [type, setType] = useState("1");
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const student = students.find(s => s.id === studentId) || presetStudent;
  const matches = q.trim() ? students.filter(s => [fullName(s), s.admissionNo, s.passportNo, s.email].some(v => String(v || "").toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")))).slice(0, 8) : [];

  const prepare = async () => {
    const [classes, sections, categories, sessions] = await Promise.all(["classes", "sections", "categories", "sessions"].map(k => listAll(k).catch(() => [])));
    const nm = (rows, id) => rows.find(r => r.id === id)?.name || "";
    setContent(await buildFromTemplate(type, student, { class: nm(classes, student.classId), section: nm(sections, student.sectionId), category: nm(categories, student.categoryId), session: nm(sessions, student.sessionId) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const code = newVerificationCode();
      const d = { code, type, studentId: student.id, studentName: fullName(student), studentEmail: student.email || "", content, issuedAt: new Date().toISOString(), updatedAtText: new Date().toISOString() };
      await setRow("documents", docId(code, type), d, { merge: false });
      const number = (content.en || content.tr)?.infoPairs?.[0]?.[1];
      if (number) await saveSettings("document_counters", { global: number });
      onSaved({ id: docId(code, type), ...d });
    } catch (e) { alert(e.message); setSaving(false); }
  };

  return (
    <Modal title="Issue Document" width={1000} onClose={onClose} footer={content ? <>
      <Btn kind="ghost" onClick={() => setContent(null)}>← Back</Btn><Btn onClick={save} disabled={saving}>{saving ? "Issuing…" : "Issue & Generate QR"}</Btn>
    </> : <Btn onClick={prepare} disabled={!student}>Continue →</Btn>}>
      {!content && (
        <Grid cols={2}>
          <Field label="Student" required>
            {student ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><b>{fullName(student)}</b> ({student.admissionNo}) {!presetStudent && <a href="#" onClick={e => { e.preventDefault(); setStudentId(""); }}>change</a>}</div> : (
              <>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, admission no, passport" style={inputStyle} />
                {matches.map(s => <div key={s.id} onClick={() => { setStudentId(s.id); setQ(""); }} style={{ padding: "6px 8px", cursor: "pointer", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>{fullName(s)} · {s.admissionNo} · {s.passportNo}</div>)}
              </>
            )}
          </Field>
          <Field label="Document Type" required><select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>{TYPE_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></Field>
        </Grid>
      )}
      {content && <><div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>Prefilled from the {DOCUMENT_TYPES[type].en} template and {fullName(student)}&apos;s record — review both languages, especially the body text.</div><BilingualEditor value={content} onChange={setContent} /></>}
    </Modal>
  );
}

// ── Per-type templates (seeded from the latest legacy document of each type) ─────
function TemplatesEditor({ onClose }) {
  const [templates, setTemplates] = useState(null);
  const [type, setType] = useState("1");
  useEffect(() => { getSettings("document_templates").then(setTemplates).catch(() => setTemplates({})); }, []);
  if (!templates) return null;
  const save = async () => { const { updatedAt, ...rest } = templates; await saveSettings("document_templates", rest); onClose(); };
  return (
    <Modal title="Document Templates" width={1000} onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save}>Save Templates</Btn></>}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, maxWidth: 340 }}>{TYPE_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <span style={{ fontSize: 12.5, color: C.muted }}>Placeholders: [name] [passport_no] [dob] [father_name] [mother_name] [nationality] [admission_no] [admission_date] [class] [section] [category] [session] [email] [phone]</span>
      </div>
      <BilingualEditor key={type} value={templates[type] || {}} onChange={v => setTemplates(p => ({ ...p, [type]: v }))} />
    </Modal>
  );
}

// ── Documents tab inside a student's profile ──────────────────────────────────────
export function StudentDocumentsPanel({ student }) {
  const [docs, setDocs] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const load = () => listWhere("documents", "studentId", "==", student.id).then(setDocs).catch(e => { alert(e.message); setDocs([]); });
  useEffect(() => { load(); }, [student.id]);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><Btn onClick={() => setIssuing(true)}>+ Issue Document</Btn></div>
      <Table columns={[
        { label: "Document", render: d => DOCUMENT_TYPES[d.type]?.tr || d.type }, { label: "Code", render: d => <code>{d.code}</code> },
        { label: "Created At", render: d => fmtDate(d.issuedAt) },
        { label: "Status", render: () => <Badge>Verifiable</Badge> },
        { label: "Actions", render: d => <div style={{ display: "flex", gap: 6 }}><Btn small kind="ghost" onClick={() => setViewing(d)}>👁️ View / Print</Btn><Btn small kind="ghost" onClick={() => window.open(`/belge_dogrulama/${d.code}/${d.type}`, "_blank")}>🔗</Btn></div> },
      ]} rows={docs || []} empty={docs ? "No documents issued." : "Loading…"} />
      {viewing && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
      {issuing && <IssueDocument students={[student]} presetStudent={student} onClose={() => setIssuing(false)} onSaved={d => { setIssuing(false); load(); setViewing(d); }} />}
    </>
  );
}

export { esc };
