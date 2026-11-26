// Public "Belge Doğrulama" (document verification) screen: enter a verification code
// and pick the document type, like the legacy page at goturkey.gen.tr/belge_dogrulama.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import { findTypesForCode } from "@/lib/erp/publicDocs";

export const metadata = { title: "Belge Doğrulama / Document Verification", robots: { index: false, follow: false } };

const field = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15, boxSizing: "border-box" };

export default async function VerifySearch({ searchParams }) {
  const sp = await searchParams;
  const code = String(sp?.dogrulama || "").trim().toLowerCase();
  const type = String(sp?.parametre || "").trim();
  const lang = sp?.lang === "tr" ? "tr" : "en";
  let error = "";

  if (code) {
    if (type) redirect(`/belge_dogrulama/${encodeURIComponent(code)}/${encodeURIComponent(type)}?lang=${lang}`);
    // No type chosen: if the code matches exactly one document, go straight to it.
    const types = await findTypesForCode(code).catch(() => []);
    if (types.length === 1) redirect(`/belge_dogrulama/${encodeURIComponent(code)}/${types[0]}?lang=${lang}`);
    error = types.length ? "Lütfen belge türünü seçin / Please select the document type." : "Belge bulunamadı / Document not found.";
  }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #E03C31 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <form method="get" style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h1 style={{ fontSize: 20, margin: "0 0 4px", color: "#0f172a" }}>Go Turkey And Study Academy</h1>
        <p style={{ margin: "0 0 20px", color: "#64748b" }}>Belge Doğrulama / Document Verification</p>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Doğrulama Kodu / Verification Code</label>
        <input name="dogrulama" defaultValue={code} required autoComplete="off" style={{ ...field, marginBottom: 14 }} />
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Belge Türü / Document Type</label>
        <select name="parametre" defaultValue={type} style={{ ...field, marginBottom: 14 }}>
          <option value="">— Select —</option>
          {Object.entries(DOCUMENT_TYPES).map(([id, n]) => <option key={id} value={id}>{n.tr} / {n.en}</option>)}
        </select>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Dil / Language</label>
        <select name="lang" defaultValue={lang} style={{ ...field, marginBottom: 18 }}>
          <option value="en">English</option><option value="tr">Türkçe</option>
        </select>
        {error && <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>}
        <button type="submit" style={{ width: "100%", padding: 12, border: "none", borderRadius: 8, background: "#E03C31", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Doğrula / Verify</button>
      </form>
    </main>
  );
}
