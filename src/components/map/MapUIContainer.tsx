'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useReducer } from 'react';

import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import LoadingIndicator from '@/components/map/LoadingIndicator';
import type { MapHandle } from '@/components/map/MapView';
import LoginRequiredPanel from '@/components/panel/LoginRequiredPanel';
import MarkerCreationPanel from '@/components/panel/MarkerCreationPanel';
import MarkerDetailsPanel from '@/components/panel/MarkerDetailsPanel';
import SegmentCreationPanel from '@/components/panel/SegmentCreationPanel';
import SegmentDetailsPanel from '@/components/panel/SegmentDetailsPanel';
import { isCreateMarkerMode, isCreateSegmentMode, isMarkerDetailsMode } from '@/lib/mapUIMode';
import { initialUiState, uiReducer } from '@/lib/mapUIReducer';
import { createMarker, fetchMarkers, removeMarker, updateMarker } from '@/lib/markerService';
import type { Marker, MarkerType } from '@/lib/markers';
import { createSegment, fetchSegments, removeSegment, updateSegment } from '@/lib/segmentService';
import type { RatingValue, Segment } from '@/lib/segments';

import styles from './MapUIContainer.module.css';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MapUIContainer({ currentUserId }: { currentUserId: string | null }) {
  const mapRef = useRef<MapHandle>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const selectedSegmentRef = useRef<Segment | null>(null);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [uiState, uiDispatch] = useReducer(uiReducer, initialUiState);
  const [autoFollowIsActive, setAutoFollowIsActive] = useState(true);

  const fetchMapData = useCallback(async (abortSignal: AbortSignal) => {
    setIsLoading(true);
    try {
      const [segmentsResult, markersResult] = await Promise.all([
        fetchSegments(abortSignal),
        fetchMarkers(abortSignal),
      ]);
      setSegments(segmentsResult);
      setMarkers(markersResult);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      // eslint-disable-next-line no-console
      console.error('fetchMapData failed:', error);
    } finally {
      // in strict mode, useMapInit's cleanup function of the unmounting component and the useEffect of the remounted component are run synchronously. The finally is async, so it will be executed after the remounted component's useEffect calls fetchMapData again. Prevent setting isLoading to false in that case.
      if (!abortSignal.aborted) {
        setIsLoading(false);
      }
    }
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

  const handleCancelCurrentAction = useCallback(() => {
    mapRef.current?.cancelCreateSegment();
    uiDispatch({ type: 'CANCEL_CURRENT_ACTION' });
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancelCurrentAction();
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
    [
      segmentIsOwnedByCurrentUser,
      markerIsOwnedByCurrentUser,
      uiState.mapUIMode,
      handleCancelCurrentAction,
    ]
  );

  useEffect(() => {
    if (!currentUserId) {
      handleCancelCurrentAction();
    }
  }, [currentUserId, handleCancelCurrentAction]);

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
        autoFollowIsActive={autoFollowIsActive}
        onControlPointCountChange={handleControlPointCountChange}
        onMarkerLocationClicked={handleMarkerLocationClicked}
        onMarkerSelect={handleSelectMarker}
        onMarkerDeselect={handleDeselectMarker}
        onSegmentSelect={handleSegmentSelect}
        onSegmentDeselect={handleSegmentDeselect}
        onSegmentDragUpdate={updateSegmentCoordinates}
        onSegmentDragEnd={handleSegmentDragEnd}
        onPauseAutoFollow={() => setAutoFollowIsActive(false)}
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
          onClick={() => {
            setAutoFollowIsActive(true);
            mapRef.current?.centerOnLocation();
          }}
          ariaLabel="Centreer op locatie"
          disabled={false}
          iconName="userLocation"
          tooltip="Centreer op locatie"
        />
      </FabContainer>

      {isLoading && (
        <LoadingIndicator testId="segments-loading-indicator">Bezig met laden...</LoadingIndicator>
      )}

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
              isPending={isPending}
            />
          )}
        </>
      )}

      {uiState.selectedSegment && (
        <SegmentDetailsPanel
          segment={uiState.selectedSegment}
          mode={uiState.mapUIMode}
          currentUserOwnsSegment={segmentIsOwnedByCurrentUser(uiState.selectedSegment)}
          userIsLoggedIn={currentUserId !== null}
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
          userIsLoggedIn={currentUserId !== null}
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
    if (!mapRef.current) {
      return;
    }
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
