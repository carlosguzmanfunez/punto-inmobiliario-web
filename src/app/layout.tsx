import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CompareBar } from "@/components/Compare";
import { site } from "@/lib/site";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${site.name} | Casas, apartamentos y terrenos en Honduras`, template: `%s | ${site.name}` },
  description: "Compra, alquila o vende casas, apartamentos y terrenos en Tegucigalpa, San Pedro Sula y toda Honduras. Atención a hondureños en el extranjero y asesoría de financiamiento.",
};

export const viewport: Viewport = { themeColor: "#0b5cc2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-HN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CompareBar />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
