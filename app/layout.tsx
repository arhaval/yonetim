import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DebugConsoleOverlay } from "@/lib/debug-console";

export const metadata: Metadata = {
  title: "Arhaval Denetim Merkezi",
  description: "Yayıncı ve içerik yönetim sistemi",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
        <DebugConsoleOverlay />
      </body>
    </html>
  );
}















