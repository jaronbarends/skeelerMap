'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useReducer } from 'react';

import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import type { MapHandle } from '@/components/map/MapView';
import LoginRequiredPanel from '@/components/panel/LoginRequiredPanel';
import MarkerCreationPanel from '@/components/panel/MarkerCreationPanel';
import MarkerDetailsPanel from '@/components/panel/MarkerDetailsPanel';
import SegmentCreationPanel from '@/components/panel/SegmentCreationPanel';
import SegmentDetailsPanel from '@/components/panel/SegmentDetailsPanel';
import {
  isCreateMarkerMode,
  isCreateSegmentMode,
  isMarkerDetailsMode,
  type MapUIMode,
} from '@/lib/mapUIMode';
import { createMarker, fetchMarkers, removeMarker, updateMarker } from '@/lib/markerService';
import type { Marker, MarkerType } from '@/lib/markers';
import { createSegment, fetchSegments, removeSegment, updateSegment } from '@/lib/segmentService';
import type { RatingValue, Segment } from '@/lib/segments';

import styles from './MapUIContainer.module.css';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

type UIState = {
  mapUIMode: MapUIMode;
  selectedSegment: Segment | null;
  selectedMarker: Marker | null;
  controlPointCount: number;
  creationModeActive: boolean;
  loginRequiredPanelOpen: boolean;
  pendingMarkerLocation: { lat: number; lng: number } | null;
};

type UIAction =
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

