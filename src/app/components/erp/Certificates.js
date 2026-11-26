"use client";
// Certificate + ID card templates and generation. Generated certificates are also
// registered as type-9999 documents in erp_documents, so their QR code verifies on
// the public /belge_dogrulama page exactly like the legacy "Sertifika" documents.

import { useEffect, useState } from "react";
import { TEMPLATE_PLACEHOLDERS, STUDENT_FIELDS } from "@/lib/erp/schema";
import { listAll, createRow, updateRow, deleteRow, setRow, getSettings, newVerificationCode, fullName } from "@/lib/erp/data";
import { renderCertificateHtml, studentPlaceholders, qrDataUrl, verificationUrl, esc } from "@/lib/erp/templating";
import { Card, Btn, Modal, Table, Grid, Field, FieldInput, inputStyle, printHtml, useRefOptions, C } from "./ui";

const CERT_FIELDS = [
  { key: "name", label: "Certificate Name", type: "text", required: true },
  { key: "leftHeader", label: "Header Left Text", type: "text" }, { key: "centerHeader", label: "Header Center Text", type: "text" }, { key: "rightHeader", label: "Header Right Text", type: "text" },
  { key: "body", label: "Body Text", type: "html", required: true },
  { key: "leftFooter", label: "Footer Left Text", type: "text" }, { key: "centerFooter", label: "Footer Center Text", type: "text" }, { key: "rightFooter", label: "Footer Right Text", type: "text" },
  { key: "headerHeight", label: "Header Height (px)", type: "number" }, { key: "contentHeight", label: "Body Height (px)", type: "number" }, { key: "footerHeight", label: "Footer Height (px)", type: "number" },
  { key: "width", label: "Width (px)", type: "number" }, { key: "height", label: "Height (px)", type: "number" }, { key: "fontSize", label: "Body Font Size (px)", type: "number" },
  { key: "showPhoto", label: "Student Photo", type: "checkbox" }, { key: "photoTop", label: "Photo Top (px)", type: "number" },
  { key: "showQr", label: "QR Verification Code", type: "checkbox" },
  { key: "background", label: "Background Image", type: "image" },
];

const IDCARD_FIELDS = [
  { key: "title", label: "ID Card Title", type: "text", required: true },
  { key: "schoolName", label: "School Name", type: "text" }, { key: "address", label: "Address / Phone / Email", type: "textarea" },
  { key: "headerColor", label: "Header Color", type: "text" },
  { key: "background", label: "Background Image", type: "image" }, { key: "logo", label: "Logo", type: "image" }, { key: "sign", label: "Signature", type: "image" },
  { key: "showName", label: "Name", type: "checkbox" }, { key: "showFatherName", label: "Father Name", type: "checkbox" }, { key: "showMotherName", label: "Mother Name", type: "checkbox" },
  { key: "showAdmissionNo", label: "Admission No / Staff ID", type: "checkbox" }, { key: "showClass", label: "Class / Designation", type: "checkbox" },
  { key: "showAddress", label: "Address", type: "checkbox" }, { key: "showPhone", label: "Phone", type: "checkbox" }, { key: "showDob", label: "Date Of Birth", type: "checkbox" },
  { key: "showBloodGroup", label: "Blood Group", type: "checkbox" }, { key: "showPassport", label: "Passport No", type: "checkbox" }, { key: "showQr", label: "QR Code", type: "checkbox" },
  { key: "vertical", label: "Vertical Card", type: "checkbox" },
];

