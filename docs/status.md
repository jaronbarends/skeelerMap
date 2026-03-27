# Project status

**Last updated:** 2026-03-27
**Current phase:** Scaffold complete. Ready to implement segment creation flow.

---

## What exists
- Next.js 15 + App Router + TypeScript
- Leaflet (plain, not react-leaflet) — full-screen map, Netherlands default, user location dot
- CartoDB Voyager tile layer
- Color system: `src/styles/colors.css` (CSS custom properties), read in TSX via `getComputedStyle`
- `leaflet/dist/leaflet.css` imported in `layout.tsx` (required — see decisions.md)

## What's decided
- Stack: Next.js + App Router + TypeScript + Leaflet (plain)
- react-leaflet: decided against — imperative pattern is sufficient for this app
- Backend: BaaS TBD (Supabase or Firebase), chosen when auth is needed
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points

## What's open
- Rating UI visibility during drawing: Option A (greyed out until 2+ points) vs Option B (hidden until 2+ points) — test on iPhone SE before implementing
- How to indicate current rating in edit panel (TBD)
- Location permission flow (deferred)
- BaaS choice (deferred)
- Tile provider for production (deferred)

## Next step
Implement segment creation flow:
1. Floating + button (bottom-right)
2. Tapping + enters drawing mode: panel appears with instruction text, map listens for taps
3. Each tap places a control point dot
4. After 2+ points: road-following polyline drawn via OSRM between consecutive points
5. Rating picker (5 options) — resolve Option A vs B first
6. Tapping a rating saves the segment in that color, closes panel
7. Tapping × cancels: removes all points/lines, closes panel
8. Persist segments to localStorage
