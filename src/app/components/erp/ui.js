"use client";
// Shared UI kit for the ERP modules — matches the PortalDashboard look (white cards,
// #E03C31 primary, #0f172a ink, 16px radius).

import { useEffect, useState } from "react";
import { listAll, uploadErpFile } from "@/lib/erp/data";

export const C = { primary: "#E03C31", ink: "#0f172a", muted: "#64748b", line: "#e2e8f0", soft: "#f8fafc", ok: "#10b981", warn: "#f59e0b", info: "#3b82f6" };

export const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.line}`, outline: "none", fontSize: 14, background: "white", boxSizing: "border-box", fontFamily: "inherit" };

export function Card({ children, style, title, actions }) {
  return (
    <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", padding: 24, marginBottom: 24, ...style }}>
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</h3>}
          {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Btn({ children, kind = "primary", small, style, ...props }) {
  const kinds = {
    primary: { background: C.primary, color: "white", border: "none" },
    dark: { background: C.ink, color: "white", border: "none" },
    ghost: { background: "white", color: C.ink, border: `1px solid ${C.line}` },
    danger: { background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "none" },
    info: { background: "rgba(59,130,246,0.1)", color: "#2563eb", border: "none" },
    ok: { background: "rgba(16,185,129,0.12)", color: "#047857", border: "none" },
  };
  return (
    <button {...props} style={{ ...kinds[kind], padding: small ? "5px 10px" : "9px 18px", borderRadius: 8, fontWeight: 600, fontSize: small ? 12 : 14, cursor: props.disabled ? "not-allowed" : "pointer", opacity: props.disabled ? 0.6 : 1, whiteSpace: "nowrap", ...style }}>
      {children}
    </button>
  );
}

export function Badge({ children, color = C.ok }) {
  return <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: `${color}1a`, color }}>{children}</span>;
}

export function Modal({ title, onClose, children, width = 760, footer }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-label={title} style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: width, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: `1px solid ${C.line}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.ink }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", borderRadius: 12, padding: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{ padding: "8px 14px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, background: active === tab.id ? C.primary : "transparent", color: active === tab.id ? "white" : C.muted }}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Table({ columns, rows, empty = "No records found.", rowKey = r => r.id }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${C.line}`, color: C.muted, textAlign: "left" }}>
            {columns.map((c, i) => <th key={i} style={{ padding: "10px 8px", whiteSpace: "nowrap", fontWeight: 700 }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: C.muted }}>{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={rowKey(r, i)} style={{ borderBottom: "1px solid #f1f5f9" }}>
              {columns.map((c, j) => <td key={j} style={{ padding: "10px 8px", verticalAlign: "top", ...(c.style || {}) }}>{c.render ? c.render(r, i) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, required, children, wide }) {
  return (
    <label style={{ display: "block", gridColumn: wide ? "1 / -1" : undefined }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.primary }}> *</span>}
      </span>
      {children}
    </label>
  );
}

export function Grid({ children, cols = 3 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${cols >= 3 ? 220 : 300}px, 1fr))`, gap: 16 }}>{children}</div>;
}

/** Loads option lists for ref fields: { collectionKey: rows } */
export function useRefOptions(fields) {
  const [opts, setOpts] = useState({});
  const keys = [...new Set(fields.filter(f => f.type === "ref" || f.type === "refMulti").map(f => f.collection))].join(",");
  useEffect(() => {
    let alive = true;
    (async () => {
      const out = {};
      for (const k of keys.split(",").filter(Boolean)) out[k] = await listAll(k).catch(() => []);
      if (alive) setOpts(out);
    })();
    return () => { alive = false; };
  }, [keys]);
  return opts;
}

