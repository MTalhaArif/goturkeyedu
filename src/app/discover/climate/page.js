import PageClient from "./page-client";

export const metadata = {
  title: "Türkiye's Climate by Region - What to Expect | Go Turkey",
  description: "A region-by-region guide to Türkiye's climate, from the Mediterranean coast to Central Anatolia, so you know what weather to expect at your university.",
  alternates: {
    canonical: "/discover/climate",
  },
};

export default function Page() {
  return <PageClient />;
}
