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

### Backend: Backend-as-a-service (TBD)
**Date:** 2025-06
**Decision:** Use a BaaS (Supabase or Firebase, to be decided) rather than a custom API layer.
**Rationale:** Keep focus on frontend. Auth and data persistence will be handled by a managed service.
**Status:** Decide when auth becomes the next priority.

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
**Status:** OPEN — test both options on iPhone SE before deciding.
**Option A:** Rating buttons visible but greyed out from step 2, activate once 2+ points are placed.
**Option B:** Rating buttons only appear after 2+ points are placed.
**Consideration:** iPhone SE has limited vertical space — option A may feel cramped. Test both.

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
2. Current rating must be visually indicated — how to show this is TBD (options: highlighted/active state on current rating button; current rating label in panel header; combination of both)
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
**Date:** 2025-06
**Decision:** Deferred to v1.1. Not in MVP.
**Rationale:** Adds meaningful interaction complexity. The core "fix a mistake" use case is covered by edit rating + delete.

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

## Out of scope (explicit)

- Segment list view / summary statistics (present in PoC, intentionally removed)
- Zoom-based polyline weight scaling (revisit only if it becomes a visible problem)
- Custom API layer (using BaaS instead)
- Drag-to-edit segment endpoints (v1.1)
- Editing intermediate control points (not planned — stored data is routed geometry only)