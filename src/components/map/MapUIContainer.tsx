'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import type { MapHandle } from '@/components/map/MapView';
import SegmentCreationPanel from '@/components/panel/SegmentCreationPanel';
import SegmentDetailsPanel from '@/components/panel/SegmentDetailsPanel';
import { createSegment, fetchSegments, removeSegment, updateSegment } from '@/lib/segmentService';
import type { Segment } from '@/lib/segments';

import styles from './MapUIContainer.module.css';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export type MapUIMode = 'view' | 'details' | 'edit' | 'delete';

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const [creationModeActive, setCreationModeActive] = useState(false);
  const [controlPointCount, setControlPointCount] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const selectedSegmentRef = useRef<Segment | null>(null);
  const [mapUIMode, setMapUIMode] = useState<MapUIMode>('view');
  // segments is empty array initially, because we don't want to fetch segments until the map is mounted (to accomodate for possibility to only load segments within the viewport later)
  const [segments, setSegments] = useState<Segment[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancelCurrentAction();
      }
      if (event.key === 'Delete') {
        if (selectedSegmentRef.current) {
          handleDeleteStart();
        }
      }
    },
    [handleCancelCurrentAction, handleDeleteStart]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    selectedSegmentRef.current = selectedSegment;
  }, [selectedSegment]);

  return (
    <div className={styles.component}>
      <MapView
        ref={mapRef}
        creationModeActive={creationModeActive}
        fetchSegments={fetchSegmentsForMap}
        segments={segments}
        selectedSegment={selectedSegment}
        onControlPointCountChange={setControlPointCount}
        onSegmentSelect={handleSegmentSelect}
        onSegmentDeselect={handleSegmentDeselect}
        onSegmentDragUpdate={updateSegmentCoordinates}
        onSegmentDragEnd={handleSegmentDragEnd}
      />
      <FabContainer>
        <FabButton
          onClick={() => setCreationModeActive(true)}
          ariaLabel="Segment toevoegen"
          disabled={creationModeActive || selectedSegment !== null}
          iconName="plus"
        />
        <FabButton
          onClick={() => mapRef.current?.centerOnLocation()}
          ariaLabel="Centreer op locatie"
          disabled={false}
          iconName="userLocation"
        />
      </FabContainer>

      {creationModeActive && (
        <SegmentCreationPanel
          isReadyToRate={controlPointCount >= 2}
          isPending={isPending}
          onCancel={handleCreationCancel}
          onRatingSelect={handleCreateSegment}
        />
      )}

      {selectedSegment && (
        <SegmentDetailsPanel
          lengthLabel={formatLength(calculateLength(selectedSegment.coordinates))}
          currentRating={selectedSegment.rating}
          mode={mapUIMode}
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

  async function fetchSegmentsForMap(abortSignal: AbortSignal): Promise<Segment[]> {
    const result = await fetchSegments(abortSignal);
    setSegments(result);
    return result;
  }

  function handleCreationCancel() {
    mapRef.current?.cancelCreation();
    setCreationModeActive(false);
    setControlPointCount(0); //
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
      setCreationModeActive(false);
      setControlPointCount(0);
      setIsPending(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setIsPending(false);
      alert('Kan het segment niet opslaan');
    }
  }

  function handleSegmentSelect(segment: Segment) {
    setSelectedSegment(segment);
    setMapUIMode('details');
  }

  function handleSegmentDeselect() {
    setSelectedSegment(null);
  }

  function handleDetailsClose() {
    setSelectedSegment(null);
    setMapUIMode('view');
  }

  function handleEditStart() {
    setMapUIMode('edit');
  }

  async function handleRatingUpdate(rating: number) {
    if (!selectedSegment) return;
    try {
      setIsPending(true);
      await updateSegment(selectedSegment.id, rating);
      setSegments((prev) => prev.map((s) => (s.id === selectedSegment.id ? { ...s, rating } : s)));
      setSelectedSegment(null);
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
    setSelectedSegment((prev) =>
      prev?.id === segmentId ? { ...prev, coordinates: newCoordinates } : prev
    );
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
    (document.activeElement as HTMLElement)?.blur();
    setMapUIMode('delete');
  }

  function handleDeleteCancel() {
    setMapUIMode('details');
  }

  async function handleDeleteConfirm() {
    if (!selectedSegment) return;
    try {
      setIsPending(true);
      await removeSegment(selectedSegment.id);
      setSegments((prev) => prev.filter((s) => s.id !== selectedSegment.id));
      setSelectedSegment(null);
      setIsPending(false);
    } catch (error) {
      setIsPending(false);
      // eslint-disable-next-line no-console
      console.error(error);
      alert('Kan het segment niet verwijderen');
    }
  }

  function handleCancelCurrentAction() {
    handleDeleteCancel();
    handleCreationCancel();
    handleSegmentDeselect();
    handleDetailsClose();
  }
}

function calculateLength(coordinates: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineDistance(coordinates[i - 1], coordinates[i]);
  }
  return total;
}

function haversineDistance([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatLength(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
