#!/usr/bin/env node
// Turns the read-only extraction of the legacy Smart School portal (goturkey.gen.tr)
// into one import file for System Settings → Legacy Data Import.
//
//   node scripts/legacy/transform.mjs "<extraction>/full"
//
// Reads  <full>/extract.json, <full>/pages/*.html, <full>/pages_tr/*.html
// Writes <full>/../legacy-import.json  and  <full>/../files-needed.txt (legacy /uploads
//        paths referenced by the data that are not yet in <full>/files).
// Legacy ids are kept (prefixed) so re-importing overwrites instead of duplicating.
// Credentials found in the legacy settings (payment gateway, SMTP passwords) are NOT exported.

import fs from "node:fs";
import path from "node:path";

const FULL = process.argv[2];
if (!FULL || !fs.existsSync(path.join(FULL, "extract.json"))) {
  console.error('usage: node scripts/legacy/transform.mjs "<extraction>/full"');
  process.exit(1);
}
const ex = JSON.parse(fs.readFileSync(path.join(FULL, "extract.json"), "utf8"));
const LEGACY = "https://goturkey.gen.tr";
const slug = p => p.replace(/^\/+|\/+$/g, "").replace(/[^A-Za-z0-9._-]+/g, "_") || "root";
const page = p => { const f = path.join(FULL, "pages", slug(p) + ".html"); return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : ""; };
const pagesOf = kind => Object.entries(ex).filter(([, v]) => v.kind === kind);
const byPattern = re => Object.entries(ex).filter(([k]) => re.test(k));
const form0 = v => (v?.forms || []).find(f => Object.keys(f.values).some(k => k !== "ci_csrf_token")) || { values: {} };
const val = x => Array.isArray(x) ? (x.length === 2 && typeof x[0] === "string" && typeof x[1] === "string" ? x[0] : x[0]?.[0] ?? "") : (x ?? "");
const label = x => Array.isArray(x) ? (x.length === 2 && typeof x[0] === "string" ? x[1] : x[0]?.[1] ?? "") : (x ?? "");
const idFrom = (url, re) => (url.match(re) || [])[1];
const decode = s => String(s ?? "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&uuml;/g, "ü").replace(/&ccedil;/g, "ç").replace(/&ouml;/g, "ö").replace(/&lsquo;|&rsquo;/g, "'");
const text = s => decode(String(s ?? "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const neededFiles = new Set();
const fileRef = (url, name) => {
  if (!url) return null;
  const m = String(url).match(/\/(uploads\/[^?#"']+)/);
  if (!m || /no_image|default_(fe)?male/.test(m[1])) return null;
  const p = decodeURIComponent(m[1]).replace(/\/+/g, "/");
  neededFiles.add(p);
  return { legacyPath: p, name: name || p.split("/").pop() };
};
const legacyUrl = url => { const r = fileRef(url); return r ? `legacy:${r.legacyPath}` : url; };
function isoDate(s) { // dd.mm.yyyy → yyyy-mm-dd
  const m = String(s || "").match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : (s || "");
}
const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
function isoDateTime(s) { // "23 Nov, 2026 23:29"
  const m = String(s || "").match(/(\d{1,2}) (\w{3}), (\d{4})(?: (\d{2}):(\d{2}))?/);
  return m ? `${m[3]}-${MONTHS[m[2]]}-${m[1].padStart(2, "0")}T${m[4] || "00"}:${m[5] || "00"}:00+03:00` : "";
}
const tableRows = (p, headerIncludes) => {
  const t = (ex[p]?.tables || []).find(t => !headerIncludes || t.headers.some(h => h.includes(headerIncludes)));
  return t ? t.rows.map((r, i) => ({ cells: r, links: t.links[i] || [] })) : [];
};
const now = new Date().toISOString();
const out = { version: 1, source: LEGACY, legacyBase: LEGACY, generatedAt: now, collections: {}, settings: {} };
const put = (key, rows) => { out.collections[key] = (out.collections[key] || []).concat(rows.filter(Boolean)); };
const legacyExtra = (values, used) => Object.fromEntries(Object.entries(values).filter(([k, v]) => !used.includes(k) && k !== "ci_csrf_token" && v !== "" && !(Array.isArray(v) && !v.length)).map(([k, v]) => [k, Array.isArray(v) ? (label(v) || val(v)) : v]));

// ── Lookups ─────────────────────────────────────────────────────────────────────
const simpleList = (listPath, editRe, prefix, nameKey, extra = () => ({})) =>
  tableRows(listPath).map(({ cells, links }) => {
    const id = links.map(l => idFrom(l, editRe)).find(Boolean);
    if (!id) return null;
    const editKey = Object.keys(ex).find(k => editRe.test(k) && idFrom(k, editRe) === id);
    const f = editKey ? form0(ex[editKey]).values : {};
    return { id: `${prefix}${id}`, legacyId: id, name: f[nameKey] ? decode(f[nameKey]) : cells[0], ...extra(f, cells) };
  });

put("categories", tableRows("/category").map(({ cells }) => ({ id: `cat${cells[1]}`, legacyId: cells[1], name: cells[0] })));
put("sections", simpleList("/sections", /\/sections\/edit\/(\d+)/, "sec", "section"));
const sectionByName = Object.fromEntries(out.collections.sections.map(s => [s.name, s.id]));
put("classes", simpleList("/classes", /\/classes\/edit\/(\d+)/, "c", "class", (f, cells) => ({
  sectionIds: String(cells[1] || "").split(/(?<=\))\s+(?=[A-ZÇĞİÖŞÜ])|\n/).map(s => sectionByName[s.trim()]).filter(Boolean)
    .concat(Object.entries(sectionByName).filter(([n]) => String(cells[1] || "").includes(n)).map(([, id]) => id)).filter((v, i, a) => a.indexOf(v) === i),
  description: f.description || "", shortDescription: f.short_desc && f.short_desc !== "." ? f.short_desc : "",
})));
const sessionRows = tableRows("/sessions");
put("sessions", sessionRows.map(({ cells, links }) => { const id = links.map(l => idFrom(l, /\/sessions\/edit\/(\d+)/)).find(Boolean); return id && { id: `ses${id}`, legacyId: id, name: cells[0], active: /active/i.test(cells[1] || "") }; }));
const sessionByName = Object.fromEntries(out.collections.sessions.map(s => [s.name, s.id]));
put("subjects", byPattern(/^\/admin\/subject\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); return { id: `sub${id}`, legacyId: id, name: f.name, code: f.code, type: f.type === "practical" ? "Practical" : "Theory" }; }));
put("subject_groups", byPattern(/^\/admin\/subjectgroup\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); const subj = [].concat(f["subject[]"] || []); return { id: `sg${id}`, legacyId: id, name: f.name, classId: val(f.class_id) ? `c${val(f.class_id)}` : "", subjectIds: subj.map(s => `sub${s}`), description: f.description || "" }; }));
put("disable_reasons", simpleList("/admin/disable_reason", /\/disable_reason\/edit\/(\d+)/, "dr", "name"));
put("departments", tableRows("/admin/department/department").map(({ cells, links }) => { const id = links.map(l => idFrom(l, /departmentedit\/(\d+)/)).find(Boolean); return id && { id: `dep${id}`, legacyId: id, name: cells[0] }; }));
put("designations", tableRows("/admin/designation/designation").map(({ cells, links }) => { const id = links.map(l => idFrom(l, /designationedit\/(\d+)/)).find(Boolean); return id && { id: `des${id}`, legacyId: id, name: cells[0] }; }));
put("roles", tableRows("/admin/roles").map(({ cells, links }) => {
  const id = links.map(l => idFrom(l, /roles\/(?:permission|edit)\/(\d+)/)).find(Boolean); if (!id) return null;
  const perm = ex[`/admin/roles/permission/${id}`]; const pf = perm ? form0(perm).values : {};
  const permTable = perm?.tables?.find(t => t.headers.includes("Module"));
  return { id: `role${id}`, legacyId: id, name: cells[0], system: /system/i.test(cells[1] || ""), permissions: permTable ? permTable.rows.map(r => r.filter(Boolean).join(" › ")).join("\n") : "", legacyPermissionIds: [].concat(pf["per_cat[]"] || []) };
}));
const gradeTable = (ex["/admin/grade"]?.tables || []).find(t => t.rows.some(r => / To /.test(r[1] || "")));
put("grades", (gradeTable ? gradeTable.rows.map((r, i) => ({ cells: r, links: gradeTable.links[i] || [] })) : []).filter(r => r.cells.length >= 3 && /To/.test(r.cells[1] || "")).map(({ cells, links }) => {
  const id = links.map(l => idFrom(l, /grade\/edit\/(\d+)/)).find(Boolean); const [from, upto] = cells[1].split(/\s*To\s*/).map(Number);
  return id && { id: `gr${id}`, legacyId: id, name: cells[0], percentFrom: from, percentUpto: upto, gradePoint: Number(cells[2]) || 0 };
}));
put("exam_groups", tableRows("/admin/examgroup").map(({ cells, links }) => { const id = links.map(l => idFrom(l, /examgroup\/edit\/(\d+)/)).find(Boolean); return id && { id: `eg${id}`, legacyId: id, name: cells[0], examType: cells[2] || "", description: "" }; }));

// Fees masters
put("fee_groups", byPattern(/^\/admin\/feegroup\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); return { id: `fg${id}`, legacyId: id, name: f.name, description: f.description || "" }; }));
put("fee_types", byPattern(/^\/admin\/feetype\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); return { id: `ft${id}`, legacyId: id, name: f.name, code: f.code, description: f.description || "" }; }));
put("fee_discounts", byPattern(/^\/admin\/feediscount\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); return { id: `fd${id}`, legacyId: id, name: f.name, code: f.code, amount: Number(f.amount) || 0, description: f.description || "" }; }));
const feeGroupByName = Object.fromEntries(out.collections.fee_groups.map(g => [g.name, g.id]));
const feeTypeByCode = Object.fromEntries(out.collections.fee_types.map(t => [t.code, t.id]));

