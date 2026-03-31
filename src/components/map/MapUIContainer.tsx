'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import SegmentAddPanel from '@/components/panel/SegmentAddPanel';
import SegmentDetailsPanel from '@/components/panel/SegmentDetailsPanel';
import styles from './MapUIContainer.module.css';
import type { MapHandle } from './LeafletMap';
import type { Segment } from '@/types/segment';
import { createSegment, fetchSegments, removeSegment, updateSegment } from '@/lib/segmentService';

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

type SelectionMode = 'view' | 'edit' | 'delete';

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const [drawingModeActive, setDrawingModeActive] = useState(false);
  const [controlPointCount, setControlPointCount] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('view');
  // segments is empty array initially, because we don't want to fetch segments until the map is mounted (to accomodate for possibility to only load segments within the viewport later)
  const [segments, setSegments] = useState<Segment[]>([]);

  return (
    <div className={styles.component}>
      <LeafletMap
        ref={mapRef}
        drawingModeActive={drawingModeActive}
        fetchSegments={fetchSegmentsForMap}
        segments={segments}
        selectedSegment={selectedSegment}
        onControlPointCountChange={setControlPointCount}
        onSegmentSelect={handleSegmentSelect}
      />
      <FabContainer>
        <FabButton
          onClick={() => setDrawingModeActive(true)}
          ariaLabel="Segment toevoegen"
          disabled={drawingModeActive || selectedSegment !== null}
          iconName="plus"
        />
        <FabButton
          onClick={() => mapRef.current?.centerOnLocation()}
          ariaLabel="Centreer op locatie"
          disabled={false}
          iconName="userLocation"
        />
      </FabContainer>

      {drawingModeActive && (
        <SegmentAddPanel
          controlPointCount={controlPointCount}
          onCancel={handleCancel}
          onRatingSelect={handleCreateSegment}
        />
      )}

      {selectedSegment && (
        <SegmentDetailsPanel
          lengthLabel={formatLength(calculateLength(selectedSegment.coordinates))}
          currentRating={selectedSegment.rating}
          mode={selectionMode}
          onClose={handleSegmentClose}
          onEditStart={handleEditStart}
          onDeleteStart={handleDeleteStart}
          onDeleteCancel={handleDeleteCancel}
          onDeleteConfirm={handleDeleteConfirm}
          onRatingSelect={handleRatingUpdate}
        />
      )}
    </div>
  );

  async function fetchSegmentsForMap(abortSignal: AbortSignal): Promise<Segment[]> {
    const result = await fetchSegments(abortSignal);
    setSegments(result);
    return result;
  }

  function handleCancel() {
    mapRef.current?.cancelDrawing();
    setDrawingModeActive(false);
    setControlPointCount(0);
  }

  async function handleCreateSegment(rating: number) {
    if (!mapRef.current) return;
    try {
      const coords = mapRef.current.getSegmentCoords();
      const data = await createSegment({ rating, coordinates: coords });
      const newSegment: Segment = { id: data.id, rating, coordinates: coords };
      mapRef.current.onSegmentSaved();
      setSegments((prev) => [...prev, newSegment]);
      setDrawingModeActive(false);
      setControlPointCount(0);
    } catch (error) {
      console.error(error);
      alert('Kan het segment niet opslaan');
    }
  }

  function handleSegmentSelect(segment: Segment) {
    setSelectedSegment(segment);
    setSelectionMode('view');
  }

  function handleSegmentClose() {
    setSelectedSegment(null);
  }

  function handleEditStart() {
    setSelectionMode('edit');
  }

  async function handleRatingUpdate(rating: number) {
    if (!selectedSegment) return;
    try {
      await updateSegment(selectedSegment.id, rating);
      setSegments((prev) => prev.map((s) => (s.id === selectedSegment.id ? { ...s, rating } : s)));
      setSelectedSegment(null);
    } catch (error) {
      console.error(error);
      alert('Kan het segment niet aanpassen');
    }
  }

  function handleDeleteStart() {
    setSelectionMode('delete');
  }

  function handleDeleteCancel() {
    setSelectionMode('view');
  }

  async function handleDeleteConfirm() {
    if (!selectedSegment) return;
    try {
      await removeSegment(selectedSegment.id);
      setSegments((prev) => segments.filter((s) => s.id !== selectedSegment.id));
      setSelectedSegment(null);
    } catch (error) {
      console.error(error);
      alert('Kan het segment niet verwijderen');
    }
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
