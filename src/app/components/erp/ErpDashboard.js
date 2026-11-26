"use client";
// Super Admin home: live figures from the ERP collections (replaces the mock widgets).
import { useEffect, useState } from "react";
import { listAll, fullName } from "@/lib/erp/data";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import { Card, Table, money, fmtDate, C } from "./ui";
import { computeLines } from "./Fees";

export default function ErpDashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    Promise.all(["students", "documents", "fee_payments", "student_fees", "visitors", "enquiries"].map(k => listAll(k).catch(e => { setErr(e.code === "permission-denied" ? "ERP data is not readable yet — deploy the updated firestore.rules." : e.message); return []; })))
      .then(([students, documents, payments, lines, visitors, enquiries]) => setD({ students, documents, payments, lines, visitors, enquiries }));
  }, []);
  if (!d) return <Card>Loading…</Card>;
  const month = new Date().toISOString().slice(0, 7);
  const sum = rows => rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const due = computeLines(d.lines, d.payments).reduce((a, l) => a + l.balance, 0);
  const tiles = [
    { icon: "👥", label: "Total Students", value: d.students.length, color: "#f59e0b" },
    { icon: "✅", label: "Active Students", value: d.students.filter(s => s.status !== "disabled").length, color: C.ok },
    { icon: "🔏", label: "Documents Issued", value: d.documents.length, color: "#1a237e" },
    { icon: "🗓️", label: "Documents This Month", value: d.documents.filter(x => String(x.issuedAt || "").startsWith(month)).length, color: C.info },
    { icon: "💰", label: "Fees Collected This Month", value: money(sum(d.payments.filter(p => String(p.date || "").startsWith(month)))), color: C.ok },
    { icon: "⏳", label: "Fees Due", value: money(due), color: "#dc2626" },
    { icon: "🚪", label: "Visitors This Month", value: d.visitors.filter(v => String(v.date || "").startsWith(month)).length, color: C.muted },
    { icon: "📈", label: "Active Enquiries", value: d.enquiries.filter(e => !e.status || e.status === "active").length, color: C.ok },
  ];
  const recent = [...d.documents].sort((a, b) => String(b.issuedAt || "").localeCompare(String(a.issuedAt || ""))).slice(0, 10);
  const byId = Object.fromEntries(d.students.map(s => [s.id, s]));
  return (
    <div style={{ animation: "fadeIn 0.3s" }}>
      {err && <Card style={{ borderColor: "#fecaca", color: "#b91c1c" }}>{err}</Card>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20, marginBottom: 24 }}>
        {tiles.map(t => (
          <div key={t.label} style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${t.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{t.icon}</div>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase" }}>{t.label}</div><div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>{t.value}</div></div>
          </div>
        ))}
      </div>
      <Card title="Recently Issued Documents">
        <Table columns={[
          { label: "User", render: x => fullName(byId[x.studentId]) || x.studentName },
          { label: "Document", render: x => DOCUMENT_TYPES[x.type]?.en || x.type },
          { label: "Code", render: x => <a href={`/belge_dogrulama/${x.code}/${x.type}`} target="_blank" rel="noreferrer"><code>{x.code}</code></a> },
          { label: "Created At", render: x => fmtDate(x.issuedAt) },
        ]} rows={recent} empty="No documents yet — run System Settings → Legacy Data Import." />
      </Card>
    </div>
  );
}
