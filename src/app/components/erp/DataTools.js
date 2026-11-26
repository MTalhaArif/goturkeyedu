"use client";
// Backup / Restore of all ERP data, and the one-time Legacy Data Import that loads the
// output of scripts/legacy/transform.mjs (plus the downloaded legacy upload files).

import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ENTITIES, SETTINGS } from "@/lib/erp/schema";
import { bulkSet, saveSettings, getSettings } from "@/lib/erp/data";
import { Card, Btn, C } from "./ui";

// Collections that are not generic ENTITIES but belong to the ERP.
const EXTRA = ["students", "student_fees", "fee_payments", "documents", "student_attendance", "cert_templates", "idcard_templates", "staff_idcard_templates"];
export const ALL_COLLECTIONS = [...new Set([...Object.keys(ENTITIES), ...EXTRA])];
const SETTINGS_KEYS = [...Object.keys(SETTINGS), "document_templates", "document_counters"];

function download(name, obj) {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function Backup() {
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);

  const backup = async () => {
    setBusy(true); setLog("Reading collections…");
    try {
      const out = { version: 1, exportedAt: new Date().toISOString(), collections: {}, settings: {} };
      for (const k of ALL_COLLECTIONS) {
        const snap = await getDocs(collection(db, `erp_${k}`));
        out.collections[k] = snap.docs.map(d => ({ id: d.id, ...JSON.parse(JSON.stringify(d.data())) }));
      }
      for (const k of SETTINGS_KEYS) out.settings[k] = await getSettings(k).catch(() => ({}));
      download(`goturkey-erp-backup-${new Date().toISOString().slice(0, 10)}.json`, out);
      setLog(`Backup downloaded: ${Object.values(out.collections).reduce((a, r) => a + r.length, 0)} records.`);
    } catch (e) { setLog(e.message); } finally { setBusy(false); }
  };

  const restore = async file => {
    if (!file) return;
    if (!confirm("Restore will write every record in this backup (existing records with the same id are overwritten). Continue?")) return;
    setBusy(true);
    try {
      const data = JSON.parse(await file.text());
      await importData(data, null, setLog);
    } catch (e) { setLog(e.message); } finally { setBusy(false); }
  };

  return (
    <Card title="Backup / Restore">
      <p style={{ fontSize: 14, color: C.muted, marginTop: 0 }}>Download every ERP record (students, fees, documents, settings, …) as one JSON file, or restore from such a file. Uploaded files stay in Storage and are referenced by link.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Btn onClick={backup} disabled={busy}>⬇ Download Backup</Btn>
        <label style={{ fontSize: 14 }}>Restore from file: <input type="file" accept="application/json" disabled={busy} onChange={e => restore(e.target.files?.[0])} /></label>
      </div>
      {log && <pre style={{ marginTop: 16, background: C.soft, padding: 12, borderRadius: 8, fontSize: 12.5, whiteSpace: "pre-wrap" }}>{log}</pre>}
    </Card>
  );
}

// Replaces legacy file markers with uploaded Storage files:
//   { legacyPath, name } → { url, name, path }       "legacy:<path>" → url
// Anything not uploaded keeps pointing at the legacy site (still works while it is up).
function resolveFiles(value, fileMap, legacyBase) {
  if (Array.isArray(value)) return value.map(v => resolveFiles(v, fileMap, legacyBase));
  if (value && typeof value === "object") {
    if (typeof value.legacyPath === "string") {
      const hit = fileMap?.[value.legacyPath];
      return hit ? { url: hit.url, name: value.name || hit.name, path: hit.path } : { url: `${legacyBase}/${value.legacyPath}`, name: value.name || value.legacyPath.split("/").pop(), legacyPath: value.legacyPath };
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveFiles(v, fileMap, legacyBase)]));
  }
  if (typeof value === "string" && value.startsWith("legacy:")) {
    const p = value.slice(7);
    return fileMap?.[p]?.url || `${legacyBase}/${p}`;
  }
  return value;
}

