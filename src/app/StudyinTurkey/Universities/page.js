import PageClient from "./page-client";

export const metadata = {
  title: "Turkish Universities Directory - State & Foundation Universities | Go Turkey",
  description: "Browse Türkiye's state and foundation universities by city and type, view available programs, and find university websites and profiles.",
  alternates: {
    canonical: "/StudyinTurkey/Universities",
  },
};

export default function Page() {
  return <PageClient />;
}
