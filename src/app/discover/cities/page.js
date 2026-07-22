import PageClient from "./page-client";

export const metadata = {
  title: "Best Cities to Study in Türkiye - Istanbul, Ankara & More | Go Turkey",
  description: "Compare Türkiye's top student cities — Istanbul, Ankara, Izmir, Bursa, Antalya, Eskişehir, Konya, and Trabzon — by universities, population, and lifestyle.",
  alternates: {
    canonical: "/discover/cities",
  },
};

export default function Page() {
  return <PageClient />;
}
