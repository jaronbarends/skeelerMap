# Feature spec: Markers

## Overview

Users can place point markers on the map to flag hazards. Markers are independent of segments. They are stored in Supabase, owned by a user, and visible to everyone.

---

## Data model

### Supabase table: `markers`

| Column        | Type                     | Notes                               |
| ------------- | ------------------------ | ----------------------------------- |
| `id`          | `uuid`                   | PK, default `gen_random_uuid()`     |
| `user_id`     | `uuid`                   | FK to `auth.users`, not null        |
| `location`    | `geography(Point, 4326)` | PostGIS point                       |
| `type`        | `text`                   | `'danger' \| 'slope' \| 'crossing'` |
| `description` | `text`                   | nullable                            |
| `created_at`  | `timestamptz`            | default `now()`                     |

### RLS policies (same pattern as `segments`)

- SELECT: public
- INSERT: authenticated; `user_id = auth.uid()`
- UPDATE: authenticated; `user_id = auth.uid()`
- DELETE: authenticated; `user_id = auth.uid()`

### Supabase RPC: `get_markers`

Returns all markers with lat/lng extracted from the PostGIS point geometry — same pattern as `get_segments` for segments. Required because `supabase.from()` cannot extract coordinates from a `geography` column directly.

---

## Frontend type definitions

New file: `src/lib/markers.ts`

```ts
export const MARKER_TYPES = {
  danger: { iconName: 'trafficSignDanger', title: 'Gevaarlijk punt' },
  slope: { iconName: 'trafficSignSlope', title: 'Steile helling' },
  crossing: { iconName: 'trafficSignCrossing', title: 'Gevaarlijke kruising' },
} as const;

export type MarkerType = keyof typeof MARKER_TYPES;

export interface Marker {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  type: MarkerType;
  description: string | null;
}
```

`MarkerType` is derived from `MARKER_TYPES` — same pattern as `RatingValue` from `RATINGS` in `segments.ts`.

---

## API route + service file

Same pattern as segments.

### API route: `src/app/api/markers/route.ts`

Uses `getSupabaseServerClient()` from `src/lib/supabaseAuth.server.ts` — same as the segments route.

- `GET` — calls `supabase.rpc('get_markers')`, returns array of `Marker`
- `POST` — inserts a new marker; requires auth
- `PATCH` — updates type and/or description by id; requires auth + ownership enforced by RLS
- `DELETE` — deletes by id; requires auth + ownership enforced by RLS

### Service file: `src/lib/markerService.ts`

Client-side `fetch` wrappers — same pattern as `segmentService.ts`.

Functions:

- `fetchMarkers(abortSignal): Promise<Marker[]>`
- `createMarker(data): Promise<{ id: string }>`
- `updateMarker(id, data): Promise<void>`
- `removeMarker(id): Promise<void>`

---

## MapUIMode extensions

Current modes renamed for clarity:

| Old         | New                |
| ----------- | ------------------ |
| `'view'`    | `'idle'`           |
| `'details'` | `'segmentDetails'` |
| `'edit'`    | `'editSegment'`    |
| `'delete'`  | `'deleteSegment'`  |

New marker modes added:

- `'placeMarker'` — user is in marker placement mode, tap on map places temporary marker
- `'markerForm'` — temporary marker placed, form is shown
- `'markerDetails'` — existing marker tapped, details panel shown
- `'editMarker'` — editing an existing marker
- `'deleteMarker'` — confirming deletion of a marker

---

## UIAction renames and additions

### Renamed (segments)

| Old                                   | New                           |
| ------------------------------------- | ----------------------------- |
| `START_CREATION`                      | `START_CREATE_SEGMENT`        |
| `CANCEL_CREATION`                     | `CANCEL_CREATE_SEGMENT`       |
| `EDIT_START`                          | `START_EDIT_SEGMENT`          |
| `START_DELETE`                        | `START_DELETE_SEGMENT`        |
| `CANCEL_DELETE`                       | `CANCEL_DELETE_SEGMENT`       |
| `CONFIRM_DELETE`                      | `SEGMENT_DELETED`             |
| `UPDATE_SELECTED_SEGMENT_COORDINATES` | `SEGMENT_COORDINATES_UPDATED` |
| `UPDATE_CONTROL_POINT_COUNT`          | `CONTROL_POINT_COUNT_UPDATED` |

