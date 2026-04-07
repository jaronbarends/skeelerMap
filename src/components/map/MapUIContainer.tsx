'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useReducer } from 'react';

import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import type { MapHandle } from '@/components/map/MapView';
import { calculateSegmentLength } from '@/components/map/mapUtils';
import SegmentCreationPanel from '@/components/panel/SegmentCreationPanel';
import SegmentDetailsPanel from '@/components/panel/SegmentDetailsPanel';
import { createSegment, fetchSegments, removeSegment, updateSegment } from '@/lib/segmentService';
import type { Segment } from '@/lib/segments';

import styles from './MapUIContainer.module.css';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export type MapUIMode = 'view' | 'details' | 'edit' | 'delete';

type UIState = {
  mapUIMode: MapUIMode;
  selectedSegment: Segment | null;
  controlPointCount: number;
  creationModeActive: boolean;
};

type UIAction =
  | { type: 'SELECT_SEGMENT'; payload: Segment }
  | { type: 'UPDATE_SELECTED_SEGMENT_COORDINATES'; payload: { newCoordinates: [number, number][] } }
  | { type: 'DESELECT_SEGMENT' }
  | { type: 'START_CREATION' }
  | { type: 'UPDATE_CONTROL_POINT_COUNT'; payload: number }
  | { type: 'SEGMENT_CREATED' }
  | { type: 'CANCEL_CREATION' }
  | { type: 'START_DELETE'; payload: Segment }
  | { type: 'CANCEL_DELETE' }
  | { type: 'CONFIRM_DELETE' }
  | { type: 'EDIT_START' }
  | { type: 'CANCEL_CURRENT_ACTION' };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SEGMENT_CREATED':
      return {
        ...state,
        creationModeActive: false,
        controlPointCount: 0,
        mapUIMode: 'view',
        selectedSegment: null,
      };
    case 'SELECT_SEGMENT':
      return { ...state, selectedSegment: action.payload, mapUIMode: 'details' };
    case 'DESELECT_SEGMENT':
      return { ...state, selectedSegment: null, mapUIMode: 'view' };
    case 'START_CREATION':
      return { ...state, creationModeActive: true, mapUIMode: 'edit' };
    case 'UPDATE_CONTROL_POINT_COUNT':
      return { ...state, controlPointCount: action.payload };
    case 'CANCEL_CREATION':
      return {
        ...state,
        creationModeActive: false,
        controlPointCount: 0,
        mapUIMode: 'view',
        selectedSegment: null,
      };
    case 'UPDATE_SELECTED_SEGMENT_COORDINATES':
      if (!state.selectedSegment) {
        return state;
      }
      return {
        ...state,
        selectedSegment: { ...state.selectedSegment, coordinates: action.payload.newCoordinates },
      };
    case 'EDIT_START':
      return { ...state, mapUIMode: 'edit' };
    case 'START_DELETE':
      return { ...state, mapUIMode: 'delete' };
    case 'CANCEL_DELETE':
      return { ...state, mapUIMode: 'details' };
    case 'CONFIRM_DELETE':
      return { ...state, mapUIMode: 'view', selectedSegment: null };
    case 'CANCEL_CURRENT_ACTION':
      return {
        ...state,
        mapUIMode: 'view',
        selectedSegment: null,
        controlPointCount: 0,
        creationModeActive: false,
      };
    default:
      // eslint-disable-next-line no-console
      console.error(`Unknown action type: ${(action as { type: unknown }).type}`);
      return state;
  }
}

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const selectedSegmentRef = useRef<Segment | null>(null);
  // segments is empty array initially, because we don't want to fetch segments until the map is mounted (to accomodate for possibility to only load segments within the viewport later)
  const [segments, setSegments] = useState<Segment[]>([]);

  const initialUiState: UIState = {
    mapUIMode: 'view',
    selectedSegment: null,
    controlPointCount: 0,
    creationModeActive: false,
  };
  const [uiState, uiDispatch] = useReducer(uiReducer, initialUiState);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // eslint-disable-next-line no-console
      console.log('Escape key pressed');
      uiDispatch({ type: 'CANCEL_CURRENT_ACTION' });
    }
    if (event.key === 'Delete') {
      if (selectedSegmentRef.current) {
        uiDispatch({ type: 'START_DELETE', payload: selectedSegmentRef.current });
      }
    }
  }, []);

  const fetchSegmentsForMap = useCallback(async (abortSignal: AbortSignal): Promise<Segment[]> => {
    const result = await fetchSegments(abortSignal);
    setSegments(result);
    return result;
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    selectedSegmentRef.current = uiState.selectedSegment;
  }, [uiState.selectedSegment]);

  return (
    <div className={styles.component}>
      <MapView
        ref={mapRef}
        creationModeActive={uiState.creationModeActive}
        fetchSegments={fetchSegmentsForMap}
        segments={segments}
        selectedSegment={uiState.selectedSegment}
        onControlPointCountChange={handleControlPointCountChange}
        onSegmentSelect={handleSegmentSelect}
        onSegmentDeselect={handleSegmentDeselect}
        onSegmentDragUpdate={updateSegmentCoordinates}
        onSegmentDragEnd={handleSegmentDragEnd}
      />
      <FabContainer>
        <FabButton
          onClick={() => uiDispatch({ type: 'START_CREATION' })}
          ariaLabel="Segment toevoegen"
          disabled={uiState.creationModeActive || uiState.selectedSegment !== null}
          iconName="plus"
        />
        <FabButton
          onClick={() => mapRef.current?.centerOnLocation()}
          ariaLabel="Centreer op locatie"
          disabled={false}
          iconName="userLocation"
        />
      </FabContainer>

      {uiState.creationModeActive && (
        <SegmentCreationPanel
          isReadyToRate={uiState.controlPointCount >= 2}
          isPending={isPending}
          onCancel={handleCreationCancel}
          onRatingSelect={handleCreateSegment}
        />
      )}

      {uiState.selectedSegment && (
        <SegmentDetailsPanel
          segmentLength={calculateSegmentLength(uiState.selectedSegment.coordinates)}
          currentRating={uiState.selectedSegment.rating}
          mode={uiState.mapUIMode}
          onClose={handleDetailsClose}
          onEditStart={handleEditStart}
          onDeleteStart={handleDeleteStart}
          onDeleteCancel={handleDeleteCancel}
          onDeleteConfirm={handleDeleteConfirm}
          onRatingSelect={handleRatingUpdate}
          isPending={isPending}
        />
      )}
    </div>
  );

  function handleControlPointCountChange(count: number) {
    uiDispatch({ type: 'UPDATE_CONTROL_POINT_COUNT', payload: count });
  }

  function handleCreationCancel() {
    mapRef.current?.cancelCreation();
    uiDispatch({ type: 'CANCEL_CREATION' });
  }

  async function handleCreateSegment(rating: number) {
    if (!mapRef.current) return;
    try {
      const coords = mapRef.current.getSegmentCoords();
      setIsPending(true);
      const data = await createSegment({ rating, coordinates: coords });
      const newSegment: Segment = { id: data.id, rating, coordinates: coords };
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
    uiDispatch({ type: 'EDIT_START' });
  }

  async function handleRatingUpdate(rating: number) {
    const segment = uiState.selectedSegment;
    if (!segment) return;
    try {
      setIsPending(true);
      await updateSegment(segment.id, rating);
      setSegments((prev) => prev.map((s) => (s.id === segment.id ? { ...s, rating } : s)));
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
    uiDispatch({ type: 'UPDATE_SELECTED_SEGMENT_COORDINATES', payload: { newCoordinates } });
  }

  async function handleSegmentDragEnd(segmentId: string, newCoordinates: [number, number][]) {
    const prevSegment = segments.find((s) => s.id === segmentId);
    if (!prevSegment) return;

    updateSegmentCoordinates(segmentId, newCoordinates);

    try {
      setIsPending(true);
      await updateSegment(segmentId, prevSegment.rating, newCoordinates);
      setIsPending(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      updateSegmentCoordinates(segmentId, prevSegment.coordinates);
      setIsPending(false);
      alert('Kan het segment niet aanpassen');
    }
  }

  function handleDeleteStart() {
    if (!uiState.selectedSegment) {
      return;
    }
    (document.activeElement as HTMLElement)?.blur();
    uiDispatch({ type: 'START_DELETE', payload: uiState.selectedSegment });
  }

  function handleDeleteCancel() {
    uiDispatch({ type: 'CANCEL_DELETE' });
  }

  async function handleDeleteConfirm() {
    const segment = uiState.selectedSegment;
    if (!segment) return;
    try {
      setIsPending(true);
      await removeSegment(segment.id);
      setSegments((prev) => prev.filter((s) => s.id !== segment.id));
      uiDispatch({ type: 'CONFIRM_DELETE' });
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan het segment niet verwijderen');
    }
  }
}
