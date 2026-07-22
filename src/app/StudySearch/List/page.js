import PageClient from "./page-client";

export const metadata = {
  title: "Search Universities & Programs in Türkiye | Go Turkey",
  description: "Filter Turkish universities by city, degree level, teaching language, and program to find the right bachelor's, master's, or PhD program for you.",
  alternates: {
    canonical: "/StudySearch/List",
  },
};

export default function Page() {
  return <PageClient />;
}
