import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import ClientShell from "./components/ClientShell";

export const metadata = {
  title: "Go Turkey - Study in Türkiye | Official Education Portal",
  description: "Your gateway to studying in Türkiye. Find universities, programs, scholarships, and everything you need to study in Turkey.",
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
