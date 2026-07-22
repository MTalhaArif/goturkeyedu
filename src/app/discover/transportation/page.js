import PageClient from "./page-client";

export const metadata = {
  title: "Getting Around Türkiye - Transportation Guide for Students | Go Turkey",
  description: "How to get to and around Türkiye: airports, metro and tram, intercity buses, high-speed trains, taxis, and ferries, plus student transport discounts.",
  alternates: {
    canonical: "/discover/transportation",
  },
};

export default function Page() {
  return <PageClient />;
}