// Form services (custom add-on) — priced services on the online admission form
put("form_services", tableRows("/admin/custom/admission_form").map(({ cells }) => cells[1] && { id: `fs${cells[0]}`, legacyId: cells[0], title: cells[1], price: Number(cells[2]) || 0, status: "active" }));

// ── Students ────────────────────────────────────────────────────────────────────
const searchAll = tableRows("/student/searchAll");
// Keyed by legacy student id — from the view link, or the edit link for students whose
// view page errors on the legacy server.
const listInfo = Object.fromEntries(searchAll.map(({ cells, links }) => [links.map(l => idFrom(l, /student\/(?:view|edit)\/(\d+)/)).find(Boolean), cells]).filter(([k, c]) => k && c[0] !== "Admission No"));
const students = [];
for (const [k, v] of pagesOf("student_edit")) {
  const sid = String(v.id ?? idFrom(k, /(\d+)$/));
  const f = form0(v).values;
  const view = page(`/student/view/${sid}`);
  const li = {};
  for (const m of view.matchAll(/<b>([^<]+)<\/b>\s*<a class="pull-right text-aqua">([\s\S]*?)<\/a>/g)) li[m[1].trim()] = text(m[2]);
  const photo = (view.match(/profile-user-img[^>]*src="([^"]+)"/) || [])[1];
  const sessionName = (li.class || "").match(/\((\d{4}-\d{2})\)\s*$/)?.[1];
  const uploads = [];
  const docTable = (ex[`/student/view/${sid}`]?.tables || []).find(t => t.headers.includes("Title") && t.headers.includes("file name"));
  for (const [i, r] of (docTable?.rows || []).entries()) {
    const link = (docTable.links[i] || []).find(l => /uploads|download/.test(l));
    if (r[0] && r[0] !== "No Record Found") uploads.push({ title: r[0], file: fileRef(link, r[1]) || { legacyPath: "", name: r[1] }, at: "" });
  }
  const listClass = listInfo[sid]?.[2] || "";
  const s = {
    id: `s${sid}`, legacyId: sid,
    admissionNo: li["Admission No"] || listInfo[sid]?.[0] || "", rollNo: li["Roll Number"] || "",
    listClassText: li.class || listClass,
    classId: val(f.class_id) ? `c${val(f.class_id)}` : "", sectionId: val(f.section_id) ? `sec${val(f.section_id)}` : (sectionByName[li.Section] || ""),
    sessionId: sessionByName[sessionName] || "",
    firstName: decode(f.firstname || ""), lastName: decode(f.lastname || ""),
    gender: label(f.gender) || val(f.gender) || listInfo[sid]?.[4] || "",
    dob: isoDate(f.dob), categoryId: val(f.category_id) ? `cat${val(f.category_id)}` : "",
    mobile: f.mobileno || "", email: f.email || "", passportNo: f.tc || "", nationality: label(f.nationality) || "",
    admissionDate: isoDate(f.admission_date), fatherName: decode(f.father_name || ""), fatherPhone: f.father_phone || "", motherName: decode(f.mother_name || ""),
    bankAccountNo: f.bank_account_no || "", bankName: f.bank_name || "", rte: f.rte || "No", note: f.note || "",
    photo: fileRef(photo), uploads, timeline: [], status: "active",
    legacy: legacyExtra(f, ["student_id", "sibling_name", "sibling_id", "class_id", "section_id", "firstname", "studentid", "lastname", "gender", "dob", "category_id", "mobileno", "email", "tc", "admission_date", "nationality", "father_name", "father_phone", "mother_name", "bank_account_no", "bank_name", "rte", "note"]),
    importedAt: now,
  };
  s.fullName = [s.firstName, s.lastName].filter(Boolean).join(" ");
  students.push(s);
}
// Students that appear in the list but whose edit page could not be fetched: keep the list data.
for (const [sid, cells] of Object.entries(listInfo)) {
  if (students.some(s => s.legacyId === sid)) continue;
  const [first, ...rest] = String(cells[1] || "").split(" ");
  students.push({ id: `s${sid}`, legacyId: sid, admissionNo: cells[0], firstName: first, lastName: rest.join(" "), fullName: cells[1], dob: isoDate(cells[3]), gender: cells[4], mobile: cells[5], status: "active", partial: true, importedAt: now });
}
const disabledIds = new Set(tableRows("/student/disablestudentslist").flatMap(r => r.links.map(l => idFrom(l, /student\/view\/(\d+)/))).filter(Boolean));
for (const s of students) if (disabledIds.has(s.legacyId)) s.status = "disabled";
put("students", students);
const studentByLegacy = Object.fromEntries(students.map(s => [s.legacyId, s]));

