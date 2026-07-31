import PageClient from "./page-client";

export const metadata = {
  title: "Go Turkey | Study in Türkiye - Universities, Scholarships & Visas",
  description: "Search 200+ Turkish universities and programs, explore scholarships, visas, and student life, and start your application to study in Türkiye with Go Turkey.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return (
    <>
      {/* First hero slide's background image is the LCP element; preloading it
          lets the browser start fetching it during HTML parsing instead of
          discovering it late via CSS background-image resolution. */}
      <link rel="preload" as="image" href="/hero.webp" fetchPriority="high" />
      <PageClient />
    </>
  );
}