async function importData(data, fileMap, setLog) {
  const legacyBase = data.legacyBase || "https://goturkey.gen.tr";
  const lines = [];
  const say = s => { lines.push(s); setLog(lines.join("\n")); };
  for (const [key, rows] of Object.entries(data.collections || {})) {
    if (!ALL_COLLECTIONS.includes(key)) { say(`skipped unknown collection ${key}`); continue; }
    const resolved = rows.map(r => resolveFiles(r, fileMap, legacyBase));
    await bulkSet(key, resolved, (n, t) => { lines[lines.length - 1] = `${key}: ${n}/${t}`; setLog(lines.join("\n")); });
    say(`${key}: ${rows.length} records ✔`);
  }
  for (const [key, val] of Object.entries(data.settings || {})) {
    const existing = await getSettings(key).catch(() => ({}));
    // Never clobber settings an admin already filled in — only add missing fields.
    const merged = { ...resolveFiles(val, fileMap, legacyBase) };
    for (const [k, v] of Object.entries(existing)) if (v !== "" && v != null && k !== "updatedAt") merged[k] = v;
    await saveSettings(key, merged);
    say(`settings/${key} ✔`);
  }
  say("Import complete.");
}

export function LegacyImport() {
  const [importFile, setImportFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!importFile) return;
    if (!confirm("Import the legacy data into the ERP collections? Re-running is safe: records keep their ids and are overwritten, not duplicated.")) return;
    setBusy(true);
    try {
      const data = JSON.parse(await importFile.text());
      let fileMap = (await getSettings("legacy_files").catch(() => ({}))).map || {};
      if (files.length) {
        // Folder chosen = the "files" directory of the extraction; its relative paths
        // ("files/uploads/...") map 1:1 to the legacy site's /uploads/... paths.
        let done = 0;
        for (const f of files) {
          const rel = (f.webkitRelativePath || f.name).split("/").slice(1).join("/");
          if (!rel || fileMap[rel]) { done++; continue; }
          const path = `legacy/${rel}`;
          const r = sref(storage, path);
          await uploadBytes(r, f, { contentType: f.type || "application/octet-stream" });
          fileMap[rel] = { url: await getDownloadURL(r), name: f.name, path };
          done++;
          if (done % 10 === 0) setLog(`Uploading files… ${done}/${files.length}`);
        }
        await saveSettings("legacy_files", { map: fileMap });
        setLog(`Uploaded files: ${files.length}`);
      }
      await importData(data, fileMap, setLog);
    } catch (e) { setLog(`Error: ${e.message}`); } finally { setBusy(false); }
  };

  return (
    <Card title="Legacy Data Import (goturkey.gen.tr)">
      <ol style={{ fontSize: 14, lineHeight: 1.8, marginTop: 0 }}>
        <li>On the PC that has the extraction folder, run <code>node scripts/legacy/transform.mjs &quot;&lt;extraction folder&gt;\full&quot;</code> — it writes <code>legacy-import.json</code>.</li>
        <li>Choose that <b>legacy-import.json</b> below.</li>
        <li>Optionally choose the extraction&apos;s <b>files</b> folder so student photos/documents and letter logos are copied into Firebase Storage (otherwise they keep loading from the old site).</li>
        <li>Click Import. It is safe to run again.</li>
      </ol>
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <label style={{ fontSize: 14 }}>Import file: <input type="file" accept="application/json" onChange={e => setImportFile(e.target.files?.[0] || null)} /></label>
        <label style={{ fontSize: 14 }}>Files folder (optional): <input type="file" webkitdirectory="" directory="" multiple onChange={e => setFiles([...(e.target.files || [])])} /> {files.length > 0 && <span>{files.length} files</span>}</label>
        <div><Btn onClick={run} disabled={!importFile || busy}>{busy ? "Importing…" : "Import"}</Btn></div>
      </div>
      {log && <pre style={{ marginTop: 16, background: C.soft, padding: 12, borderRadius: 8, fontSize: 12.5, whiteSpace: "pre-wrap", maxHeight: 360, overflowY: "auto" }}>{log}</pre>}
    </Card>
  );
}
