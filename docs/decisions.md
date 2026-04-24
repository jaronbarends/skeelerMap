# Decision log

## Stack

### Framework: Next.js with App Router

**Date:** 2025-06
**Decision:** Use Next.js with App Router and TypeScript.
**Rationale:** The app will eventually include multiple pages (FAQ, etc.) and user accounts requiring auth. Next.js handles route protection, API routes for auth, and multi-page structure well. Also a deliberate learning goal alongside the app itself.
**Alternatives considered:** Plain React + Vite — appropriate if this were only a single-view map tool, but ruled out given the broader product scope.

### Tile provider: TBD

**Date:** 2026-03-26
**Status:** OPEN — currently using CartoDB Positron (no API key required) for development.
**Decision needed:** Choose a production tile provider before launch.
**Options considered:**

- CartoDB (Positron/Dark Matter) — free, no API key, but terms of service require attribution and limit heavy traffic
- Stadia Maps — free tier with API key, good quality
- Maptiler — free tier with API key
- Mapbox — free tier with API key, most features

### Leaflet CSS import location: layout.tsx (global)

**Date:** 2026-03-26
**Decision:** Import `leaflet/dist/leaflet.css` in `src/app/layout.tsx`, not in the map component.
**Rationale:** In Next.js dev mode, CSS imported inside a client component is injected as a `<style>` tag by the runtime after the first render. This means Leaflet's CSS was not yet applied when `useEffect` fired and `L.map()` initialized — causing tiles to render at incorrect positions. Importing it in `layout.tsx` (a Server Component) makes it a guaranteed first-load stylesheet, matching how the PoC loaded Leaflet CSS via a `<link>` tag.
**Symptom it fixed:** ~1/3 of tiles visible, remaining tiles at wrong screen positions on every page load.

### Map library: Leaflet (via react-leaflet)

**Date:** 2025-06
**Decision:** Use Leaflet.
**Rationale:** Already proven in the PoC, including road-following (routing/snapping) and draggable segment endpoints. No blocking limitations encountered.
**Status:** Consider a formal evaluation if a specific limitation arises.

### Backend: Supabase

**Date:** 2025-06 (chosen and implemented 2026-03-31)
**Decision:** Use Supabase as the BaaS for storage (and eventually auth).
**Rationale:** Keep focus on frontend. Auth and data persistence handled by a managed service. Supabase chosen over Firebase for its Postgres-based data model and open-source nature.
**Status:** Implemented — segments are stored in Supabase.

### Email delivery: Resend

**Date:** 2026-04-24
**Decision:** Use Resend (resend.com) as the SMTP provider for Supabase auth emails (verification, password reset).
**Rationale:** Supabase's built-in email service is limited to 2 messages per hour and is not intended for production use. Resend provides a reliable free tier with no meaningful rate limits for this app's scale.
**Setup:**

- Sending subdomain `skeelermap-auth.jaron.nl` created and verified in Resend
- DNS records added in Cloudflare (DNS only, not proxied)
- Configured in Supabase under Authentication > SMTP Settings
- Sender address: `skeelermap@skeelermap-auth.jaron.nl`

---

## Architecture

### UI structure: Full-screen map, contextual panels only

**Date:** 2025-06
**Decision:** No persistent navigation bar or header in MVP. All UI surfaces are triggered contextually (panels, buttons). Map is always full-screen.
**Rationale:** Maximises usable map area, especially on mobile (iPhone SE is the primary test device).

### Default map location: Center on the Netherlands

**Date:** 2025-06
**Decision:** When location permission is unavailable or not yet granted, center the map on the Netherlands.

### Segment data model: Store routed geometry, not control points

**Date:** 2025-06
**Decision:** Persisted segment data is the routed polyline geometry (the road-following path). Original user control points are not stored.
**Rationale:** Simplifies the data model. Start and end points can be derived from the polyline geometry. Drag-to-edit (v1.1) will operate on these endpoints only, not intermediate control points.

---

## Segment creation flow

### Core flow (agreed)

**Date:** 2025-06

1. User sees full-screen map centered on their location (dot marker).
2. User taps + button — map enters drawing mode, panel appears with instruction text.
3. Each map tap places a control point (dot). After 2+ points, road-following polyline is drawn between consecutive points.
4. Once 2+ points exist, rating options become available (see open question below).
5. Tapping a rating saves the segment in the corresponding color; panel closes automatically.
6. Tapping × cancels drawing mode — all points and lines are removed, panel closes.

