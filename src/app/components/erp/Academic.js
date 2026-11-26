"use client";
// Student attendance (by class/section/date), admit card printing, marksheet printing.

import { useEffect, useState } from "react";
import { STUDENT_FIELDS } from "@/lib/erp/schema";
import { listAll, listWhere, setRow, fullName } from "@/lib/erp/data";
import { esc } from "@/lib/erp/templating";
import { Card, Btn, Table, inputStyle, printHtml, useRefOptions, fmtDate, C } from "./ui";

const STATUSES = ["Present", "Late", "Absent", "Half Day", "Holiday"];
const today = () => new Date().toISOString().slice(0, 10);

function Criteria({ opts, crit, setCrit, extra }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <select value={crit.classId || ""} onChange={e => setCrit(p => ({ ...p, classId: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">Select Class</option>{(opts.classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select value={crit.sectionId || ""} onChange={e => setCrit(p => ({ ...p, sectionId: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">All Sections</option>{(opts.sections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      {extra}
    </div>
  );
}

export function StudentAttendance() {
  const opts = useRefOptions(STUDENT_FIELDS);
  const [students, setStudents] = useState([]);
  const [crit, setCrit] = useState({ date: today() });
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { listAll("students").then(setStudents).catch(e => alert(e.message)); }, []);
  const rows = students.filter(s => s.status !== "disabled" && crit.classId && s.classId === crit.classId && (!crit.sectionId || s.sectionId === crit.sectionId));

  useEffect(() => {
    if (!crit.classId || !crit.date) return;
    listWhere("student_attendance", "date", "==", crit.date).then(list => setMarks(Object.fromEntries(list.map(a => [a.studentId, { status: a.status, note: a.note || "" }])))).catch(() => setMarks({}));
  }, [crit.classId, crit.sectionId, crit.date]);

  const save = async () => {
    setSaving(true);
    try {
      for (const s of rows) {
        const m = marks[s.id] || { status: "Present", note: "" };
        await setRow("student_attendance", `${crit.date}_${s.id}`, { date: crit.date, studentId: s.id, classId: s.classId, sectionId: s.sectionId || "", status: m.status, note: m.note || "" });
      }
      alert("Attendance saved.");
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  return (
    <>
      <Card title="Select Criteria"><Criteria opts={opts} crit={crit} setCrit={setCrit} extra={<input type="date" value={crit.date} onChange={e => setCrit(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, maxWidth: 180 }} />} /></Card>
      <Card title={`Student List (${rows.length})`} actions={<>
        <Btn kind="ghost" disabled={!rows.length} onClick={() => setMarks(Object.fromEntries(rows.map(s => [s.id, { status: "Holiday", note: "" }])))}>Mark As Holiday</Btn>
        <Btn disabled={!rows.length || saving} onClick={save}>{saving ? "Saving…" : "Save Attendance"}</Btn>
      </>}>
        <Table columns={[
          { label: "Admission No", key: "admissionNo" }, { label: "Name", render: s => fullName(s) },
          { label: "Attendance", render: s => STATUSES.map(st => <label key={st} style={{ marginRight: 10, fontSize: 13 }}><input type="radio" checked={(marks[s.id]?.status || "Present") === st} onChange={() => setMarks(p => ({ ...p, [s.id]: { ...(p[s.id] || {}), status: st } }))} /> {st}</label>) },
          { label: "Note", render: s => <input value={marks[s.id]?.note || ""} onChange={e => setMarks(p => ({ ...p, [s.id]: { status: p[s.id]?.status || "Present", note: e.target.value } }))} style={{ ...inputStyle, minWidth: 160 }} /> },
        ]} rows={rows} empty={crit.classId ? "No students." : "Select a class."} />
      </Card>
    </>
  );
}

const PRINT_REFS = [...STUDENT_FIELDS, { type: "ref", collection: "subjects" }];

function usePrintSetup(templatesKey) {
  const opts = useRefOptions(PRINT_REFS);
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    Promise.all([listAll("students"), listAll(templatesKey, { force: true }), listAll("exam_schedules"), listAll("exam_groups")])
      .then(([s, t, sc, g]) => { setStudents(s); setTemplates(t); setSchedules(sc); setGroups(g); }).catch(e => alert(e.message));
  }, [templatesKey]);
  return { opts, students, templates, schedules, groups };
}

const img = (f, style) => f?.url ? `<img src="${esc(f.url)}" style="${style}">` : "";

export function PrintAdmitCard() {
  const { opts, students, templates, schedules, groups } = usePrintSetup("admit_cards");
  const [crit, setCrit] = useState({});
  const rows = students.filter(s => s.status !== "disabled" && crit.classId && s.classId === crit.classId && (!crit.sectionId || s.sectionId === crit.sectionId));
  const print = () => {
    const tpl = templates.find(t => t.id === crit.tpl); if (!tpl) { alert("Select a template."); return; }
    const exams = schedules.filter(x => x.examGroupId === crit.groupId && (!x.classId || x.classId === crit.classId));
    const subj = id => (opts.subjects || []).find(s => s.id === id)?.name || "";
    const nm = (k, id) => (opts[k] || []).find(r => r.id === id)?.name || "";
    printHtml("Admit Cards", rows.map(s => `
      <div style="border:2px solid #333;padding:16px;margin-bottom:16px;page-break-after:always;${tpl.background?.url ? `background:url('${esc(tpl.background.url)}') center/cover;` : ""}">
        <div style="display:flex;justify-content:space-between;align-items:center">${img(tpl.leftLogo, "height:60px")}<div style="text-align:center"><h2 style="margin:0">${esc(tpl.schoolName || "")}</h2><div>${esc(tpl.heading || "")}</div><h3 style="margin:4px 0">${esc(tpl.title || "Admit Card")}</h3><div>${esc(tpl.examName || "")}</div></div>${img(tpl.rightLogo, "height:60px")}</div>
        <table style="width:100%;margin:12px 0;font-size:13px"><tr><td>
          ${tpl.showName !== false ? `<b>Name:</b> ${esc(fullName(s))}<br>` : ""}${tpl.showAdmissionNo ? `<b>Admission No:</b> ${esc(s.admissionNo)}<br>` : ""}${tpl.showRollNo ? `<b>Roll No:</b> ${esc(s.rollNo || "")}<br>` : ""}
          ${tpl.showFatherName ? `<b>Father Name:</b> ${esc(s.fatherName || "")}<br>` : ""}${tpl.showMotherName ? `<b>Mother Name:</b> ${esc(s.motherName || "")}<br>` : ""}
          ${tpl.showDob ? `<b>Date Of Birth:</b> ${esc(fmtDate(s.dob))}<br>` : ""}${tpl.showGender ? `<b>Gender:</b> ${esc(s.gender || "")}<br>` : ""}
          ${tpl.showClass ? `<b>Class:</b> ${esc(nm("classes", s.classId))}<br>` : ""}${tpl.showSection ? `<b>Section:</b> ${esc(nm("sections", s.sectionId))}<br>` : ""}${tpl.showAddress ? `<b>Address:</b> ${esc(s.currentAddress || "")}<br>` : ""}
          ${tpl.examCenter ? `<b>Exam Center:</b> ${esc(tpl.examCenter)}` : ""}
        </td><td style="text-align:right">${tpl.showPhoto && s.photo?.url ? `<img src="${esc(s.photo.url)}" style="width:90px;height:110px;object-fit:cover">` : ""}</td></tr></table>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%;border-collapse:collapse;font-size:12px"><tr><th>Subject</th><th>Exam</th><th>Date</th><th>Start Time</th><th>Duration</th><th>Room</th></tr>
        ${exams.map(x => `<tr><td>${esc(subj(x.subjectId))}</td><td>${esc(x.exam)}</td><td>${esc(fmtDate(x.date))}</td><td>${esc(x.startTime || "")}</td><td>${esc(x.duration || "")}</td><td>${esc(x.room || "")}</td></tr>`).join("")}</table>
        <div style="margin-top:12px;font-size:12px">${esc(tpl.footerText || "")}</div>
        <div style="text-align:right">${img(tpl.sign, "height:40px")}</div>
      </div>`).join(""));
  };
  return (
    <>
      <Card title="Select Criteria"><Criteria opts={opts} crit={crit} setCrit={setCrit} extra={<>
        <select value={crit.groupId || ""} onChange={e => setCrit(p => ({ ...p, groupId: e.target.value }))} style={{ ...inputStyle, maxWidth: 220 }}><option value="">Exam Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <select value={crit.tpl || ""} onChange={e => setCrit(p => ({ ...p, tpl: e.target.value }))} style={{ ...inputStyle, maxWidth: 220 }}><option value="">Admit Card Template</option>{templates.map(t => <option key={t.id} value={t.id}>{t.template}</option>)}</select>
      </>} /></Card>
      <Card title={`Students (${rows.length})`} actions={<Btn disabled={!rows.length} onClick={print}>🖨 Print Admit Cards</Btn>}>
        <Table columns={[{ label: "Admission No", key: "admissionNo" }, { label: "Name", render: s => fullName(s) }, { label: "Father Name", key: "fatherName" }]} rows={rows} empty="Select a class." />
      </Card>
    </>
  );
}

export function PrintMarksheet() {
  const { opts, students, templates, schedules, groups } = usePrintSetup("marksheets");
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  const [crit, setCrit] = useState({});
  useEffect(() => { Promise.all([listAll("exam_results", { force: true }), listAll("grades")]).then(([r, g]) => { setResults(r); setGrades(g); }).catch(() => {}); }, []);
  const rows = students.filter(s => s.status !== "disabled" && crit.classId && s.classId === crit.classId && (!crit.sectionId || s.sectionId === crit.sectionId));
  const gradeFor = pct => grades.find(g => pct >= Number(g.percentFrom || 0) && pct <= Number(g.percentUpto || 100))?.name || "";
  const print = () => {
    const tpl = templates.find(t => t.id === crit.tpl); if (!tpl) { alert("Select a template."); return; }
    const exams = schedules.filter(x => x.examGroupId === crit.groupId);
    const subj = id => (opts.subjects || []).find(s => s.id === id)?.name || "";
    printHtml("Marksheets", rows.map(s => {
      let total = 0, max = 0;
      const lines = exams.map(x => {
        const r = results.find(rr => rr.examScheduleId === x.id && rr.studentId === s.id);
        const m = r?.absent ? 0 : Number(r?.marks || 0); total += m; max += Number(x.maxMarks || 0);
        return `<tr><td>${esc(subj(x.subjectId) || x.exam)}</td><td>${esc(x.maxMarks || "")}</td><td>${esc(x.minMarks || "")}</td><td>${r?.absent ? "ABS" : esc(r?.marks ?? "")}</td><td>${m >= Number(x.minMarks || 0) ? "Pass" : "Fail"}</td></tr>`;
      }).join("");
      const pct = max ? Math.round((total / max) * 10000) / 100 : 0;
      return `<div style="border:2px solid #333;padding:16px;margin-bottom:16px;page-break-after:always;${tpl.background?.url ? `background:url('${esc(tpl.background.url)}') center/cover;` : ""}">
        ${img(tpl.headerImage, "width:100%;max-height:120px;object-fit:contain")}
        <div style="text-align:center"><h2 style="margin:4px 0">${esc(tpl.schoolName || "")}</h2><div>${esc(tpl.heading || "")}</div><h3 style="margin:4px 0">${esc(tpl.title || "Marksheet")}</h3><div>${esc(tpl.examName || "")}</div></div>
        <p><b>Name:</b> ${esc(fullName(s))} &nbsp; <b>Admission No:</b> ${esc(s.admissionNo)} &nbsp; <b>Father Name:</b> ${esc(s.fatherName || "")}</p>
        <div>${esc(tpl.bodyText || "")}</div>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%;border-collapse:collapse;font-size:12px"><tr><th>Subject</th><th>Max Marks</th><th>Min Marks</th><th>Marks Obtained</th><th>Result</th></tr>${lines}
        <tr><td colspan="3"><b>Grand Total</b></td><td><b>${total} / ${max}</b></td><td><b>${pct}% ${esc(gradeFor(pct))}</b></td></tr></table>
        <div style="display:flex;justify-content:space-between;margin-top:30px">${img(tpl.leftSign, "height:40px")}${img(tpl.middleSign, "height:40px")}${img(tpl.rightSign, "height:40px")}</div>
        <div style="font-size:12px;margin-top:8px">${esc(tpl.footerText || "")} ${tpl.printingDate ? `· ${esc(tpl.printingDate)}` : ""}</div>
      </div>`;
    }).join(""));
  };
  return (
    <>
      <Card title="Select Criteria"><Criteria opts={opts} crit={crit} setCrit={setCrit} extra={<>
        <select value={crit.groupId || ""} onChange={e => setCrit(p => ({ ...p, groupId: e.target.value }))} style={{ ...inputStyle, maxWidth: 220 }}><option value="">Exam Group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <select value={crit.tpl || ""} onChange={e => setCrit(p => ({ ...p, tpl: e.target.value }))} style={{ ...inputStyle, maxWidth: 220 }}><option value="">Marksheet Template</option>{templates.map(t => <option key={t.id} value={t.id}>{t.template}</option>)}</select>
      </>} /></Card>
      <Card title={`Students (${rows.length})`} actions={<Btn disabled={!rows.length} onClick={print}>🖨 Print Marksheets</Btn>}>
        <Table columns={[{ label: "Admission No", key: "admissionNo" }, { label: "Name", render: s => fullName(s) }, { label: "Father Name", key: "fatherName" }]} rows={rows} empty="Select a class." />
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Marks come from Examinations → Exam Result.</div>
      </Card>
    </>
  );
}
