import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "@/styles/colors.css";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SkateMap",
  description: "Interactieve kaart met wegkwaliteit voor inline skating",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={openSans.variable}>{children}</body>
    </html>
  );
}
