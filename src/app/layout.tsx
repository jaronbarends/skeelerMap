import type { Metadata } from 'next';
import { mapColorCSSVars } from '@/styles/mapColorTokens';
import 'leaflet/dist/leaflet.css';
import './main.css';

export const metadata: Metadata = {
  title: 'SkateMap',
  description: 'Interactieve kaart met wegkwaliteit voor inline skating',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mapColorStyles = mapColorCSSVars as React.CSSProperties;

  return (
    <html lang="nl">
      <body style={mapColorStyles}>{children}</body>
    </html>
  );
}