// Fees per student (addfee pages): fee lines + payments
const feeLines = [], payments = [];
const studentsByAdmission = {}; for (const s of students) (studentsByAdmission[s.admissionNo] ||= []).push(s);
const norm = s => String(s || "").toLocaleUpperCase("tr").replace(/\s+/g, " ").trim();
function feePageStudent(v) {
  if (Array.isArray(v.id)) return studentByLegacy[String(v.id[0])];
  // Scanned fee pages: identify by admission no + name (admission numbers repeat across sessions).
  const head = (v.tables || []).find(t => t.headers.includes("name") && t.headers.includes("class_section"));
  if (!head) return null;
  const name = head.headers[0] === "name" ? head.rows[0]?.[0] : "";
  const adm = head.rows.flat().find((c, i, a) => a[i - 1] === "Admission No");
  const cands = studentsByAdmission[adm] || [];
  return cands.find(s => norm(s.fullName) === norm(name)) || (cands.length === 1 ? cands[0] : null);
}
const seenFeePages = new Set();
const hasFeeData = v => (v.tables || []).some(t => t.headers.includes("fees_group") && t.rows.some(r => r[4] && r[4] !== "grand_total"));
for (const [, v] of [...pagesOf("student_fees"), ...pagesOf("student_fees_scan")]) {
  const feeId = Array.isArray(v.id) ? v.id[1] : v.id;
  let st = feePageStudent(v);
  // Fee records whose student was deleted on the legacy site (blank student header):
  // keep the payment history under a clearly labelled, disabled placeholder student.
  if (!st && hasFeeData(v)) {
    st = { id: `sfee${feeId}`, legacyId: `fee-session-${feeId}`, admissionNo: "", firstName: "Unlinked legacy fee record", lastName: `#${feeId}`, fullName: `Unlinked legacy fee record #${feeId}`, status: "disabled", disableNote: "Student was deleted on the legacy site; fee history kept for finance reports.", importedAt: now };
    students.push(st);
  }
  if (!st) continue;
  if (seenFeePages.has(String(feeId))) continue; seenFeePages.add(String(feeId));
  const t = (v.tables || []).find(t => t.headers.includes("fees_group"));
  let line = null;
  for (const r of t?.rows || []) {
    const [, group, code, due, status, amount, payId, mode, date, discount, fine, paid] = r;
    if (status === "grand_total" || (!group && !payId)) continue;
    if (group) {
      const groupName = group.replace(/\s*\([^)]*\)\s*$/, "").trim(); // "Group (Type)" → "Group"
      line = { id: `sf${st.legacyId}_${feeLines.length}`, studentId: st.id, feeGroupId: feeGroupByName[groupName] || "", feeTypeId: feeTypeByCode[code] || "", title: feeGroupByName[groupName] ? "" : group, amount: money(String(amount).split("+")[0]), fineAmount: money(String(amount).split("+")[1]), dueDate: isoDate(due), legacyStatus: status };
      feeLines.push(line);
    }
    if (payId && line) payments.push({ id: `fp${st.legacyId}_${payments.length}`, studentId: st.id, studentFeeId: line.id, receiptNo: payId, mode: mode || "", date: isoDate(date), amount: money(paid), discount: money(discount), fine: money(fine) });
  }
}
// "₺1,771.52" / "271.52" / "1.771,52" → number (first number in the string).
function money(s) {
  const m = String(s || "").match(/-?[\d.,]+/); if (!m) return 0;
  let v = m[0];
  if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, "").replace(",", "."); else v = v.replace(/,/g, "");
  return Number(v) || 0;
}
put("students", students.filter(s => s.id.startsWith("sfee"))); // placeholders created above
put("student_fees", feeLines);
put("fee_payments", payments);

