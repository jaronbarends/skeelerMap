# Project status

**Last updated:** 2026-03-26
**Current phase:** Map renders correctly. Cleanup pending before next feature work.

---

## What exists
- Next.js 15 + App Router + TypeScript scaffolded
- `src/` directory structure
- Leaflet (plain, not react-leaflet) installed and working
- Full-screen map, centered on Netherlands by default (zoom 12)
- User location dot (blue circle, white border) via `watchPosition`
- CartoDB Voyager tile layer (no API key required)
- Color token system (`src/styles/tokens.ts`) injected as CSS custom properties via `layout.tsx`

## What was resolved this session
- Tile rendering bug (tiles at wrong positions): root cause was `leaflet/dist/leaflet.css` being imported inside the client component (`Map.tsx`). In Next.js dev mode this CSS loads after `useEffect` fires. Fixed by moving the import to `layout.tsx`.
- Switched from react-leaflet to plain Leaflet to eliminate SSR/rendering timing issues. react-leaflet may be re-evaluated next session.
- Left some cleanup in `Map.tsx` (diagnostic `console.log`, inner div wrapper, unnecessary `box-sizing` override in `globals.css`) — to be done next session.

## What's decided
- Stack: Next.js + App Router + TypeScript + Leaflet
- Backend: BaaS TBD (Supabase or Firebase), chosen when auth is needed
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points

## What's open
- Whether to re-add react-leaflet (discuss next session, now that root cause is known)
- Rating UI visibility during drawing (test both options on iPhone SE)
- How to indicate current rating in edit panel (TBD)
- Location permission flow (deferred)
- BaaS choice (deferred)
- Tile provider for production (deferred)

## Next step
1. Clean up `Map.tsx`: remove console.log, remove inner div wrapper, simplify
2. Remove unnecessary `.leaflet-container` box-sizing override from `globals.css`
3. Discuss re-adding react-leaflet
4. If react-leaflet is back: implement segment creation flow
