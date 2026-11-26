"use client";
// Fees Collection: per-student fee lines (erp_student_fees) and payments (erp_fee_payments).
// A fee line comes from a Fees Master (group + type + amount + due date) or is added ad hoc;
// payments record amount, discount and fine against one line, like the legacy collect screen.

import { useEffect, useMemo, useState } from "react";
import { STUDENT_FIELDS } from "@/lib/erp/schema";
import { listAll, listWhere, createRow, deleteRow, getSettings, fullName } from "@/lib/erp/data";
import { esc, safeHtml } from "@/lib/erp/templating";
import { Card, Btn, Badge, Modal, Table, Grid, Field, inputStyle, money, fmtDate, printHtml, exportCsv, useRefOptions, C } from "./ui";

const MODES = ["Cash", "Cheque", "DD", "Bank Transfer", "UPI", "Card", "Online"];
const today = () => new Date().toISOString().slice(0, 10);
const n = v => Number(v) || 0;

export function computeLines(lines, payments) {
  return lines.map(l => {
    const ps = payments.filter(p => p.studentFeeId === l.id);
    const paid = ps.reduce((a, p) => a + n(p.amount), 0);
    const discount = ps.reduce((a, p) => a + n(p.discount), 0);
    const fine = ps.reduce((a, p) => a + n(p.fine), 0);
    const balance = Math.max(0, n(l.amount) - paid - discount);
    const status = balance <= 0 ? "Paid" : paid + discount > 0 ? "Partial" : "Unpaid";
    return { ...l, payments: ps, paid, discount, fine, balance, status };
  });
}

function useFeeLookups() {
  const [lk, setLk] = useState({ groups: [], types: [], masters: [], discounts: [], sessions: [] });
  useEffect(() => {
    Promise.all(["fee_groups", "fee_types", "fee_masters", "fee_discounts", "sessions"].map(k => listAll(k).catch(() => [])))
      .then(([groups, types, masters, discounts, sessions]) => setLk({ groups, types, masters, discounts, sessions }));
  }, []);
  return lk;
}

const label = (rows, id, f = "name") => rows.find(r => r.id === id)?.[f] || "";

