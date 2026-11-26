"use client";
// Reports: every legacy report page and its sub-reports (Student Information has 12,
// Finance 11, Attendance 4, …), computed from the ERP collections; each is a table
// with CSV export and print.

import { useEffect, useMemo, useState } from "react";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import { listAll, fullName } from "@/lib/erp/data";
import { esc } from "@/lib/erp/templating";
import { Card, Btn, Table, inputStyle, money, fmtDate, exportCsv, printHtml, C } from "./ui";
import { computeLines } from "./Fees";

function useData(keys) {
  const [d, setD] = useState(null);
  const sig = keys.join(",");
  useEffect(() => {
    const ks = sig.split(",");
    Promise.all(ks.map(k => listAll(k, { force: true }).catch(() => []))).then(r => setD(Object.fromEntries(ks.map((k, i) => [k, r[i]]))));
  }, [sig]);
  return d;
}

const nm = (rows, id, f = "name") => (rows || []).find(r => r.id === id)?.[f] || "";
const n = v => Number(v) || 0;
const inRange = (date, from, to) => (!from || String(date || "") >= from) && (!to || String(date || "") <= to);
const countBy = (rows, fn) => Object.entries(rows.reduce((m, r) => { const k = fn(r) || "—"; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);

const Stat = ({ label, value, color = C.ink }) => (
  <div style={{ background: "white", borderRadius: 14, padding: 18, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{label}</div>
  </div>
);
const Stats = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>{children}</div>;

/** A report = { id, label, columns, rows, stats?, needsRange? } — shown with a picker. */
function ReportBoard({ title, data, build, withRange = true }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const reports = useMemo(() => data ? build(data, { from, to }) : [], [data, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const [active, setActive] = useState(null);
  if (!data) return <Card>Loading…</Card>;
  const rep = reports.find(r => r.id === active) || reports[0];
  const printIt = () => printHtml(rep.label, `<h2>${esc(title)} — ${esc(rep.label)}</h2>${from || to ? `<p>${esc(fmtDate(from))} – ${esc(fmtDate(to))}</p>` : ""}<table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:12px"><tr>${rep.columns.map(c => `<th>${esc(c.label)}</th>`).join("")}</tr>${rep.rows.map(r => `<tr>${rep.columns.map(c => `<td>${esc(c.text ? c.text(r) : r[c.key])}</td>`).join("")}</tr>`).join("")}</table>`);
  return (
    <>
      <Card title={title}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 6 }}>
          {reports.map(r => (
            <button key={r.id} onClick={() => setActive(r.id)} style={{ textAlign: "left", padding: "8px 10px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, background: rep.id === r.id ? "rgba(224,60,49,0.1)" : "transparent", color: rep.id === r.id ? C.primary : C.ink, fontWeight: rep.id === r.id ? 700 : 500 }}>📄 {r.label}</button>
          ))}
        </div>
        {withRange && (
          <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.muted }}>Date range:</span>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} />
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} />
          </div>
        )}
      </Card>
      {rep.stats && <Stats>{rep.stats.map(([l, v, c]) => <Stat key={l} label={l} value={v} color={c} />)}</Stats>}
      <Card title={`${rep.label} (${rep.rows.length})`} actions={<>
        <Btn kind="ghost" onClick={() => exportCsv(`${rep.id}.csv`, rep.columns, rep.rows)}>⬇ CSV</Btn>
        <Btn kind="ghost" onClick={printIt}>🖨 Print</Btn>
      </>}>
        <Table columns={rep.columns.map(c => ({ ...c, render: c.render || (c.text ? r => c.text(r) : undefined) }))} rows={rep.rows.slice(0, 1000)} rowKey={(r, i) => r.id || i} />
      </Card>
    </>
  );
}

const col = (label, text, render) => ({ label, text, render });

// ── Student Information (12 legacy sub-reports) ───────────────────────────────────
export function ReportStudents() {
  const d = useData(["students", "classes", "sections", "categories", "sessions", "subject_groups", "subjects", "portal_users", "homework", "class_teachers", "staff"]);
  return <ReportBoard title="Student Information Report" data={d} build={(d, { from, to }) => {
    const cls = s => nm(d.classes, s.classId), sec = s => nm(d.sections, s.sectionId);
    const base = [col("Admission No", s => s.admissionNo), col("Student Name", s => fullName(s)), col("Class", cls), col("Section", sec)];
    const active = d.students.filter(s => s.status !== "disabled");
    const siblings = Object.values(d.students.reduce((m, s) => { const k = `${(s.fatherName || "").trim().toUpperCase()}|${(s.fatherPhone || s.mobile || "").trim()}`; if (s.fatherName) (m[k] ||= []).push(s); return m; }, {})).filter(g => g.length > 1);
    const classIds = [...new Set(d.students.map(s => s.classId).filter(Boolean))];
    return [
      { id: "student", label: "Student Report", rows: d.students, columns: [...base, col("Category", s => nm(d.categories, s.categoryId)), col("Gender", s => s.gender), col("Date Of Birth", s => fmtDate(s.dob)), col("Mobile", s => s.mobile), col("Passport", s => s.passportNo), col("Nationality", s => s.nationality), col("Status", s => s.status || "active")] },
      { id: "class_section", label: "Class & Section Report", rows: Object.entries(d.students.reduce((m, s) => { const k = `${cls(s)}|${sec(s)}`; m[k] = (m[k] || 0) + 1; return m; }, {})).map(([k, c]) => ({ id: k, cls: k.split("|")[0], sec: k.split("|")[1], c })), columns: [col("Class", r => r.cls), col("Section", r => r.sec), col("Students", r => r.c)] },
      { id: "guardian", label: "Guardian Report", rows: d.students, columns: [...base, col("Father Name", s => s.fatherName), col("Father Phone", s => s.fatherPhone), col("Mother Name", s => s.motherName), col("Guardian Name", s => s.guardianName), col("Guardian Phone", s => s.guardianPhone), col("Guardian Relation", s => s.guardianRelation)] },
      { id: "history", label: "Student History", rows: d.students, columns: [...base, col("Session", s => nm(d.sessions, s.sessionId)), col("Admission Date", s => fmtDate(s.admissionDate)), col("Other Classes", s => (s.extraClasses || []).map(x => nm(d.classes, x.classId)).join(", ")), col("Status", s => s.status || "active"), col("Disabled On", s => fmtDate(s.disableDate))] },
      { id: "login", label: "Student Login Credential", rows: d.portal_users.filter(u => u.userType === "student"), columns: [col("Admission No", u => d.students.find(s => s.id === u.studentId)?.admissionNo), col("Student Name", u => u.name), col("Username", u => u.username), col("Status", u => u.status)] },
      { id: "class_subject", label: "Class Subject Report", rows: d.subject_groups, columns: [col("Subject Group", g => g.name), col("Class", g => nm(d.classes, g.classId)), col("Subjects", g => (g.subjectIds || []).map(id => nm(d.subjects, id)).join(", "))] },
      { id: "admission", label: "Admission Report", rows: d.students.filter(s => inRange(s.admissionDate, from, to)).sort((a, b) => String(b.admissionDate).localeCompare(String(a.admissionDate))), columns: [...base, col("Admission Date", s => fmtDate(s.admissionDate)), col("Category", s => nm(d.categories, s.categoryId)), col("Mobile", s => s.mobile)], stats: [["Admissions In Range", d.students.filter(s => inRange(s.admissionDate, from, to)).length]] },
      { id: "sibling", label: "Sibling Report", rows: siblings.flat(), columns: [col("Father Name", s => s.fatherName), ...base, col("Mobile", s => s.mobile)] },
      { id: "profile", label: "Student Profile", rows: d.students, columns: [...base, col("Gender", s => s.gender), col("Date Of Birth", s => fmtDate(s.dob)), col("Email", s => s.email), col("Mobile", s => s.mobile), col("Passport", s => s.passportNo), col("Nationality", s => s.nationality), col("Father", s => s.fatherName), col("Mother", s => s.motherName), col("Address", s => s.currentAddress), col("Bank Account", s => s.bankAccountNo), col("Note", s => s.note)] },
      { id: "homework", label: "Homework Evaluation Report", rows: d.homework, columns: [col("Class", h => nm(d.classes, h.classId)), col("Section", h => nm(d.sections, h.sectionId)), col("Subject", h => nm(d.subjects, h.subjectId)), col("Homework Date", h => fmtDate(h.homeworkDate)), col("Submission Date", h => fmtDate(h.submissionDate)), col("Evaluation Date", h => fmtDate(h.evaluationDate)), col("Students In Class", h => active.filter(s => s.classId === h.classId).length)] },
      { id: "gender", label: "Student Gender Ratio Report", rows: classIds.map(id => { const ss = active.filter(s => s.classId === id); const b = ss.filter(s => s.gender === "Male").length, g = ss.filter(s => s.gender === "Female").length; return { id, b, g, t: ss.length }; }), columns: [col("Class", r => nm(d.classes, r.id)), col("Boys", r => r.b), col("Girls", r => r.g), col("Total", r => r.t), col("Boys : Girls", r => r.g ? `${(r.b / r.g).toFixed(2)} : 1` : `${r.b} : 0`)], stats: [["Boys", active.filter(s => s.gender === "Male").length, C.info], ["Girls", active.filter(s => s.gender === "Female").length, "#db2777"]] },
      { id: "teacher_ratio", label: "Student Teacher Ratio Report", rows: classIds.map(id => { const st = active.filter(s => s.classId === id).length; const te = new Set(d.class_teachers.filter(t => t.classId === id).flatMap(t => t.staffIds || [])).size; return { id, st, te }; }), columns: [col("Class", r => nm(d.classes, r.id)), col("Students", r => r.st), col("Teachers", r => r.te), col("Students : Teacher", r => r.te ? `${(r.st / r.te).toFixed(1)} : 1` : "—")], stats: [["Active Students", active.length], ["Staff", d.staff.filter(s => s.status !== "disabled").length]] },
    ];
  }} />;
}

// ── Finance (legacy: fees statement, balance fees, daily collection, …) ────────────
export function ReportFinance() {
  const d = useData(["fee_payments", "student_fees", "income", "expenses", "income_heads", "expense_heads", "students", "classes", "fee_groups", "fee_types", "payroll", "staff", "online_admissions", "course_payments", "courses"]);
  return <ReportBoard title="Finance Report" data={d} build={(d, { from, to }) => {
    const sById = Object.fromEntries(d.students.map(s => [s.id, s]));
    const lineById = Object.fromEntries(d.student_fees.map(l => [l.id, l]));
    const pays = d.fee_payments.filter(p => inRange(p.date, from, to));
    const lines = computeLines(d.student_fees, d.fee_payments);
    const inc = d.income.filter(i => inRange(i.date, from, to)), exp = d.expenses.filter(e => inRange(e.date, from, to));
    const sum = (rs, k = "amount") => rs.reduce((a, r) => a + n(r[k]), 0);
    const payCols = [col("Payment Id", p => p.receiptNo), col("Date", p => fmtDate(p.date)), col("Admission No", p => sById[p.studentId]?.admissionNo), col("Name", p => fullName(sById[p.studentId])), col("Fees Group", p => nm(d.fee_groups, lineById[p.studentFeeId]?.feeGroupId) || lineById[p.studentFeeId]?.title), col("Mode", p => p.mode), col("Paid", p => money(p.amount)), col("Discount", p => money(p.discount)), col("Fine", p => money(p.fine))];
    const byGroup = (rows, heads) => Object.entries(rows.reduce((m, r) => { const k = nm(heads, r.headId) || "—"; m[k] = (m[k] || 0) + n(r.amount); return m; }, {})).map(([k, v]) => ({ id: k, k, v }));
    const perStudent = Object.values(lines.reduce((m, l) => { (m[l.studentId] ||= { id: l.studentId, amount: 0, paid: 0, discount: 0, fine: 0, balance: 0 }); for (const k of ["amount", "paid", "discount", "fine", "balance"]) m[l.studentId][k] += n(l[k]); return m; }, {}));
    return [
      { id: "fees_statement", label: "Fees Statement", rows: lines, columns: [col("Admission No", l => sById[l.studentId]?.admissionNo), col("Name", l => fullName(sById[l.studentId])), col("Fees Group", l => nm(d.fee_groups, l.feeGroupId) || l.title), col("Fees Code", l => nm(d.fee_types, l.feeTypeId, "code")), col("Due Date", l => fmtDate(l.dueDate)), col("Amount", l => money(l.amount)), col("Paid", l => money(l.paid)), col("Discount", l => money(l.discount)), col("Fine", l => money(l.fine)), col("Balance", l => money(l.balance)), col("Status", l => l.status)] },
      { id: "balance", label: "Balance Fees Report", rows: perStudent.filter(r => r.balance > 0), columns: [col("Admission No", r => sById[r.id]?.admissionNo), col("Name", r => fullName(sById[r.id])), col("Class", r => nm(d.classes, sById[r.id]?.classId)), col("Total", r => money(r.amount)), col("Paid", r => money(r.paid)), col("Discount", r => money(r.discount)), col("Balance", r => money(r.balance))], stats: [["Total Balance", money(perStudent.reduce((a, r) => a + r.balance, 0)), "#dc2626"]] },
      { id: "collection", label: "Fees Collection Report", rows: pays, columns: payCols, stats: [["Collected", money(sum(pays)), C.ok], ["Discount", money(sum(pays, "discount")), C.warn], ["Fine", money(sum(pays, "fine")), C.info]] },
      { id: "daily", label: "Daily Collection Report", rows: Object.entries(pays.reduce((m, p) => { (m[p.date] ||= { id: p.date, c: 0, a: 0 }); m[p.date].c++; m[p.date].a += n(p.amount); return m; }, {})).map(([, v]) => v).sort((a, b) => String(b.id).localeCompare(String(a.id))), columns: [col("Date", r => fmtDate(r.id)), col("Payments", r => r.c), col("Amount", r => money(r.a))] },
      { id: "by_name", label: "Student Fees By Name", rows: perStudent, columns: [col("Admission No", r => sById[r.id]?.admissionNo), col("Name", r => fullName(sById[r.id])), col("Total", r => money(r.amount)), col("Paid", r => money(r.paid)), col("Balance", r => money(r.balance))] },
      { id: "income", label: "Income Report", rows: inc, columns: [col("Name", r => r.name), col("Invoice No", r => r.invoiceNo), col("Income Head", r => nm(d.income_heads, r.headId)), col("Date", r => fmtDate(r.date)), col("Amount", r => money(r.amount))], stats: [["Income", money(sum(inc)), C.ok]] },
      { id: "expense", label: "Expense Report", rows: exp, columns: [col("Name", r => r.name), col("Invoice No", r => r.invoiceNo), col("Expense Head", r => nm(d.expense_heads, r.headId)), col("Date", r => fmtDate(r.date)), col("Amount", r => money(r.amount))], stats: [["Expense", money(sum(exp)), "#dc2626"]] },
      { id: "income_group", label: "Income Group Report", rows: byGroup(inc, d.income_heads), columns: [col("Income Head", r => r.k), col("Amount", r => money(r.v))] },
      { id: "expense_group", label: "Expense Group Report", rows: byGroup(exp, d.expense_heads), columns: [col("Expense Head", r => r.k), col("Amount", r => money(r.v))] },
      { id: "payroll", label: "Payroll Report", rows: d.payroll.filter(p => inRange(p.paymentDate, from, to)), columns: [col("Staff", p => nm(d.staff, p.staffId)), col("Month", p => `${p.month || ""} ${p.year || ""}`), col("Basic", p => money(p.basic)), col("Earning", p => money(p.earnings)), col("Deduction", p => money(p.deductions)), col("Net Salary", p => money(p.netSalary)), col("Status", p => p.status), col("Payment Date", p => fmtDate(p.paymentDate))] },
      { id: "online_admission", label: "Online Admission Fees Report", rows: d.online_admissions.filter(a => inRange(a.submitDate, from, to)), columns: [col("Reference No", a => a.referenceNo), col("Name", a => `${a.firstName || ""} ${a.lastName || ""}`), col("Submit Date", a => fmtDate(a.submitDate)), col("Payment Status", a => a.paymentStatus), col("Enrolled", a => a.enrolled ? "Yes" : "No")] },
      { id: "online_course_fees", label: "Online Course Fees Report", rows: d.course_payments.filter(p => inRange(p.paymentDate, from, to)), columns: [col("Course", p => nm(d.courses, p.courseId, "title")), col("Student", p => fullName(sById[p.studentId])), col("Date", p => fmtDate(p.paymentDate)), col("Amount", p => money(p.amount)), col("Status", p => p.status)] },
      { id: "summary", label: "Income vs Expense Summary", rows: [{ id: "fees", k: "Fees collected", v: sum(pays) + sum(pays, "fine") }, { id: "inc", k: "Other income", v: sum(inc) }, { id: "exp", k: "Expenses", v: -sum(exp) }, { id: "bal", k: "Balance", v: sum(pays) + sum(pays, "fine") + sum(inc) - sum(exp) }], columns: [col("Item", r => r.k), col("Amount", r => money(r.v))] },
    ];
  }} />;
}

// ── Attendance ─────────────────────────────────────────────────────────────────────
export function ReportAttendance() {
  const d = useData(["student_attendance", "students", "classes", "staff_attendance", "staff"]);
  return <ReportBoard title="Attendance Report" data={d} build={(d, { from, to }) => {
    const att = d.student_attendance.filter(a => inRange(a.date, from, to));
    const sById = Object.fromEntries(d.students.map(s => [s.id, s]));
    const tally = (rows, key) => Object.values(rows.reduce((m, a) => { (m[a[key]] ||= { id: a[key], Present: 0, Late: 0, Absent: 0, "Half Day": 0, Holiday: 0 }); m[a[key]][a.status] = (m[a[key]][a.status] || 0) + 1; return m; }, {}));
    const pct = r => { const t = r.Present + r.Late + r.Absent + r["Half Day"]; return t ? `${Math.round(((r.Present + r.Late + r["Half Day"] / 2) / t) * 100)}%` : "—"; };
    const statusCols = ["Present", "Late", "Absent", "Half Day", "Holiday"].map(k => col(k, r => r[k]));
    return [
      { id: "student", label: "Student Attendance Report", rows: tally(att, "studentId"), columns: [col("Admission No", r => sById[r.id]?.admissionNo), col("Name", r => fullName(sById[r.id])), col("Class", r => nm(d.classes, sById[r.id]?.classId)), ...statusCols, col("%", pct)] },
      { id: "by_date", label: "Attendance By Date", rows: [...att].sort((a, b) => String(b.date).localeCompare(String(a.date))), columns: [col("Date", a => fmtDate(a.date)), col("Admission No", a => sById[a.studentId]?.admissionNo), col("Name", a => fullName(sById[a.studentId])), col("Class", a => nm(d.classes, a.classId)), col("Status", a => a.status), col("Note", a => a.note)] },
      { id: "daily", label: "Daily Attendance Report", rows: tally(att, "date").sort((a, b) => String(b.id).localeCompare(String(a.id))), columns: [col("Date", r => fmtDate(r.id)), ...statusCols, col("%", pct)] },
      { id: "class", label: "Class Attendance Report", rows: tally(att, "classId"), columns: [col("Class", r => nm(d.classes, r.id)), ...statusCols, col("%", pct)] },
      { id: "staff", label: "Staff Attendance Report", rows: tally(d.staff_attendance.filter(a => inRange(a.date, from, to)), "staffId"), columns: [col("Staff", r => nm(d.staff, r.id)), ...statusCols, col("%", pct)] },
    ];
  }} />;
}

// ── Examinations ───────────────────────────────────────────────────────────────────
export function ReportExams() {
  const d = useData(["exam_results", "exam_schedules", "exam_groups", "students", "subjects", "grades"]);
  return <ReportBoard title="Examinations Report" withRange={false} data={d} build={d => {
    const sch = Object.fromEntries(d.exam_schedules.map(x => [x.id, x]));
    const sById = Object.fromEntries(d.students.map(s => [s.id, s]));
    const totals = Object.values(d.exam_results.reduce((m, r) => { const g = sch[r.examScheduleId]?.examGroupId || "—"; const k = `${g}|${r.studentId}`; (m[k] ||= { id: k, g, s: r.studentId, got: 0, max: 0 }); m[k].got += r.absent ? 0 : n(r.marks); m[k].max += n(sch[r.examScheduleId]?.maxMarks); return m; }, {}))
      .map(t => ({ ...t, pct: t.max ? Math.round((t.got / t.max) * 10000) / 100 : 0 })).sort((a, b) => b.pct - a.pct);
    const grade = p => d.grades.find(g => p >= n(g.percentFrom) && p <= n(g.percentUpto || 100))?.name || "";
    return [
      { id: "results", label: "Exam Results", rows: d.exam_results, columns: [col("Exam Group", r => nm(d.exam_groups, sch[r.examScheduleId]?.examGroupId)), col("Exam", r => sch[r.examScheduleId]?.exam), col("Subject", r => nm(d.subjects, sch[r.examScheduleId]?.subjectId)), col("Student", r => fullName(sById[r.studentId])), col("Marks", r => r.absent ? "ABS" : r.marks), col("Max", r => sch[r.examScheduleId]?.maxMarks)] },
      { id: "rank", label: "Rank Report", rows: totals.map((t, i) => ({ ...t, rank: i + 1 })), columns: [col("Rank", t => t.rank), col("Exam Group", t => nm(d.exam_groups, t.g)), col("Admission No", t => sById[t.s]?.admissionNo), col("Student", t => fullName(sById[t.s])), col("Total", t => `${t.got} / ${t.max}`), col("Percent", t => `${t.pct}%`), col("Grade", t => grade(t.pct))] },
      { id: "schedule", label: "Exam Schedule Report", rows: d.exam_schedules, columns: [col("Exam Group", x => nm(d.exam_groups, x.examGroupId)), col("Exam", x => x.exam), col("Subject", x => nm(d.subjects, x.subjectId)), col("Date", x => fmtDate(x.date)), col("Start", x => x.startTime), col("Duration", x => x.duration), col("Room", x => x.room)] },
    ];
  }} />;
}

export function ReportOnlineExams() {
  const d = useData(["online_exams", "online_exam_results", "students", "questions"]);
  return <ReportBoard title="Online Examinations Report" data={d} build={(d, { from, to }) => {
    const sById = Object.fromEntries(d.students.map(s => [s.id, s]));
    const res = d.online_exam_results.filter(r => inRange(r.attemptDate, from, to));
    return [
      { id: "exams", label: "Online Exams Report", rows: d.online_exams, columns: [col("Exam", e => e.title), col("Quiz", e => e.quizType), col("Exam From", e => fmtDate(e.from)), col("Exam To", e => fmtDate(e.to)), col("Duration", e => e.duration), col("Attempt", e => e.attempts), col("Attended", e => new Set(res.filter(r => r.onlineExamId === e.id).map(r => r.studentId)).size), col("Published", e => e.published ? "Yes" : "No")] },
      { id: "attend", label: "Online Exam Attend Report", rows: res, columns: [col("Exam", r => nm(d.online_exams, r.onlineExamId, "title")), col("Admission No", r => sById[r.studentId]?.admissionNo), col("Student", r => fullName(sById[r.studentId])), col("Date", r => fmtDate(r.attemptDate)), col("Attempt", r => r.attempt), col("Result", r => r.result)] },
      { id: "rank", label: "Online Exam Rank Report", rows: [...res].sort((a, b) => n(b.score) - n(a.score)).map((r, i) => ({ ...r, rank: i + 1 })), columns: [col("Rank", r => r.rank), col("Exam", r => nm(d.online_exams, r.onlineExamId, "title")), col("Student", r => fullName(sById[r.studentId])), col("Correct", r => r.correct), col("Score", r => `${n(r.score)}%`), col("Result", r => r.result)] },
      { id: "questions", label: "Question Bank Summary", rows: countBy(d.questions, q => `${q.questionType || "—"} · ${q.level || "—"}`).map(([k, v]) => ({ id: k, k, v })), columns: [col("Type · Level", r => r.k), col("Questions", r => r.v)] },
    ];
  }} />;
}

export function ReportLessonPlan() {
  const d = useData(["lessons", "topics", "syllabus", "classes", "sections", "subjects", "staff"]);
  return <ReportBoard title="Lesson Plan Report" withRange={false} data={d} build={d => [
    { id: "status", label: "Syllabus Status Report", rows: d.lessons.map(l => { const ts = d.topics.filter(t => t.lessonId === l.id); const done = ts.filter(t => t.status === "Complete").length; return { ...l, total: ts.length, done }; }), columns: [col("Class", l => nm(d.classes, l.classId)), col("Section", l => nm(d.sections, l.sectionId)), col("Subject", l => nm(d.subjects, l.subjectId)), col("Lesson", l => l.name), col("Topics", l => l.total), col("Completed", l => l.done), col("Progress", l => l.total ? `${Math.round((l.done / l.total) * 100)}%` : "—")] },
    { id: "plans", label: "Teacher Lesson Plans", rows: d.syllabus, columns: [col("Teacher", s => nm(d.staff, s.staffId)), col("Topic", s => nm(d.topics, s.topicId)), col("Date", s => fmtDate(s.date)), col("From", s => s.from), col("To", s => s.to), col("Sub Topic", s => s.subTopic)] },
  ]} />;
}

export function ReportAlumni() {
  const d = useData(["alumni", "alumni_events", "students", "sessions", "classes"]);
  return <ReportBoard title="Alumni Report" withRange={false} data={d} build={d => [
    { id: "alumni", label: "Alumni Report", rows: d.alumni, columns: [col("Pass Out Session", a => nm(d.sessions, a.sessionId)), col("Admission No", a => d.students.find(s => s.id === a.studentId)?.admissionNo), col("Student", a => fullName(d.students.find(s => s.id === a.studentId))), col("Class", a => nm(d.classes, d.students.find(s => s.id === a.studentId)?.classId)), col("Current Email", a => a.currentEmail), col("Current Phone", a => a.currentPhone), col("Occupation", a => a.occupation)] },
    { id: "events", label: "Alumni Events", rows: d.alumni_events, columns: [col("Event", e => e.title), col("Event For", e => e.eventFor), col("From", e => fmtDate(e.from)), col("To", e => fmtDate(e.to))] },
  ]} />;
}

export function ReportHr() {
  const d = useData(["staff", "departments", "designations", "roles", "payroll", "leave_requests", "leave_types", "staff_ratings"]);
  return <ReportBoard title="Human Resource Report" withRange={false} data={d} build={d => [
    { id: "staff", label: "Staff Report", rows: d.staff, columns: [col("Staff ID", s => s.staffId), col("Name", s => `${s.name || ""} ${s.surname || ""}`), col("Role", s => nm(d.roles, s.roleId)), col("Department", s => nm(d.departments, s.departmentId)), col("Designation", s => nm(d.designations, s.designationId)), col("Phone", s => s.phone), col("Email", s => s.email), col("Joining", s => fmtDate(s.dateOfJoining)), col("Status", s => s.status || "active")], stats: [["Staff", d.staff.length], ["Active", d.staff.filter(s => s.status !== "disabled").length, C.ok]] },
    { id: "payroll", label: "Payroll Report", rows: d.payroll, columns: [col("Staff", p => nm(d.staff, p.staffId)), col("Month", p => `${p.month || ""} ${p.year || ""}`), col("Net Salary", p => money(p.netSalary)), col("Status", p => p.status), col("Payment Date", p => fmtDate(p.paymentDate))] },
    { id: "leave", label: "Leave Report", rows: d.leave_requests, columns: [col("Staff", l => nm(d.staff, l.staffId)), col("Leave Type", l => nm(d.leave_types, l.leaveTypeId)), col("From", l => fmtDate(l.from)), col("To", l => fmtDate(l.to)), col("Status", l => l.status)] },
    { id: "rating", label: "Teacher Rating Report", rows: Object.values(d.staff_ratings.reduce((m, r) => { (m[r.staffId] ||= { id: r.staffId, c: 0, s: 0 }); m[r.staffId].c++; m[r.staffId].s += n(r.rate); return m; }, {})), columns: [col("Staff", r => nm(d.staff, r.id)), col("Ratings", r => r.c), col("Average", r => (r.s / r.c).toFixed(2))] },
    { id: "by_department", label: "Staff By Department", rows: countBy(d.staff, s => nm(d.departments, s.departmentId)).map(([k, v]) => ({ id: k, k, v })), columns: [col("Department", r => r.k), col("Staff", r => r.v)] },
  ]} />;
}

export function ReportDocuments() {
  const d = useData(["documents"]);
  return <ReportBoard title="Documents Report" data={d} build={(d, { from, to }) => {
    const docs = d.documents.filter(x => inRange(String(x.issuedAt || "").slice(0, 10), from, to));
    return [
      { id: "by_type", label: "Documents By Type", rows: Object.entries(DOCUMENT_TYPES).map(([id, t]) => ({ id, t, c: docs.filter(x => x.type === id).length })), columns: [col("Type", r => `${r.t.tr} / ${r.t.en}`), col("Issued", r => r.c)], stats: [["Documents", docs.length]] },
      { id: "by_month", label: "Documents Per Month", rows: countBy(docs, x => String(x.issuedAt || "").slice(0, 7)).sort((a, b) => b[0].localeCompare(a[0])).map(([k, v]) => ({ id: k, k, v })), columns: [col("Month", r => r.k), col("Issued", r => r.v)] },
      { id: "list", label: "Issued Documents", rows: docs, columns: [col("Code", x => x.code), col("Type", x => DOCUMENT_TYPES[x.type]?.tr), col("Name", x => x.studentName), col("Email", x => x.studentEmail), col("Created At", x => fmtDate(x.issuedAt))] },
    ];
  }} />;
}

export function ReportCourses() {
  const d = useData(["courses", "course_payments", "course_lessons", "students", "staff"]);
  return <ReportBoard title="Online Course Report" data={d} build={(d, { from, to }) => {
    const pays = d.course_payments.filter(p => inRange(p.paymentDate, from, to));
    return [
      { id: "sell", label: "Course Sell Report", rows: d.courses.map(c => { const ps = pays.filter(p => p.courseId === c.id && p.status !== "rejected"); return { ...c, sold: ps.length, revenue: ps.reduce((a, p) => a + n(p.amount), 0), lessons: d.course_lessons.filter(l => l.courseId === c.id).length }; }), columns: [col("Course", c => c.title), col("Teacher", c => nm(d.staff, c.staffId)), col("Lessons", c => c.lessons), col("Price", c => money(c.price)), col("Sold", c => c.sold), col("Revenue", c => money(c.revenue)), col("Status", c => c.status)] },
      { id: "purchase", label: "Course Purchase Report", rows: pays, columns: [col("Course", p => nm(d.courses, p.courseId, "title")), col("Student", p => fullName(d.students.find(s => s.id === p.studentId))), col("Date", p => fmtDate(p.paymentDate)), col("Amount", p => money(p.amount)), col("Mode", p => p.paymentMode), col("Status", p => p.status)] },
      { id: "trending", label: "Trending Courses", rows: countBy(pays, p => nm(d.courses, p.courseId, "title")).map(([k, v]) => ({ id: k, k, v })), columns: [col("Course", r => r.k), col("Purchases", r => r.v)] },
    ];
  }} />;
}

function liveReport(title, key) {
  return function LiveReport() {
    const d = useData([key, "staff", "classes"]);
    return <ReportBoard title={title} data={d} build={(d, { from, to }) => {
      const rows = d[key].filter(r => inRange(r.date, from, to));
      return [
        { id: "list", label: title, rows, columns: [col("Title", r => r.title), col("Date", r => fmtDate(r.date)), col("Time", r => r.time), col("Duration", r => r.duration), col("Host / Staff", r => r.staffId ? nm(d.staff, r.staffId) : (r.staffIds || []).map(id => nm(d.staff, id)).join(", ")), col("Class", r => nm(d.classes, r.classId)), col("Status", r => r.status)], stats: countBy(rows, r => r.status).map(([k, v]) => [k, v]) },
      ];
    }} />;
  };
}
export const ReportLiveClasses = liveReport("Live Classes Report", "live_classes");
export const ReportLiveMeetings = liveReport("Live Meeting Report", "live_meetings");
