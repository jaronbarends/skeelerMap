import type { MapUIMode } from '@/lib/mapUIMode';
import type { MarkerType, Marker } from '@/lib/markers';
import type { Segment } from '@/lib/segments';

export type UIState = {
  mapUIMode: MapUIMode;
  selectedSegment: Segment | null;
  selectedMarker: Marker | null;
  controlPointCount: number;
  creationModeActive: boolean;
  loginRequiredPanelOpen: boolean;
  pendingMarkerLocation: { lat: number; lng: number } | null;
};

export type UIAction =
  | { type: 'SELECT_SEGMENT'; payload: Segment }
  | { type: 'SEGMENT_COORDINATES_UPDATED'; payload: { newCoordinates: [number, number][] } }
  | { type: 'DESELECT_SEGMENT' }
  | { type: 'START_CREATE_SEGMENT' }
  | { type: 'CONTROL_POINT_COUNT_UPDATED'; payload: number }
  | { type: 'SEGMENT_CREATED' }
  | { type: 'CANCEL_CREATE_SEGMENT' }
  | { type: 'START_CREATE_MARKER' }
  | { type: 'MARKER_LOCATION_CLICKED'; payload: { lat: number; lng: number } }
  | { type: 'CANCEL_CREATE_MARKER' }
  | { type: 'MARKER_CREATED'; payload: Marker }
  | { type: 'SELECT_MARKER'; payload: Marker }
  | { type: 'DESELECT_MARKER' }
  | { type: 'START_EDIT_MARKER' }
  | { type: 'START_DELETE_MARKER' }
  | { type: 'CANCEL_DELETE_MARKER' }
  | { type: 'MARKER_DELETED' }
  | { type: 'MARKER_UPDATED'; payload: { type: MarkerType; description: string | null } }
  | { type: 'CANCEL_EDIT_MARKER' }
  | { type: 'SHOW_LOGIN_REQUIRED' }
  | { type: 'HIDE_LOGIN_REQUIRED' }
  | { type: 'START_DELETE_SEGMENT'; payload: Segment }
  | { type: 'CANCEL_DELETE_SEGMENT' }
  | { type: 'SEGMENT_DELETED' }
  | { type: 'START_EDIT_SEGMENT' }
  | { type: 'CANCEL_CURRENT_ACTION' };

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SEGMENT_CREATED':
      return {
        ...state,
        creationModeActive: false,
        controlPointCount: 0,
        mapUIMode: 'idle',
        selectedSegment: null,
        selectedMarker: null,
        pendingMarkerLocation: null,
      };
    case 'SELECT_SEGMENT':
      return {
        ...state,
        selectedMarker: null,
        pendingMarkerLocation: null,
        selectedSegment: action.payload,
        mapUIMode: 'segmentDetails',
      };
    case 'DESELECT_SEGMENT':
      return { ...state, selectedSegment: null, mapUIMode: 'idle' };
    case 'START_CREATE_SEGMENT':
      return {
        ...state,
        creationModeActive: true,
        mapUIMode: 'drawSegment',
        loginRequiredPanelOpen: false,
        pendingMarkerLocation: null,
        selectedMarker: null,
      };
    case 'CONTROL_POINT_COUNT_UPDATED':
      return {
        ...state,
        controlPointCount: action.payload,
        mapUIMode: getMapUIModeForControlPointCount(state, action.payload),
      };
    case 'START_CREATE_MARKER':
      return { ...state, mapUIMode: 'placeMarker', pendingMarkerLocation: null };
    case 'MARKER_LOCATION_CLICKED':
      return { ...state, mapUIMode: 'markerForm', pendingMarkerLocation: action.payload };
    case 'CANCEL_CREATE_MARKER':
      return {
        ...state,
        mapUIMode: 'drawSegment',
        pendingMarkerLocation: null,
      };
    case 'MARKER_CREATED':
      return {
        ...state,
        mapUIMode: 'idle',
        pendingMarkerLocation: null,
        creationModeActive: false,
        controlPointCount: 0,
        selectedMarker: null,
      };
    case 'SELECT_MARKER':
      return {
        ...state,
        selectedSegment: null,
        pendingMarkerLocation: null,
        selectedMarker: action.payload,
        mapUIMode: 'markerDetails',
      };
    case 'DESELECT_MARKER':
      return { ...state, mapUIMode: 'idle', selectedMarker: null };
    case 'START_EDIT_MARKER':
      return { ...state, mapUIMode: 'editMarker' };
    case 'START_DELETE_MARKER':
      return { ...state, mapUIMode: 'deleteMarker' };
    case 'CANCEL_DELETE_MARKER':
      return { ...state, mapUIMode: 'markerDetails' };
    case 'MARKER_DELETED':
      return {
        ...state,
        mapUIMode: 'idle',
        selectedMarker: null,
        pendingMarkerLocation: null,
      };
    case 'MARKER_UPDATED':
      return {
        ...state,
        mapUIMode: 'idle',
        selectedMarker: null,
        pendingMarkerLocation: null,
      };
    case 'CANCEL_EDIT_MARKER':
      return { ...state, mapUIMode: 'markerDetails' };
    case 'CANCEL_CREATE_SEGMENT':
      return {
        ...state,
        creationModeActive: false,
        controlPointCount: 0,
        mapUIMode: 'idle',
        selectedSegment: null,
        selectedMarker: null,
        loginRequiredPanelOpen: false,
        pendingMarkerLocation: null,
      };
    case 'SHOW_LOGIN_REQUIRED':
      return {
        ...state,
        loginRequiredPanelOpen: true,
        creationModeActive: false,
        controlPointCount: 0,
        mapUIMode: 'idle',
        selectedSegment: null,
        selectedMarker: null,
        pendingMarkerLocation: null,
      };
    case 'HIDE_LOGIN_REQUIRED':
      return { ...state, loginRequiredPanelOpen: false };
    case 'SEGMENT_COORDINATES_UPDATED':
      if (!state.selectedSegment) {
        return state;
      }
      return {
        ...state,
        selectedSegment: { ...state.selectedSegment, coordinates: action.payload.newCoordinates },
      };
    case 'START_EDIT_SEGMENT':
      return { ...state, mapUIMode: 'editSegment' };
    case 'START_DELETE_SEGMENT':
      return { ...state, mapUIMode: 'deleteSegment' };
    case 'CANCEL_DELETE_SEGMENT':
      return { ...state, mapUIMode: 'segmentDetails' };
    case 'SEGMENT_DELETED':
      return { ...state, mapUIMode: 'idle', selectedSegment: null };
    case 'CANCEL_CURRENT_ACTION':
      return {
        ...state,
        mapUIMode: 'idle',
        selectedSegment: null,
        selectedMarker: null,
        controlPointCount: 0,
        creationModeActive: false,
        loginRequiredPanelOpen: false,
        pendingMarkerLocation: null,
      };
    default: {
      const _exhaustive: never = action;
      // eslint-disable-next-line no-console
      console.error(`Unknown action type: ${(_exhaustive as { type: unknown }).type}`);
      return state;
    }
  }
}

export const initialUiState: UIState = {
  mapUIMode: 'idle',
  selectedSegment: null,
  selectedMarker: null,
  controlPointCount: 0,
  creationModeActive: false,
  loginRequiredPanelOpen: false,
  pendingMarkerLocation: null,
};

export function getMapUIModeForControlPointCount(
  currentState: UIState,
  newControlPointCount: number
): MapUIMode {
  if (!currentState.creationModeActive) {
    return currentState.mapUIMode;
  }

  if (currentState.mapUIMode === 'placeMarker' || currentState.mapUIMode === 'markerForm') {
    return currentState.mapUIMode;
  }

  if (currentState.mapUIMode !== 'drawSegment' && currentState.mapUIMode !== 'rateSegment') {
    return currentState.mapUIMode;
  }

  if (newControlPointCount >= 2) {
    return 'rateSegment';
  }

  return 'drawSegment';
}
