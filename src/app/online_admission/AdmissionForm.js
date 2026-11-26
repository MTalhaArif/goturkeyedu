"use client";
import { useState } from "react";
import Link from "next/link";

const input = { width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15, boxSizing: "border-box", fontFamily: "inherit" };
const FIELDS = [
  ["firstName", "First Name", true], ["lastName", "Last Name", true], ["gender", "Gender"], ["dob", "Date Of Birth", false, "date"],
  ["mobile", "Mobile Number", true, "tel"], ["email", "Email", true, "email"], ["passportNo", "Passport / ID Number"], ["nationality", "Nationality"],
  ["fatherName", "Father Name"], ["motherName", "Mother Name"],
];

export default function AdmissionForm({ services }) {
  const [v, setV] = useState({ formServiceId: services[0]?.id || "" });
  const [state, setState] = useState({ busy: false, error: "", ref: "" });

  const submit = async e => {
    e.preventDefault();
    setState({ busy: true, error: "", ref: "" });
    try {
      const res = await fetch("/api/online-admission", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setState({ busy: false, error: "", ref: data.referenceNo || "" });
    } catch (err) { setState({ busy: false, error: err.message, ref: "" }); }
  };

  if (state.ref) {
    return (
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 12, padding: 24 }}>
        <h2 style={{ marginTop: 0, color: "#065f46" }}>Application received</h2>
        <p>Your reference number is <b>{state.ref}</b>. Please keep it for your records — our team will contact you soon.</p>
      </div>
    );
  }

  if (!services.length) return <p>Online admission is not open at the moment. Please <Link href="/contact">contact us</Link>.</p>;

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
      <label><span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Service *</span>
        <select required value={v.formServiceId} onChange={e => setV(p => ({ ...p, formServiceId: e.target.value }))} style={input}>
          {services.map(s => <option key={s.id} value={s.id}>{s.title}{s.price !== "" ? ` — ₺${s.price}` : ""}</option>)}
        </select>
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {FIELDS.map(([k, label, req, type]) => (
          <label key={k}><span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{label}{req ? " *" : ""}</span>
            {k === "gender"
              ? <select value={v.gender || ""} onChange={e => setV(p => ({ ...p, gender: e.target.value }))} style={input}><option value="">Select</option><option>Male</option><option>Female</option></select>
              : <input required={!!req} type={type || "text"} value={v[k] || ""} onChange={e => setV(p => ({ ...p, [k]: e.target.value }))} style={input} />}
          </label>
        ))}
      </div>
      <label><span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Address</span><textarea rows={3} value={v.address || ""} onChange={e => setV(p => ({ ...p, address: e.target.value }))} style={input} /></label>
      <label><span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Note</span><textarea rows={3} value={v.note || ""} onChange={e => setV(p => ({ ...p, note: e.target.value }))} style={input} /></label>
      {/* Honeypot: hidden from people, filled by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" value={v.website || ""} onChange={e => setV(p => ({ ...p, website: e.target.value }))} style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
      {state.error && <p style={{ color: "#b91c1c", margin: 0 }}>{state.error}</p>}
      <button type="submit" disabled={state.busy} className="btn-primary" style={{ justifySelf: "start", padding: "12px 28px" }}>{state.busy ? "Submitting…" : "Submit Application"}</button>
    </form>
  );
}