function TemplateManager({ collection, fields, title, renderPreview }) {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState("");
  const load = () => listAll(collection, { force: true }).then(setRows).catch(e => { alert(e.message); setRows([]); });
  useEffect(() => { load(); }, [collection]);
  const save = async () => {
    const v = editing.values;
    if (!v[fields[0].key]) { alert(`${fields[0].label} is required`); return; }
    if (editing.id) await updateRow(collection, editing.id, v); else await createRow(collection, v);
    setEditing(null); load();
  };
  return (
    <>
      <Card title={`${title} List`} actions={<Btn onClick={() => setEditing({ values: { width: 1000, height: 700, headerHeight: 80, contentHeight: 380, footerHeight: 80, fontSize: 18, showQr: true, showName: true, showAdmissionNo: true, showClass: true, headerColor: "#E03C31" } })}>+ Add</Btn>}>
        <Table columns={[
          { label: "Name", render: r => r[fields[0].key] },
          { label: "Background Image", render: r => r.background?.url ? <img src={r.background.url} alt="" style={{ height: 40 }} /> : "" },
          { label: "Action", render: r => <div style={{ display: "flex", gap: 6 }}>
            <Btn small kind="ghost" onClick={async () => setPreview(await renderPreview(r))}>👁️</Btn>
            <Btn small kind="info" onClick={() => setEditing({ id: r.id, values: (({ id, createdAt, updatedAt, ...x }) => x)(r) })}>✏️</Btn>
            <Btn small kind="danger" onClick={async () => { if (confirm("Delete template?")) { await deleteRow(collection, r.id); load(); } }}>🗑️</Btn>
          </div> },
        ]} rows={rows || []} empty={rows ? "No templates." : "Loading…"} />
      </Card>
      {editing && (
        <Modal title={`${editing.id ? "Edit" : "Add"} ${title}`} width={1000} onClose={() => setEditing(null)} footer={<>
          <Btn kind="ghost" onClick={async () => setPreview(await renderPreview(editing.values))}>Preview</Btn>
          <Btn kind="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn>
        </>}>
          {collection === "cert_templates" && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>Body placeholders: {TEMPLATE_PLACEHOLDERS.map(p => `[${p}]`).join(" ")}</div>}
          <Grid>{fields.map(f => <Field key={f.key} label={f.label} required={f.required} wide={f.type === "html" || f.type === "textarea"}><FieldInput field={f} value={editing.values[f.key]} onChange={v => setEditing(p => ({ ...p, values: { ...p.values, [f.key]: v } }))} folder={collection} /></Field>)}</Grid>
        </Modal>
      )}
      {preview && <Modal title="Preview" width={1100} onClose={() => setPreview("")}><div style={{ overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: preview }} /></Modal>}
    </>
  );
}

const SAMPLE = { firstName: "Sample", lastName: "Student", dob: "2000-01-01", admissionNo: "100001", gender: "Male", fatherName: "Father", motherName: "Mother", passportNo: "AB1234567", nationality: "Türkiye", mobile: "+90 555 000 0000", email: "student@example.com", admissionDate: "2026-01-01", currentAddress: "İstanbul" };

export function CertTemplates() {
  return <TemplateManager collection="cert_templates" fields={CERT_FIELDS} title="Student Certificate"
    renderPreview={async tpl => renderCertificateHtml(tpl, { ...studentPlaceholders(SAMPLE, { class: "A1", section: "Türkçe Dil Kursu" }), photo: "" }, tpl.showQr ? await qrDataUrl("https://goturkey.gen.tr/belge_dogrulama", 180) : "")} />;
}

export function IdCardTemplates({ kind }) {
  return <TemplateManager collection={kind === "staff" ? "staff_idcard_templates" : "idcard_templates"} fields={IDCARD_FIELDS} title={kind === "staff" ? "Staff ID Card" : "Student ID Card"}
    renderPreview={async tpl => idCardHtml(tpl, kind === "staff" ? { name: "Sample Staff", id: "go101", sub: "Teacher", phone: "+90 555 000 0000" } : { name: "Sample Student", id: "100001", sub: "A1", father: "Father", mother: "Mother", dob: "01.01.2000", phone: "+90 555", passport: "AB1234567", blood: "O+", address: "İstanbul" }, tpl.showQr ? await qrDataUrl("100001", 120) : "")} />;
}

