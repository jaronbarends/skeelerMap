# Project status

**Last updated:** 2026-03-26
**Current phase:** Scaffolding complete — map renders, location dot implemented.

---

## What exists
- Next.js 15 + App Router + TypeScript scaffolded (manual, not create-next-app)
- `src/` directory structure
- Leaflet / react-leaflet@5 (React 19 compatible) installed
- Full-screen map view, centered on Netherlands by default
- User location dot (blue circle, white border) via `watchPosition`
  - Map centers on first GPS fix at zoom ≥ 15
  - Falls back to Netherlands default if permission denied
- Leaflet SSR issue handled: `MapLoader` (client component) wraps dynamic import with `ssr: false`

## What's decided
- Stack: Next.js + App Router + TypeScript + Leaflet
- Backend: BaaS TBD (Supabase or Firebase), chosen when auth is needed
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points

## What's open
- Rating UI visibility during drawing (test both options on iPhone SE)
- How to indicate current rating in edit panel (TBD)
- Location permission flow (deferred)
- BaaS choice (deferred)

## Next step
Implement the segment creation flow:
1. Add + button (floating, bottom-right)
2. Drawing mode: map enters drawing mode on tap, panel appears with instruction text
3. Each map tap places a control point (dot marker)
4. After 2+ points, draw road-following polyline between consecutive points (OSRM or similar)
5. Rating picker (5 options) — visibility behavior TBD (Option A or B, test on iPhone SE)
6. Tapping a rating saves the segment in that color; panel closes
7. Tapping × cancels — removes all points/lines, closes panel
8. Persist segments to localStorage
