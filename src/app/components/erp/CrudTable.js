"use client";
// Generic list / search / create / edit / delete screen for any ENTITIES[key].

import { useEffect, useMemo, useState } from "react";
import { ENTITIES } from "@/lib/erp/schema";
import { listAll, createRow, updateRow, deleteRow, bulkDelete } from "@/lib/erp/data";
import { Card, Btn, Modal, Table, SchemaForm, useRefOptions, displayValue, missingRequired, exportCsv, printHtml, inputStyle, C } from "./ui";
import { esc } from "@/lib/erp/templating";

const PAGE = 50;

// `filter` ({ field: value }) makes this tab a filtered view of the collection (e.g.
// Disabled Staff, Assignments); records added from it get those values preset.
// A missing value counts as "active" so records saved before a status existed still show.
export default function CrudTable({ entityKey, filter, title: titleOverride }) {
  const def = ENTITIES[entityKey];
  const presetFilter = filter ? r => Object.entries(filter).every(([k, v]) => r[k] === v || (v === "active" && !r[k])) : null;
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null); // {id?, values}
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);
  const refOptions = useRefOptions(def.fields);

  const load = async (force = true) => {
    setError("");
    try { setRows(await listAll(entityKey, { force })); }
    catch (e) { setError(e.code === "permission-denied" ? "Permission denied — deploy the updated firestore.rules." : e.message); setRows([]); }
  };
  // ErpSection mounts this with key={entityKey}, so state starts fresh per entity.
  useEffect(() => {
    let alive = true;
    listAll(entityKey)
      .then(r => { if (alive) setRows(r); })
      .catch(e => { if (alive) { setError(e.code === "permission-denied" ? "Permission denied — deploy the updated firestore.rules." : e.message); setRows([]); } });
    return () => { alive = false; };
  }, [entityKey]);

  const listFields = (def.list || def.fields.slice(0, 6).map(f => f.key)).map(k => def.fields.find(f => f.key === k)).filter(Boolean);
  const filterFields = def.fields.filter(f => (f.type === "ref" || f.type === "select") && listFields.includes(f)).slice(0, 3);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLocaleLowerCase("tr");
    return rows
      .filter(r => !presetFilter || presetFilter(r))
      .filter(r => Object.entries(filters).every(([k, v]) => !v || r[k] === v))
      .filter(r => !q || def.fields.some(f => String(displayValue(f, r[f.key], refOptions) ?? "").toLocaleLowerCase("tr").includes(q)))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [rows, search, filters, refOptions, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const bulkRemove = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} selected record(s)? This cannot be undone.`)) return;
    try { await bulkDelete(entityKey, [...selected]); setSelected(new Set()); await load(); } catch (e) { alert(e.message); }
  };

  // CSV import: header row may use field labels or keys; ref columns may hold the
  // referenced record's name — it is resolved to its id.
  const importCsv = async file => {
    if (!file) return;
    setImporting(true);
    try {
      const table = parseCsv(await file.text());
      const [head, ...lines] = table;
      const fieldFor = h => def.fields.find(f => f.key.toLowerCase() === h.trim().toLowerCase() || f.label.toLowerCase() === h.trim().toLowerCase());
      const cols = head.map(fieldFor);
      let n = 0;
      for (const line of lines) {
        if (!line.some(c => c.trim())) continue;
        const values = { ...(filter || {}) };
        cols.forEach((f, i) => {
          if (!f) return;
          let v = (line[i] ?? "").trim();
          if (f.type === "ref") v = (refOptions[f.collection] || []).find(r => [r.id, r[f.labelField], r.name, r.title].includes(v))?.id || v;
          if (["number", "money"].includes(f.type)) v = v === "" ? "" : Number(v.replace(",", "."));
          if (f.type === "checkbox") v = /^(1|true|yes|evet|✔)$/i.test(v);
          values[f.key] = v;
        });
        await createRow(entityKey, values); n++;
      }
      alert(`Imported ${n} record(s).`); await load();
    } catch (e) { alert(`Import failed: ${e.message}`); } finally { setImporting(false); }
  };

  const pageRows = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const save = async () => {
    const missing = missingRequired(def.fields, editing.values);
    if (missing.length) { alert(`Required: ${missing.join(", ")}`); return; }
    setSaving(true);
    try {
      if (editing.id) await updateRow(entityKey, editing.id, editing.values);
      else await createRow(entityKey, editing.values);
      setEditing(null); await load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const remove = async r => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try { await deleteRow(entityKey, r.id); await load(); } catch (e) { alert(e.message); }
  };

  const columns = [
    ...(def.readOnly ? [] : [{ label: <input type="checkbox" aria-label="Select all" checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))} onChange={e => setSelected(p => { const s = new Set(p); pageRows.forEach(r => e.target.checked ? s.add(r.id) : s.delete(r.id)); return s; })} />, render: r => <input type="checkbox" aria-label="Select" checked={selected.has(r.id)} onChange={() => setSelected(p => { const s = new Set(p); s.has(r.id) ? s.delete(r.id) : s.add(r.id); return s; })} />, text: () => "" }]),
    ...listFields.map(f => ({ label: f.label, render: r => displayValue(f, r[f.key], refOptions), text: r => { const v = displayValue(f, r[f.key], refOptions); return typeof v === "string" ? v : r[f.key]?.url || ""; } })),
    { label: "Action", render: r => (
      <div style={{ display: "flex", gap: 6 }}>
        <Btn small kind="ghost" onClick={() => setViewing(r)} title="View">👁️</Btn>
        {!def.readOnly && <Btn small kind="info" onClick={() => setEditing({ id: r.id, values: stripMeta(r) })} title="Edit">✏️</Btn>}
        {!def.readOnly && <Btn small kind="danger" onClick={() => remove(r)} title="Delete">🗑️</Btn>}
      </div>
    ) },
  ];

  const printList = () => {
    const head = listFields.map(f => `<th>${esc(f.label)}</th>`).join("");
    const body = filtered.map(r => `<tr>${listFields.map(f => { const v = displayValue(f, r[f.key], refOptions); return `<td>${esc(typeof v === "string" ? v : r[f.key]?.name || "")}</td>`; }).join("")}</tr>`).join("");
    printHtml(def.title, `<h2>${esc(titleOverride || def.title)}</h2><table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
  };

  return (
    <>
      <Card title={`${titleOverride || def.title} List`} actions={<>
        {!def.readOnly && <Btn onClick={() => setEditing({ values: { ...(filter || {}) } })}>+ Add</Btn>}
        {!def.readOnly && selected.size > 0 && <Btn kind="danger" onClick={bulkRemove}>🗑 Bulk Delete ({selected.size})</Btn>}
        {!def.readOnly && <label style={{ display: "inline-flex" }}><span style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.line}`, fontWeight: 600, fontSize: 14, cursor: "pointer", background: "white" }}>{importing ? "Importing…" : "⬆ Import CSV"}</span><input type="file" accept=".csv,text/csv" hidden disabled={importing} onChange={e => { importCsv(e.target.files?.[0]); e.target.value = ""; }} /></label>}
        <Btn kind="ghost" onClick={() => exportCsv(`${entityKey}.csv`, columns.filter(c => c.label !== "Action" && typeof c.label === "string"), filtered)}>⬇ CSV</Btn>
        <Btn kind="ghost" onClick={printList}>🖨 Print</Btn>
      </>}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <input placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} style={{ ...inputStyle, maxWidth: 320 }} />
          {filterFields.map(f => (
            <select key={f.key} value={filters[f.key] || ""} onChange={e => { setFilters(p => ({ ...p, [f.key]: e.target.value })); setPage(0); }} style={{ ...inputStyle, maxWidth: 220 }}>
              <option value="">{f.label}: All</option>
              {(f.type === "select" ? f.options.map(o => ({ id: o, label: o })) : (refOptions[f.collection] || []).map(r => ({ id: r.id, label: r[f.labelField] || r.name }))).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          ))}
          <span style={{ alignSelf: "center", color: C.muted, fontSize: 13 }}>{rows ? `${filtered.length} records` : "Loading…"}</span>
        </div>
        {error && <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div>}
        <Table columns={columns} rows={pageRows} empty={rows ? "No records found." : "Loading…"} />
        {pages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12, alignItems: "center" }}>
            <Btn small kind="ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Prev</Btn>
            <span style={{ fontSize: 13, color: C.muted }}>Page {page + 1} / {pages}</span>
            <Btn small kind="ghost" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next ›</Btn>
          </div>
        )}
      </Card>

      {editing && (
        <Modal title={`${editing.id ? "Edit" : "Add"} ${def.title}`} onClose={() => setEditing(null)} footer={<>
          <Btn kind="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
        </>}>
          <SchemaForm fields={def.fields} values={editing.values} setValues={fn => setEditing(p => ({ ...p, values: typeof fn === "function" ? fn(p.values) : fn }))} refOptions={refOptions} folder={entityKey} />
        </Modal>
      )}

      {viewing && (
        <Modal title={def.title} onClose={() => setViewing(null)}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <tbody>
              {def.fields.map(f => (
                <tr key={f.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 6px", color: C.muted, width: "35%", verticalAlign: "top" }}>{f.label}</td>
                  <td style={{ padding: "8px 6px" }}>{f.type === "html" && viewing[f.key] ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(viewing[f.key]) }} /> : displayValue(f, viewing[f.key], refOptions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </>
  );
}

// Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF, BOM).
function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === "," || c === ";") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function stripMeta(r) {
  const { id, createdAt, updatedAt, ...rest } = r;
  return rest;
}

// Admin-authored HTML is shown back to the same Super Admin only; still drop scripts
// and inline event handlers so pasted legacy content can't run code.
export function sanitizeHtml(s) {
  return String(s)
    .replace(/<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}
