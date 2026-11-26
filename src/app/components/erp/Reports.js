"use client";
// Reports: computed summaries over the ERP collections, each exportable to CSV.

import { useEffect, useMemo, useState } from "react";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import { listAll, fullName } from "@/lib/erp/data";
import { Card, Btn, Table, inputStyle, money, fmtDate, exportCsv, C } from "./ui";
import { computeLines } from "./Fees";

function useData(keys) {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all(keys.map(k => listAll(k, { force: true }).catch(() => []))).then(r => setD(Object.fromEntries(keys.map((k, i) => [k, r[i]]))));
  }, [keys.join(",")]);
  return d;
}

const nm = (rows, id, f = "name") => (rows || []).find(r => r.id === id)?.[f] || "";
const Stat = ({ label, value, color = C.ink }) => (
  <div style={{ background: "white", borderRadius: 14, padding: 18, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", textAlign: "center" }}>
    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{label}</div>
  </div>
);
const Stats = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>{children}</div>;
const countBy = (rows, fn) => Object.entries(rows.reduce((m, r) => { const k = fn(r) || "—"; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);

function Breakdown({ title, pairs }) {
  return <Card title={title}><Table columns={[{ label: "Name", render: p => p[0] }, { label: "Count", render: p => p[1] }]} rows={pairs} rowKey={p => p[0]} /></Card>;
}

export function ReportStudents() {
  const d = useData(["students", "classes", "categories", "sections"]);
  const [classId, setClassId] = useState("");
  if (!d) return <Card>Loading…</Card>;
  const all = d.students;
  const rows = all.filter(s => !classId || s.classId === classId);
  const cols = [
    { label: "Admission No", key: "admissionNo" }, { label: "Name", render: s => fullName(s), text: s => fullName(s) },
    { label: "Class", render: s => nm(d.classes, s.classId), text: s => nm(d.classes, s.classId) },
    { label: "Category", render: s => nm(d.categories, s.categoryId), text: s => nm(d.categories, s.categoryId) },
    { label: "Gender", key: "gender" }, { label: "Nationality", key: "nationality" }, { label: "Passport", key: "passportNo" },
    { label: "Mobile", key: "mobile" }, { label: "Email", key: "email" }, { label: "Admission Date", render: s => fmtDate(s.admissionDate), text: s => s.admissionDate },
    { label: "Status", render: s => s.status || "active", text: s => s.status || "active" },
  ];
  return (
    <>
      <Stats>
        <Stat label="Total Students" value={all.length} />
        <Stat label="Active" value={all.filter(s => s.status !== "disabled").length} color={C.ok} />
        <Stat label="Disabled" value={all.filter(s => s.status === "disabled").length} color="#dc2626" />
        <Stat label="Male" value={all.filter(s => s.gender === "Male").length} color={C.info} />
        <Stat label="Female" value={all.filter(s => s.gender === "Female").length} color="#db2777" />
      </Stats>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        <Breakdown title="By Class" pairs={countBy(all, s => nm(d.classes, s.classId))} />
        <Breakdown title="By Category" pairs={countBy(all, s => nm(d.categories, s.categoryId))} />
        <Breakdown title="By Nationality" pairs={countBy(all, s => s.nationality)} />
      </div>
      <Card title={`Student Report (${rows.length})`} actions={<>
        <select value={classId} onChange={e => setClassId(e.target.value)} style={{ ...inputStyle, maxWidth: 240 }}><option value="">All Classes</option>{d.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <Btn kind="ghost" onClick={() => exportCsv("student-report.csv", cols, rows)}>⬇ CSV</Btn>
      </>}><Table columns={cols} rows={rows.slice(0, 500)} /></Card>
    </>
  );
}

export function ReportFinance() {
  const d = useData(["fee_payments", "student_fees", "income", "expenses", "income_heads", "expense_heads", "students"]);
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const inRange = x => (!from || (x.date || "") >= from) && (!to || (x.date || "") <= to);
  const sum = (rows, k = "amount") => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
  const view = useMemo(() => {
    if (!d) return null;
    const pays = d.fee_payments.filter(inRange), inc = d.income.filter(inRange), exp = d.expenses.filter(inRange);
    const lines = computeLines(d.student_fees, d.fee_payments);
    return { pays, inc, exp, due: lines.reduce((a, l) => a + l.balance, 0) };
  }, [d, from, to]);
  if (!view) return <Card>Loading…</Card>;
  const byMode = countSum(view.pays, p => p.mode);
  const byDay = countSum(view.pays, p => p.date).sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  const ledger = [
    ...view.pays.map(p => ({ date: p.date, kind: "Fees", name: fullName(d.students.find(s => s.id === p.studentId)), head: p.mode, amount: Number(p.amount) || 0 })),
    ...view.inc.map(i => ({ date: i.date, kind: "Income", name: i.name, head: nm(d.income_heads, i.headId), amount: Number(i.amount) || 0 })),
    ...view.exp.map(e => ({ date: e.date, kind: "Expense", name: e.name, head: nm(d.expense_heads, e.headId), amount: -(Number(e.amount) || 0) })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const cols = [{ label: "Date", render: r => fmtDate(r.date), text: r => r.date }, { label: "Type", key: "kind" }, { label: "Name", key: "name" }, { label: "Head / Mode", key: "head" }, { label: "Amount", render: r => <span style={{ color: r.amount < 0 ? "#dc2626" : "#047857" }}>{money(r.amount)}</span>, text: r => r.amount }];
  return (
    <>
      <Card title="Date Range"><div style={{ display: "flex", gap: 12 }}><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} /><input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} /></div></Card>
      <Stats>
        <Stat label="Fees Collected" value={money(sum(view.pays))} color={C.ok} />
        <Stat label="Discounts" value={money(sum(view.pays, "discount"))} color={C.warn} />
        <Stat label="Fines" value={money(sum(view.pays, "fine"))} color={C.info} />
        <Stat label="Other Income" value={money(sum(view.inc))} color={C.ok} />
        <Stat label="Expenses" value={money(sum(view.exp))} color="#dc2626" />
        <Stat label="Balance" value={money(sum(view.pays) + sum(view.pays, "fine") + sum(view.inc) - sum(view.exp))} />
        <Stat label="Fees Due (all time)" value={money(view.due)} color="#dc2626" />
      </Stats>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        <Card title="Collection By Mode"><Table columns={[{ label: "Mode", render: p => p[0] }, { label: "Payments", render: p => p[1] }, { label: "Amount", render: p => money(p[2]) }]} rows={byMode} rowKey={p => p[0]} /></Card>
        <Card title="Daily Collection"><Table columns={[{ label: "Date", render: p => fmtDate(p[0]) }, { label: "Payments", render: p => p[1] }, { label: "Amount", render: p => money(p[2]) }]} rows={byDay.slice(0, 60)} rowKey={p => p[0]} /></Card>
      </div>
      <Card title="Income / Expense Ledger" actions={<Btn kind="ghost" onClick={() => exportCsv("finance.csv", cols, ledger)}>⬇ CSV</Btn>}><Table columns={cols} rows={ledger.slice(0, 500)} rowKey={(r, i) => i} /></Card>
    </>
  );
}

function countSum(rows, fn) {
  return Object.entries(rows.reduce((m, r) => { const k = fn(r) || "—"; (m[k] ||= [0, 0]); m[k][0]++; m[k][1] += Number(r.amount) || 0; return m; }, {})).map(([k, [c, s]]) => [k, c, s]);
}

export function ReportAttendance() {
  const d = useData(["student_attendance", "students", "classes", "staff_attendance", "staff"]);
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  if (!d) return <Card>Loading…</Card>;
  const att = d.student_attendance.filter(a => (!from || a.date >= from) && (!to || a.date <= to));
  const perStudent = Object.values(att.reduce((m, a) => { (m[a.studentId] ||= { studentId: a.studentId, Present: 0, Late: 0, Absent: 0, "Half Day": 0, Holiday: 0 }); m[a.studentId][a.status] = (m[a.studentId][a.status] || 0) + 1; return m; }, {}));
  const cols = [
    { label: "Admission No", render: r => d.students.find(s => s.id === r.studentId)?.admissionNo, text: r => d.students.find(s => s.id === r.studentId)?.admissionNo },
    { label: "Name", render: r => fullName(d.students.find(s => s.id === r.studentId)), text: r => fullName(d.students.find(s => s.id === r.studentId)) },
    ...["Present", "Late", "Absent", "Half Day", "Holiday"].map(k => ({ label: k, key: k })),
    { label: "%", render: r => { const t = r.Present + r.Late + r.Absent + r["Half Day"]; return t ? `${Math.round(((r.Present + r.Late + r["Half Day"] / 2) / t) * 100)}%` : "—"; } },
  ];
  return (
    <>
      <Card title="Date Range"><div style={{ display: "flex", gap: 12 }}><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} /><input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} /></div></Card>
      <Card title="Student Attendance Report" actions={<Btn kind="ghost" onClick={() => exportCsv("attendance.csv", cols, perStudent)}>⬇ CSV</Btn>}><Table columns={cols} rows={perStudent} rowKey={r => r.studentId} empty="No attendance recorded in this range." /></Card>
      <Breakdown title="Staff Attendance (status counts)" pairs={countBy(d.staff_attendance.filter(a => (!from || a.date >= from) && (!to || a.date <= to)), a => a.status)} />
    </>
  );
}

export function ReportExams() {
  const d = useData(["exam_results", "exam_schedules", "students", "subjects"]);
  if (!d) return <Card>Loading…</Card>;
  const cols = [
    { label: "Exam", render: r => nm(d.exam_schedules, r.examScheduleId, "exam"), text: r => nm(d.exam_schedules, r.examScheduleId, "exam") },
    { label: "Subject", render: r => nm(d.subjects, d.exam_schedules.find(x => x.id === r.examScheduleId)?.subjectId), text: () => "" },
    { label: "Student", render: r => fullName(d.students.find(s => s.id === r.studentId)), text: r => fullName(d.students.find(s => s.id === r.studentId)) },
    { label: "Marks", render: r => r.absent ? "ABS" : r.marks, text: r => r.absent ? "ABS" : r.marks },
    { label: "Max", render: r => d.exam_schedules.find(x => x.id === r.examScheduleId)?.maxMarks, text: () => "" },
  ];
  return <Card title="Examination Results" actions={<Btn kind="ghost" onClick={() => exportCsv("exam-results.csv", cols, d.exam_results)}>⬇ CSV</Btn>}><Table columns={cols} rows={d.exam_results} empty="No exam results recorded." /></Card>;
}

export function ReportDocuments() {
  const d = useData(["documents"]);
  if (!d) return <Card>Loading…</Card>;
  const docs = d.documents;
  const byMonth = countBy(docs, x => String(x.issuedAt || "").slice(0, 7)).sort((a, b) => b[0].localeCompare(a[0]));
  return (
    <>
      <Stats>{Object.entries(DOCUMENT_TYPES).map(([id, n]) => <Stat key={id} label={n.en} value={docs.filter(x => x.type === id).length} />)}</Stats>
      <Breakdown title="Documents Issued Per Month" pairs={byMonth} />
    </>
  );
}

export function ReportHr() {
  const d = useData(["staff", "departments", "designations", "roles", "payroll", "leave_requests"]);
  if (!d) return <Card>Loading…</Card>;
  return (
    <>
      <Stats>
        <Stat label="Staff" value={d.staff.length} /><Stat label="Active" value={d.staff.filter(s => s.status !== "disabled").length} color={C.ok} />
        <Stat label="Payroll Paid" value={money(d.payroll.filter(p => p.status === "paid").reduce((a, p) => a + (Number(p.netSalary) || 0), 0))} />
        <Stat label="Pending Leave" value={d.leave_requests.filter(l => l.status === "pending").length} color={C.warn} />
      </Stats>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        <Breakdown title="By Department" pairs={countBy(d.staff, s => nm(d.departments, s.departmentId))} />
        <Breakdown title="By Designation" pairs={countBy(d.staff, s => nm(d.designations, s.designationId))} />
        <Breakdown title="By Role" pairs={countBy(d.staff, s => nm(d.roles, s.roleId))} />
      </div>
    </>
  );
}
