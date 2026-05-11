# Architecture

Technical decisions and their rationale. Covers noteworthy and non-obvious choices

---

## UI state as an explicit state machine

Interacting with the map has a surprising amount of states: idle, drawing (with 0, 1, or 2+ points), segment selected, editing a selected segment, confirming deletion, etcetera. I started with state variables for this, but there were too many interdependent factors to keep that usable.

I extracted it into a `useReducer` with an explicit `UIAction` union type and a `uiReducer` function in `src/lib/mapUIReducer.ts`. Transitions are now exhaustive and typed - an invalid state change simply has no handler. It also made the component easier to test in isolation.

I have extracted the state logic into a separate reducer in `src/lib/mapUIReducer.ts`, with dedicated state and action types. Using a state machine library felt like overkill to me.

---

## Plain Leaflet over react-leaflet

react-leaflet is good in declarative flows (where data flows from React to Leaflet, so for displaying existing segments, react-leaflet would be easier). However, most of the Leaflet-related complexity is in segment creation. That is an imperative flow (click to place point, drag endpoint, draw polyline) where the flow is the other way around: Leaflet creates data to store in React state. Plain Leaflet is more suitable for that.

I use React's `useImperativeHandle` to let `MapView` expose some functions to `MapUIContainer`. That's a bit unusual for React, but it fits where we specifically want to instruct the map what to do. Using react-leaflet would have made that more difficult.

---

## Adding middleware to refresh JWT

Supabase's JWT have an expiry time of 1 hour. If we wouldn't use middleware, the token would only be refreshed in server actions or route handlers. In that case, a user who is only reading data, could be silently logged out in the middle of a session.

---

## Using RLS for ownership

Since the only logic for ownership lives in Supabase, we use Supabase's RLS policies. Checking ownership in the Next.js would mean it would do the same job, with the risk of diverging. (This would make sense if we had more complex business logic for ownership, where we would want to handle the complexity in the app)

---

## Storing routed geometry, not control points

When a user draws a segment, they place control points; OSRM routes the actual road-following path between them. Only the routed geometry is stored; the control points are discarded.

We only need control points if you want to re-edit a segment by repositioning intermediate points. That is useful when you create long routes on a map, but because I expect the segments to be short I don't want to build this.

---

## Leaflet CSS imported in layout.tsx, not in the map component

In Next.js dev mode, CSS imported inside a Client Component is loaded on demand and injected as a `<style>` tag. This causes a race-condition: when the `useEffect` what calls `L.map()` fires, Leaflet's CSS sometimes wasn't applied yet, and that rendered tiles at the wrong positions. In production this wouldn't be an issue, because Next pre-processes CSS and includes it in the html.
Importing it in server component `layout.tsx` fixes this. This does mean that the css is always added, even for pages that don't need it. Since the map is the core functionality, I think that's okay in this case.
Pending in backlog: check if `useLayoutEffect` with `requestAnimationFrame` is a better solution.

---

## FAB tooltips via CSS anchor positioning

The non-obvious constraint: a `position: fixed` element's containing block is the viewport. For anchor positioning to work, the anchor element must share the same containing block as the positioned element. Since `FabContainer` is `position: fixed`, a tooltip rendered _inside_ the button would have `FabContainer` as its containing block - breaking the anchor relationship. The fix is to render the tooltip as a sibling of the button, both direct children of `FabContainer`.
