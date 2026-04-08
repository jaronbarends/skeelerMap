# Project status

**Last updated:** 2026-04-08
**Current phase:** Auth implemented.

---

## What exists

- Next.js 15 + App Router + TypeScript
- Leaflet (plain, not react-leaflet) — full-screen map, Netherlands default, user location dot
- OpenStreetMap tile layer; CartoDB Voyager can be set in `tilesProvider.ts`
- Color system: `src/styles/colors.css` (CSS custom properties), read in TSX via `getComputedStyle`
- `leaflet/dist/leaflet.css` imported in `layout.tsx` (required — see decisions.md)
- Open Sans via `next/font/google`
- `react-icons` (fa6) for FAB and panel close button
- Segment creation flow: FAB → drawing mode → control points → OSRM routing → rating → Supabase
- Panel component system: `Panel`, `PanelHeader`, `PanelInstruction`, `PanelIconButton`,
  `RatingButtons`, `SegmentCreation`, `SegmentEditPanel` — all in `src/components/panel/`
- Segment selection and editing flow: tap segment → panel with length + edit/delete/close;
  edit rating with current rating indicated; delete with confirmation
- Location button (FAB, below add-segment button): centers map on user's last known position
- Keyboard shortcuts: `Esc` cancels drawing mode; `Delete` deletes selected segment
  (with confirmation)
- Drag-to-edit segment endpoints: drag start/end point of a saved segment to reposition it;
  reroutes via OSRM and saves to Supabase
- Indicate saving: shows status text in the panel during save and delete operations
- Auth: Supabase email/password — signup at `/signup`, login at `/login`, email verification
  via `/auth/callback`. Write operations (POST, PATCH, DELETE) require authentication;
  RLS enforced in Supabase.
- Menubar: app name "SkeelerMap" + tagline "Vind en beoordeel skeelerpaden" (stacked left);
  auth controls right ("Inloggen" / "Uitloggen"). MenuBar is a Server Component;
  `AuthControls` is a Client Component child.
- Toast component: map-level feedback, triggered via `?toast=` query param on `/`.
  Auto-dismisses after 4s.
- Supabase auth helpers split into `src/lib/supabaseAuth.ts` (browser) and
  `src/lib/supabaseAuth.server.ts` (server)
- Segments have `user_id` (FK to auth.users); RLS policies enforce ownership on writes

## What's decided

- Stack: Next.js + App Router + TypeScript + Leaflet (plain)
- react-leaflet: decided against — imperative pattern is sufficient for this app
- Backend: Supabase — chosen and implemented for segment storage and auth
- MVP scope and explicit out-of-scope items (see requirements.md)
- Segment creation flow (see decisions.md)
- Segment selection, edit, and delete flow (see decisions.md)
- Data model: store routed geometry, not control points
- Rating UI: Option A (greyed out until 2+ points placed)
- Auth: email/password via Supabase, PKCE flow, email verification required
- Segments are public (anyone can read); writes require auth and ownership (RLS)
- MenuBar architecture: Server Component shell, Client Component islands

## What's open

- Location permission flow (deferred)
- Tile provider for production (deferred)
- Hide edit/delete controls for segments not owned by current user (see backlog)
- Assign existing segments to owner account via SQL update (one-time task)

## Next step

- Pick next feature from backlog.md