function idCardHtml(tpl, p, qr) {
  const line = (show, label, v) => show && v ? `<div><b>${esc(label)}:</b> ${esc(v)}</div>` : "";
  const w = tpl.vertical ? 240 : 340, h = tpl.vertical ? 380 : 215;
  return `<div style="display:inline-block;vertical-align:top;margin:8px;width:${w}px;height:${h}px;border:1px solid #ccc;border-radius:10px;overflow:hidden;font-family:Arial;font-size:11px;position:relative;${tpl.background?.url ? `background:url('${esc(tpl.background.url)}') center/cover;` : "background:#fff;"}">
    <div style="background:${esc(tpl.headerColor || "#E03C31")};color:#fff;padding:6px 8px;display:flex;gap:6px;align-items:center">${tpl.logo?.url ? `<img src="${esc(tpl.logo.url)}" style="height:28px">` : ""}<div><b style="font-size:12px">${esc(tpl.schoolName || "")}</b><div style="font-size:9px">${esc(tpl.address || "")}</div></div></div>
    <div style="text-align:center;font-weight:bold;margin:4px 0">${esc(tpl.title || "")}</div>
    <div style="display:flex;gap:8px;padding:0 8px">
      <div style="width:70px;height:84px;border:1px solid #ddd;flex-shrink:0;background:#f3f4f6">${p.photo ? `<img src="${esc(p.photo)}" style="width:100%;height:100%;object-fit:cover">` : ""}</div>
      <div style="line-height:1.5">${line(tpl.showName, "Name", p.name)}${line(tpl.showAdmissionNo, "ID", p.id)}${line(tpl.showClass, "Class", p.sub)}${line(tpl.showFatherName, "Father", p.father)}${line(tpl.showMotherName, "Mother", p.mother)}${line(tpl.showDob, "D.O.B", p.dob)}${line(tpl.showPhone, "Phone", p.phone)}${line(tpl.showPassport, "Passport", p.passport)}${line(tpl.showBloodGroup, "Blood", p.blood)}${line(tpl.showAddress, "Address", p.address)}</div>
    </div>
    <div style="position:absolute;bottom:6px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:flex-end">${qr ? `<img src="${qr}" style="width:48px;height:48px">` : "<span></span>"}${tpl.sign?.url ? `<img src="${esc(tpl.sign.url)}" style="height:26px">` : ""}</div>
  </div>`;
}

function usePeople(kind) {
  const [people, setPeople] = useState([]);
  useEffect(() => { listAll(kind === "staff" ? "staff" : "students").then(setPeople).catch(e => alert(e.message)); }, [kind]);
  return people;
}

