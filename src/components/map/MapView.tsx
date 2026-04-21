'use client';

import L from 'leaflet';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from 'react';

import type { MapUIMode } from '@/lib/mapUIMode';
import { isCreateSegmentMode } from '@/lib/mapUIMode';
import type { Marker } from '@/lib/markers';
import { Segment } from '@/lib/segments';

import { useInitMarkersLayer } from './useInitMarkersLayer';
import { useInitPendingMarker } from './useInitPendingMarker';
import { useMapInit } from './useMapInit';
import { useSegmentCreation } from './useSegmentCreation';
import { useSegmentLayers } from './useSegmentLayers';
import { useSegmentSelection } from './useSegmentSelection';

import styles from './MapView.module.css';

export interface MapHandle {
  cancelCreateSegment: () => void;
  getSegmentCoords: () => [number, number][];
  onSegmentSaved: () => void;
  centerOnLocation: () => void;
}

interface MapProps {
  ref?: Ref<MapHandle>;
  creationModeActive: boolean;
  mode: MapUIMode;
  fetchMapData: (abortSignal: AbortSignal) => Promise<void>;
  segments: Segment[];
  markers: Marker[];
  selectedSegment: Segment | null;
  pendingMarkerLocation: { lat: number; lng: number } | null;
  onControlPointCountChange: (count: number) => void;
  onMarkerLocationClicked: (lat: number, lng: number) => void;
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
  fetchMapData,
  segments,
  markers,
  selectedSegment,
  pendingMarkerLocation,
  onControlPointCountChange,
  onMarkerLocationClicked,
  onMarkerSelect,
  onMarkerDeselect,
  onSegmentSelect,
  onSegmentDeselect,
  onSegmentDragUpdate,
  onSegmentDragEnd,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Critical layout is inline so Fast Refresh / CSS-module hash drift can't break Leaflet sizing.
  const containerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 'var(--z-map)',
  };

  // addControlPoint comes from useSegmentCreation below, so we use a ref to avoid
  // a before-declaration access in the useCallback closure.
  const addControlPointRef = useRef<(latlng: L.LatLng) => void>(() => {});

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      if (mode === 'placeMarker') {
        onMarkerLocationClicked(latlng.lat, latlng.lng);
        return;
      }
      if (isCreateSegmentMode(mode)) {
        addControlPointRef.current(latlng);
      } else {
        onMarkerDeselect();
        onSegmentDeselect();
      }
    },
    [mode, onMarkerDeselect, onMarkerLocationClicked, onSegmentDeselect]
  );

  const { mapRef, centerOnLocation } = useMapInit(containerRef, fetchMapData, handleMapClick);
  const { addControlPoint, removeTempSegment, getSegmentCoords } = useSegmentCreation(
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
    creationModeActive,
    mode
  );
  useSegmentSelection(
    mapRef,
    segmentLayersRef,
    selectedSegment,
    onSegmentDragUpdate,
    onSegmentDragEnd
  );

  useInitMarkersLayer(mapRef, markers, mode, onMarkerSelect);
  useInitPendingMarker(mapRef, pendingMarkerLocation);

  // expose methods to the ref in parent component
  // we do not need onMarkerSaved, because when marker creation is cancelled, pendingMarkerLocation is set to null, removing the marker
  useImperativeHandle(ref, () => ({
    cancelCreateSegment: removeTempSegment,
    getSegmentCoords,
    onSegmentSaved: removeTempSegment,
    centerOnLocation,
  }));

  // return the component's DOM element
  return <div ref={containerRef} className={styles.container} style={containerStyle} />;
}
