import type { Metadata } from "next";
import { buildColorVars } from "@/styles/tokens";
import "leaflet/dist/leaflet.css";
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
    <html lang="nl" style={buildColorVars()}>
      <body>{children}</body>
    </html>
  );
}
