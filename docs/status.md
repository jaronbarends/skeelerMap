# Project status

**Last updated:** 2026-03-29
**Current phase:** Segment creation flow tested and working on iPhone SE. Panel component structure refactored.

---

## What exists
- Next.js 15 + App Router + TypeScript
- Leaflet (plain, not react-leaflet) — full-screen map, Netherlands default, user location dot
- CartoDB Voyager tile layer
- Color system: `src/styles/colors.css` (CSS custom properties), read in TSX via `getComputedStyle`
- `leaflet/dist/leaflet.css` imported in `layout.tsx` (required — see decisions.md)
- Open Sans via `next/font/google`
- `react-icons` (fa6) for FAB and panel close button
- Segment creation flow: FAB → drawing mode → control points → OSRM routing → rating → localStorage
- Panel component system: `Panel`, `PanelHeader`, `PanelInstruction`, `PanelIconButton`, `RatingButtons`, `SegmentAddPanel` — all in `src/components/panel/`

## What's decided
- Stack: Next.js + App Router + TypeScript + Leaflet (plain)
- react-leaflet: decided against — imperative pattern is sufficient for this app
- Backend: BaaS TBD (Supabase or Firebase), chosen when auth is needed
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points
- Rating UI: Option A (greyed out until 2+ points placed)

## What's open
- How to indicate current rating in edit panel (TBD)
- Mobile browser emulation: page is larger than the device viewport in Chrome/Firefox devtools mobile mode, causing the FAB to be out of view — needs investigation before mobile testing
- Location permission flow (deferred)
- BaaS choice (deferred)
- Tile provider for production (deferred)

## Next step
1. Location button (FAB, below add-segment button) — centers map on user
2. Segment selection flow (tap segment → panel at top → length, edit, delete, close)
