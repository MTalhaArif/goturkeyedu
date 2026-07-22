import PageClient from "./page-client";

export const metadata = {
  title: "Student Accommodation in Türkiye - Dorms & Apartments | Go Turkey",
  description: "Compare accommodation options for international students in Türkiye: KYK dormitories, university dorms, private dorms, and shared apartments.",
  alternates: {
    canonical: "/for-students/accommodation",
  },
};

export default function Page() {
  return <PageClient />;
}
