# Backlog

Post-MVP features in rough priority order. Pick the next item from here and move it to `status.md` when work starts.

---

## High priority

### Drag-to-edit segment endpoints

Allow users to drag the start or end point of a saved segment to adjust it. Operates on routed geometry endpoints only — not intermediate control points (those are not stored).
_Noted in decisions.md as v1.1._

### Location permission flow

Decide and implement what happens before/during the browser location prompt:

- Show explanation before triggering the prompt?
- Show default map location while waiting, or hold?

---

## Medium priority

### Keyboard shortcuts

- `Esc` — cancel drawing mode
- `Delete` — delete selected segment in edit mode

### Auto-follow location mode

Map stays centered on user while moving. Panning/zooming pauses auto-follow. Tapping the location button resumes it.
_Post-MVP behavior noted in decisions.md._

### Zoom-based visual scaling

Scale polyline weight based on zoom level. Defer unless it becomes a visible problem.

### Production tile provider

Choose and configure a production tile provider. Current CartoDB usage may violate ToS under real traffic.
Options: Stadia Maps, Maptiler, Mapbox — all have free tiers with API keys.
_Open decision in decisions.md._

---

## Low priority

### Legend / info panel

Explain the 5 rating levels to the user.

### Logo / branding

### Auth (Supabase)

Supabase is in place. Auth not yet implemented. Required before segments can be user-scoped.

### FAQ or other pages

Deferred until core app is stable.

---

## Icebox

Items that have been considered and explicitly deferred with no near-term plan.

### Segment list view / statistics

Present in the PoC, intentionally removed for MVP. Revisit only if there's a clear user need.

### Editing intermediate control points

Not planned — stored data is routed geometry only, control points are discarded after routing.
