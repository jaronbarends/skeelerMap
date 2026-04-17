export const CREATE_SEGMENT_MODES = ['drawSegment', 'rateSegment'] as const;
export const CREATE_MARKER_MODES = ['placeMarker', 'markerForm'] as const;
export const SEGMENT_DETAILS_MODES = ['segmentDetails', 'editSegment', 'deleteSegment'] as const;
export const MARKER_DETAILS_MODES = ['markerDetails', 'editMarker', 'deleteMarker'] as const;

export type CreateSegmentMode = (typeof CREATE_SEGMENT_MODES)[number];
export type CreateMarkerMode = (typeof CREATE_MARKER_MODES)[number];
export type SegmentDetailsMode = (typeof SEGMENT_DETAILS_MODES)[number];
export type MarkerDetailsMode = (typeof MARKER_DETAILS_MODES)[number];

export type MapUIMode =
  | 'idle'
  | CreateSegmentMode
  | CreateMarkerMode
  | SegmentDetailsMode
  | MarkerDetailsMode;

export function isCreateSegmentMode(mode: MapUIMode): mode is CreateSegmentMode {
  return (CREATE_SEGMENT_MODES as readonly string[]).includes(mode);
}

export function isCreateMarkerMode(mode: MapUIMode): mode is CreateMarkerMode {
  return (CREATE_MARKER_MODES as readonly string[]).includes(mode);
}

export function isSegmentDetailsMode(mode: MapUIMode): mode is SegmentDetailsMode {
  return (SEGMENT_DETAILS_MODES as readonly string[]).includes(mode);
}

export function isMarkerDetailsMode(mode: MapUIMode): mode is MarkerDetailsMode {
  return (MARKER_DETAILS_MODES as readonly string[]).includes(mode);
}