### Rating colors

**Date:** 2025-06
**Decision:** Reuse the 5 rating colors from the PoC.
**Action:** Extract colors from PoC code and define as design tokens early in setup.

### Rating UI visibility during drawing

**Date:** 2025-06
**Decision:** Option B — rating buttons only appear after 2+ points are placed.
**Rationale:** Tested both on iPhone SE. Option A felt cramped; showing the drawing instruction only until 2+ points are placed keeps the panel compact and focused.
**Option A (rejected):** Rating buttons visible but greyed out from step 2, activate once 2+ points are placed.

---

## Segment selection and editing

### Selection state

**Date:** 2025-06
**Decision:** Tapping a segment selects it:

- Segment stroke becomes thicker
- Start and end points shown as black dots with a border in the segment's rating color
- Panel appears showing: segment length, edit button, delete button, close button

### Edit flow

**Date:** 2025-06
**Decision:**

1. Tapping edit shows the rating picker (same UI as creation panel)
2. Current rating is indicated with an outline + filled background on the active rating button (CSS `.current` class)
3. Tapping a rating saves the new rating and closes the panel

### Delete flow

**Date:** 2025-06
**Decision:**

1. Tapping the delete (trash) icon shows a confirmation prompt
2. Confirming deletes the segment
3. Cancelling closes the confirmation prompt and returns to the segment panel

### Close behavior

**Date:** 2025-06
**Decision:** Tapping × closes the panel and deselects the segment. No changes are made.

### Drag-to-edit endpoints

**Original decision:** Deferred to v1.1. Not in MVP.
**Status:** Implemented 2026-04-01 — see "Drag-to-edit segment endpoints" section above.

---

## FAB tooltips

**Date:** 2026-04-10
**Decision:** Tooltip is rendered as a sibling of the button (inside a fragment), not as a child. Positioned via CSS anchor positioning (`position: fixed`, `position-area: left center`). Anchor name generated per-instance via `useId()`, set as an inline style using camelCase (`anchorName`, `positionAnchor`) which React converts to kebab-case.
**Key constraint:** CSS anchor positioning requires that if the positioned element is `position: fixed` (containing block = viewport), the anchor element must also have the viewport as its containing block. Since `FabContainer` is `position: fixed`, a tooltip rendered as a child of the button (inside `FabContainer`) violates this: the button's containing block is `FabContainer`, not the viewport. Making the tooltip a sibling of the button (both direct children of `FabContainer`) resolves this — the positioned element and the anchor share the same containing block.
**Scope:** Only shown on `pointer: fine` devices, scoped inside `@supports (anchor-name: --x)`.

---

## FAB container positioning: `position: fixed`

**Date:** 2026-03-31
**Decision:** The FAB container uses `position: fixed`, not `position: absolute` within `MapUIContainer`.
**Rationale:** `position: absolute` within the map container would be the natural choice, but iOS Safari's dynamic address bar overlaps the bottom of the viewport. `position: fixed` is resolved relative to the visual viewport, which shrinks to exclude the address bar — keeping the FAB visible and tappable.
**Symptom it fixed:** FAB was out of view in mobile browser emulation and on iOS Safari due to the address bar overlapping the bottom of the page.

---

## Location permission flow

**Date:** 2025-06
**Status:** DEFERRED — revisit before implementing location features.
**Questions to resolve:**

- Should we show an explanation of why location is needed before triggering the browser prompt?
- While waiting for `navigator.geolocation.watchPosition` to resolve: show map at default location, or hold until coordinates arrive?

---

## Location button behavior

**Date:** 2025-06
**MVP:** Centers map on user's current location.
**Post-MVP (noted for later):**

- Auto-follow mode: map stays centered on user while moving.
- Interaction (pan/zoom) pauses auto-follow.
- Tapping location button resumes auto-follow.

---

## Keyboard shortcuts

**Date:** 2026-04-01
**Decision:** `Esc` cancels drawing mode; `Delete` triggers deletion of the currently selected segment (same confirmation flow as the delete button).
**Rationale:** Low-effort UX improvement for desktop users. Maps naturally to existing cancel/delete actions already in the panel.

---

## Drag-to-edit segment endpoints