// ── Issued documents (EN + TR) ──────────────────────────────────────────────────
function parseDoc(html) {
  if (!html || !/class="container"/.test(html)) return null;
  const b = html.slice(html.indexOf("<body"));
  const logosBlock = (b.match(/<div class="col-md-12 d-flex mb-2"[\s\S]*?<\/div>/) || [""])[0];
  const logos = [...logosBlock.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => legacyUrl(m[1]));
  const heading = text((b.match(/<h6 class="text-capitalize"[^>]*>([\s\S]*?)<\/h6>/) || [])[1]);
  const infoBlock = (b.match(/<div class="col-md-12 mt-2">([\s\S]*?)<\/div>/) || [])[1] || "";
  const infoPairs = [...infoBlock.matchAll(/<b>([^<]*?)\s*:?\s*:\s*<\/b>\s*([^<]*)/g)].map(m => [text(m[1]).replace(/:$/, "").trim(), text(m[2])]).filter(p => p[1]);
  // Subject + date live in the "d-flex mb-1" block as two <p><b>Label : </b>value</p>.
  const subjBlock = (b.match(/<div class="col-md-12 d-flex mb-1[^"]*"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || "";
  const subj = subjBlock.match(/<p[^>]*>\s*<b>\s*([^<:]+?)\s*:\s*<\/b>\s*([\s\S]*?)<\/p>\s*<p[^>]*>\s*<b>\s*([^<:]+?)\s*:\s*<\/b>\s*([\s\S]*?)<\/p>/);
  const title = text((b.match(/<div class="col-md-12 text-center mb-1">\s*<h6>([\s\S]*?)<\/h6>/) || [])[1]).replace(/\s*-\s*$/, "");
  const tableHtml = (b.match(/<table class="table table-bordered" style="font-size:\.9em">([\s\S]*?)<\/table>/) || [])[1] || "";
  const rows = []; let perLine = 1;
  for (const tr of tableHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => text(m[1]));
    if (tds.length >= 4) perLine = 2;
    for (let i = 0; i + 1 < tds.length; i += 2) rows.push([tds[i], tds[i + 1]]);
  }
  let bodyHtml = "";
  const bStart = b.indexOf('<p style="text-indent: 35px');
  if (bStart > -1) {
    const after = b.slice(bStart);
    const end = after.search(/<div class="w-100\s+mt-\d/);
    bodyHtml = after.slice(after.indexOf(">") + 1, end > -1 ? end : undefined).replace(/<\/p>\s*<\/div>\s*$/, "").trim();
  }
  const sigBlock = (b.match(/justify-content: end !important;">\s*<div class="text-center">([\s\S]*?)<\/div>/) || [])[1] || "";
  const signature = [...sigBlock.matchAll(/<b>([\s\S]*?)<\/b>/g)].map(m => text(m[1])).filter(Boolean);
  const notice = text((b.match(/<div class="w-100 mt-1 text-justify"[^>]*>\s*<b[^>]*>([\s\S]*?)<\/b>/) || [])[1]);
  const footBlock = (b.match(/<div class="col-md-12 mt-1" style="font-size:\.9em !important;">([\s\S]*?)<\/div>/) || [])[1] || "";
  const footerPairs = [...footBlock.matchAll(/<b>([^<]+?):<\/b>\s*([\s\S]*?)(?:<br\s*\/?>|$)/g)].map(m => [text(m[1]), text(m[2])]).filter(p => p[1]);
  return {
    logos, heading, infoPairs,
    subjectLabel: subj ? text(subj[1]) : "", subject: subj ? text(subj[2]) : "",
    dateLabel: subj ? text(subj[3]) : "", date: subj ? text(subj[4]) : "",
    title, rows, rowsPerLine: perLine, bodyHtml: decode(bodyHtml) === bodyHtml ? bodyHtml : bodyHtml, signature, notice, footerPairs,
  };
}
// The legacy page printed the current date as the document date; keep that behaviour.
const crawlDay = new Date(fs.statSync(path.join(FULL, "extract.json")).mtime);
const p2 = n => String(n).padStart(2, "0");
const todayEn = `${p2(crawlDay.getMonth() + 1)}.${p2(crawlDay.getDate())}.${crawlDay.getFullYear()}`;
const todayTr = `${p2(crawlDay.getDate())}.${p2(crawlDay.getMonth() + 1)}.${crawlDay.getFullYear()}`;

const docMeta = {};
for (const { cells, links } of tableRows("/admin/custom/top_text_documents")) {
  const m = links.map(l => l.match(/belge_dogrulama\/([0-9a-f]+)\/(\d+)/)).find(Boolean); if (!m) continue;
  const key = `${m[1]}_${m[2]}`;
  const [, name, email] = String(cells[1] || "").match(/^(.*?)\s*\[\s*(.*?)\s*\]\s*$/) || [null, cells[1], ""];
  const prev = docMeta[key];
  const meta = { name: name?.trim(), email, created: isoDateTime(cells[4]), updated: isoDateTime(cells[5]) };
  // Duplicate rows for the same code: keep the earliest created / latest updated.
  docMeta[key] = prev ? { ...prev, created: prev.created < meta.created ? prev.created : meta.created, updated: prev.updated > meta.updated ? prev.updated : meta.updated } : meta;
}
const studentByEmail = Object.fromEntries(students.filter(s => s.email).map(s => [s.email.toLowerCase(), s]));
const studentByName = {}; for (const s of students) (studentByName[s.fullName?.toUpperCase()] ||= []).push(s);
const documents = [];
for (const [k, v] of pagesOf("documents")) {
  const [code, type] = Array.isArray(v.id) ? v.id : k.split("/").slice(-2);
  const key = `${code}_${type}`;
  const en = parseDoc(page(k));
  const trFile = path.join(FULL, "pages_tr", `${key}.html`);
  const tr = parseDoc(fs.existsSync(trFile) ? fs.readFileSync(trFile, "utf8") : "");
  if (en && en.date === todayEn) en.date = "{today}";
  if (tr && tr.date === todayTr) tr.date = "{today}";
  const meta = docMeta[key] || {};
  const st = (meta.email && studentByEmail[meta.email.toLowerCase()]) || (studentByName[(meta.name || "").toUpperCase()] || [])[0];
  const content = {};
  if (en && (en.rows.length || en.bodyHtml || en.subject)) content.en = en;
  if (tr && (tr.rows.length || tr.bodyHtml || tr.subject)) content.tr = tr;
  if (!content.en && !content.tr) content.en = { subject: "Sertifika / Certificate", date: meta.created?.slice(0, 10) || "", rows: [["Name Surname", meta.name || ""]] };
  documents.push({ id: key, code, type: String(type), studentId: st?.id || "", studentName: meta.name || st?.fullName || "", studentEmail: meta.email || st?.email || "", content, issuedAt: meta.created || "", updatedAtText: meta.updated || "", legacy: true });
}
put("documents", documents);

// Per-type templates for issuing new documents: the most recent legacy document of
// each type, with the student-specific table values turned into placeholders.
const PH = [
  [/passport|pasaport/i, "[passport_no]"], [/name surname|adı soyadı|ad soyad/i, "[name]"], [/birth|doğum/i, "[dob]"],
  [/mother|anne/i, "[mother_name] . [father_name]"], [/nationality|uyru/i, "[nationality]"],
  [/student number|candidate number|öğrenci no|aday no/i, "[admission_no]"], [/registered|kayıt tarihi/i, "[admission_date]"],
  [/programme|program/i, "[class]"], [/^class$|^sınıf/i, "[section]"],
];
const templates = {}; let maxNumber = "";
for (const d of documents) {
  for (const c of Object.values(d.content)) { const n = c.infoPairs?.[0]?.[1]; if (n && /\d+$/.test(n) && (!maxNumber || n.localeCompare(maxNumber, undefined, { numeric: true }) > 0)) maxNumber = n; }
}
for (const type of [...new Set(documents.map(d => d.type))]) {
  const latest = documents.filter(d => d.type === type && (d.content.en?.rows?.length || d.content.tr?.rows?.length || d.content.en?.bodyHtml)).sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)))[0];
  if (!latest) continue;
  templates[type] = {};
  for (const [lang, c] of Object.entries(latest.content)) {
    templates[type][lang] = { ...c, date: "{today}", rows: (c.rows || []).map(([k, v]) => [k, (PH.find(([re]) => re.test(k)) || [null, v])[1]]) };
  }
}
out.settings.document_templates = templates;
out.settings.document_counters = maxNumber ? { global: maxNumber } : {};

