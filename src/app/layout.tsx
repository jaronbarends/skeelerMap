import type { Metadata, Viewport } from 'next';
import { type CSSProperties, ReactNode } from 'react';

import MenuBar from '@/components/MenuBar';
import { mapColorCSSVars } from '@/styles/mapColorTokens';

import './main.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'SkateMap',
  description: 'Interactieve kaart met wegkwaliteit voor inline skating',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const mapColorStyles = mapColorCSSVars as CSSProperties;

  return (
    <html lang="nl">
      <body style={mapColorStyles}>
        <MenuBar />
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
