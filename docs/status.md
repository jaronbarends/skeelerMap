# Project status

**Last updated:** 2026-04-10
**Current phase:** Auth implemented; DRY button and form styling in place; content page layout in place.

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
- Ownership-aware UI: edit/delete controls only shown for segments owned by the current user;
  `get_segments` RPC returns `user_id`; `currentUserId` passed server-side from `page.tsx`
- DRY button and form styling: `Button` component (`src/components/button/`); global stylesheets
  `src/styles/elements.forms.css`, `src/styles/components.forms.css`, `src/styles/elements.type.css`;
  auth forms (`LoginForm`, `SignupForm`) and panel buttons refactored to use these
- Layout: root layout provides chrome only (`<Header>` + `{children}`, no `<main>`); root page
  (`page.tsx`) wraps map in full-width `<main>`; content pages use `app/(content)/` route group
  with its own layout that renders a max-width centered `<main>`. `MenuBar` renamed to `Header`.
  Color tokens: `--color-surface-150` added; `body` uses `--color-surface-200`, `main` uses
  `--color-surface-150`, header uses `--color-surface-100`.
- FAB tooltips: `FabButton` accepts an optional `tooltip` prop. On `pointer: fine` devices with
  anchor positioning support (`@supports (anchor-name: --x)`), a tooltip is rendered as a sibling
  of the button and positioned to the left via CSS anchor positioning (`position: fixed`,
  `position-area: left center`). Anchor name is generated per-instance via `useId()`.

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
- Header (formerly MenuBar) architecture: Server Component shell, Client Component islands

## What's open

- Location permission flow (deferred)
- Tile provider for production (deferred)
- Assign existing segments to owner account via SQL update (one-time task)

## Next step

- Pick next feature from backlog.md
