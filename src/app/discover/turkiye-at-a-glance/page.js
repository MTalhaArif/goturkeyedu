import PageClient from "./page-client";

export const metadata = {
  title: "Türkiye at a Glance - Geography, History & Economy | Go Turkey",
  description: "Key facts about Türkiye for international students: population, geography, history, economy, and its 208 universities serving over 7 million students.",
  alternates: {
    canonical: "/discover/turkiye-at-a-glance",
  },
};

export default function Page() {
  return <PageClient />;
}
