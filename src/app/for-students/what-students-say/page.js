import PageClient from "./page-client";

export const metadata = {
  title: "Student Testimonials - Studying in Türkiye | Go Turkey",
  description: "Hear from international students at Turkish universities about their academic experience, scholarships, and life in Türkiye.",
  alternates: {
    canonical: "/for-students/what-students-say",
  },
};

export default function Page() {
  return <PageClient />;
}