// ── Front office / HR / CMS / templates ────────────────────────────────────────
put("visitors", byPattern(/^\/admin\/visitors\/edit\/\d+$/).map(([k, v]) => {
  const f = form0(v).values; const id = idFrom(k, /(\d+)$/);
  return { id: `v${id}`, legacyId: id, purposeId: "", purposeText: label(f.purpose) || "", name: text(f.name), phone: f.contact || "", idCard: f.id_proof || "", noOfPeople: Number(f.pepples) || 0, date: isoDate(f.date), inTime: f.time || "", outTime: f.out_time || "", note: f.note || "" };
}));
// Legacy visitor purposes were free text from the website contact form — keep them as purposes.
const purposeTexts = [...new Set(byPattern(/^\/admin\/visitors$/).flatMap(([, v]) => v.tables.flatMap(t => t.headers.includes("Purpose") ? t.rows.map(r => r[0]) : [])))];
for (const v of out.collections.visitors) {
  const row = tableRows("/admin/visitors", "Purpose").find(r => r.links.some(l => idFrom(l, /visitors\/edit\/(\d+)/) === v.legacyId));
  v.purposeText = v.purposeText || row?.cells[0] || "";
  v.note = v.purposeText && !v.note.includes(v.purposeText) ? `${v.purposeText}\n\n${v.note}` : v.note;
}
void purposeTexts;
put("postal_dispatch", byPattern(/^\/admin\/dispatch\/editdispatch\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); return { id: `pd${id}`, legacyId: id, toTitle: f.to_title, referenceNo: f.ref_no, address: f.address, note: f.note, fromTitle: f.from, date: isoDate(f.date) }; }));

const staffList = [...tableRows("/admin/staff", "Staff ID"), ...tableRows("/admin/staff/disablestafflist", "Staff ID").map(r => ({ ...r, disabled: true }))];
const roleByName = Object.fromEntries(out.collections.roles.map(r => [r.name, r.id]));
put("staff", byPattern(/^\/admin\/staff\/edit\/\d+$/).map(([k, v]) => {
  const f = form0(v).values; const id = idFrom(k, /(\d+)$/);
  const lr = staffList.find(r => r.links.some(l => idFrom(l, /staff\/(?:profile|edit)\/(\d+)/) === id));
  return {
    id: `st${id}`, legacyId: id, staffId: lr?.cells[0] || "", roleId: val(f.role) ? `role${val(f.role)}` : (roleByName[lr?.cells[2]] || ""),
    designationId: val(f.designation) ? `des${val(f.designation)}` : "", departmentId: val(f.department) ? `dep${val(f.department)}` : "",
    name: decode(f.name || ""), surname: decode(f.surname || ""), fatherName: f.father_name || "", motherName: f.mother_name || "", email: f.email || "",
    gender: label(f.gender) || "", dob: isoDate(f.dob), dateOfJoining: isoDate(f.date_of_joining), phone: f.contactno || "", emergencyPhone: f.emergency_no || "",
    maritalStatus: label(f.marital_status) || "", currentAddress: f.address || "", permanentAddress: f.permanent_address || "", qualification: f.qualification || "",
    workExperience: f.work_exp || "", note: f.note || "", epfNo: f.epf_no || "", contractType: label(f.contract_type) || "", basicSalary: Number(f.basic_salary) || "",
    shift: f.shift || "", location: f.location || "", bankAccountTitle: f.account_title || "", bankAccountNo: f.bank_account_no || "", bankName: f.bank_name || "",
    ifsc: f.ifsc_code || "", bankBranch: f.bank_branch || "", facebook: f.facebook || "", twitter: f.twitter || "", linkedin: f.linkedin || "", instagram: f.instagram || "",
    status: lr?.disabled ? "disabled" : "active",
  };
}));
// Disabled staff have no edit page in the list crawl — keep them from the table.
for (const r of tableRows("/admin/staff/disablestafflist", "Staff ID")) {
  const id = r.links.map(l => idFrom(l, /staff\/profile\/(\d+)/)).find(Boolean);
  if (id && !out.collections.staff.some(s => s.legacyId === id)) out.collections.staff.push({ id: `st${id}`, legacyId: id, staffId: r.cells[0], name: r.cells[1], roleId: roleByName[r.cells[2]] || "", phone: r.cells[5] || "", status: "disabled" });
}

