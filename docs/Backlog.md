# Backlog

Post-MVP features in rough priority order. Pick the next item from here and move it to `status.md` when work starts.

---

## High priority

### when logging out, cancel all current actions

### show indicator while loading map data

### use Dutch error messages

Supabase error messages are in English by default; for Dutch errors, add a translation layer on top of authError.message.

### re-evaluate error messages on change

`setError` is now only called in `handleSubmit`. We want to update the error message when they're corrected.

### Auth: confirmation failure page

Currently, a failed email verification redirects to `/?toast=confirmation-failed`
which is too brief for this error case. A failed confirmation needs a dedicated page
that explains what went wrong and what the user can do next (e.g. request a new
verification email, contact support, or try signing up again).

- Create `/auth/confirmation-failed` page with a clear error message and next steps
- Update `src/app/auth/callback/route.ts` to redirect there instead of `/?toast=confirmation-failed`

---

## Medium priority

### Auto-follow location mode

Map stays centered on user while moving. Panning/zooming pauses auto-follow. Tapping the location button resumes it.
_Post-MVP behavior noted in decisions.md._

### [techdebt] move inlineLinkButton somewhere else

### [techdebt] in MapUIContainer `getMapUIModeForControlPointCount` feels bloated

### [techdebt]

discuss: UIActions and uiReducer from MapUIContainer to separate file(s)?

### Location permission flow

Decide and implement what happens before/during the browser location prompt:

- Show explanation before triggering the prompt?
- Show default map location while waiting, or hold?

### Center-on-location FAB: permission-aware visibility

Currently the FAB is always shown (`disabled={false}`), and silently does nothing when geolocation is denied.

Use the Permissions API (`navigator.permissions.query({ name: 'geolocation' })`) to track permission state and expose it from `useMapInit`. Then in `MapUIContainer`:

- `granted` — show FAB normally
- `prompt` — show FAB (the existing `watchPosition` call already triggers the browser prompt on map load)
- `denied` — hide or disable the FAB; optionally show a tooltip like "Schakel locatietoegang in via je browserinstellingen"

The `PermissionStatus` object supports a `change` event, so the FAB reacts live if the user changes the setting while the app is open.

Note: a `denied` permission cannot be re-triggered via JS — the user must reset it manually in browser settings.

### Zoom-based visual scaling

Scale polyline weight based on zoom level. Defer unless it becomes a visible problem.

### Production tile provider

Choose and configure a production tile provider. Current CartoDB usage may violate ToS under real traffic.
Options: Stadia Maps, Maptiler, Mapbox — all have free tiers with API keys.
_Open decision in decisions.md._

### Supabase auth middleware

Add `src/middleware.ts` to handle session token refresh on every request.

Currently, token refresh is attempted in Server Components (e.g. MenuBar) where
cookie writes are not allowed — the try/catch in `supabaseAuth.server.ts` suppresses
the resulting error. This means a refreshed token is not persisted, and users may
be logged out unexpectedly when their token expires.

Middleware runs before any page renders and is allowed to write cookies, making it
the correct place for token refresh. Supabase's SSR documentation has a standard
template for this.

**Risk without this:** low for now — tokens are valid for 1 hour and the user base
is small. Revisit before launch.

### Error and success styling

The success messages in Toast.tsx should indicate success more: maybe add green background or checkmark. The error messages in the form should have a red background. Investigate if we have more occurences of succes / error feedback and apply there too.

### Only show user-info when user is logged in

In SegmentDetailsPanel (and if we already have it, MarkerDetailsPanel), only show the user information ('Segment aangemaakt door jou' or 'Segment aangemaakt door andere gebruiker') if the user is logged in.

---

## Low priority

### Legend / info panel

Explain the 5 rating levels to the user.

### Logo / branding

### Add max length to marker description

Add a max length; include a counter showing how many characters are left

### FAQ or other pages

Deferred until core app is stable.

### User profiles table

Add a `profiles` table in Supabase (FK to `auth.uid()`, auto-populated on signup via trigger).
Needed as a clean extension point for user metadata — in particular, a `role` column for
admin vs. regular user permissions. Admin users would be able to edit/delete all segments;
regular users can only edit/delete their own.
Do not implement role-based RLS until the profiles table exists.

### Use Custom SMTP for supabase emails

To overcome Supabase's free tier limit (2-3 mails per hour), Configure a provider like Resend, SendGrid, or Postmark in your project settings to overcome free tier limitations.

---

## Icebox

Items that have been considered and explicitly deferred with no near-term plan.

### Segment list view / statistics

Present in the PoC, intentionally removed for MVP. Revisit only if there's a clear user need.

### Editing intermediate control points

Not planned — stored data is routed geometry only, control points are discarded after routing.

## Done

### ~~Keyboard shortcuts~~ ✓ Done

- `Esc` — cancel drawing mode
- `Delete` — delete selected segment in edit mode
  _Implemented 2026-04-01._

### ~~Drag-to-edit segment endpoints~~ ✓ Done

Allow users to drag the start or end point of a saved segment to adjust it. Operates on routed geometry endpoints only — not intermediate control points (those are not stored).
_Implemented 2026-04-01._

### ~~Indicate saving~~ ✓ Done

Saving a segment may take some time. Give the user feedback that something's happening.
_Implemented 2026-04-07._

### ~~Menubar~~ ✓ Done

Replace placeholder with real menubar: app name + tagline stacked left, auth controls right.
_Implemented 2026-04-08._

### ~~Auth: login + signup~~ ✓ Done

`/inloggen` and `/registreren` pages with Supabase email/password auth.
_Implemented 2026-04-08._

### ~~Toast component~~ ✓ Done

Map-level feedback component. Rendered in `page.tsx`, triggered by `?toast=` query param.
_Implemented 2026-04-08._

### ~~Add `user_id` to segments table~~ ✓ Done

Supabase migration: add `user_id` (uuid, nullable) to segments table. Enable RLS with policies per decisions.md.
_Implemented 2026-04-08._

### ~~Hide edit/delete controls for segments not owned by current user~~ ✓ Done

_Implemented 2026-04-08._

### ~~use DRY solution for buttons and forms~~ ✓ Done

`Button` component for interactive buttons; global element and component stylesheets for forms.
_Implemented 2026-04-09._

### ~~update GitHub repo name~~ ✓ Done

Change SkateMap to SkeelerMap
_Implemented 2026-04-09._

### ~~Layout for content pages~~ ✓ Done

In LoginForm and SignUpForm we now have a div.formPage that defines the page's layout. Come up with a generic page layout.
_Implemented 2026-04-10._

### ~~Add toast after logging out~~ ✓ Done

When the user logs out, they don't see any confirmation of that. Show a toast with the text "Je bent nu uitgelogd."
_Implemented 2026-04-14._

### ~~Don't allow drawing segments when not logged in~~ ✓ Done

When user is not logged in, when clicking on add segment button, they should be shown a panel with a text that they need to login (or register) to create segments.

_Implemented 2026-04-15._

### ~~Add markers (warnings)~~ ✓ Done

Add option to add markers on the map. For now, markers represent warnings: dangerous point, dangerous crossing, steep slope.

_Implemented 2026-04-20._

### ~~handle pending segment save~~ ✓ Done

show indicator while saving segment; disable buttons

_Implemented 2026-04-21._

### ~~~~only show "aangemaakt door jou" or "aangemaakt door andere gebruiker" for logged in user~~ ✓ Done

_Implemented 2026-04-22._
