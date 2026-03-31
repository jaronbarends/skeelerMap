'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import { tilesProvider } from '@/lib/tilesProvider';
import { mapColors } from '@/styles/mapColorTokens';
import { Segment } from '@/types/segment';
import { createSegment, removeSegment, updateSegment } from '@/lib/segmentService';
import styles from './LeafletMap.module.css';

const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;

interface TempSegment {
  controlPoints: L.LatLng[];
  controlMarkers: L.CircleMarker[];
  routePolylines: (L.Polyline | null)[];
  routeCoordinates: ([number, number][] | null)[];
}

export interface MapHandle {
  cancelDrawing: () => void;
  saveSegment: (rating: number) => Promise<void>;
  deselectSegment: () => void;
  updateSegmentRating: (id: string, rating: number) => Promise<void>;
  deleteSegment: (id: string) => Promise<void>;
  centerOnLocation: () => void;
}

interface MapProps {
  ref?: React.Ref<MapHandle>;
  drawingModeActive: boolean;
  fetchSegments: (abortSignal: AbortSignal) => Promise<Segment[]>;
  segments: Segment[];
  onControlPointCountChange: (count: number) => void;
  onSegmentSelect: (segment: Segment) => void;
}

// we can't name this component Map, because that might conflict with javascript's Map object
export default function LeafletMap({
  ref,
  drawingModeActive,
  fetchSegments,
  onControlPointCountChange,
  onSegmentSelect,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawingActiveRef = useRef(false);
  const tempSegmentRef = useRef<TempSegment>({
    controlPoints: [],
    controlMarkers: [],
    routePolylines: [],
    routeCoordinates: [],
  });
  const segmentsRef = useRef<Segment[]>([]);
  const segmentLayersRef = useRef<Map<string, L.Polyline>>(new Map());
  const selectedSegmentIdRef = useRef<string | null>(null);
  const selectionMarkersRef = useRef<{ start: L.CircleMarker; end: L.CircleMarker } | null>(null);
  const lastPositionRef = useRef<L.LatLngExpression | null>(null);

  // expose methods to the ref in parent component
  useImperativeHandle(
    ref,
    () => ({
      cancelDrawing: clearTempSegment,
      saveSegment,
      deselectSegment: clearSelectionVisuals,
      updateSegmentRating,
      deleteSegment,
      centerOnLocation,
    }),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const abortController = new AbortController();
    const { map, userLocationWatchId } = initMap(container, abortController.signal);

    return () => {
      abortController.abort();
      if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    drawingActiveRef.current = drawingModeActive;
  }, [drawingModeActive]);

  // return the component's DOM element
  return <div ref={containerRef} className={styles.container} />;

  // internal functions

  function initMap(
    container: HTMLDivElement,
    abortSignal: AbortSignal
  ): { map: L.Map; userLocationWatchId: number | null } {
    const map = L.map(container, { zoomControl: false }).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    mapRef.current = map;

    createTileLayer(map);
    renderAllSegments(map, abortSignal);
    addMapListeners(map);

    const userLocationWatchId = createWatchedLocationMarker(map, onPositionUpdate);

    return { map, userLocationWatchId };
  }

  function centerOnLocation() {
    const map = mapRef.current;
    const position = lastPositionRef.current;
    if (!map || !position) return;
    map.setView(position, Math.max(map.getZoom(), 15));
  }

  function onPositionUpdate(latlng: L.LatLngExpression) {
    lastPositionRef.current = latlng;
  }

  async function renderAllSegments(map: L.Map, abortSignal: AbortSignal) {
    const segments = await fetchSegments(abortSignal);
    if (abortSignal.aborted) {
      // catches case where fetch completed just before abort
      return;
    }
    segmentsRef.current = segments;
    segments.forEach((segment) => renderSegment(segment, map));
  }

  function renderSegment(segment: Segment, map: L.Map) {
    if (!map) {
      console.error('Map not found');
    }
    const color = mapColors.rating[String(segment.rating) as keyof typeof mapColors.rating];
    const polyline = L.polyline(segment.coordinates, {
      color,
      weight: 5,
      opacity: 0.85,
    }).addTo(map);

    polyline.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (!drawingActiveRef.current) {
        handleSelectSegment(segment, polyline);
      }
    });

    segmentLayersRef.current.set(segment.id, polyline);
  }

  function handleSelectSegment(segment: Segment, polyline: L.Polyline) {
    if (selectedSegmentIdRef.current === segment.id) return;

    const map = mapRef.current;
    if (!map) return;

    const current = segmentsRef.current.find((s) => s.id === segment.id) ?? segment;

    clearSelectionVisuals();

    selectedSegmentIdRef.current = current.id;
    polyline.setStyle({ weight: 8 });

    const color = mapColors.rating[String(current.rating) as keyof typeof mapColors.rating];
    const startCoord = current.coordinates[0];
    const endCoord = current.coordinates[current.coordinates.length - 1];
    const markerOptions: L.CircleMarkerOptions = {
      radius: 6,
      color,
      weight: 3,
      fillColor: '#000000',
      fillOpacity: 1,
    };
    const startMarker = L.circleMarker(startCoord, markerOptions).addTo(map);
    const endMarker = L.circleMarker(endCoord, markerOptions).addTo(map);
    selectionMarkersRef.current = { start: startMarker, end: endMarker };

    onSegmentSelect(current);
  }

  function clearSelectionVisuals() {
    if (selectedSegmentIdRef.current) {
      const polyline = segmentLayersRef.current.get(selectedSegmentIdRef.current);
      if (polyline) {
        polyline.setStyle({ weight: 5 });
      }
    }
    selectionMarkersRef.current?.start.remove();
    selectionMarkersRef.current?.end.remove();
    selectionMarkersRef.current = null;
    selectedSegmentIdRef.current = null;
  }

  function addMapListeners(map: L.Map) {
    map.on('click', (e) => {
      if (!drawingActiveRef.current) {
        return;
      }

      addControlMarker({ latlng: e.latlng, tempSegment: tempSegmentRef.current, map });
    });
  }

  function addControlMarker({
    latlng,
    tempSegment,
    map,
  }: {
    latlng: L.LatLng;
    tempSegment: TempSegment;
    map: L.Map;
  }) {
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
      if (!drawingActiveRef.current) return;
      tempSegment.routeCoordinates[legIndex] = coords;
      const polyline = L.polyline(coords, {
        color: mapColors.rating.neutral,
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      tempSegment.routePolylines[legIndex] = polyline;
    });
  }

  function clearTempSegment() {
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

  async function saveSegment(rating: number) {
    const tempSegment = tempSegmentRef.current;
    const map = mapRef.current;
    if (!map) return;

    const allCoords = tempSegment.routeCoordinates
      .filter((c): c is [number, number][] => c !== null)
      .flat();

    if (allCoords.length <= 1) {
      throw new Error('Selecteer ten minste 2 punten');
    }

    const data = await createSegment({ rating, coordinates: allCoords });

    const newSegment: Segment = {
      id: data.id,
      rating,
      coordinates: allCoords,
    };
    renderSegment(newSegment, map);
    segmentsRef.current = [...segmentsRef.current, newSegment];

    clearTempSegment();
  }

  async function updateSegmentRating(id: string, rating: number) {
    const idx = segmentsRef.current.findIndex((s) => s.id === id);
    if (idx === -1) return;

    await updateSegment(id, rating);

    //-- start what will be handled by prop update later
    const updatedSegment = { ...segmentsRef.current[idx], rating };
    segmentsRef.current = [
      ...segmentsRef.current.slice(0, idx),
      updatedSegment,
      ...segmentsRef.current.slice(idx + 1),
    ];

    const polyline = segmentLayersRef.current.get(id);
    if (polyline) {
      const color = mapColors.rating[String(rating) as keyof typeof mapColors.rating];
      polyline.setStyle({ color });
    }
    //-- end what will be handled by prop update later

    clearSelectionVisuals();
  }

  async function deleteSegment(id: string) {
    await removeSegment(id);

    const polyline = segmentLayersRef.current.get(id);
    if (polyline) {
      polyline.remove();
      segmentLayersRef.current.delete(id);
    }

    segmentsRef.current = segmentsRef.current.filter((s) => s.id !== id);

    clearSelectionVisuals();
  }
}