// ── Fee card for one student (used in Collect Fees and the student profile) ──────
export function StudentFeesPanel({ student }) {
  const lk = useFeeLookups();
  const [lines, setLines] = useState(null);
  const [payments, setPayments] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [collect, setCollect] = useState(null);

  const load = async () => {
    const [l, p] = await Promise.all([listWhere("student_fees", "studentId", "==", student.id), listWhere("fee_payments", "studentId", "==", student.id)]);
    setLines(l); setPayments(p);
  };
  useEffect(() => {
    let alive = true;
    Promise.all([listWhere("student_fees", "studentId", "==", student.id), listWhere("fee_payments", "studentId", "==", student.id)])
      .then(([l, p]) => { if (alive) { setLines(l); setPayments(p); } })
      .catch(e => alert(e.message));
    return () => { alive = false; };
  }, [student.id]);

  const rows = useMemo(() => computeLines(lines || [], payments).sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || ""))), [lines, payments]);
  const totals = rows.reduce((t, r) => ({ amount: t.amount + n(r.amount), paid: t.paid + r.paid, discount: t.discount + r.discount, fine: t.fine + r.fine, balance: t.balance + r.balance }), { amount: 0, paid: 0, discount: 0, fine: 0, balance: 0 });

  const printReceipt = async (line, pay) => {
    const hdr = await getSettings("print_header_footer").catch(() => ({}));
    const gen = await getSettings("general").catch(() => ({}));
    const ps = pay ? [pay] : line.payments;
    printHtml("Fees Receipt", `
      ${hdr.feeReceiptHeader?.url ? `<img src="${esc(hdr.feeReceiptHeader.url)}" style="width:100%;max-height:140px;object-fit:contain">` : `<h2 style="text-align:center;margin:0">${esc(gen.schoolName || "Go Turkey And Study Academy")}</h2>`}
      <h3 style="text-align:center">Fees Receipt</h3>
      <table style="width:100%;font-size:13px;margin-bottom:10px"><tr><td><b>Name:</b> ${esc(fullName(student))}</td><td><b>Admission No:</b> ${esc(student.admissionNo)}</td></tr>
      <tr><td><b>Father Name:</b> ${esc(student.fatherName || "")}</td><td><b>Mobile:</b> ${esc(student.mobile || "")}</td></tr></table>
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px">
        <tr><th>Fees Group</th><th>Fees Code</th><th>Payment Id</th><th>Mode</th><th>Date</th><th>Amount</th><th>Discount</th><th>Fine</th></tr>
        ${ps.map(p => `<tr><td>${esc(label(lk.groups, line.feeGroupId) || line.title || "")}</td><td>${esc(label(lk.types, line.feeTypeId, "code"))}</td><td>${esc(p.receiptNo)}</td><td>${esc(p.mode)}</td><td>${esc(fmtDate(p.date))}</td><td>${esc(money(p.amount))}</td><td>${esc(money(p.discount))}</td><td>${esc(money(p.fine))}</td></tr>`).join("")}
      </table>
      <p style="text-align:right"><b>Fee:</b> ${esc(money(line.amount))} &nbsp; <b>Paid:</b> ${esc(money(line.paid))} &nbsp; <b>Balance:</b> ${esc(money(line.balance))}</p>
      ${hdr.feeReceiptFooter ? `<div>${safeHtml(hdr.feeReceiptFooter)}</div>` : ""}`);
  };

  const revert = async p => { if (confirm(`Revert payment ${p.receiptNo}?`)) { await deleteRow("fee_payments", p.id); load(); } };
  const removeLine = async l => {
    if (l.payments.length) { alert("Revert this fee's payments first."); return; }
    if (confirm("Remove this fee from the student?")) { await deleteRow("student_fees", l.id); load(); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 14 }}><b>Total:</b> {money(totals.amount)} · <b>Paid:</b> {money(totals.paid)} · <b>Discount:</b> {money(totals.discount)} · <b>Fine:</b> {money(totals.fine)} · <b style={{ color: totals.balance ? "#dc2626" : "#047857" }}>Balance: {money(totals.balance)}</b></div>
        <Btn onClick={() => setAssignOpen(true)}>+ Assign Fees</Btn>
      </div>
      <Table columns={[
        { label: "Fees Group", render: l => label(lk.groups, l.feeGroupId) || l.title },
        { label: "Fees Code", render: l => label(lk.types, l.feeTypeId, "code") },
        { label: "Due Date", render: l => fmtDate(l.dueDate) },
        { label: "Status", render: l => <Badge color={l.status === "Paid" ? C.ok : l.status === "Partial" ? C.warn : "#dc2626"}>{l.status}</Badge> },
        { label: "Amount (₺)", render: l => money(l.amount) },
        { label: "Payments", render: l => l.payments.map(p => <div key={p.id} style={{ fontSize: 12, whiteSpace: "nowrap" }}>{p.receiptNo} · {p.mode} · {fmtDate(p.date)} · {money(p.amount)} <a href="#" onClick={e => { e.preventDefault(); printReceipt(l, p); }}>🖨</a> <a href="#" onClick={e => { e.preventDefault(); revert(p); }} style={{ color: "#dc2626" }}>↺</a></div>) },
        { label: "Discount (₺)", render: l => money(l.discount) }, { label: "Fine (₺)", render: l => money(l.fine) },
        { label: "Paid (₺)", render: l => money(l.paid) }, { label: "Balance (₺)", render: l => <b>{money(l.balance)}</b> },
        { label: "Action", render: l => <div style={{ display: "flex", gap: 4 }}>
          {l.balance > 0 && <Btn small onClick={() => setCollect(l)}>+ Collect</Btn>}
          <Btn small kind="ghost" onClick={() => printReceipt(l)}>🖨</Btn>
          <Btn small kind="danger" onClick={() => removeLine(l)}>🗑️</Btn>
        </div> },
      ]} rows={rows} empty={lines ? "No fees assigned." : "Loading…"} />

      {assignOpen && <AssignFees student={student} lk={lk} onClose={() => setAssignOpen(false)} onDone={() => { setAssignOpen(false); load(); }} />}
      {collect && <CollectModal student={student} line={collect} lk={lk} onClose={() => setCollect(null)} onDone={async (line, pay) => { setCollect(null); await load(); if (confirm("Payment saved. Print receipt?")) printReceipt({ ...line, paid: line.paid + n(pay.amount), balance: Math.max(0, line.balance - n(pay.amount) - n(pay.discount)) }, pay); }} />}
    </div>
  );
}

