// lib/erp/templating.js
// Pure helpers shared by the admin UI (client) and the public verification page
// (server): HTML escaping, placeholder filling, QR codes, and the official-document
// layout copied from the legacy belge_dogrulama pages.

import QRCode from "qrcode";
import { DOCUMENT_TYPES } from "./schema";

export const PUBLIC_BASE_URL = (process.env.NEXT_PUBLIC_VERIFY_BASE_URL || "https://goturkey.gen.tr").replace(/\/+$/, "");

export function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Strips script-capable markup from stored rich text before it is rendered. */
export function safeHtml(s) {
  return String(s ?? "")
    .replace(/<\s*(script|iframe|object|embed|style|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "$1=$2#$2");
}

/** Replaces legacy-style [placeholder] tokens with escaped student values. */
export function fillPlaceholders(template, values) {
  return String(template ?? "").replace(/\[([a-z_]+)\]/gi, (m, k) => (k.toLowerCase() in values ? esc(values[k.toLowerCase()]) : m));
}

/** Placeholder values for a student record (+ resolved lookup names). */
export function studentPlaceholders(s, names = {}) {
  return {
    name: [s.firstName, s.lastName].filter(Boolean).join(" "),
    dob: s.dob || "", present_address: s.currentAddress || "", guardian: s.guardianName || s.fatherName || "",
    created_at: s.createdAtText || "", admission_no: s.admissionNo || "", roll_no: s.rollNo || "",
    class: names.class || "", section: names.section || "", gender: s.gender || "",
    admission_date: s.admissionDate || "", category: names.category || "", cast: s.caste || "",
    father_name: s.fatherName || "", mother_name: s.motherName || "", religion: s.religion || "",
    email: s.email || "", phone: s.mobile || "", passport_no: s.passportNo || "", nationality: s.nationality || "",
    session: names.session || "",
  };
}

export function verificationUrl(code, type) {
  return `${PUBLIC_BASE_URL}/belge_dogrulama/${encodeURIComponent(code)}/${encodeURIComponent(type)}`;
}

export async function qrDataUrl(text, size = 128) {
  return QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: "M" });
}

const LABELS = {
  en: { number: "Number", taxNumber: "Company Tax Number", subject: "Subject", date: "Date", verificationCode: "Verification Code",
        validation: (code) => `<b>Document Validation:</b> You can verify this document by reading the QR code or by entering the verification code <b>(${esc(code)})</b> at <b>${esc(PUBLIC_BASE_URL)}/belge_dogrulama</b>`,
        address: "Address", web: "Web Addresses", email: "E-Mail", gsm: "GSM" },
  tr: { number: "Sayı", taxNumber: "Şirket Vergi Numarası", subject: "Konu", date: "Tarih", verificationCode: "Doğrulama Kodu",
        validation: (code) => `<b>Belge Doğrulama:</b> Bu belgeyi QR kodu okutarak veya <b>${esc(PUBLIC_BASE_URL)}/belge_dogrulama</b> adresine <b>(${esc(code)})</b> doğrulama kodunu girerek doğrulayabilirsiniz.`,
        address: "Adres", web: "Web Adresleri", email: "E-Posta", gsm: "GSM" },
};

/** "{today}" in a document date renders as the current date (the legacy behaviour). */
export function resolveDate(value, lang) {
  if (value !== "{today}") return value || "";
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0"), y = d.getFullYear();
  return lang === "tr" ? `${dd}.${mm}.${y}` : `${mm}.${dd}.${y}`;
}

/**
 * Renders an issued document (migrated or new) to an HTML fragment, reproducing the
 * legacy belge_dogrulama layout. doc: { code, type, content: { en, tr } }, where each
 * language's content is:
 *   { logos: [url], heading, infoPairs: [[label, value]], subjectLabel, subject, dateLabel, date,
 *     title, rows: [[label, value]], rowsPerLine: 1|2, bodyHtml, signature: [line],
 *     verifyHtml, notice, footerPairs: [[label, value]] }
 * settings (erp_settings/general) fills in logos/notice/footer for documents that omit them.
 */
