'use client';

import L from 'leaflet';
import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { renderToStaticMarkup } from 'react-dom/server.browser';
import { FaLocationDot } from 'react-icons/fa6';

import type { MapUIMode } from '@/lib/mapUIMode';
import { getIconByName } from '@/lib/getIconByName';
import type { Marker } from '@/lib/markers';
import { MARKER_TYPES } from '@/lib/markers';
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
  fetchSegments,
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

  // addControlPoint comes from useSegmentCreation below, so we use a ref to avoid
  // a before-declaration access in the useCallback closure.
  const addControlPointRef = useRef<(latlng: L.LatLng) => void>(() => {});

  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pendingMarkerRef = useRef<L.Marker | null>(null);

  // Refs mirror props so Leaflet event callbacks always call the latest version
  // without needing to be listed as effect dependencies.
  const markersRef = useRef(markers);
  const modeRef = useRef(mode);
  const onMarkerSelectRef = useRef(onMarkerSelect);

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      if (mode === 'placeMarker') {
        onMarkerLocationClicked(latlng.lat, latlng.lng);
        return;
      }
      if (creationModeActive) {
        addControlPointRef.current(latlng);
      } else {
        onMarkerDeselect();
        onSegmentDeselect();
      }
    },
    [creationModeActive, mode, onMarkerDeselect, onMarkerLocationClicked, onSegmentDeselect]
  );

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

  useEffect(() => {
    markersRef.current = markers;
    modeRef.current = mode;
    onMarkerSelectRef.current = onMarkerSelect;
  }, [markers, mode, onMarkerSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markerLayerGroupRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = group;

    for (const marker of markers) {
      const iconName = MARKER_TYPES[marker.type].iconName;
      const Icon = getIconByName(iconName);
      const svgHtml = renderToStaticMarkup(<Icon />);
      const icon = L.divIcon({
        className: '',
        html: `<div class="${styles.mapMarker}">${svgHtml}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const layer = L.marker([marker.lat, marker.lng], { icon }).addTo(group);
      layer.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        const currentMode = modeRef.current;
        if (currentMode === 'placeMarker' || currentMode === 'markerForm') {
          return;
        }
        const latestMarker = markersRef.current.find((m) => m.id === marker.id) ?? marker;
        onMarkerSelectRef.current(latestMarker);
      });
    }
  }, [mapRef, markers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!pendingMarkerLocation) {
      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;
      return;
    }

    const svgHtml = renderToStaticMarkup(<FaLocationDot />);
    const icon = L.divIcon({
      className: '',
      html: `<div class="${styles.pendingMapMarker}">${svgHtml}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    if (!pendingMarkerRef.current) {
      pendingMarkerRef.current = L.marker([pendingMarkerLocation.lat, pendingMarkerLocation.lng], {
        icon,
      }).addTo(map);
      pendingMarkerRef.current.setZIndexOffset(1000);
    } else {
      pendingMarkerRef.current.setLatLng([pendingMarkerLocation.lat, pendingMarkerLocation.lng]);
      pendingMarkerRef.current.setIcon(icon);
    }
  }, [mapRef, pendingMarkerLocation]);

  useEffect(() => {
    return () => {
      markerLayerGroupRef.current?.remove();
      markerLayerGroupRef.current = null;
      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;
    };
  }, []);

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
