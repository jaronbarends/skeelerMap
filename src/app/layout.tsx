import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "@/styles/colors.css";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