// async function loadSegments(abortSignal: AbortSignal): Promise<Segment[]> {
//   try {
//     const res = await fetch('/api/segments', { signal: abortSignal });
//     return res.json();
//   } catch {
//     return [];
//   }
// }

async function fetchRoute(from: L.LatLng, to: L.LatLng): Promise<[number, number][]> {
  const url = `${tilesProvider.routingUrl}${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // GeoJSON coordinates are [lng, lat]; Leaflet needs [lat, lng]
    const geoCoords = data.routes[0].geometry.coordinates as [number, number][];
    return geoCoords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  }
}

function createTileLayer(map: L.Map) {
  L.tileLayer(tilesProvider.url, { attribution: tilesProvider.attribution, maxZoom: 19 }).addTo(
    map
  );
}

function createWatchedLocationMarker(
  map: L.Map,
  onPositionUpdate: (latlng: L.LatLngExpression) => void
) {
  if (!navigator.geolocation) return null;

  let locationMarker: L.CircleMarker | null = null;
  let firstFix = true;

  const userLocationWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const latlng: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
      onPositionUpdate(latlng);
      if (!locationMarker) {
        locationMarker = L.circleMarker(latlng, {
          radius: 8,
          color: mapColors.locationDot.border,
          weight: 2,
          fillColor: mapColors.locationDot.fill,
          fillOpacity: 1,
        }).addTo(map);
      } else {
        locationMarker.setLatLng(latlng);
      }
      if (firstFix) {
        map.setView(latlng, Math.max(map.getZoom(), 15));
        firstFix = false;
      }
    },
    () => {
      // Permission denied or unavailable — stay on default Netherlands view
    },
    { enableHighAccuracy: true }
  );

  return userLocationWatchId;
}
