"use client";
// Student Information module: Student Details (search + profile), Student Admission,
// Disabled Students, Multi Class, Bulk Delete, Promote Students.

import { useEffect, useMemo, useState } from "react";
import { STUDENT_FIELD_GROUPS, STUDENT_FIELDS } from "@/lib/erp/schema";
import { listAll, createRow, updateRow, deleteRow, bulkDelete, listWhere, fullName, getSettings } from "@/lib/erp/data";
import { Card, Btn, Badge, Modal, Table, Grid, Field, FieldInput, useRefOptions, displayValue, missingRequired, exportCsv, inputStyle, fmtDate, C } from "./ui";
import { StudentFeesPanel } from "./Fees";
import { StudentDocumentsPanel } from "./Documents";

const nameOf = (opts, key, id) => (opts[key] || []).find(r => r.id === id)?.name || "";

function useStudents() {
  const [students, setStudents] = useState(null);
  const reload = async () => setStudents(await listAll("students", { force: true }));
  useEffect(() => { listAll("students").then(setStudents).catch(e => { alert(e.message); setStudents([]); }); }, []);
  return [students, reload];
}

function ClassSectionPicker({ value, onChange, opts, extra }) {
  const cls = (opts.classes || []).find(c => c.id === value.classId);
  const sections = (opts.sections || []).filter(s => !cls?.sectionIds?.length || cls.sectionIds.includes(s.id));
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
      <Field label="Class"><select value={value.classId || ""} onChange={e => onChange({ ...value, classId: e.target.value, sectionId: "" })} style={{ ...inputStyle, minWidth: 220 }}>
        <option value="">All / Select</option>{(opts.classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select></Field>
      <Field label="Section"><select value={value.sectionId || ""} onChange={e => onChange({ ...value, sectionId: e.target.value })} style={{ ...inputStyle, minWidth: 220 }}>
        <option value="">All / Select</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select></Field>
      {extra}
    </div>
  );
}

const inClass = (s, classId, sectionId) =>
  (!classId || s.classId === classId || (s.extraClasses || []).some(x => x.classId === classId)) &&
  (!sectionId || s.sectionId === sectionId || (s.extraClasses || []).some(x => x.sectionId === sectionId));

// ── Student Details ─────────────────────────────────────────────────────────────
export function StudentList({ disabledOnly = false }) {
  const [students, reload] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [crit, setCrit] = useState({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => (students || [])
    .filter(s => disabledOnly ? s.status === "disabled" : s.status !== "disabled")
    .filter(s => inClass(s, crit.classId, crit.sectionId))
    .filter(s => {
      const k = q.trim().toLocaleLowerCase("tr"); if (!k) return true;
      return [fullName(s), s.admissionNo, s.rollNo, s.passportNo, s.mobile, s.email, s.nationalId, s.localId, s.fatherName].some(v => String(v || "").toLocaleLowerCase("tr").includes(k));
    })
    .sort((a, b) => String(b.admissionNo || "").localeCompare(String(a.admissionNo || ""), undefined, { numeric: true })), [students, crit, q, disabledOnly]);

  const columns = [
    { label: "Admission No", key: "admissionNo" },
    { label: "Student Name", render: s => <a href="#" onClick={e => { e.preventDefault(); setOpen(s); }} style={{ color: C.info, fontWeight: 600 }}>{fullName(s)}</a>, text: s => fullName(s) },
    { label: "Class", render: s => `${nameOf(opts, "classes", s.classId)}${s.sectionId ? ` (${nameOf(opts, "sections", s.sectionId)})` : ""}`, text: s => nameOf(opts, "classes", s.classId) },
    { label: "Father Name", key: "fatherName" },
    { label: "Date Of Birth", render: s => fmtDate(s.dob), text: s => s.dob },
    { label: "Gender", key: "gender" },
    { label: "Category", render: s => nameOf(opts, "categories", s.categoryId), text: s => nameOf(opts, "categories", s.categoryId) },
    { label: "Mobile Number", key: "mobile" },
    { label: "Passport", key: "passportNo" },
    { label: "Action", render: s => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn small kind="ghost" onClick={() => setOpen(s)} title="View">👁️</Btn>
        <Btn small kind="info" onClick={() => setEditing(s)} title="Edit">✏️</Btn>
      </div>
    ) },
  ];

  return (
    <>
      <Card title={disabledOnly ? "Disabled Students" : "Select Criteria"}>
        <ClassSectionPicker value={crit} onChange={setCrit} opts={opts} extra={
          <Field label="Search By Keyword"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, admission no, passport, phone…" style={{ ...inputStyle, minWidth: 280 }} /></Field>
        } />
      </Card>
      <Card title={`Student List (${rows.length})`} actions={<Btn kind="ghost" onClick={() => exportCsv("students.csv", columns.slice(0, -1), rows)}>⬇ CSV</Btn>}>
        <Table columns={columns} rows={rows.slice(0, 500)} empty={students ? "No students found." : "Loading…"} />
        {rows.length > 500 && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Showing first 500 — narrow the criteria to see more.</div>}
      </Card>
      {open && <StudentProfile student={open} opts={opts} onClose={() => setOpen(null)} onChanged={async () => { await reload(); setOpen(null); }} onEdit={() => { setEditing(open); setOpen(null); }} />}
      {editing && <StudentForm initial={editing} opts={opts} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />}
    </>
  );
}

export const DisabledStudents = () => <StudentList disabledOnly />;

// ── All Students (legacy student/searchAll: every student with total Paid) ──────
export function AllStudents() {
  const [students] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [paid, setPaid] = useState({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  useEffect(() => {
    listAll("fee_payments", { force: true })
      .then(ps => setPaid(ps.reduce((m, p) => { m[p.studentId] = (m[p.studentId] || 0) + (Number(p.amount) || 0); return m; }, {})))
      .catch(() => {});
  }, []);
  const rows = (students || [])
    .filter(s => { const k = q.trim().toLocaleLowerCase("tr"); return !k || [fullName(s), s.admissionNo, s.mobile, s.passportNo].some(v => String(v || "").toLocaleLowerCase("tr").includes(k)); })
    .sort((a, b) => String(b.admissionNo || "").localeCompare(String(a.admissionNo || ""), undefined, { numeric: true }));
  const columns = [
    { label: "Admission No", key: "admissionNo" },
    { label: "Student Name", render: s => <a href="#" onClick={e => { e.preventDefault(); setOpen(s); }} style={{ color: C.info, fontWeight: 600 }}>{fullName(s)}</a>, text: s => fullName(s) },
    { label: "Class", render: s => nameOf(opts, "classes", s.classId), text: s => nameOf(opts, "classes", s.classId) },
    { label: "Date Of Birth", render: s => fmtDate(s.dob), text: s => s.dob },
    { label: "Gender", key: "gender" }, { label: "Mobile Number", key: "mobile" },
    { label: "Paid", render: s => <span style={{ fontWeight: 600 }}>{paid[s.id] || 0}</span>, text: s => paid[s.id] || 0, style: { background: "rgba(239,68,68,0.06)" } },
    { label: "Status", render: s => s.status === "disabled" ? <Badge color="#dc2626">Disabled</Badge> : <Badge>Active</Badge>, text: s => s.status || "active" },
  ];
  return (
    <>
      <Card title={`All Students (${rows.length})`} actions={<>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ ...inputStyle, maxWidth: 260 }} />
        <Btn kind="ghost" onClick={() => exportCsv("all-students.csv", columns, rows)}>⬇ CSV</Btn>
      </>}>
        <Table columns={columns} rows={rows.slice(0, 1000)} empty={students ? "No students." : "Loading…"} />
      </Card>
      {open && <StudentProfile student={open} opts={opts} onClose={() => setOpen(null)} onChanged={() => setOpen(null)} onEdit={() => setOpen(null)} />}
    </>
  );
}

// ── Admission / edit form ──────────────────────────────────────────────────────
function StudentForm({ initial, opts, onClose, onSaved, inline }) {
  const [values, setValues] = useState(() => initial ? strip(initial) : { admissionDate: new Date().toISOString().slice(0, 10), status: "active", rte: "No" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial || values.admissionNo) return;
    // Auto admission no (General Settings: prefix + zero-padded number from "start"),
    // else continue the legacy numbering: highest numeric admission no + 1.
    Promise.all([listAll("students"), getSettings("general").catch(() => ({}))]).then(([all, g]) => {
      if (g.autoAdmissionNo) {
        const prefix = String(g.admissionNoPrefix || ""), digits = Number(g.admissionNoDigits) || 0;
        const used = all.map(s => String(s.admissionNo || "")).filter(a => a.startsWith(prefix)).map(a => Number(a.slice(prefix.length)) || 0);
        const next = Math.max(Number(g.admissionNoStart) || 1, ...used.map(u => u + 1));
        setValues(v => ({ ...v, admissionNo: prefix + String(next).padStart(digits, "0") }));
        return;
      }
      const max = all.reduce((m, s) => Math.max(m, Number(String(s.admissionNo || "").replace(/\D/g, "")) || 0), 0);
      setValues(v => ({ ...v, admissionNo: String(max + 1) }));
    }).catch(() => {});
  }, []);

  const save = async () => {
    const missing = missingRequired(STUDENT_FIELDS, values);
    if (missing.length) { alert(`Required: ${missing.join(", ")}`); return; }
    setSaving(true);
    try {
      const data = { ...values, fullName: fullName(values) };
      if (initial?.id) await updateRow("students", initial.id, data);
      else {
        const dupe = (await listAll("students", { force: true })).find(s => String(s.admissionNo) === String(values.admissionNo));
        if (dupe) { alert(`Admission No ${values.admissionNo} is already used by ${fullName(dupe)}.`); setSaving(false); return; }
        await createRow("students", { ...data, status: "active" });
      }
      onSaved?.();
      if (inline) { setValues({ admissionDate: new Date().toISOString().slice(0, 10), status: "active", rte: "No" }); alert("Student saved."); }
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const body = STUDENT_FIELD_GROUPS.map(g => (
    <div key={g.title} style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, color: C.ink, margin: "0 0 12px", paddingBottom: 6, borderBottom: `1px solid ${C.line}` }}>{g.title}</h4>
      <Grid>
        {g.fields.map(f => (
          <Field key={f.key} label={f.label} required={f.required} wide={f.type === "textarea"}>
            <FieldInput field={f} value={values[f.key]} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} refOptions={opts} folder="students" />
          </Field>
        ))}
      </Grid>
    </div>
  ));

  if (inline) return <Card title="Student Admission" actions={<Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>}>{body}</Card>;
  return (
    <Modal title={initial?.id ? `Edit Student — ${fullName(initial)}` : "Student Admission"} width={1000} onClose={onClose} footer={<>
      <Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
    </>}>{body}</Modal>
  );
}