function AssignFees({ student, lk, onClose, onDone }) {
  const [sel, setSel] = useState(new Set());
  const [adhoc, setAdhoc] = useState({ title: "", amount: "", dueDate: "" });
  const save = async () => {
    for (const id of sel) {
      const m = lk.masters.find(x => x.id === id);
      await createRow("student_fees", { studentId: student.id, feeMasterId: m.id, feeGroupId: m.feeGroupId, feeTypeId: m.feeTypeId, amount: n(m.amount), dueDate: m.dueDate || "", sessionId: m.sessionId || "", fineType: m.fineType || "none", fineAmount: n(m.fineAmount), finePercentage: n(m.finePercentage) });
    }
    if (adhoc.title && adhoc.amount) await createRow("student_fees", { studentId: student.id, title: adhoc.title, amount: n(adhoc.amount), dueDate: adhoc.dueDate });
    onDone();
  };
  return (
    <Modal title="Assign Fees" onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={!sel.size && !(adhoc.title && adhoc.amount)}>Assign</Btn></>}>
      <h4 style={{ margin: "0 0 8px" }}>From Fees Master</h4>
      <Table columns={[
        { label: "", render: m => <input type="checkbox" checked={sel.has(m.id)} onChange={() => setSel(p => { const s = new Set(p); s.has(m.id) ? s.delete(m.id) : s.add(m.id); return s; })} /> },
        { label: "Session", render: m => label(lk.sessions, m.sessionId) }, { label: "Fees Group", render: m => label(lk.groups, m.feeGroupId) },
        { label: "Fees Type", render: m => label(lk.types, m.feeTypeId) }, { label: "Due Date", render: m => fmtDate(m.dueDate) }, { label: "Amount", render: m => money(m.amount) },
      ]} rows={lk.masters} empty="No fees master defined — add one under Fees Master, or use an ad-hoc fee below." />
      <h4 style={{ margin: "20px 0 8px" }}>Or Ad-hoc Fee</h4>
      <Grid>
        <Field label="Title"><input value={adhoc.title} onChange={e => setAdhoc(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Amount (₺)"><input type="number" value={adhoc.amount} onChange={e => setAdhoc(p => ({ ...p, amount: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Due Date"><input type="date" value={adhoc.dueDate} onChange={e => setAdhoc(p => ({ ...p, dueDate: e.target.value }))} style={inputStyle} /></Field>
      </Grid>
    </Modal>
  );
}

function suggestedFine(line, date) {
  if (!line.dueDate || date <= line.dueDate || !line.fineType || line.fineType === "none") return 0;
  return line.fineType === "fix" ? n(line.fineAmount) : Math.round(n(line.amount) * n(line.finePercentage)) / 100;
}

function CollectModal({ student, line, lk, onClose, onDone }) {
  const [v, setV] = useState({ date: today(), amount: line.balance, discount: 0, fine: suggestedFine(line, today()), mode: "Cash", note: "" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (n(v.amount) <= 0 && n(v.discount) <= 0) { alert("Enter an amount or discount."); return; }
    if (n(v.amount) + n(v.discount) > line.balance + 0.001) { alert(`Amount + discount exceeds the balance (${money(line.balance)}).`); return; }
    setSaving(true);
    const all = await listAll("fee_payments", { force: true });
    const receiptNo = `${all.length + 1}/1`;
    const pay = { studentId: student.id, studentFeeId: line.id, amount: n(v.amount), discount: n(v.discount), discountId: v.discountId || "", fine: n(v.fine), mode: v.mode, date: v.date, note: v.note, receiptNo };
    await createRow("fee_payments", pay);
    onDone(line, pay);
  };
  return (
    <Modal title={`${fullName(student)} — ${label(lk.groups, line.feeGroupId) || line.title}`} width={560} onClose={onClose} footer={<><Btn kind="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Collect"}</Btn></>}>
      <Grid cols={1}>
        <Field label="Date"><input type="date" value={v.date} onChange={e => setV(p => ({ ...p, date: e.target.value, fine: suggestedFine(line, e.target.value) }))} style={inputStyle} /></Field>
        <Field label={`Amount (₺) — balance ${money(line.balance)}`}><input type="number" value={v.amount} onChange={e => setV(p => ({ ...p, amount: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Discount Group"><select value={v.discountId || ""} onChange={e => { const d = lk.discounts.find(x => x.id === e.target.value); setV(p => ({ ...p, discountId: e.target.value, discount: d ? Math.min(n(d.amount), line.balance) : 0 })); }} style={inputStyle}><option value="">None</option>{lk.discounts.map(d => <option key={d.id} value={d.id}>{d.name} ({money(d.amount)})</option>)}</select></Field>
        <Field label="Discount (₺)"><input type="number" value={v.discount} onChange={e => setV(p => ({ ...p, discount: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Fine (₺)"><input type="number" value={v.fine} onChange={e => setV(p => ({ ...p, fine: e.target.value }))} style={inputStyle} /></Field>
        <Field label="Payment Mode"><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{MODES.map(m => <label key={m} style={{ fontSize: 13 }}><input type="radio" checked={v.mode === m} onChange={() => setV(p => ({ ...p, mode: m }))} /> {m}</label>)}</div></Field>
        <Field label="Note"><textarea value={v.note} onChange={e => setV(p => ({ ...p, note: e.target.value }))} style={inputStyle} /></Field>
      </Grid>
    </Modal>
  );
}

// ── Collect Fees (search student → fee card) ─────────────────────────────────────
export function FeesCollect() {
  const opts = useRefOptions(STUDENT_FIELDS);
  const [students, setStudents] = useState([]);
  const [crit, setCrit] = useState({ classId: "", q: "" });
  const [open, setOpen] = useState(null);
  useEffect(() => { listAll("students").then(setStudents).catch(e => alert(e.message)); }, []);
  const rows = students.filter(s => s.status !== "disabled" && (!crit.classId || s.classId === crit.classId) && (!crit.q || [fullName(s), s.admissionNo, s.passportNo, s.mobile].some(v => String(v || "").toLocaleLowerCase("tr").includes(crit.q.toLocaleLowerCase("tr")))));
  return (
    <>
      <Card title="Select Criteria">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={crit.classId} onChange={e => setCrit(p => ({ ...p, classId: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">All Classes</option>{(opts.classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input value={crit.q} onChange={e => setCrit(p => ({ ...p, q: e.target.value }))} placeholder="Search by name, admission no, passport, phone" style={{ ...inputStyle, maxWidth: 360 }} />
        </div>
      </Card>
      <Card title="Student List">
        <Table columns={[
          { label: "Admission No", key: "admissionNo" }, { label: "Student Name", render: s => fullName(s) },
          { label: "Class", render: s => (opts.classes || []).find(c => c.id === s.classId)?.name || "" },
          { label: "Father Name", key: "fatherName" }, { label: "Mobile Number", key: "mobile" },
          { label: "Action", render: s => <Btn small onClick={() => setOpen(s)}>Collect Fees</Btn> },
        ]} rows={(crit.classId || crit.q) ? rows.slice(0, 200) : []} empty="Select a class or search for a student." />
      </Card>
      {open && <Modal title={`Student Fees — ${fullName(open)} (${open.admissionNo})`} width={1200} onClose={() => setOpen(null)}><StudentFeesPanel student={open} /></Modal>}
    </>
  );
}

function useAllFees() {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all([listAll("students"), listAll("student_fees", { force: true }), listAll("fee_payments", { force: true })])
      .then(([students, lines, payments]) => setD({ students, lines, payments })).catch(e => alert(e.message));
  }, []);
  return d;
}

// ── Search Fees Payment ─────────────────────────────────────────────────────────
export function FeesSearchPayment() {
  const d = useAllFees(); const lk = useFeeLookups();
  const [q, setQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  if (!d) return <Card>Loading…</Card>;
  const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
  const lineById = Object.fromEntries(d.lines.map(l => [l.id, l]));
  const rows = d.payments.filter(p => (!q || String(p.receiptNo).includes(q) || fullName(byId[p.studentId]).toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"))) && (!from || p.date >= from) && (!to || p.date <= to))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const cols = [
    { label: "Payment Id", key: "receiptNo" }, { label: "Date", render: p => fmtDate(p.date), text: p => p.date },
    { label: "Name", render: p => fullName(byId[p.studentId]), text: p => fullName(byId[p.studentId]) },
    { label: "Admission No", render: p => byId[p.studentId]?.admissionNo, text: p => byId[p.studentId]?.admissionNo },
    { label: "Fees Group", render: p => label(lk.groups, lineById[p.studentFeeId]?.feeGroupId) || lineById[p.studentFeeId]?.title, text: p => label(lk.groups, lineById[p.studentFeeId]?.feeGroupId) || lineById[p.studentFeeId]?.title },
    { label: "Mode", key: "mode" }, { label: "Paid (₺)", render: p => money(p.amount), text: p => p.amount },
    { label: "Discount (₺)", render: p => money(p.discount), text: p => p.discount }, { label: "Fine (₺)", render: p => money(p.fine), text: p => p.fine },
  ];
  return (
    <Card title="Search Fees Payment" actions={<Btn kind="ghost" onClick={() => exportCsv("payments.csv", cols, rows)}>⬇ CSV</Btn>}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Payment Id or student name" style={{ ...inputStyle, maxWidth: 300 }} />
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} />
        <span style={{ alignSelf: "center", fontWeight: 600 }}>Total: {money(rows.reduce((a, p) => a + n(p.amount), 0))}</span>
      </div>
      <Table columns={cols} rows={rows} />
    </Card>
  );
}

// ── Search Due Fees ─────────────────────────────────────────────────────────────
export function FeesDue() {
  const d = useAllFees(); const lk = useFeeLookups();
  const opts = useRefOptions(STUDENT_FIELDS);
  const [groupId, setGroupId] = useState(""); const [classId, setClassId] = useState(""); const [overdueOnly, setOverdueOnly] = useState(false);
  if (!d) return <Card>Loading…</Card>;
  const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
  const rows = computeLines(d.lines, d.payments)
    .filter(l => l.balance > 0 && byId[l.studentId] && (!groupId || l.feeGroupId === groupId) && (!classId || byId[l.studentId].classId === classId) && (!overdueOnly || (l.dueDate && l.dueDate < today())));
  const cols = [
    { label: "Admission No", render: l => byId[l.studentId].admissionNo, text: l => byId[l.studentId].admissionNo },
    { label: "Student Name", render: l => fullName(byId[l.studentId]), text: l => fullName(byId[l.studentId]) },
    { label: "Class", render: l => (opts.classes || []).find(c => c.id === byId[l.studentId].classId)?.name || "", text: l => "" },
    { label: "Fees Group", render: l => label(lk.groups, l.feeGroupId) || l.title, text: l => label(lk.groups, l.feeGroupId) || l.title },
    { label: "Due Date", render: l => fmtDate(l.dueDate), text: l => l.dueDate }, { label: "Amount", render: l => money(l.amount), text: l => l.amount },
    { label: "Paid", render: l => money(l.paid), text: l => l.paid }, { label: "Balance", render: l => <b>{money(l.balance)}</b>, text: l => l.balance },
  ];
  return (
    <Card title="Search Due Fees" actions={<Btn kind="ghost" onClick={() => exportCsv("due-fees.csv", cols, rows)}>⬇ CSV</Btn>}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select value={groupId} onChange={e => setGroupId(e.target.value)} style={{ ...inputStyle, maxWidth: 240 }}><option value="">All Fees Groups</option>{lk.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <select value={classId} onChange={e => setClassId(e.target.value)} style={{ ...inputStyle, maxWidth: 240 }}><option value="">All Classes</option>{(opts.classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <label style={{ fontSize: 13 }}><input type="checkbox" checked={overdueOnly} onChange={e => setOverdueOnly(e.target.checked)} /> Past due date only</label>
        <span style={{ fontWeight: 600 }}>Total Due: {money(rows.reduce((a, l) => a + l.balance, 0))}</span>
      </div>
      <Table columns={cols} rows={rows} />
    </Card>
  );
}

// ── Fees Carry Forward ──────────────────────────────────────────────────────────
export function FeesCarryForward() {
  const d = useAllFees(); const lk = useFeeLookups();
  const [fromSession, setFromSession] = useState(""); const [toSession, setToSession] = useState(""); const [due, setDue] = useState("");
  if (!d) return <Card>Loading…</Card>;
  const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
  const pending = computeLines(d.lines, d.payments).filter(l => l.balance > 0 && !l.carriedForward && (!fromSession || l.sessionId === fromSession));
  const perStudent = Object.values(pending.reduce((m, l) => { (m[l.studentId] ||= { studentId: l.studentId, balance: 0, lines: [] }); m[l.studentId].balance += l.balance; m[l.studentId].lines.push(l); return m; }, {}));
  const run = async () => {
    if (!toSession || !confirm(`Carry forward balances for ${perStudent.length} student(s)?`)) return;
    const { updateRow } = await import("@/lib/erp/data");
    for (const s of perStudent) {
      await createRow("student_fees", { studentId: s.studentId, title: "Previous Session Balance", amount: s.balance, dueDate: due, sessionId: toSession, carriedFrom: fromSession || "" });
      for (const l of s.lines) await updateRow("student_fees", l.id, { carriedForward: true });
    }
    alert("Done."); location.reload();
  };
  return (
    <Card title="Fees Carry Forward" actions={<Btn onClick={run} disabled={!toSession || !perStudent.length}>Carry Forward</Btn>}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={fromSession} onChange={e => setFromSession(e.target.value)} style={{ ...inputStyle, maxWidth: 220 }}><option value="">From: any session</option>{lk.sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={toSession} onChange={e => setToSession(e.target.value)} style={{ ...inputStyle, maxWidth: 220 }}><option value="">To session…</option>{lk.sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ ...inputStyle, maxWidth: 180 }} title="Due date for the carried balance" />
      </div>
      <Table columns={[
        { label: "Admission No", render: s => byId[s.studentId]?.admissionNo }, { label: "Student Name", render: s => fullName(byId[s.studentId]) },
        { label: "Fees", render: s => s.lines.length }, { label: "Balance", render: s => money(s.balance) },
      ]} rows={perStudent} rowKey={s => s.studentId} empty="No unpaid balances to carry forward." />
    </Card>
  );
}