`SEGMENT_CREATED` is kept as-is.

### Action naming convention

- **Imperative** (`START_`, `CANCEL_`) — user triggered something
- **Past tense** (`_CREATED`, `_DELETED`, `_UPDATED`) — operation completed

### New marker actions

- `START_CREATE_MARKER` — user tapped "voeg een waarschuwing toe"
- `CANCEL_CREATE_MARKER` — user tapped "Annuleren" from either `'placeMarker'` or `'markerForm'`; always returns to `'drawSegment'`
- `PLACE_MARKER` — user tapped map in `'placeMarker'` mode; stores temporary lat/lng
- `MARKER_CREATED` — marker saved to Supabase
- `SELECT_MARKER` — user tapped an existing marker
- `DESELECT_MARKER` — panel closed
- `START_EDIT_MARKER`
- `START_DELETE_MARKER`
- `CANCEL_DELETE_MARKER`
- `MARKER_DELETED`
- `MARKER_UPDATED`

---

## SegmentCreationPanel modes

The panel now receives an explicit `mode` prop instead of `isReadyToRate`. `MapUIContainer` is the single source of truth for what is displayed.

| Mode            | Content                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `'drawSegment'` | Instruction text + inline "voeg een waarschuwing toe" link. Link hidden once 1+ points placed. |
| `'rateSegment'` | Rating buttons (2+ points placed)                                                              |
| `'placeMarker'` | Placement instruction + "Annuleren" button                                                     |
| `'markerForm'`  | Icon picker + description field + "Opslaan" + "Annuleren" button. Temporary marker on map.     |

**Transition: `'drawSegment'` → `'placeMarker'`**
When the user taps "voeg een waarschuwing toe", any placed control points are cleared via `mapRef.current?.cancelCreateSegment()` before dispatching `START_CREATE_MARKER`.

**"Annuleren" behavior**
Both `'placeMarker'` and `'markerForm'` show a secondary "Annuleren" button. Both dispatch `CANCEL_CREATE_MARKER`, which returns to `'drawSegment'`. They are visually and functionally identical.

---

## MarkerDetailsPanel

New component: `src/components/panel/MarkerDetailsPanel.tsx`

Mirrors `SegmentDetailsPanel` in structure. Handles `'markerDetails'`, `'editMarker'`, `'deleteMarker'` modes.

```ts
interface Props {
  marker: Marker;
  mode: 'markerDetails' | 'editMarker' | 'deleteMarker';
  currentUserOwnsMarker: boolean;
  onClose: () => void;
  onEditStart?: () => void;
  onDeleteStart?: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onSave: (type: MarkerType, description: string | null) => void;
  isPending: boolean;
}
```

### markerDetails mode

- Title: marker type title from `MARKER_TYPES` (e.g. "Steile helling")
- Description if present
- "Aangemaakt door jou" / "Aangemaakt door andere gebruiker"
- Owner only: edit + delete buttons in panel header

### editMarker mode

- Title: "Waarschuwing aanpassen"
- Icon picker with current type pre-selected
- Description field pre-filled
- "Opslaan" button

### deleteMarker mode

- Title: "Waarschuwing verwijderen?"
- Same confirmation pattern as segment delete
- "Annuleren" + "Verwijderen" buttons

---

## Map rendering

Markers are rendered as Leaflet `DivIcon` markers containing the SVG icon. Clicking a marker selects it and opens `MarkerDetailsPanel`. Click event stops propagation so the map click handler does not fire.

Markers are fetched in `MapUIContainer` on mount alongside segments — same pattern as `fetchSegmentsForMap`.

---

## MapUIContainer changes

- Rename existing `UIAction` and `MapUIMode` values as specified above
- Add `markers` state: `useState<Marker[]>([])`
- Add `selectedMarker` to `UIState`
- Add `pendingMarkerLocation` to `UIState` (lat/lng of temporary marker during `'markerForm'`)
- Add marker action handlers following the same pattern as segment handlers
- Pass `markers`, `selectedMarker`, `pendingMarkerLocation`, and marker event callbacks to `MapView`

---

## Out of scope for this feature

- Hover tooltips
- Filtering markers by type
- Bounding box optimisation (fetch all markers for now)