export const money = v => (v === "" || v == null || isNaN(Number(v)) ? "" : `₺${Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

export function fmtDate(v) {
  if (!v) return "";
  if (v?.toDate) v = v.toDate();
  if (v instanceof Date) return v.toLocaleDateString("tr-TR");
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) { const [y, m, d] = v.slice(0, 10).split("-"); return `${d}.${m}.${y}`; }
  return String(v);
}

/** Renders a stored value for display in tables/profiles. */
export function displayValue(field, value, refOptions = {}) {
  if (value == null || value === "") return "";
  switch (field.type) {
    case "ref": {
      const row = (refOptions[field.collection] || []).find(r => r.id === value);
      return row ? (row[field.labelField] || row.name || row.title || value) : value;
    }
    case "refMulti":
      return (Array.isArray(value) ? value : [value]).map(v => {
        const row = (refOptions[field.collection] || []).find(r => r.id === v);
        return row ? (row[field.labelField] || row.name) : v;
      }).join(", ");
    case "multiCheck": return Array.isArray(value) ? value.join(", ") : String(value);
    case "checkbox": return value ? "✔" : "";
    case "money": return money(value);
    case "date": return fmtDate(value);
    case "html": return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    case "file": case "image":
      return value?.url ? <a href={value.url} target="_blank" rel="noreferrer">{field.type === "image" ? "🖼️" : "📎"} {value.name || "file"}</a> : "";
    default: return typeof value === "object" ? JSON.stringify(value) : String(value);
  }
}

/** One editable input for a schema field. */
export function FieldInput({ field, value, onChange, refOptions = {}, folder = "misc" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  switch (field.type) {
    case "textarea": return <textarea rows={3} value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />;
    case "html": return <textarea rows={8} value={value || ""} onChange={e => onChange(e.target.value)} placeholder="HTML allowed" style={{ ...inputStyle, resize: "vertical", fontFamily: "ui-monospace, monospace", fontSize: 12.5 }} />;
    case "number": case "money": return <input type="number" step="any" value={value ?? ""} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))} style={inputStyle} />;
    case "date": return <input type="date" value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />;
    case "time": return <input type="time" value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />;
    case "checkbox": return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18 }} />;
    case "select": return (
      <select value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle}>
        <option value="">Select</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    case "multiCheck": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {field.options.map(o => (
            <label key={o} style={{ fontSize: 13, display: "flex", gap: 4, alignItems: "center" }}>
              <input type="checkbox" checked={arr.includes(o)} onChange={e => onChange(e.target.checked ? [...arr, o] : arr.filter(x => x !== o))} /> {o}
            </label>
          ))}
        </div>
      );
    }
    case "ref": return (
      <select value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle}>
        <option value="">Select</option>
        {(refOptions[field.collection] || []).map(r => <option key={r.id} value={r.id}>{r[field.labelField] || r.name || r.title || r.id}</option>)}
      </select>
    );
    case "refMulti": {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div style={{ maxHeight: 140, overflowY: "auto", border: `1px solid ${C.line}`, borderRadius: 8, padding: 8 }}>
          {(refOptions[field.collection] || []).map(r => (
            <label key={r.id} style={{ display: "flex", gap: 6, fontSize: 13, padding: "2px 0" }}>
              <input type="checkbox" checked={arr.includes(r.id)} onChange={e => onChange(e.target.checked ? [...arr, r.id] : arr.filter(x => x !== r.id))} />
              {r[field.labelField] || r.name}
            </label>
          ))}
        </div>
      );
    }
    case "file": case "image": return (
      <div>
        {value?.url && <div style={{ fontSize: 12.5, marginBottom: 6 }}><a href={value.url} target="_blank" rel="noreferrer">{value.name || "current file"}</a> <button type="button" onClick={() => onChange(null)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer" }}>remove</button></div>}
        <input type="file" accept={field.type === "image" ? "image/*" : undefined} disabled={busy} onChange={async e => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true); setErr("");
          try { onChange(await uploadErpFile(folder, f)); } catch (x) { setErr(x.message); } finally { setBusy(false); }
        }} style={{ fontSize: 13 }} />
        {busy && <div style={{ fontSize: 12, color: C.muted }}>Uploading…</div>}
        {err && <div style={{ fontSize: 12, color: "#dc2626" }}>{err}</div>}
      </div>
    );
    default: return <input type={field.type === "email" ? "email" : "text"} value={value || ""} onChange={e => onChange(e.target.value)} style={inputStyle} />;
  }
}

/** Renders a whole form for a field list. */
export function SchemaForm({ fields, values, setValues, refOptions, folder }) {
  return (
    <Grid>
      {fields.map(f => (
        <Field key={f.key} label={f.label} required={f.required} wide={["textarea", "html", "refMulti", "multiCheck"].includes(f.type)}>
          <FieldInput field={f} value={values[f.key]} onChange={v => setValues(p => ({ ...p, [f.key]: v }))} refOptions={refOptions} folder={folder} />
        </Field>
      ))}
    </Grid>
  );
}

export function missingRequired(fields, values) {
  return fields.filter(f => f.required && (values[f.key] === undefined || values[f.key] === "" || values[f.key] === null)).map(f => f.label);
}

/** Downloads rows as CSV (Excel opens it). */
export function exportCsv(filename, columns, rows) {
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [columns.map(c => esc(c.label)).join(","), ...rows.map(r => columns.map(c => esc(c.text ? c.text(r) : r[c.key])).join(","))];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Opens a print window with the given HTML (certificates, receipts, ID cards). */
export function printHtml(title, bodyHtml, extraCss = "") {
  const w = window.open("", "_blank", "width=1000,height=800");
  if (!w) { alert("Allow pop-ups to print."); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:16px;color:#111}@media print{.noprint{display:none}}${extraCss}</style></head><body><div class="noprint" style="margin-bottom:12px"><button onclick="window.print()">Print</button></div>${bodyHtml}</body></html>`);
  w.document.close();
}
