// Public document verification page — same URL shape as the legacy site
// (/belge_dogrulama/{code}/{type}) so QR codes already printed on issued documents
// keep resolving once the domain points here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { findDocument, publicSettings } from "@/lib/erp/publicDocs";
import { renderDocumentHtml, qrDataUrl, verificationUrl } from "@/lib/erp/templating";
import { DOCUMENT_TYPES } from "@/lib/erp/schema";
import PrintButton from "../../PrintButton";

export const metadata = { title: "Belge Doğrulama / Document Verification", robots: { index: false, follow: false } };

const btn = { display: "inline-block", padding: "8px 18px", borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: "none", border: "none", cursor: "pointer" };

export default async function VerifyPage({ params, searchParams }) {
  const { code, type } = await params;
  const sp = await searchParams;
  const doc = await findDocument(code, type);

  if (!doc) {
    return (
      <main style={{ maxWidth: 640, margin: "60px auto", padding: 16, fontFamily: "Arial, sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, color: "#b91c1c" }}>Belge bulunamadı / Document not found</h1>
        <p>Doğrulama kodu ve belge türünü kontrol edin. / Check the verification code and document type.</p>
        <Link href="/belge_dogrulama" style={{ ...btn, background: "#E03C31", color: "white" }}>Belge Doğrulama / Verify a document</Link>
      </main>
    );
  }

  const available = ["en", "tr"].filter(l => doc.content?.[l]);
  const lang = available.includes(sp?.lang) ? sp.lang : available.includes("en") ? "en" : available[0] || "en";
  const [settings, qr] = await Promise.all([publicSettings(), qrDataUrl(verificationUrl(doc.code, doc.type), 192)]);
  const html = renderDocumentHtml(doc, lang, qr, settings);

  return (
    <main style={{ background: "white", minHeight: "100vh", padding: "16px 12px 40px" }}>
      <style>{`@media print { .noprint { display: none !important; } @page { size: A4; margin: 10mm; } }`}</style>
      <div className="noprint" style={{ maxWidth: 820, margin: "0 auto 16px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", fontFamily: "Arial, sans-serif" }}>
        {available.includes("tr") && <Link href={`?lang=tr`} style={{ ...btn, background: lang === "tr" ? "#dc3545" : "#f1f5f9", color: lang === "tr" ? "white" : "#111" }}>Türkçe / Turkish</Link>}
        {available.includes("en") && <Link href={`?lang=en`} style={{ ...btn, background: lang === "en" ? "#ffc107" : "#f1f5f9", color: "#111" }}>English / İngilizce</Link>}
        <PrintButton style={{ ...btn, background: "#0d6efd", color: "white" }} />
      </div>
      <div className="noprint" style={{ maxWidth: 820, margin: "0 auto 12px", padding: "10px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, color: "#065f46", fontFamily: "Arial, sans-serif", fontSize: 14, textAlign: "center" }}>
        ✔ {lang === "tr" ? "Bu belge doğrulanmıştır" : "This document is verified"} — {DOCUMENT_TYPES[doc.type]?.[lang] || ""} · {doc.code}
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
