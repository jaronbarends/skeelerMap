# SkeelerMap

## Setup

`MapView` (`src/components/map/MapView.tsx`) takes care of all map-related functionality. It exposes methods to `MapUIContainer`'s `mapRef` with `useImperativeHandle`. Other Map UI elements use those exposed methods.

`MapUIContainer` handles the state, has method for fetching segments. It passes `fetchSegments` and the `segments` array to children. So then `Map` and `SegmentsList` (if we would have that) can determine themselves when segments should be fetched again.
The alternative would be to give `Map` an `onBoundsChanged` prop, and `SegmentsList` an `onListChanged` prop. But then you would have to create such a prop for every possible event in those segment views that would require re-fetching the segments. By passing `fetchSegments`, you leave it up to the views to determine when new segments should be fetched.
