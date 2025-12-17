import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arhaval Denetim Merkezi",
  description: "Yayıncı ve içerik yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}













