# Backlog

Post-MVP features in rough priority order. Pick the next item from here and move it to `status.md` when work starts.

---

## High priority

### ~~Drag-to-edit segment endpoints~~ ✓ Done

Allow users to drag the start or end point of a saved segment to adjust it. Operates on routed geometry endpoints only — not intermediate control points (those are not stored).
_Implemented 2026-04-01._

### ~~Indicate saving~~ ✓ Done

Saving a segment may take some time. Give the user feedback that something's happening.
_Implemented 2026-04-07._

### Menubar

Replace placeholder with real menubar: app name + tagline stacked left, auth controls right.

- App name: TBD (working title: SkateMap)
- Tagline: "Vind en beoordeel skeelerpaden"
- Logged-out: "Inloggen" button
- Logged-in: "Uitloggen" button
- MenuBar is a Server Component; interactive parts are Client Component children
- See decisions.md for architecture details

### Auth: login + signup

`/login` and `/signup` pages with Supabase email/password auth.

- Email verification required on signup
- On success: redirect to `/` with `?toast=` query param for feedback
- Segment write operations gated behind auth
- See decisions.md for full details

### Toast component

Map-level feedback component. Rendered in `page.tsx`, triggered by `?toast=` query param.
Auto-dismisses after 3–4s. Positioned below menubar.

### Add `user_id` to segments table

Supabase migration: add `user_id` (uuid, nullable) to segments table. Enable RLS with policies per decisions.md.
After first login: manually assign existing segments to owner account via SQL update.

### use Dutch error messages

Supabase error messages are in English by default; for Dutch errors, add a translation layer on top of authError.message.

### re-evaluate error messages on change

`setError` is now only called in `handleSubmit`. We want to update the error message when they're corrected.

### use DRY solution for buttons and forms

TBD: do we want a button component, or do we use global button classes?

### Auth: confirmation failure page

Currently, a failed email verification redirects to `/?toast=confirmation-failed`
which is too brief for this error case. A failed confirmation needs a dedicated page
that explains what went wrong and what the user can do next (e.g. request a new
verification email, contact support, or try signing up again).

- Create `/auth/confirmation-failed` page with a clear error message and next steps
- Update `src/app/auth/callback/route.ts` to redirect there instead of `/?toast=confirmation-failed`

---

## Medium priority

### ~~Keyboard shortcuts~~ ✓ Done

- `Esc` — cancel drawing mode
- `Delete` — delete selected segment in edit mode
  _Implemented 2026-04-01._

### Auto-follow location mode

Map stays centered on user while moving. Panning/zooming pauses auto-follow. Tapping the location button resumes it.
_Post-MVP behavior noted in decisions.md._

### Location permission flow

Decide and implement what happens before/during the browser location prompt:

- Show explanation before triggering the prompt?
- Show default map location while waiting, or hold?

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

### FAQ or other pages

Deferred until core app is stable.

### User profiles table

Add a `profiles` table in Supabase (FK to `auth.uid()`, auto-populated on signup via trigger).
Needed as a clean extension point for user metadata — in particular, a `role` column for
admin vs. regular user permissions. Admin users would be able to edit/delete all segments;
regular users can only edit/delete their own.
Do not implement role-based RLS until the profiles table exists.

---

## Icebox

Items that have been considered and explicitly deferred with no near-term plan.

### Segment list view / statistics

Present in the PoC, intentionally removed for MVP. Revisit only if there's a clear user need.

### Editing intermediate control points

Not planned — stored data is routed geometry only, control points are discarded after routing.