export function renderDocumentHtml(doc, lang, qr, settings = {}) {
  const L = LABELS[lang] || LABELS.en;
  const c = (doc.content && (doc.content[lang] || doc.content.en || doc.content.tr)) || {};
  const typeName = DOCUMENT_TYPES[doc.type]?.[lang] || DOCUMENT_TYPES[doc.type]?.en || "";
  const logos = (c.logos?.length ? c.logos : [settings.headerLogoLeft?.url, settings.headerLogoCenter?.url, settings.headerLogoRight?.url]).filter(Boolean);
  const cell = "padding:3px 6px;border:1px solid #dee2e6";
  const perLine = c.rowsPerLine === 2 ? 2 : 1;
  const rowsHtml = [];
  const rows = c.rows || [];
  for (let i = 0; i < rows.length; i += perLine) {
    const chunk = rows.slice(i, i + perLine);
    const span = perLine === 2 && chunk.length === 1 ? ' colspan="2"' : "";
    rowsHtml.push(`<tr>${chunk.map(([k, v]) => `<td${span} style="${cell};width:${perLine === 2 ? 23 : 45}%">${esc(k)}</td><td${span} style="${cell}"><b>${esc(v)}</b></td>`).join("")}</tr>`);
  }
  const info = (c.infoPairs || []).map(([k, v]) => `<b>${esc(k)} :</b> ${esc(v)}`).join("<br>");
  const sig = (c.signature || []).map(l => `<b>${esc(l)}</b>`).join("<br>");
  const footerPairs = c.footerPairs || [
    settings.address && [L.address, settings.address], settings.website && [L.web, settings.website],
    settings.email && [L.email, settings.email], settings.gsm && [L.gsm, settings.gsm],
  ].filter(Boolean);
  const footer = footerPairs.map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`).join("<br>");
  const notice = c.notice ?? (lang === "tr" ? settings.documentNoticeTr : settings.documentNotice);

  return `
<div class="gt-doc" style="max-width:820px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111;line-height:1.45">
  ${logos.length ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">${logos.map(u => `<img src="${esc(u)}" alt="" style="height:100px;max-width:32%;object-fit:contain">`).join("")}</div>` : ""}
  ${c.heading ? `<h4 style="text-align:center;margin:6px 0;font-size:14px">${esc(c.heading)}</h4>` : ""}
  ${info ? `<div style="margin-top:6px">${info}</div>` : ""}
  <div style="display:flex;justify-content:space-between;gap:12px;margin:6px 0">
    <span><b>${esc(c.subjectLabel || L.subject)} :</b> ${esc(c.subject || typeName)}</span>
    <span style="white-space:nowrap"><b>${esc(c.dateLabel || L.date)} :</b> ${esc(resolveDate(c.date, lang))}</span>
  </div>
  ${c.title ? `<h4 style="text-align:center;margin:8px 0;font-size:14px">${esc(c.title)}</h4>` : ""}
  ${rowsHtml.length ? `<table style="width:100%;border-collapse:collapse;font-size:12px;margin:6px 0">${rowsHtml.join("")}</table>` : ""}
  ${c.bodyHtml ? `<div style="margin:10px 0;text-align:justify;text-indent:35px">${safeHtml(c.bodyHtml)}</div>` : ""}
  ${sig ? `<div style="display:flex;justify-content:flex-end;margin:14px 0"><div style="text-align:center">${sig}</div></div>` : ""}
  <table style="width:100%;border-collapse:collapse;font-size:12px;margin:8px 0"><tr>
    <td style="width:20%;text-align:center;${cell};padding:6px"><b>${L.verificationCode}</b><br>${qr ? `<img src="${qr}" alt="QR" style="width:96px;height:96px;margin:4px auto;display:block">` : ""}<b style="word-break:break-all">${esc(doc.code)}</b></td>
    <td style="${cell};padding:8px;vertical-align:middle">${L.validation(doc.code)}</td>
  </tr></table>
  ${notice ? `<div style="margin:6px 0;text-align:justify"><b>${esc(notice)}</b></div>` : ""}
  ${footer ? `<div style="font-size:12px">${footer}</div>` : ""}
</div>`;
}

/** Fills a certificate/ID-card template object (legacy field layout) for one student. */
export function renderCertificateHtml(tpl, values, qr) {
  const fill = s => fillPlaceholders(s, values);
  const bg = tpl.background?.url ? `background-image:url('${esc(tpl.background.url)}');background-size:100% 100%;` : "";
  return `
<div style="position:relative;width:${tpl.width || 1000}px;min-height:${tpl.height || 700}px;margin:0 auto 24px;${bg}border:1px solid #ddd;box-sizing:border-box;padding:40px;page-break-after:always;font-family:Georgia,serif">
  <div style="display:flex;justify-content:space-between;height:${tpl.headerHeight || 80}px;font-size:14px"><div>${fill(tpl.leftHeader)}</div><div style="text-align:center">${fill(tpl.centerHeader)}</div><div style="text-align:right">${fill(tpl.rightHeader)}</div></div>
  ${tpl.showPhoto && values.photo ? `<img src="${esc(values.photo)}" alt="" style="position:absolute;top:${tpl.photoTop || 40}px;right:40px;width:100px;height:120px;object-fit:cover;border:1px solid #ccc">` : ""}
  <div style="min-height:${tpl.contentHeight || 380}px;font-size:${tpl.fontSize || 18}px;line-height:1.7;text-align:center;padding:20px 40px">${safeHtml(fill(tpl.body))}</div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;height:${tpl.footerHeight || 80}px;font-size:14px"><div>${fill(tpl.leftFooter)}</div><div style="text-align:center">${fill(tpl.centerFooter)}${qr ? `<br><img src="${qr}" alt="QR" style="width:90px;height:90px">` : ""}</div><div style="text-align:right">${fill(tpl.rightFooter)}</div></div>
</div>`;
}
