import PageClient from "./page-client";
import { faqs } from "@/app/data/faq";
import { jsonLdScriptProps } from "@/lib/jsonLd";

export const metadata = {
  title: "FAQ - Studying in Türkiye | Go Turkey",
  description: "Answers to frequently asked questions about applying, tuition and living costs, scholarships, visas, and degree recognition in Türkiye.",
  alternates: {
    canonical: "/for-students/faq",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(faqJsonLd)} />
      <PageClient />
    </>
  );
}
