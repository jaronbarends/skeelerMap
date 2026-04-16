'use client';

import L from 'leaflet';
import { useRef } from 'react';
import type { RefObject } from 'react';

import { mapColors } from '@/styles/mapColorTokens';

import { fetchRoute } from './mapUtils';

interface TempSegment {
  controlPoints: L.LatLng[];
  controlMarkers: L.CircleMarker[];
  routePolylines: (L.Polyline | null)[];
  routeCoordinates: ([number, number][] | null)[];
}

export function useSegmentCreation(
  mapRef: RefObject<L.Map | null>,
  onControlPointCountChange: (count: number) => void
): {
  addControlPoint: (latlng: L.LatLng) => void;
  cancelCreation: () => void;
  getSegmentCoords: () => [number, number][];
} {
  const tempSegmentRef = useRef<TempSegment>({
    controlPoints: [],
    controlMarkers: [],
    routePolylines: [],
    routeCoordinates: [],
  });

  return { addControlPoint, cancelCreation, getSegmentCoords };

  function addControlPoint(latlng: L.LatLng) {
    const map = mapRef.current;
    if (!map) return;
    const tempSegment = tempSegmentRef.current;

    const marker = L.circleMarker(latlng, {
      radius: 6,
      color: mapColors.tempControlMarker.border,
      weight: 2,
      fillColor: mapColors.tempControlMarker.fill,
      fillOpacity: 1,
    }).addTo(map);

    tempSegment.controlPoints.push(latlng);
    tempSegment.controlMarkers.push(marker);

    const count = tempSegment.controlPoints.length;
    onControlPointCountChange(count);

    if (count >= 2) {
      addPolyline({ count, tempSegment, map, latlng });
    }
  }

  function addPolyline({
    count,
    tempSegment,
    map,
    latlng,
  }: {
    count: number;
    tempSegment: TempSegment;
    map: L.Map;
    latlng: L.LatLng;
  }) {
    const legIndex = count - 2;
    const from = tempSegment.controlPoints[count - 2];
    const to = latlng;

    tempSegment.routePolylines[legIndex] = null;
    tempSegment.routeCoordinates[legIndex] = null;

    fetchRoute(from, to).then((coords) => {
      // If cancelCreation was called, tempSegmentRef.current is a new object and the slot is gone
      if (tempSegmentRef.current.routeCoordinates[legIndex] === undefined) return;
      tempSegment.routeCoordinates[legIndex] = coords;
      const polyline = L.polyline(coords, {
        color: mapColors.rating.neutral,
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      tempSegment.routePolylines[legIndex] = polyline;
    });
  }

  function cancelCreation() {
    const tempSegment = tempSegmentRef.current;
    const map = mapRef.current;
    if (map) {
      tempSegment.controlMarkers.forEach((m) => m.remove());
      tempSegment.routePolylines.forEach((p) => p?.remove());
    }
    tempSegmentRef.current = {
      controlPoints: [],
      controlMarkers: [],
      routePolylines: [],
      routeCoordinates: [],
    };
  }

  function getSegmentCoords(): [number, number][] {
    const tempSegment = tempSegmentRef.current;

    const allCoords = tempSegment.routeCoordinates
      .filter((c): c is [number, number][] => c !== null)
      .flat();

    if (allCoords.length <= 1) {
      throw new Error('Selecteer ten minste 2 punten');
    }

    return allCoords;
  }
}