put("cms_pages", byPattern(/^\/admin\/front\/page\/edit\/[\w-]+$/).map(([k, v]) => { const f = form0(v).values; const s = k.split("/").pop(); return { id: `p${f.id || s}`, legacyId: f.id || "", slug: s, title: f.title, pageType: (f.content_category || "standard").replace(/^\w/, c => c.toUpperCase()), description: (f.description || "").trim(), metaTitle: f.meta_title || "", metaKeywords: f.meta_keywords || "", metaDescription: f.meta_description || "", published: true }; }));
put("cms_notices", byPattern(/^\/admin\/front\/notice\/edit\/[\w-]+$/).map(([k, v]) => { const f = form0(v).values; const s = k.split("/").pop(); return { id: `n${f.id || s}`, legacyId: f.id || "", slug: s, title: f.title, date: isoDate(f.date), description: (f.description || "").trim(), metaTitle: f.meta_title || "", metaKeywords: f.meta_keywords || "", metaDescription: f.meta_description || "", published: true }; }));
put("cms_menus", byPattern(/^\/admin\/front\/menus\/edititem\//).map(([k, v], i) => { const f = form0(v).values; const [, , , , , item, menu] = k.split("/"); return { id: `m_${menu}_${item}`, menu: menu === "main-menu" ? "Main Menu" : menu === "bottom-menu" ? "Bottom Menu" : menu, title: f.menu || f.title || item, slug: f.page_id ? label(f.page_id) || item : item, externalUrl: f.ext_url_link || f.ext_url || "", openNewTab: !!f.open_new_tab, order: i, legacy: legacyExtra(f, ["menu", "title"]) }; }));

const tplList = (listPath, re) => tableRows(listPath).map(({ cells, links }) => ({ id: links.map(l => idFrom(l, re)).find(Boolean), name: cells[0], bg: links.find(l => /uploads\//.test(l)), design: cells[2] }));
put("cert_templates", tplList("/admin/certificate/", /certificate\/edit\/(\d+)/).filter(t => t.id).map(t => {
  const f = form0(ex[`/admin/certificate/edit/${t.id}`]).values;
  return { id: `cert${t.id}`, legacyId: t.id, name: f.certificate_name || t.name, leftHeader: f.left_header || "", centerHeader: f.center_header || "", rightHeader: f.right_header || "", body: f.certificate_text || "", leftFooter: f.left_footer || "", centerFooter: f.center_footer || "", rightFooter: f.right_footer || "", headerHeight: Number(f.header_height) || 0, footerHeight: Number(f.footer_height) || 80, contentHeight: Number(f.content_height) || 380, width: Number(f.content_width) || 1000, photoTop: Number(f.image_height) || 40, showPhoto: f.enable_student_image === "1" || f.enable_image_height === "1", showQr: true, background: fileRef(t.bg) };
}));
const idcard = (listPath, editPrefix, idPrefix, uploadDir) => tplList(listPath, new RegExp(`${editPrefix}\\/edit\\/(\\d+)`)).filter(t => t.id).map(t => {
  const f = form0(ex[`/admin/${editPrefix}/edit/${t.id}`]).values;
  const on = k => f[k] === "1";
  return { id: `${idPrefix}${t.id}`, legacyId: t.id, title: f.title || t.name, schoolName: f.school_name || "", address: f.address || "", headerColor: f.header_color || "#E03C31",
    background: fileRef(t.bg) || (f.old_background ? fileRef(`/uploads/${uploadDir}/background/${f.old_background}`) : null),
    logo: f.old_logo_img ? fileRef(`/uploads/${uploadDir}/logo/${f.old_logo_img}`) : null, sign: f.old_sign_image ? fileRef(`/uploads/${uploadDir}/signature/${f.old_sign_image}`) : null,
    showName: on("is_active_student_name") || on("is_active_staff_name"), showAdmissionNo: on("is_active_admission_no") || on("is_active_staff_id"), showClass: on("is_active_class") || on("is_active_staff_designation"),
    showFatherName: on("is_active_father_name") || on("is_active_staff_father_name"), showMotherName: on("is_active_mother_name") || on("is_active_staff_mother_name"),
    showAddress: on("is_active_address") || on("is_active_staff_permanent_address"), showPhone: on("is_active_phone") || on("is_active_staff_phone"),
    showDob: on("is_active_dob") || on("is_active_staff_dob"), showBloodGroup: on("is_active_blood_group"), vertical: on("enable_vertical_card") || /vertical/i.test(t.design || "") };
});
put("idcard_templates", idcard("/admin/studentidcard/", "studentidcard", "idc", "student_id_card"));
put("staff_idcard_templates", idcard("/admin/staffidcard/", "staffidcard", "sidc", "staff_id_card"));
put("admit_cards", byPattern(/^\/admin\/admitcard\/edit\/\d+$/).map(([k, v]) => { const f = form0(v).values; const id = idFrom(k, /(\d+)$/); const bg = tableRows("/admin/admitcard").find(r => r.links.some(l => l.endsWith(`/edit/${id}`)))?.links.find(l => /uploads\//.test(l)); return { id: `adm${id}`, legacyId: id, template: f.template, heading: f.heading, title: f.title, examName: f.exam_name, schoolName: f.school_name, examCenter: f.exam_center, footerText: f.content_footer || "", background: fileRef(bg), showName: true, showAdmissionNo: true, showClass: true, showPhoto: true }; }));
put("marksheets", tableRows("/admin/marksheet").map(({ cells, links }) => { const id = links.map(l => idFrom(l, /marksheet\/edit\/(\d+)/)).find(Boolean); return id && { id: `ms${id}`, legacyId: id, template: cells[0], background: fileRef(links.find(l => /uploads\//.test(l))) }; }));

// Portal user accounts (usernames only — passwords are never migrated)
put("portal_users", [
  ...tableRows("/admin/users", "Username").filter(r => r.cells.length >= 6).map(({ cells, links }) => { const sid = links.map(l => idFrom(l, /student\/view\/(\d+)/)).find(Boolean); return { id: `u_${cells[2]}`, name: cells[1], username: cells[2], userType: "student", studentId: sid ? `s${sid}` : "", status: "active" }; }),
  ...((ex["/admin/users"]?.tables || []).find(t => t.headers[0] === "guardian_name")?.rows || []).map(r => r[2] && { id: `u_${r[2]}`, name: r[0] || r[2], username: r[2], userType: "parent", status: "active" }),
  ...((ex["/admin/users"]?.tables || []).find(t => t.headers[0] === "Staff ID" && t.headers.includes("email"))?.rows || []).map(r => r[0] && { id: `u_${r[0]}`, name: r[1], username: r[0], email: r[2], userType: "staff", status: "active" }),
]);

// ── Settings (no secrets) ──────────────────────────────────────────────────────
const sch = form0(ex["/schsettings"]).values;
const t6 = documents.find(d => d.type === "6" && d.content.en)?.content.en;
const t6tr = documents.find(d => d.type === "6" && d.content.tr)?.content.tr;
out.settings.general = {
  schoolName: sch.sch_name || "Go Turkey And Study Academy", schoolCode: sch.sch_dise_code || "", address: sch.sch_address || "", phone: sch.sch_phone || "", email: sch.sch_email || "",
  sessionId: val(sch.sch_session_id) ? `ses${val(sch.sch_session_id)}` : "", sessionStartMonth: label(sch.sch_start_month) || "", dateFormat: label(sch.sch_date_format) || "dd.mm.yyyy",
  timezone: val(sch.sch_timezone) || "Europe/Istanbul", currency: val(sch.sch_currency) || "TRY", currencySymbol: "₺", language: label(sch.sch_lang_id) || "English",
  website: t6?.footerPairs?.find(p => /web/i.test(p[0]))?.[1] || "", gsm: t6?.footerPairs?.find(p => /gsm/i.test(p[0]))?.[1] || "",
  signatoryTitle: t6?.signature?.[0] || "", signatoryName: t6?.signature?.[1] || "",
  documentNotice: t6?.notice || "", documentNoticeTr: t6tr?.notice || "",
  headerLogoLeft: t6?.logos?.[0] ? fileRef(t6.logos[0].replace(/^legacy:/, "/")) : null,
  headerLogoCenter: t6?.logos?.[1] ? fileRef(t6.logos[1].replace(/^legacy:/, "/")) : null,
  headerLogoRight: t6?.logos?.[2] ? fileRef(t6.logos[2].replace(/^legacy:/, "/")) : null,
  legacy: legacyExtra(sch, ["sch_name", "sch_id", "sch_dise_code", "sch_address", "sch_phone", "sch_email", "sch_session_id", "sch_start_month", "sch_date_format", "sch_timezone", "sch_currency", "sch_lang_id"]),
};
const fc = form0(ex["/admin/frontcms"]).values;
out.settings.front_cms = { enabled: fc.is_active_front_cms === "1", theme: fc.theme || "", sidebarOptions: [].concat(fc["sidebar_options[]"] || []).join(", "), footerText: fc.footer_text || "", cookieConsent: fc.cookie_consent || "", whatsappUrl: fc.whatsapp_url || "", facebookUrl: fc.fb_url || "", twitterUrl: fc.twitter_url || "", youtubeUrl: fc.youtube_url || "", googlePlusUrl: fc.google_plus || "", linkedinUrl: fc.linkedin_url || "", instagramUrl: fc.instagram_url || "", pinterestUrl: fc.pinterest_url || "", googleAnalytics: fc.google_analytics || "" };
const em = form0(ex["/emailconfig"]).values;
out.settings.email = { engine: label(em.email_type) || "SMTP", smtpServer: em.smtp_server || "", smtpPort: Number(em.smtp_port) || "", smtpUsername: em.smtp_username || "", smtpSecurity: label(em.smtp_security) || "", enabled: true };
const pay = (ex["/admin/paymentsettings"]?.forms || []).find(f => f.action.endsWith("/setting"))?.values || {};
out.settings.payment_methods = { activeGateway: pay.payment_setting === "param" ? "Param (Türk POS) — re-enter credentials" : (pay.payment_setting || "None"), instructions: "Gateway credentials were intentionally not migrated. Re-enter them server-side when online payments are wired up." };
const phf = Object.fromEntries((ex["/admin/print_headerfooter"]?.forms || []).map(f => [f.values.type, f.values]));
out.settings.print_header_footer = { feeReceiptFooter: (phf.student_receipt?.message1 || "").trim(), payslipFooter: (phf.staff_payslip?.message || "").trim(), onlineAdmissionFooter: (phf.online_admission_receipt?.admission_message || "").trim() };
const oa = (ex["/admin/onlineadmission/admissionsetting"]?.forms || [])[0]?.values || {};
out.settings.online_admission = { enabled: oa.online_admission === "1", fee: Number(oa.online_admission_amount) || 0, instructions: oa.online_admission_instruction || "", terms: oa.online_admission_conditions || "" };
const fr = form0(ex["/admin/feereminder/setting"]).values;
out.settings.fees_reminder = { before1: true, before1Days: Number(fr.days1) || 0, before2: true, before2Days: Number(fr.days2) || 0, after1: true, after1Days: Number(fr.days3) || 0, after2: true, after2Days: Number(fr.days4) || 0 };
const ns = form0(ex["/admin/notification/setting"]).values; const nt = (ex["/admin/notification/setting"]?.tables || [])[0];
out.settings.notification = { templates: (nt?.rows || []).map((r, i) => `${r[0]} [${ns[`mail_${i + 1}`] === "1" ? "email on" : "email off"}]: ${r[3] || ""}`).join("\n\n"), studentAdmissionEmail: ns.mail_1 === "1", feesSubmissionEmail: ns.mail_2 === "1" };
out.settings.student_profile_update = { allowEdit: form0(ex["/student/profilesetting"]).values.student_profile_edit === "1" };

// ── AJAX-loaded lists (fetch_lists.py → <full>/lists/*.json) ───────────────────
const listFile = name => { const f = path.join(FULL, "lists", `${name}.json`); try { return JSON.parse(fs.readFileSync(f, "utf8")).data || []; } catch { return []; } };
const cellText = c => text(String(c ?? "").replace(/<a [^>]*>Read more\.\.\.<\/a>/g, ""));
const subjectByName = Object.fromEntries((out.collections.subjects || []).map(s => [s.name, s.id]));
const classByName = Object.fromEntries((out.collections.classes || []).map(c => [c.name, c.id]));
const sectionByName2 = Object.fromEntries((out.collections.sections || []).map(s => [s.name, s.id]));
const dmyTime = s => { const m = String(s || "").match(/(\d{2})\.(\d{2})\.(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ""; };

put("online_exams", listFile("admin_onlineexam_getexamlist").map((r, i) => {
  const parts = String(r[0] || "").split(/<[^>]+>/).map(s => decode(s).trim()).filter(Boolean);
  return { id: `oe${i + 1}`, title: parts[0] || "", description: parts.slice(1).join(" "), quizType: /yes/i.test(cellText(r[1])) ? "Quiz" : "Exam",
    from: dmyTime(r[4]), to: dmyTime(r[5]), fromText: cellText(r[4]), toText: cellText(r[5]), duration: cellText(r[6]), attempts: Number(cellText(r[3])) || 0,
    published: /yes/i.test(cellText(r[7])), publishResult: /yes/i.test(cellText(r[8])), questionsSummary: cellText(r[2]) };
}));
put("questions", listFile("admin_question_getDatatable").map(r => {
  const qid = cellText(r[1]);
  const f = path.join(FULL, "lists", `question_${qid}.html`);
  const page = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  const full = (page.match(/<div class="questiondetail"><b>Question:<\/b>([\s\S]*?)<\/div>/) || [])[1];
  const cls = text((page.match(/<b>class\s*<\/b>\s*:([^<]*)/) || [])[1]);
  return { id: `q${qid}`, legacyId: qid, subjectId: subjectByName[cellText(r[2])] || "", subjectText: cellText(r[2]), questionType: cellText(r[3]), level: cellText(r[4]),
    classId: classByName[cls] || "", question: (full || String(r[5] || "").replace(/<a [^>]*>Read more\.\.\.<\/a>/g, "")).trim() };
}));
put("lessons", listFile("admin_lessonplan_getlessonlist").map((r, i) => ({ id: `les${i + 1}`, classId: classByName[cellText(r[0])] || "", sectionId: sectionByName2[cellText(r[1])] || "", subjectId: subjectByName[cellText(r[3])] || "", subjectGroup: cellText(r[2]), name: cellText(r[4]) })));
put("topics", listFile("admin_lessonplan_gettopiclist").map((r, i) => ({ id: `top${i + 1}`, lessonId: (out.collections.lessons.find(l => l.name === cellText(r[4])) || {}).id || "", name: cellText(r[5]), status: "Incomplete" })));
put("income", listFile("admin_income_getincomelist").map((r, i) => ({ id: `inc${i + 1}`, name: cellText(r[0]), invoiceNo: cellText(r[2] ?? ""), date: dmyTime(cellText(r[3] ?? "")), amount: money(cellText(r[4] ?? "")), legacyRow: r.map(cellText) })));
put("expenses", listFile("admin_expense_getexpenselist").map((r, i) => ({ id: `exp${i + 1}`, name: cellText(r[0]), invoiceNo: cellText(r[2] ?? ""), date: dmyTime(cellText(r[3] ?? "")), amount: money(cellText(r[4] ?? "")), legacyRow: r.map(cellText) })));
put("phone_calls", listFile("admin_generalcall_getcalllist").map((r, i) => ({ id: `call${i + 1}`, name: cellText(r[0]), phone: cellText(r[1]), date: dmyTime(cellText(r[2])), followUpDate: dmyTime(cellText(r[3])), callType: cellText(r[4]), legacyRow: r.map(cellText) })));
put("online_admissions", listFile("admin_onlinestudent_getstudentlist").map((r, i) => ({ id: `oa${i + 1}`, referenceNo: cellText(r[0]), firstName: cellText(r[1]), legacyRow: r.map(cellText) })));
put("user_log", listFile("admin_userlog_getDatatable").map((r, i) => ({ id: `ul${i + 1}`, user: cellText(r[0]), role: cellText(r[1]), classSection: cellText(r[2]), ip: cellText(r[3]), loginAt: cellText(r[4]), userAgent: cellText(r[5]) })));
put("audit_log", listFile("admin_audit_getDatatable").map((r, i) => ({ id: `au${i + 1}`, message: cellText(r[0]), user: cellText(r[1]), ip: cellText(r[2]), action: cellText(r[3]), platform: cellText(r[4]), agent: cellText(r[5]), at: cellText(r[6]) })));

// ── Write ───────────────────────────────────────────────────────────────────────
const dest = path.join(FULL, "..", "legacy-import.json");
fs.writeFileSync(dest, JSON.stringify(out));
const have = new Set();
const walk = d => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : have.add(path.relative(path.join(FULL, "files"), p).split(path.sep).join("/")); } };
walk(path.join(FULL, "files"));
const missing = [...neededFiles].filter(p => !have.has(p)).sort();
fs.writeFileSync(path.join(FULL, "..", "files-needed.txt"), missing.join("\n") + (missing.length ? "\n" : ""));
console.log(`wrote ${dest}`);
for (const [k, rows] of Object.entries(out.collections)) console.log(`  ${k.padEnd(24)} ${rows.length}`);
console.log(`  settings: ${Object.keys(out.settings).join(", ")}`);
console.log(`  documents with EN: ${documents.filter(d => d.content.en).length}, TR: ${documents.filter(d => d.content.tr).length}, linked to a student: ${documents.filter(d => d.studentId).length}`);
console.log(`  legacy files referenced: ${neededFiles.size}, still to download: ${missing.length} (files-needed.txt)`);
