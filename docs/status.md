# Project status

**Last updated:** 2026-04-01
**Current phase:** Keyboard shortcuts and segment dragging implemented.

---

## What exists

- Next.js 15 + App Router + TypeScript
- Leaflet (plain, not react-leaflet) — full-screen map, Netherlands default, user location dot
- CartoDB Voyager tile layer
- Color system: `src/styles/colors.css` (CSS custom properties), read in TSX via `getComputedStyle`
- `leaflet/dist/leaflet.css` imported in `layout.tsx` (required — see decisions.md)
- Open Sans via `next/font/google`
- `react-icons` (fa6) for FAB and panel close button
- Segment creation flow: FAB → drawing mode → control points → OSRM routing → rating → Supabase
- Panel component system: `Panel`, `PanelHeader`, `PanelInstruction`, `PanelIconButton`, `RatingButtons`, `SegmentCreation`, `SegmentEditPanel` — all in `src/components/panel/`
- Segment selection and editing flow: tap segment → panel with length + edit/delete/close; edit rating with current rating indicated; delete with confirmation
- Location button (FAB, below add-segment button): centers map on user's last known position
- Keyboard shortcuts: `Esc` cancels drawing mode; `Delete` deletes selected segment (with confirmation)
- Drag-to-edit segment endpoints: drag start/end point of a saved segment to reposition it; reroutes via OSRM and saves to Supabase

## What's decided

- Stack: Next.js + App Router + TypeScript + Leaflet (plain)
- react-leaflet: decided against — imperative pattern is sufficient for this app
- Backend: Supabase — chosen and implemented for segment storage
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points
- Rating UI: Option A (greyed out until 2+ points placed)

## What's open

- Location permission flow (deferred)
- Auth flow (deferred — Supabase chosen but auth not yet implemented)
- Tile provider for production (deferred)

## Next step

- Pick next feature from backlog.md
