# Backlog

Post-MVP features in rough priority order. Pick the next item from here and move it to `status.md` when work starts.

---

## High priority

### Remove marker bug

Steps to reproduce:

- place a marker
- select marker, click trash and confirm remove
- marker is no longer visible
- change zoom level
- marker is rendered again. Trying to remove marker results in "kan marker niet verwijderen"

### Go live

- Verify email expiry is 86400 seconds (check go-live-checklist.md)
- Deploy

---

## Medium priority

### Add a test suite

Add baseline test coverage as a learning exercise. Scope:

- One utility function (unit test with Vitest)
- One form component (component test with React Testing Library)
- One E2E happy path with Playwright (e.g. user logs in, adds a segment)

### Publish frontend-tooling-config

eslint.config uses @jaronbarends/frontend-tooling-config, now imported from file system. publish the package to npm and import from there.

### Password requirements

Set password requirements Authentication > Sign In / Providers / Email > Password requirements
Add indication at pw field
add realtime check
allowed symbols by supabase: !@#$%^&\*()\_+-=[]{};'\:"|<>?,./`~

### Investigate alternative location for leaflet.css

In Next.js dev mode, CSS imported inside a Client Component is loaded on demand and injected as a `<style>` tag. This causes a race-condition: when the `useEffect` that calls `L.map()` fires, Leaflet's CSS sometimes wasn't applied yet, and that rendered tiles at the wrong positions. In production this wouldn't be an issue, because Next pre-processes CSS and includes it in the html.
Importing it in server component `layout.tsx` fixes this. This does mean that the css is always added, even for pages that don't need it. Since the map is the core functionality, I think that's okay in this case. Even so, check if `useLayoutEffect` with `requestAnimationFrame` is a better solution.

### Center-on-location FAB: permission-aware visibility

Currently the FAB is always shown (`disabled={false}`), and silently does nothing when geolocation is denied.

Use the Permissions API (`navigator.permissions.query({ name: 'geolocation' })`) to track permission state and expose it from `useMapInit`. Then in `MapUIContainer`:

- `granted` — show FAB normally
- `prompt` — show FAB (the existing `watchPosition` call already triggers the browser prompt on map load)
- `denied` — hide or disable the FAB; optionally show a tooltip like "Schakel locatietoegang in via je browserinstellingen"

The `PermissionStatus` object supports a `change` event, so the FAB reacts live if the user changes the setting while the app is open.

Note: a `denied` permission cannot be re-triggered via JS — the user must reset it manually in browser settings.

### live-check error messages on change

`setFeedback` is now only called in `handleSubmit`. We want to update the error message when they're corrected.

### Location permission flow

Decide and implement what happens before/during the browser location prompt:

- Show explanation before triggering the prompt?
- Show default map location while waiting, or hold?

### Legend / info panel

Explain the 5 rating levels to the user.

### [techdebt] move inlineLinkButton somewhere else

---

## Low priority

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

### Switch auth functions to Server Actions

Migrate signIn, signUp, signOut, updatePassword, and resetPasswordForEmail from browser-client calls in supabaseAuth.ts to Server Actions. Use useActionState in the form components. Eliminates getBrowserClient from the auth flow; aligns with App Router's server-first model.
Skip for now: middleware already handles token rotation, and the current setup works. Learn the pattern on a new feature first, then revisit.

---

## Icebox

Items that have been considered and explicitly deferred with no near-term plan.

### Re-evaluate Handling deleted user's segments

ATM, in supabase we have a constraint on table segments for fk_segments_user_id: delete_rule CASCADE, which deletes their segments when a user is deleted. Is this still what we want?

### Zoom-based visual scaling

Scale polyline weight based on zoom level. Defer unless it becomes a visible problem.

### Segment list view / statistics

Present in the PoC, intentionally removed for MVP. Revisit only if there's a clear user need.

### Editing intermediate control points

Not planned — stored data is routed geometry only, control points are discarded after routing.

---

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

### ~~only show "aangemaakt door jou" or "aangemaakt door andere gebruiker" for logged in user~~ ✓ Done

_Implemented 2026-04-22._

### ~~when logging out, cancel all current actions~~ ✓ Done

_Implemented 2026-04-22._

### ~~Bullet proof maken van sign up / login flow~~ ✓ Done

Dedicated error page, forgot password flow, re-send confirmation, Dutch error messages, generic auth callback, Resend for email delivery.
_Implemented 2026-04-24._

### ~~use Dutch error messages~~ ✓ Done

Translation layer in `src/lib/authErrorTranslations.ts` on top of Supabase `authError.message`.
_Implemented 2026-04-24._

### ~~form tech debt~~ ✓ Done

- move all auth pages to (content)/(auth)
- remove old auth/callback urls from Authentication > URL Configuration
- add pending state to all submitbuttons
- add title to success states after sending mail (signup, request reset)
- use constants for recurring form errors (like password not matching)
- see if we need components for recurring form items (input fields, button)
- move FormError out of auth

### ~~toast closing behavior~~ ✓ Done

- make timeout longer
- make dismiss obvious by adding button
- add countdown bar
  _Implemented 2026-04-29._

### ~~Add possibility to resend confirmation email~~ ✓ Done

_Implemented 2026-04-29._

### ~~show indicator while loading map data~~ ✓ Done

_Implemented 2026-05-01._

### ~~Only show user-info when user is logged in~~ ✓ Done

In SegmentDetailsPanel (and if we already have it, MarkerDetailsPanel), only show the user information ('Segment aangemaakt door jou' or 'Segment aangemaakt door andere gebruiker') if the user is logged in.

### ~~Error and success styling~~ ✓ Done

The success messages in Toast.tsx should indicate success more: maybe add green background or checkmark. The error messages in the form should have a red background. Investigate if we have more occurences of succes / error feedback and apply there too.

### ~~Use Custom SMTP for supabase emails~~ ✓ Done

To overcome Supabase's free tier limit (2-3 mails per hour), configure a provider like Resend in project settings.
_Implemented 2026-04-24._

### ~~[techdebt] in MapUIContainer `getMapUIModeForControlPointCount` feels bloated~~ ✓ Done

_Moved to `src/lib/mapUIReducer.ts` 2026-05-01._

### ~~[techdebt] UIActions and uiReducer from MapUIContainer to separate file(s)?~~ ✓ Done

_Extracted to `src/lib/mapUIReducer.ts` 2026-05-01._

### ~~Production tile provider~~ ✓ Done

Choose and configure a production tile provider. Decided on OSM.
_Decided 2026-05-04._

### ~~Supabase auth middleware~~ ✓ Done

`src/middleware.ts` refreshes the JWT on every request, properly persisting updated session cookies.
_Implemented 2026-05-08._

### ~~Auto-follow location mode~~ ✓ Done

Map stays centered on user while moving. Panning/zooming pauses auto-follow. Tapping the location button resumes it.
_Implemented 2026-05-05._

### ~~Write a proper README~~ ✓ Done

Human-readable explanation of what the app does, why it was built, and 2–3 explicit
architectural decisions with their rationale. Pull from decisions.md.
Not technical docs — written for a potential contributor reading it cold.
_Implemented 2026-05-11._
