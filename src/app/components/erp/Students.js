"use client";
// Student Information module: Student Details (search + profile), Student Admission,
// Disabled Students, Multi Class, Bulk Delete, Promote Students.

import { useEffect, useMemo, useState } from "react";
import { STUDENT_FIELD_GROUPS, STUDENT_FIELDS } from "@/lib/erp/schema";
import { listAll, createRow, updateRow, deleteRow, bulkDelete, listWhere, fullName, getSettings } from "@/lib/erp/data";
import { Card, Btn, Badge, Modal, Table, Grid, Field, FieldInput, useRefOptions, displayValue, missingRequired, exportCsv, inputStyle, fmtDate, C } from "./ui";
import StudentProfile from "./StudentProfile";

export { StudentProfile };

const nameOf = (opts, key, id) => (opts[key] || []).find(r => r.id === id)?.name || "";

// Returns [students|null, reload, error]. Errors (e.g. expired session) are shown
// inline instead of silently rendering an empty list.
function useStudents() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");
  const reload = async () => {
    setError("");
    try { setStudents(await listAll("students", { force: true })); } catch (e) { setError(e.message); setStudents([]); }
  };
  useEffect(() => { listAll("students").then(setStudents).catch(e => { setError(e.message); setStudents([]); }); }, []);
  return [students, reload, error];
}

function LoadError({ error, onRetry }) {
  if (!error) return null;
  return (
    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span>{error}</span><Btn small kind="ghost" onClick={onRetry}>Retry</Btn>
    </div>
  );
}

// Legacy action icons on every student row: ≡ view profile, ✏ edit, $ collect fees.
function RowActions({ s, onView, onEdit, onFees }) {
  return (
    <div style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
      <Btn small kind="ghost" onClick={() => onView(s)} title="View" aria-label="View">☰</Btn>
      <Btn small kind="info" onClick={() => onEdit(s)} title="Edit" aria-label="Edit">✏️</Btn>
      {onFees && <Btn small kind="ok" onClick={() => onFees(s)} title="Collect Fees" aria-label="Collect Fees">$</Btn>}
    </div>
  );
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
  const [students, reload, loadError] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [crit, setCrit] = useState({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // { student, tab }
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
    { label: "Student Name", render: s => <a href="#" onClick={e => { e.preventDefault(); setOpen({ student: s }); }} style={{ color: C.info, fontWeight: 600 }}>{fullName(s)}</a>, text: s => fullName(s) },
    { label: "Roll No", key: "rollNo" },
    { label: "Class", render: s => `${nameOf(opts, "classes", s.classId)}${s.sectionId ? ` (${nameOf(opts, "sections", s.sectionId)})` : ""}`, text: s => nameOf(opts, "classes", s.classId) },
    { label: "Father Name", key: "fatherName" },
    { label: "Date Of Birth", render: s => fmtDate(s.dob), text: s => s.dob },
    { label: "Gender", key: "gender" },
    { label: "Category", render: s => nameOf(opts, "categories", s.categoryId), text: s => nameOf(opts, "categories", s.categoryId) },
    { label: "Mobile Number", key: "mobile" },
    { label: "Passport", key: "passportNo" },
    { label: "Action", render: s => <RowActions s={s} onView={x => setOpen({ student: x })} onEdit={setEditing} onFees={x => setOpen({ student: x, tab: "fees" })} /> },
  ];

  return (
    <>
      <LoadError error={loadError} onRetry={reload} />
      <Card title={disabledOnly ? "Disabled Students" : "Select Criteria"}>
        <ClassSectionPicker value={crit} onChange={setCrit} opts={opts} extra={
          <Field label="Search By Keyword"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, admission no, passport, phone…" style={{ ...inputStyle, minWidth: 280 }} /></Field>
        } />
      </Card>
      <Card title={`Student List (${rows.length})`} actions={<Btn kind="ghost" onClick={() => exportCsv("students.csv", columns.slice(0, -1), rows)}>⬇ CSV</Btn>}>
        <Table columns={columns} rows={rows.slice(0, 500)} empty={students ? "No students found." : "Loading…"} />
        {rows.length > 500 && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Showing first 500 — narrow the criteria to see more.</div>}
      </Card>
      {open && <StudentProfile key={open.student.id + (open.tab || "")} student={open.student} initialTab={open.tab} opts={opts} onClose={() => setOpen(null)} onChanged={reload} onEdit={() => { setEditing(open.student); setOpen(null); }} />}
      {editing && <StudentForm initial={editing} opts={opts} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />}
    </>
  );
}

export const DisabledStudents = () => <StudentList disabledOnly />;

// ── All Students (legacy student/searchAll: every student with total Paid) ──────
export function AllStudents() {
  const [students, reload, loadError] = useStudents();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [paid, setPaid] = useState({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // { student, tab }
  const [editing, setEditing] = useState(null);
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
    { label: "Student Name", render: s => <a href="#" onClick={e => { e.preventDefault(); setOpen({ student: s }); }} style={{ color: C.info, fontWeight: 600 }}>{fullName(s)}</a>, text: s => fullName(s) },
    { label: "Class", render: s => nameOf(opts, "classes", s.classId), text: s => nameOf(opts, "classes", s.classId) },
    { label: "Date Of Birth", render: s => fmtDate(s.dob), text: s => s.dob },
    { label: "Gender", key: "gender" }, { label: "Mobile Number", key: "mobile" },
    { label: "Paid", render: s => <span style={{ fontWeight: 600 }}>{paid[s.id] || 0}</span>, text: s => paid[s.id] || 0, style: { background: "rgba(239,68,68,0.06)" } },
    { label: "Status", render: s => s.status === "disabled" ? <Badge color="#dc2626">Disabled</Badge> : <Badge>Active</Badge>, text: s => s.status || "active" },
    { label: "Action", render: s => <RowActions s={s} onView={x => setOpen({ student: x })} onEdit={setEditing} onFees={x => setOpen({ student: x, tab: "fees" })} /> },
  ];
  return (
    <>
      <LoadError error={loadError} onRetry={reload} />
      <Card title={`All Students (${rows.length})`} actions={<>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ ...inputStyle, maxWidth: 260 }} />
        <Btn kind="ghost" onClick={() => exportCsv("all-students.csv", columns.slice(0, -1), rows)}>⬇ CSV</Btn>
      </>}>
        <Table columns={columns} rows={rows.slice(0, 1000)} empty={students ? "No students." : "Loading…"} />
      </Card>
      {open && <StudentProfile key={open.student.id + (open.tab || "")} student={open.student} initialTab={open.tab} opts={opts} onClose={() => setOpen(null)} onChanged={reload} onEdit={() => { setEditing(open.student); setOpen(null); }} />}
      {editing && <StudentForm initial={editing} opts={opts} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await reload(); }} />}
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
      let id = initial?.id;
      if (id) await updateRow("students", id, data);
      else {
        const dupe = (await listAll("students", { force: true })).find(s => String(s.admissionNo) === String(values.admissionNo));
        if (dupe) { alert(`Admission No ${values.admissionNo} is already used by ${fullName(dupe)}.`); setSaving(false); return; }
        id = await createRow("students", { ...data, status: "active" });
      }
      // Sibling links are mutual: add/remove this student on the other records too.
      const before = new Set(initial?.siblingIds || []), after = new Set(values.siblingIds || []);
      const all = await listAll("students", { force: true });
      for (const sid of new Set([...before, ...after])) {
        const other = all.find(x => x.id === sid); if (!other) continue;
        const theirs = new Set(other.siblingIds || []);
        if (after.has(sid)) theirs.add(id); else theirs.delete(id);
        await updateRow("students", sid, { siblingIds: [...theirs] });
      }
      onSaved?.();
      if (inline) { setValues({ admissionDate: new Date().toISOString().slice(0, 10), status: "active", rte: "No" }); alert("Student saved."); }
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const body = STUDENT_FIELD_GROUPS.map((g, gi) => (
    <div key={g.title} style={{ marginBottom: 20, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
      <h4 style={{ fontSize: 15, color: C.ink, margin: 0, padding: "10px 14px", background: C.soft, borderBottom: `1px solid ${C.line}` }}>{gi === 0 ? (initial?.id ? "Edit Student" : "Student Admission") : g.title}</h4>
      <div style={{ padding: 14 }}>
        <Grid>
          {g.fields.map(f => (
            <Field key={f.key} label={f.label} required={f.required} wide={f.type === "textarea"}>
              <FieldInput field={f} value={values[f.key]} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} refOptions={opts} folder="students" />
            </Field>
          ))}
        </Grid>
        {gi === 0 && <SiblingPicker value={values.siblingIds || []} selfId={initial?.id} onChange={ids => setValues(p => ({ ...p, siblingIds: ids }))} />}
      </div>
    </div>
  ));

  if (inline) return <Card title="Student Admission" actions={<Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>}>{body}</Card>;
  return (
    <Modal title={initial?.id ? `Edit Student — ${fullName(initial)}` : "Student Admission"} width={1000} onClose={onClose} footer={<>
      <Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
    </>}>{body}</Modal>
  );
}