**Date:** 2026-04-01
**Decision:** Users can drag the start or end endpoint of a saved segment. On drag end, the new endpoint is routed via OSRM and the updated geometry is saved to Supabase.
**Rationale:** Covers the primary "fix a mistake" use case without storing intermediate control points. Operates on routed geometry endpoints only, consistent with the data model decision.
**Scope:** Endpoints only — intermediate points are not draggable (stored data is routed geometry, not original control points).

---

## Out of scope (explicit)

- Segment list view / summary statistics (present in PoC, intentionally removed)
- Zoom-based polyline weight scaling (revisit only if it becomes a visible problem)
- Custom API layer (using BaaS instead)
- Drag-to-edit segment endpoints (v1.1)
- Editing intermediate control points (not planned — stored data is routed geometry only)

---

## Auth

### Auth approach: Supabase email/password

**Date:** 2026-04-08
**Decision:** Email + password auth via Supabase. No social login.
**Details:**

- Self-service signup at `/registreren` with email verification
- Login at `/inloggen`
- On success, redirect to `/` with toast feedback via `?toast=` query param
- Toast auto-dismisses after 3–4s, positioned below menubar

### Segment creation requires auth

**Date:** 2026-04-15
**Decision:** When the user is logged out and taps “Segment toevoegen”, show a panel prompting login/registration instead of entering drawing mode.
**Rationale:** Segment writes are authenticated + ownership-protected; blocking the creation flow in the UI prevents confusing “you can draw but can’t save” states.

### Segment ownership

**Date:** 2026-04-08
**Decision:** Every segment has a `user_id` (uuid, FK to auth.users). Only the owner can edit or delete their segments.
**Enforcement:** Supabase RLS — not in the Next.js layer.
**Existing segments:** `user_id` is nullable for now. One-time SQL assignment of anonymous segments to an owner account has been completed.

### RLS policies (segments table)

**Date:** 2026-04-08

- SELECT: public (anyone can read all segments)
- INSERT: authenticated users only; `user_id` must match `auth.uid()`
- UPDATE: authenticated users only; `user_id` must match `auth.uid()`
- DELETE: authenticated users only; `user_id` must match `auth.uid()`

### Header architecture

**Date:** 2026-04-08 (originally MenuBar; renamed to Header 2026-04-10)
**Decision:** Header is a Server Component. Auth state is read server-side and passed as props to child Client Components.
**Rationale:** Avoids logged-out → logged-in flicker on load. Consistent with Next.js App Router model.
**Pattern:** `<Header>` (Server) renders `<AuthControls>` (Client) for interactive auth buttons. Future flyout menu follows the same pattern — a Client Component child of the Server Component shell.

### Toast component

**Date:** 2026-04-08
**Decision:** Map-level feedback via a `<Toast>` component rendered in `page.tsx`. Triggered by `?toast=` query param on `/`. Page reads param on mount, shows toast, clears param from URL.

### Layout architecture: root vs content pages

**Date:** 2026-04-10
**Decision:** The root layout (`app/layout.tsx`) provides chrome only — `<Header>` and `{children}`, no `<main>`. Each layout level that needs it owns its own `<main>`:

- Root page (`app/page.tsx`) wraps its map content in a full-width `<main>`.
- Content pages live in the `app/(content)/` route group, whose layout renders a max-width centered `<main>`.
  **Rationale:** Different pages need structurally different `<main>` elements (full-width map vs constrained content). Putting `<main>` in the root layout forces all pages to share the same structure. Route groups let each section own the right structure without affecting URLs.
  **Color layering:** `body` → `--color-surface-200`; `main` → `--color-surface-150` (global); `<header>` → `--color-surface-100`. Header has `max-width: var(--content-max-width)` centered — on wide screens the body color shows on either side of it (intentional).

---

### `supabaseAuth.server.ts` — `setAll` try/catch

**Date:** 2026-04-08
**Decision:** The `setAll` cookie handler in `supabaseAuth.server.ts` is wrapped in a try/catch that silently swallows errors.
**Rationale:** When `getUser()` is called from a Server Component (e.g. `MenuBar`), Supabase may attempt to refresh the session token and write an updated cookie. Next.js forbids cookie writes outside of Server Actions and Route Handlers, so this throws. The try/catch suppresses the error — the session is still valid for the current request, and the proper place for token rotation is middleware (not yet implemented).
**Risk:** Without middleware, a refreshed token won't be persisted until the next Route Handler or Server Action that writes cookies. Acceptable for now; revisit when middleware is added.