function uiReducer(state: UIState, action: UIAction): UIState {
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
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown action type: ${(action as { type: unknown }).type}`);
      return state;
  }
}

const initialUiState: UIState = {
  mapUIMode: 'idle',
  selectedSegment: null,
  selectedMarker: null,
  controlPointCount: 0,
  creationModeActive: false,
  loginRequiredPanelOpen: false,
  pendingMarkerLocation: null,
};

export default function MapUIContainer({ currentUserId }: { currentUserId: string | null }) {
  const mapRef = useRef<MapHandle>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const selectedSegmentRef = useRef<Segment | null>(null);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const [uiState, uiDispatch] = useReducer(uiReducer, initialUiState);

  const fetchMapData = useCallback(async (abortSignal: AbortSignal) => {
    const [segmentsResult, markersResult] = await Promise.all([
      fetchSegments(abortSignal),
      fetchMarkers(abortSignal),
    ]);
    setSegments(segmentsResult);
    setMarkers(markersResult);
  }, []);

  const segmentIsOwnedByCurrentUser = useCallback(
    (segment: Segment): boolean => {
      return currentUserId !== null && segment.userId === currentUserId;
    },
    [currentUserId]
  );

  const markerIsOwnedByCurrentUser = useCallback(
    (marker: Marker): boolean => {
      return currentUserId !== null && marker.userId === currentUserId;
    },
    [currentUserId]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        mapRef.current?.cancelCreateSegment();
        uiDispatch({ type: 'CANCEL_CURRENT_ACTION' });
      }
      if (event.key === 'Delete') {
        const selectedSegment = selectedSegmentRef.current;
        if (selectedSegment && segmentIsOwnedByCurrentUser(selectedSegment)) {
          uiDispatch({ type: 'START_DELETE_SEGMENT', payload: selectedSegment });
        } else if (
          selectedMarkerRef.current &&
          markerIsOwnedByCurrentUser(selectedMarkerRef.current) &&
          uiState.mapUIMode === 'markerDetails' // we don't want to delete markers when they are in the markerForm mode
        ) {
          uiDispatch({ type: 'START_DELETE_MARKER' });
        }
      }
    },
    [segmentIsOwnedByCurrentUser, markerIsOwnedByCurrentUser, uiState.mapUIMode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    selectedSegmentRef.current = uiState.selectedSegment;
    selectedMarkerRef.current = uiState.selectedMarker;
  }, [uiState.selectedSegment, uiState.selectedMarker]);

  return (
    <div className={styles.component}>
      <MapView
        ref={mapRef}
        creationModeActive={uiState.creationModeActive}
        mode={uiState.mapUIMode}
        fetchMapData={fetchMapData}
        segments={segments}
        markers={markers}
        selectedSegment={uiState.selectedSegment}
        selectedMarker={uiState.selectedMarker}
        pendingMarkerLocation={uiState.pendingMarkerLocation}
        onControlPointCountChange={handleControlPointCountChange}
        onMarkerLocationClicked={handleMarkerLocationClicked}
        onMarkerSelect={handleSelectMarker}
        onMarkerDeselect={handleDeselectMarker}
        onSegmentSelect={handleSegmentSelect}
        onSegmentDeselect={handleSegmentDeselect}
        onSegmentDragUpdate={updateSegmentCoordinates}
        onSegmentDragEnd={handleSegmentDragEnd}
      />
      <FabContainer>
        <FabButton
          onClick={handleClickCreateButton}
          ariaLabel="Segment toevoegen"
          disabled={
            uiState.creationModeActive ||
            uiState.selectedSegment !== null ||
            uiState.selectedMarker !== null ||
            uiState.loginRequiredPanelOpen
          }
          iconName="plus"
          tooltip="Segment toevoegen"
        />
        <FabButton
          onClick={() => mapRef.current?.centerOnLocation()}
          ariaLabel="Centreer op locatie"
          disabled={false}
          iconName="userLocation"
          tooltip="Centreer op locatie"
        />
      </FabContainer>

      {uiState.loginRequiredPanelOpen && <LoginRequiredPanel onClose={handleCloseLoginRequired} />}

      {uiState.creationModeActive && (
        <>
          {isCreateSegmentMode(uiState.mapUIMode) && (
            <SegmentCreationPanel
              mode={uiState.mapUIMode}
              isPending={isPending}
              onCancel={handleCancelCreateSegment}
              onRatingSelect={handleSaveNewSegment}
              onStartCreateMarker={handleStartCreateMarker}
            />
          )}

          {isCreateMarkerMode(uiState.mapUIMode) && (
            <MarkerCreationPanel
              mode={uiState.mapUIMode}
              onCancel={handleCancelCreateMarker}
              onSaveMarker={handleSaveNewMarker}
            />
          )}
        </>
      )}

      {uiState.selectedSegment && (
        <SegmentDetailsPanel
          segment={uiState.selectedSegment}
          mode={uiState.mapUIMode}
          currentUserOwnsSegment={segmentIsOwnedByCurrentUser(uiState.selectedSegment)}
          onClose={handleDetailsClose}
          onEditStart={
            segmentIsOwnedByCurrentUser(uiState.selectedSegment) ? handleEditStart : undefined
          }
          onDeleteStart={
            segmentIsOwnedByCurrentUser(uiState.selectedSegment)
              ? handleStartDeleteSegment
              : undefined
          }
          onDeleteCancel={handleCancelDeleteSegment}
          onDeleteConfirm={handleConfirmDeleteSegment}
          onRatingSelect={handleRatingUpdate}
          isPending={isPending}
        />
      )}

      {uiState.selectedMarker && isMarkerDetailsMode(uiState.mapUIMode) && (
        <MarkerDetailsPanel
          marker={uiState.selectedMarker}
          mode={uiState.mapUIMode}
          currentUserOwnsMarker={markerIsOwnedByCurrentUser(uiState.selectedMarker)}
          onClose={handleCloseMarkerDetails}
          onEditStart={
            markerIsOwnedByCurrentUser(uiState.selectedMarker) ? handleStartEditMarker : undefined
          }
          onDeleteStart={
            markerIsOwnedByCurrentUser(uiState.selectedMarker) ? handleStartDeleteMarker : undefined
          }
          onEditCancel={handleCancelEditMarker}
          onDeleteCancel={handleCancelDeleteMarker}
          onDeleteConfirm={handleConfirmDeleteMarker}
          onSave={handleMarkerUpdate}
          isPending={isPending}
        />
      )}
    </div>
  );

  function handleControlPointCountChange(count: number) {
    uiDispatch({ type: 'CONTROL_POINT_COUNT_UPDATED', payload: count });
  }

  function handleMarkerLocationClicked(lat: number, lng: number) {
    uiDispatch({ type: 'MARKER_LOCATION_CLICKED', payload: { lat, lng } });
  }

  function handleClickCreateButton() {
    if (currentUserId === null) {
      uiDispatch({ type: 'SHOW_LOGIN_REQUIRED' });
      return;
    }
    uiDispatch({ type: 'START_CREATE_SEGMENT' });
  }

  function handleCloseLoginRequired() {
    uiDispatch({ type: 'HIDE_LOGIN_REQUIRED' });
  }

  function handleCancelCreateSegment() {
    mapRef.current?.cancelCreateSegment();
    uiDispatch({ type: 'CANCEL_CREATE_SEGMENT' });
  }

  function handleStartCreateMarker() {
    mapRef.current?.cancelCreateSegment();
    uiDispatch({ type: 'START_CREATE_MARKER' });
  }

  function handleCancelCreateMarker() {
    uiDispatch({ type: 'CANCEL_CREATE_MARKER' });
  }

  async function handleSaveNewMarker(type: MarkerType, description: string | null) {
    const pendingLocation = uiState.pendingMarkerLocation;
    if (!pendingLocation || currentUserId === null) {
      return;
    }
    try {
      setIsPending(true);
      const data = await createMarker({
        type,
        description,
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
      });
      const newMarker: Marker = {
        id: data.id,
        userId: currentUserId,
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        type,
        description,
      };
      setMarkers((prev) => [...prev, newMarker]);
      uiDispatch({ type: 'MARKER_CREATED', payload: newMarker });
      setIsPending(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setIsPending(false);
      alert('Kan de marker niet opslaan');
    }
  }

  function handleSelectMarker(marker: Marker) {
    uiDispatch({ type: 'SELECT_MARKER', payload: marker });
  }

  function handleDeselectMarker() {
    uiDispatch({ type: 'DESELECT_MARKER' });
  }

  function handleCloseMarkerDetails() {
    uiDispatch({ type: 'DESELECT_MARKER' });
  }

  function handleStartEditMarker() {
    uiDispatch({ type: 'START_EDIT_MARKER' });
  }

  function handleCancelEditMarker() {
    uiDispatch({ type: 'CANCEL_EDIT_MARKER' });
  }

  function handleStartDeleteMarker() {
    if (!uiState.selectedMarker) {
      return;
    }
    (document.activeElement as HTMLElement)?.blur();
    uiDispatch({ type: 'START_DELETE_MARKER' });
  }

  function handleCancelDeleteMarker() {
    uiDispatch({ type: 'CANCEL_DELETE_MARKER' });
  }

  async function handleConfirmDeleteMarker() {
    const marker = uiState.selectedMarker;
    if (!marker) {
      return;
    }
    try {
      setIsPending(true);
      await removeMarker(marker.id);
      setMarkers((prev) => prev.filter((m) => m.id !== marker.id));
      uiDispatch({ type: 'MARKER_DELETED' });
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan de marker niet verwijderen');
    }
  }

  async function handleMarkerUpdate(type: MarkerType, description: string | null) {
    const marker = uiState.selectedMarker;
    if (!marker) {
      return;
    }
    try {
      setIsPending(true);
      await updateMarker(marker.id, { type, description });
      setMarkers((prev) => prev.map((m) => (m.id === marker.id ? { ...m, type, description } : m)));
      uiDispatch({ type: 'MARKER_UPDATED', payload: { type, description } });
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan de marker niet aanpassen');
    }
  }

  async function handleSaveNewSegment(ratingValue: RatingValue) {
    if (!mapRef.current) return;
    try {
      const coords = mapRef.current.getSegmentCoords();
      setIsPending(true);
      const data = await createSegment({ ratingValue, coordinates: coords });
      const newSegment: Segment = {
        id: data.id,
        ratingValue,
        coordinates: coords,
        userId: currentUserId,
      };
      mapRef.current.onSegmentSaved();
      setSegments((prev) => [...prev, newSegment]);
      uiDispatch({ type: 'SEGMENT_CREATED' });

      setIsPending(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setIsPending(false);
      alert('Kan het segment niet opslaan');
    }
  }

  function handleSegmentSelect(segment: Segment) {
    uiDispatch({ type: 'SELECT_SEGMENT', payload: segment });
  }

  function handleSegmentDeselect() {
    uiDispatch({ type: 'DESELECT_SEGMENT' });
  }

  function handleDetailsClose() {
    uiDispatch({ type: 'DESELECT_SEGMENT' });
  }

  function handleEditStart() {
    uiDispatch({ type: 'START_EDIT_SEGMENT' });
  }

  async function handleRatingUpdate(ratingValue: RatingValue) {
    const segment = uiState.selectedSegment;
    if (!segment) return;
    try {
      setIsPending(true);
      await updateSegment(segment.id, ratingValue);
      setSegments((prev) => prev.map((s) => (s.id === segment.id ? { ...s, ratingValue } : s)));
      uiDispatch({ type: 'DESELECT_SEGMENT' });
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan het segment niet aanpassen');
    }
  }

  function updateSegmentCoordinates(segmentId: string, newCoordinates: [number, number][]) {
    setSegments((prev) =>
      prev.map((s) => (s.id === segmentId ? { ...s, coordinates: newCoordinates } : s))
    );
    uiDispatch({ type: 'SEGMENT_COORDINATES_UPDATED', payload: { newCoordinates } });
  }

  async function handleSegmentDragEnd(segmentId: string, newCoordinates: [number, number][]) {
    const prevSegment = segments.find((s) => s.id === segmentId);
    if (!prevSegment) return;

    updateSegmentCoordinates(segmentId, newCoordinates);

    try {
      setIsPending(true);
      await updateSegment(segmentId, prevSegment.ratingValue, newCoordinates);
      setIsPending(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      updateSegmentCoordinates(segmentId, prevSegment.coordinates);
      setIsPending(false);
      alert('Kan het segment niet aanpassen');
    }
  }

  function handleStartDeleteSegment() {
    if (!uiState.selectedSegment) {
      return;
    }
    (document.activeElement as HTMLElement)?.blur();
    uiDispatch({ type: 'START_DELETE_SEGMENT', payload: uiState.selectedSegment });
  }

  function handleCancelDeleteSegment() {
    uiDispatch({ type: 'CANCEL_DELETE_SEGMENT' });
  }

  async function handleConfirmDeleteSegment() {
    const segment = uiState.selectedSegment;
    if (!segment) return;
    try {
      setIsPending(true);
      await removeSegment(segment.id);
      setSegments((prev) => prev.filter((s) => s.id !== segment.id));
      uiDispatch({ type: 'SEGMENT_DELETED' });
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan het segment niet verwijderen');
    }
  }
}

function getMapUIModeForControlPointCount(
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
