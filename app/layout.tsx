import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katniss Real Estate",
  description:
    "Demo funcional para gestionar inmuebles, contratos, documentos, facturas, rentabilidad y alertas de cartera inmobiliaria.",
  applicationName: "Katniss Real Estate",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Katniss",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "Katniss Real Estate",
    description:
      "Gestion visual de cartera inmobiliaria con indicadores, documentos y alertas.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#17211c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
