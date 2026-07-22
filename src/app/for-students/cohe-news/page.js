import PageClient from "./page-client";

export const metadata = {
  title: "CoHE News - Higher Education Updates from Türkiye | Go Turkey",
  description: "Latest announcements from Türkiye's Council of Higher Education (YÖK): TR-YÖS updates, scholarship openings, rankings, and policy news.",
  alternates: {
    canonical: "/for-students/cohe-news",
  },
};

export default function Page() {
  return <PageClient />;
}
