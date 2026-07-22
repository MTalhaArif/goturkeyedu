import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import ClientShell from "./components/ClientShell";
import { SITE_URL } from "@/lib/siteConfig";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Go Turkey - Study in Türkiye | Official Education Portal",
  description: "Your gateway to studying in Türkiye. Find universities, programs, scholarships, and everything you need to study in Turkey.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