// "+ Add Sibling": link other student records (shown on the profile card).
function SiblingPicker({ value, selfId, onChange }) {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open && !all.length) listAll("students").then(setAll).catch(() => {}); }, [open, all.length]);
  const byId = Object.fromEntries(all.map(s => [s.id, s]));
  const k = q.trim().toLocaleLowerCase("tr");
  const matches = k.length < 2 ? [] : all.filter(s => s.id !== selfId && !value.includes(s.id) && [fullName(s), s.admissionNo].some(v => String(v || "").toLocaleLowerCase("tr").includes(k))).slice(0, 8);
  return (
    <div style={{ marginTop: 12 }}>
      <a href="#" onClick={e => { e.preventDefault(); setOpen(o => !o); }} style={{ color: C.info, fontWeight: 600, fontSize: 14 }}>+ Add Sibling</a>
      {value.length > 0 && <span style={{ marginLeft: 12, fontSize: 13 }}>{value.map(id => <span key={id} style={{ marginRight: 10 }}>{byId[id] ? fullName(byId[id]) : id} <a href="#" onClick={e => { e.preventDefault(); onChange(value.filter(x => x !== id)); }} style={{ color: "#dc2626" }}>×</a></span>)}</span>}
      {open && (
        <div style={{ marginTop: 8, maxWidth: 420 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search sibling by name or admission no" style={inputStyle} />
          {matches.map(s => <div key={s.id} onClick={() => { onChange([...value, s.id]); setQ(""); }} style={{ padding: "6px 8px", cursor: "pointer", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>{fullName(s)} · {s.admissionNo}</div>)}
        </div>
      )}
    </div>
  );
}

export function StudentAdmission() {
  const opts = useRefOptions(STUDENT_FIELDS);
  return <StudentForm opts={opts} inline />;
}

function strip(r) { const { id, createdAt, updatedAt, ...rest } = r; return rest; }

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
