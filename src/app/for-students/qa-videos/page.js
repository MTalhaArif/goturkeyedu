import PageClient from "./page-client";

export const metadata = {
  title: "Q&A Videos - Studying in Türkiye | Go Turkey",
  description: "Watch video answers to common questions about academic life, living costs, admissions, and visas from students and university advisors.",
  alternates: {
    canonical: "/for-students/qa-videos",
  },
};

export default function Page() {
  return <PageClient />;
}
