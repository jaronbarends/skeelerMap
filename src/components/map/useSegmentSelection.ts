'use client';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { Segment } from '@/lib/segments';
import { mapColors } from '@/styles/mapColorTokens';

import { fetchRoute } from './mapUtils';

export function useSegmentSelection(
  mapRef: RefObject<L.Map | null>,
  segmentLayersRef: RefObject<Map<string, L.Polyline>>,
  selectedSegment: Segment | null,
  onSegmentDragUpdate: (segmentId: string, newCoordinates: [number, number][]) => void,
  onSegmentDragEnd: (segmentId: string, newCoordinates: [number, number][]) => void
): void {
  const selectionMarkersRef = useRef<{
    start: L.Marker;
    end: L.Marker;
    debounceTimer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Refs mirror props so Leaflet event callbacks always call the latest version
  // without needing to be listed as effect dependencies.
  const selectedSegmentRef = useRef<Segment | null>(null);
  selectedSegmentRef.current = selectedSegment;

  const onSegmentDragUpdateRef = useRef(onSegmentDragUpdate);
  onSegmentDragUpdateRef.current = onSegmentDragUpdate;

  const onSegmentDragEndRef = useRef(onSegmentDragEnd);
  onSegmentDragEndRef.current = onSegmentDragEnd;

  // depend on id only — coordinate updates during drag must not recreate markers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateSelectedSegmentEffect, [selectedSegment?.id]);

  function updateSelectedSegmentEffect() {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const selectedSegment = selectedSegmentRef.current;
    if (!selectedSegment) {
      return;
    }

    const polyline = segmentLayersRef.current.get(selectedSegment.id);
    if (!polyline) {
      return;
    }

    polyline.setStyle({ weight: 8 });

    const segment = selectedSegment;
    const dragEnabled = window.matchMedia('(pointer: fine)').matches;
    const startCoord = segment.coordinates[0];
    const endCoord = segment.coordinates[segment.coordinates.length - 1];

    const startMarker = L.marker(startCoord, {
      icon: createEndpointIcon(segment.ratingValue),
      draggable: dragEnabled,
    }).addTo(map);

    const endMarker = L.marker(endCoord, {
      icon: createEndpointIcon(segment.ratingValue),
      draggable: dragEnabled,
    }).addTo(map);

    selectionMarkersRef.current = { start: startMarker, end: endMarker, debounceTimer: null };

    if (dragEnabled) {
      startMarker.on('drag', handleDrag);
      startMarker.on('dragend', handleDragEnd);
      endMarker.on('drag', handleDrag);
      endMarker.on('dragend', handleDragEnd);
    }

    // cleanup function, runs every time this effect function runs again
    return () => {
      polyline.setStyle({ weight: 5 });
      const markers = selectionMarkersRef.current;
      if (markers?.debounceTimer) {
        clearTimeout(markers.debounceTimer);
      }
      markers?.start.remove();
      markers?.end.remove();
      selectionMarkersRef.current = null;
    };

    function handleDrag() {
      const markers = selectionMarkersRef.current;
      if (!markers) {
        return;
      }
      if (markers.debounceTimer) {
        clearTimeout(markers.debounceTimer);
      }
      markers.debounceTimer = setTimeout(async () => {
        const coords = await fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
        onSegmentDragUpdateRef.current(segment.id, coords);
      }, 200);
    }

    async function handleDragEnd() {
      const markers = selectionMarkersRef.current;
      if (!markers) {
        return;
      }
      if (markers.debounceTimer) {
        clearTimeout(markers.debounceTimer);
        markers.debounceTimer = null;
      }
      const coords = await fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
      onSegmentDragEndRef.current(segment.id, coords);
    }
  }
}

function createEndpointIcon(ratingValue: number): L.DivIcon {
  const sizePx = 16;
  const anchor = sizePx / 2;
  const borderColor =
    mapColors.rating[String(ratingValue) as keyof typeof mapColors.rating] ??
    mapColors.rating.neutral;

  // Inline styles keep endpoint markers visible even if CSS modules hot-reload in a mismatched state.
  const html = `<div data-rating="${ratingValue}" style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;background-color:var(--color-black);border:3px solid ${borderColor};cursor:move;"></div>`;

  return L.divIcon({
    className: '',
    html,
    iconSize: [sizePx, sizePx],
    iconAnchor: [anchor, anchor],
  });
}
