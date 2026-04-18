'use client';

import L from 'leaflet';
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react';

import type { MapUIMode } from '@/lib/mapUIMode';
import type { Marker } from '@/lib/markers';
import { Segment } from '@/lib/segments';
import { useMapInit } from './useMapInit';
import { useSegmentCreation } from './useSegmentCreation';
import { useSegmentLayers } from './useSegmentLayers';
import { useSegmentSelection } from './useSegmentSelection';

import styles from './MapView.module.css';

export interface MapHandle {
  cancelCreation: () => void;
  getSegmentCoords: () => [number, number][];
  onSegmentSaved: () => void;
  centerOnLocation: () => void;
}

interface MapProps {
  ref?: Ref<MapHandle>;
  creationModeActive: boolean;
  mode: MapUIMode;
  fetchSegments: (abortSignal: AbortSignal) => Promise<Segment[]>;
  segments: Segment[];
  markers: Marker[];
  selectedSegment: Segment | null;
  pendingMarkerLocation: { lat: number; lng: number } | null;
  onControlPointCountChange: (count: number) => void;
  onMapMarkerPlace: (lat: number, lng: number) => void;
  onMarkerSelect: (marker: Marker) => void;
  onMarkerDeselect: () => void;
  onSegmentSelect: (segment: Segment) => void;
  onSegmentDeselect: () => void;
  onSegmentDragUpdate: (segmentId: string, newCoordinates: [number, number][]) => void;
  onSegmentDragEnd: (segmentId: string, newCoordinates: [number, number][]) => void;
}

// we can't name this component Map, because that might conflict with javascript's Map object
export default function MapView({
  ref,
  creationModeActive,
  mode,
  fetchSegments,
  segments,
  markers,
  selectedSegment,
  pendingMarkerLocation,
  onControlPointCountChange,
  onMapMarkerPlace,
  onMarkerSelect,
  onMarkerDeselect,
  onSegmentSelect,
  onSegmentDeselect,
  onSegmentDragUpdate,
  onSegmentDragEnd,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // addControlPoint comes from useSegmentCreation below, so we use a ref to avoid
  // a before-declaration access in the useCallback closure.
  const addControlPointRef = useRef<(latlng: L.LatLng) => void>(() => {});

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      if (mode === 'placeMarker') {
        onMapMarkerPlace(latlng.lat, latlng.lng);
        return;
      }
      if (creationModeActive) {
        addControlPointRef.current(latlng);
      } else {
        onSegmentDeselect();
      }
    },
    [creationModeActive, mode, onMapMarkerPlace, onSegmentDeselect]
  );

  void markers;
  void pendingMarkerLocation;
  void onMarkerSelect;
  void onMarkerDeselect;

  const { mapRef, centerOnLocation } = useMapInit(containerRef, fetchSegments, handleMapClick);
  const { addControlPoint, cancelCreation, getSegmentCoords } = useSegmentCreation(
    mapRef,
    onControlPointCountChange
  );
  // Keep the ref current. Using an effect (not render) to satisfy react-hooks/refs.
  // Safe because Leaflet click events only fire after useMapInit's effect runs.
  useEffect(() => {
    addControlPointRef.current = addControlPoint;
  });

  const { segmentLayersRef } = useSegmentLayers(
    mapRef,
    segments,
    onSegmentSelect,
    creationModeActive
  );
  useSegmentSelection(
    mapRef,
    segmentLayersRef,
    selectedSegment,
    onSegmentDragUpdate,
    onSegmentDragEnd
  );

  // expose methods to the ref in parent component
  useImperativeHandle(ref, () => ({
    cancelCreation,
    getSegmentCoords,
    onSegmentSaved: cancelCreation,
    centerOnLocation,
  }));

  // return the component's DOM element
  return <div ref={containerRef} className={styles.container} />;
}
