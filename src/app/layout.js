import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import ClientShell from "./components/ClientShell";
import { SITE_URL } from "@/lib/siteConfig";
import { jsonLdScriptProps } from "@/lib/jsonLd";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Go Turkey",
  url: SITE_URL,
  email: "goturkeyandstudytr@gmail.com",
  telephone: "+90-555-175-32-26",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Molla Gürani Neighborhood, Tomrukçu Street, Nevin Apartment, No: 51/3",
    addressLocality: "Fatih / İstanbul",
    addressCountry: "TR",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Go Turkey",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/StudySearch/List?university={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Go Turkey - Study in Türkiye | Official Education Portal",
  description: "Your gateway to studying in Türkiye. Find universities, programs, scholarships, and everything you need to study in Turkey.",
  alternates: {
    canonical: "/",
  },
  verification: {
    other: {
      "msvalidate.01": "33753268187F92D42A0C9E084A1291DB",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script {...jsonLdScriptProps(organizationJsonLd)} />
        <script {...jsonLdScriptProps(websiteJsonLd)} />
        <LanguageProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