export function StudentAdmission() {
  const opts = useRefOptions(STUDENT_FIELDS);
  return <StudentForm opts={opts} inline />;
}

function strip(r) { const { id, createdAt, updatedAt, ...rest } = r; return rest; }

// ── Profile (tabs: Profile, Fees, Documents, Uploads, Timeline) ────────────────
export function StudentProfile({ student, opts, onClose, onChanged, onEdit }) {
  const [tab, setTab] = useState("profile");
  const [s, setS] = useState(student);
  const [disableOpen, setDisableOpen] = useState(false);
  const save = async patch => { await updateRow("students", s.id, patch); setS(p => ({ ...p, ...patch })); };

  const enable = async () => { if (confirm("Enable this student?")) { await save({ status: "active", disableReasonId: "", disableDate: "", disableNote: "" }); onChanged(); } };
  const remove = async () => {
    if (!confirm(`Permanently delete ${fullName(s)} and their fee records? Issued documents stay verifiable.`)) return;
    for (const f of await listWhere("student_fees", "studentId", "==", s.id)) await deleteRow("student_fees", f.id);
    for (const p of await listWhere("fee_payments", "studentId", "==", s.id)) await deleteRow("fee_payments", p.id);
    await deleteRow("students", s.id); onChanged();
  };

  return (
    <Modal title={fullName(s)} width={1100} onClose={onClose}>
      <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ width: 110, height: 130, borderRadius: 10, background: C.soft, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>
          {s.photo?.url ? <img src={s.photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
        </div>
        <div style={{ flex: 1, minWidth: 240, fontSize: 14, lineHeight: 1.9 }}>
          <div><b>Admission No:</b> {s.admissionNo} &nbsp; {s.status === "disabled" ? <Badge color="#dc2626">Disabled</Badge> : <Badge>Active</Badge>}</div>
          <div><b>Class:</b> {nameOf(opts, "classes", s.classId)} {s.sectionId && `(${nameOf(opts, "sections", s.sectionId)})`}</div>
          <div><b>Gender:</b> {s.gender} &nbsp; <b>Passport:</b> {s.passportNo} &nbsp; <b>Nationality:</b> {s.nationality}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Btn kind="info" onClick={onEdit}>✏️ Edit</Btn>
          {s.status === "disabled" ? <Btn kind="ok" onClick={enable}>Enable</Btn> : <Btn kind="ghost" onClick={() => setDisableOpen(true)}>Disable</Btn>}
          <Btn kind="danger" onClick={remove}>Delete</Btn>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.line}`, marginBottom: 16, flexWrap: "wrap" }}>
        {[["profile", "Profile"], ["fees", "Fees"], ["documents", "Documents & QR"], ["uploads", "Uploaded Documents"], ["timeline", "Timeline"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "8px 14px", border: "none", background: "none", borderBottom: tab === id ? `3px solid ${C.primary}` : "3px solid transparent", fontWeight: 600, color: tab === id ? C.ink : C.muted, cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {tab === "profile" && STUDENT_FIELD_GROUPS.map(g => (
        <div key={g.title} style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, margin: "0 0 8px", color: C.ink }}>{g.title}</h4>
          <table style={{ width: "100%", fontSize: 13.5, borderCollapse: "collapse" }}><tbody>
            {g.fields.filter(f => s[f.key] !== undefined && s[f.key] !== "").map(f => (
              <tr key={f.key} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={{ padding: "6px", color: C.muted, width: "35%" }}>{f.label}</td><td style={{ padding: "6px" }}>{displayValue(f, s[f.key], opts)}</td></tr>
            ))}
          </tbody></table>
        </div>
      ))}
      {tab === "profile" && s.status === "disabled" && <div style={{ fontSize: 13, color: "#dc2626" }}>Disabled on {fmtDate(s.disableDate)} — {nameOf(opts, "disable_reasons", s.disableReasonId)} {s.disableNote}</div>}

      {tab === "fees" && <StudentFeesPanel student={s} />}
      {tab === "documents" && <StudentDocumentsPanel student={s} />}
      {tab === "uploads" && <UploadsPanel s={s} save={save} />}
      {tab === "timeline" && <TimelinePanel s={s} save={save} />}

      {disableOpen && <DisableModal opts={opts} onClose={() => setDisableOpen(false)} onSave={async v => { await save({ status: "disabled", ...v }); setDisableOpen(false); onChanged(); }} />}
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
        <Btn disabled={!title || !file} onClick={async () => { await save({ uploads: [...uploads, { title, file, at: new Date().toISOString() }] }); setTitle(""); setFile(null); }}>Upload</Btn>
      </div>
      <Table columns={[
        { label: "Title", key: "title" },
        { label: "File Name", render: u => u.file?.url ? <a href={u.file.url} target="_blank" rel="noreferrer">{u.file.name}</a> : (u.file?.legacyPath || "") },
        { label: "Action", render: (u, i) => <Btn small kind="danger" onClick={() => confirm("Remove this document?") && save({ uploads: uploads.filter((_, j) => j !== i) })}>🗑️</Btn> },
      ]} rows={uploads} rowKey={(u, i) => i} />
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
      {items.length === 0 && <div style={{ color: C.muted }}>No timeline entries.</div>}
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

// ── Multi Class Student ─────────────────────────────────────────────────────────
export function MultiClass() {
  const [students, reload] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [crit, setCrit] = useState({});
  const rows = (students || []).filter(s => s.status !== "disabled" && crit.classId && inClass(s, crit.classId, crit.sectionId));

  const addClass = async (s, classId, sectionId) => {
    if (!classId) return;
    await updateRow("students", s.id, { extraClasses: [...(s.extraClasses || []), { classId, sectionId: sectionId || "" }] }); reload();
  };
  const removeClass = async (s, i) => { await updateRow("students", s.id, { extraClasses: (s.extraClasses || []).filter((_, j) => j !== i) }); reload(); };

  return (
    <>
      <Card title="Select Criteria"><ClassSectionPicker value={crit} onChange={setCrit} opts={opts} /></Card>
      <Card title="Multi Class Student">
        {!crit.classId && <div style={{ color: C.muted }}>Select a class.</div>}
        {rows.map(s => <MultiClassRow key={s.id} s={s} opts={opts} onAdd={addClass} onRemove={removeClass} />)}
      </Card>
    </>
  );
}

function MultiClassRow({ s, opts, onAdd, onRemove }) {
  const [v, setV] = useState({});
  return (
    <div style={{ borderBottom: `1px solid ${C.line}`, padding: "10px 0", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ minWidth: 220, fontWeight: 600 }}>{fullName(s)} <span style={{ color: C.muted, fontWeight: 400 }}>({s.admissionNo})</span></div>
      <div style={{ fontSize: 13 }}>Primary: {nameOf(opts, "classes", s.classId)}{(s.extraClasses || []).map((x, i) => <span key={i}> · {nameOf(opts, "classes", x.classId)} {x.sectionId && `(${nameOf(opts, "sections", x.sectionId)})`} <a href="#" onClick={e => { e.preventDefault(); onRemove(s, i); }} style={{ color: "#dc2626" }}>×</a></span>)}</div>
      <select value={v.classId || ""} onChange={e => setV({ ...v, classId: e.target.value })} style={{ ...inputStyle, maxWidth: 200 }}><option value="">+ Class</option>{(opts.classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select value={v.sectionId || ""} onChange={e => setV({ ...v, sectionId: e.target.value })} style={{ ...inputStyle, maxWidth: 200 }}><option value="">Section</option>{(opts.sections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <Btn small onClick={() => { onAdd(s, v.classId, v.sectionId); setV({}); }}>Add</Btn>
    </div>
  );
}

// ── Bulk Delete ─────────────────────────────────────────────────────────────────
export function BulkDelete() {
  const [students, reload] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [crit, setCrit] = useState({});
  const [sel, setSel] = useState(new Set());
  const rows = (students || []).filter(s => crit.classId && inClass(s, crit.classId, crit.sectionId));
  const toggle = id => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const run = async () => {
    if (!sel.size || !confirm(`Permanently delete ${sel.size} student(s)? This cannot be undone.`)) return;
    await bulkDelete("students", [...sel]); setSel(new Set()); reload();
  };

  return (
    <>
      <Card title="Select Criteria"><ClassSectionPicker value={crit} onChange={c => { setCrit(c); setSel(new Set()); }} opts={opts} /></Card>
      <Card title="Student List" actions={<Btn kind="danger" disabled={!sel.size} onClick={run}>Delete Selected ({sel.size})</Btn>}>
        <Table columns={[
          { label: <input type="checkbox" checked={rows.length > 0 && sel.size === rows.length} onChange={e => setSel(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} />, render: s => <input type="checkbox" checked={sel.has(s.id)} onChange={() => toggle(s.id)} /> },
          { label: "Admission No", key: "admissionNo" }, { label: "Student Name", render: s => fullName(s) },
          { label: "Class", render: s => nameOf(opts, "classes", s.classId) }, { label: "Date Of Birth", render: s => fmtDate(s.dob) },
          { label: "Gender", key: "gender" }, { label: "Mobile Number", key: "mobile" },
        ]} rows={rows} empty={crit.classId ? "No students." : "Select a class."} />
      </Card>
    </>
  );
}

// ── Promote Students ────────────────────────────────────────────────────────────
export function PromoteStudents() {
  const [students, reload] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [from, setFrom] = useState({}); const [to, setTo] = useState({});
  const [decisions, setDecisions] = useState({});
  const rows = (students || []).filter(s => s.status !== "disabled" && from.classId && s.classId === from.classId && (!from.sectionId || s.sectionId === from.sectionId));

  const run = async () => {
    if (!to.classId) { alert("Select the class to promote into."); return; }
    if (!confirm(`Promote ${rows.length} student(s)?`)) return;
    for (const s of rows) {
      const d = decisions[s.id] || { result: "pass", next: "continue" };
      if (d.next === "leave") await updateRow("students", s.id, { status: "disabled", disableNote: "Left (promotion)", disableDate: new Date().toISOString().slice(0, 10) });
      else if (d.result === "pass") await updateRow("students", s.id, { classId: to.classId, sectionId: to.sectionId || "", sessionId: to.sessionId || s.sessionId || "" });
    }
    setDecisions({}); reload(); alert("Promotion complete.");
  };

  const sessionSelect = (v, set) => (
    <Field label="Session"><select value={v.sessionId || ""} onChange={e => set({ ...v, sessionId: e.target.value })} style={{ ...inputStyle, minWidth: 160 }}><option value="">Select</option>{(opts.sessions || []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
  );

  return (
    <>
      <Card title="Promote Students In Next Session">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>From</div>
        <ClassSectionPicker value={from} onChange={setFrom} opts={opts} />
        <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>Promote To</div>
        <ClassSectionPicker value={to} onChange={setTo} opts={opts} extra={sessionSelect(to, setTo)} />
      </Card>
      <Card title={`Student List (${rows.length})`} actions={<Btn disabled={!rows.length} onClick={run}>Promote</Btn>}>
        <Table columns={[
          { label: "Admission No", key: "admissionNo" }, { label: "Student Name", render: s => fullName(s) },
          { label: "Current Result", render: s => ["pass", "fail"].map(r => <label key={r} style={{ marginRight: 10 }}><input type="radio" checked={(decisions[s.id]?.result || "pass") === r} onChange={() => setDecisions(p => ({ ...p, [s.id]: { ...(p[s.id] || { next: "continue" }), result: r } }))} /> {r}</label>) },
          { label: "Next Session Status", render: s => ["continue", "leave"].map(r => <label key={r} style={{ marginRight: 10 }}><input type="radio" checked={(decisions[s.id]?.next || "continue") === r} onChange={() => setDecisions(p => ({ ...p, [s.id]: { ...(p[s.id] || { result: "pass" }), next: r } }))} /> {r}</label>) },
        ]} rows={rows} empty={from.classId ? "No students." : "Select a class."} />
      </Card>
    </>
  );
}