function Picker({ kind, onGenerate, templatesKey, buttonText }) {
  const people = usePeople(kind);
  const opts = useRefOptions(kind === "staff" ? [{ type: "ref", collection: "designations" }, { type: "ref", collection: "departments" }] : STUDENT_FIELDS);
  const [templates, setTemplates] = useState([]);
  const [crit, setCrit] = useState({ classId: "", sectionId: "", tpl: "" });
  const [sel, setSel] = useState(new Set());
  useEffect(() => { listAll(templatesKey, { force: true }).then(setTemplates).catch(() => {}); }, [templatesKey]);
  const rows = people.filter(p => p.status !== "disabled" && (kind === "staff" ? (!crit.classId || p.designationId === crit.classId) : (!crit.classId || p.classId === crit.classId) && (!crit.sectionId || p.sectionId === crit.sectionId)));
  const groupKey = kind === "staff" ? "designations" : "classes";
  return (
    <>
      <Card title="Select Criteria">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={crit.classId} onChange={e => setCrit(p => ({ ...p, classId: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">{kind === "staff" ? "All Designations" : "All Classes"}</option>{(opts[groupKey] || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          {kind !== "staff" && <select value={crit.sectionId} onChange={e => setCrit(p => ({ ...p, sectionId: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">All Sections</option>{(opts.sections || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          <select value={crit.tpl} onChange={e => setCrit(p => ({ ...p, tpl: e.target.value }))} style={{ ...inputStyle, maxWidth: 260 }}><option value="">Select template</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name || t.title}</option>)}</select>
        </div>
      </Card>
      <Card title={`List (${rows.length})`} actions={<Btn disabled={!sel.size || !crit.tpl} onClick={() => onGenerate(templates.find(t => t.id === crit.tpl), rows.filter(r => sel.has(r.id)), opts)}>{buttonText} ({sel.size})</Btn>}>
        <Table columns={[
          { label: <input type="checkbox" checked={rows.length > 0 && sel.size === rows.length} onChange={e => setSel(e.target.checked ? new Set(rows.map(r => r.id)) : new Set())} />, render: r => <input type="checkbox" checked={sel.has(r.id)} onChange={() => setSel(p => { const s = new Set(p); s.has(r.id) ? s.delete(r.id) : s.add(r.id); return s; })} /> },
          { label: kind === "staff" ? "Staff ID" : "Admission No", render: r => kind === "staff" ? r.staffId : r.admissionNo },
          { label: "Name", render: r => kind === "staff" ? `${r.name || ""} ${r.surname || ""}` : fullName(r) },
          { label: kind === "staff" ? "Designation" : "Class", render: r => (opts[groupKey] || []).find(c => c.id === (kind === "staff" ? r.designationId : r.classId))?.name || "" },
          { label: "Mobile", render: r => r.mobile || r.phone },
        ]} rows={rows.slice(0, 500)} />
      </Card>
    </>
  );
}

export function CertGenerate() {
  const generate = async (tpl, students, opts) => {
    if (!confirm(`Generate ${students.length} certificate(s)? Each gets a verification code.`)) return;
    const general = await getSettings("general").catch(() => ({}));
    const nm = (k, id) => (opts[k] || []).find(r => r.id === id)?.name || "";
    const parts = [];
    for (const s of students) {
      const code = newVerificationCode();
      const values = { ...studentPlaceholders(s, { class: nm("classes", s.classId), section: nm("sections", s.sectionId), category: nm("categories", s.categoryId), session: nm("sessions", s.sessionId) }), photo: s.photo?.url || "" };
      const certHtml = renderCertificateHtml(tpl, values, "");
      await setRow("documents", `${code}_9999`, {
        code, type: "9999", studentId: s.id, studentName: fullName(s), studentEmail: s.email || "", certificateTemplateId: tpl.id,
        issuedAt: new Date().toISOString(), updatedAtText: new Date().toISOString(),
        content: { en: { subject: tpl.name, date: new Date().toLocaleDateString("en-US"), rows: [["Name Surname", values.name], ["ID Card / Passport Number", values.passport_no], ["Certificate", tpl.name]], bodyHtml: certHtml, signature: general.signatoryName ? [general.signatoryTitle || "", general.signatoryName] : [] } },
      }, { merge: false });
      parts.push(renderCertificateHtml(tpl, values, tpl.showQr === false ? "" : await qrDataUrl(verificationUrl(code, "9999"), 180)));
    }
    printHtml("Certificates", parts.join(""), "@page{size:landscape;margin:8mm}");
  };
  return <Picker kind="student" templatesKey="cert_templates" buttonText="Generate" onGenerate={generate} />;
}

export function IdCardGenerate({ kind }) {
  const generate = async (tpl, people, opts) => {
    const parts = [];
    for (const p of people) {
      const data = kind === "staff"
        ? { name: `${p.name || ""} ${p.surname || ""}`.trim(), id: p.staffId, sub: (opts.designations || []).find(d => d.id === p.designationId)?.name, phone: p.phone, photo: p.photo?.url, dob: p.dob, address: p.currentAddress }
        : { name: fullName(p), id: p.admissionNo, sub: (opts.classes || []).find(c => c.id === p.classId)?.name, father: p.fatherName, mother: p.motherName, dob: p.dob, phone: p.mobile, passport: p.passportNo, blood: p.bloodGroup, address: p.currentAddress, photo: p.photo?.url };
      parts.push(idCardHtml(tpl, data, tpl.showQr ? await qrDataUrl(`${data.name} | ${data.id}`, 120) : ""));
    }
    printHtml("ID Cards", parts.join(""), "@page{margin:8mm}");
  };
  return <Picker kind={kind} templatesKey={kind === "staff" ? "staff_idcard_templates" : "idcard_templates"} buttonText="Generate" onGenerate={generate} />;
}
