'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import styles from './Map.module.css';

const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;
const STORAGE_KEY = 'skatemap_segments';

interface Segment {
  id: string;
  rating: number;
  coordinates: [number, number][];
}

interface DrawingState {
  controlPoints: L.LatLng[];
  controlMarkers: L.CircleMarker[];
  routePolylines: (L.Polyline | null)[];
  routeCoordinates: ([number, number][] | null)[];
}

export interface MapHandle {
  cancelDrawing: () => void;
  saveSegment: (rating: number) => void;
}

interface Props {
  ref?: React.Ref<MapHandle>;
  drawingModeActive: boolean;
  onControlPointCountChange: (count: number) => void;
}

export default function Map({ ref, drawingModeActive, onControlPointCountChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawingActiveRef = useRef(false);
  const drawingStateRef = useRef<DrawingState>({
    controlPoints: [],
    controlMarkers: [],
    routePolylines: [],
    routeCoordinates: [],
  });
  const segmentsRef = useRef<Segment[]>([]);

  useImperativeHandle(ref, () => ({ cancelDrawing: clearDrawingState, saveSegment }), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cssVars = getComputedStyle(document.documentElement);

    const map = L.map(container, { zoomControl: false }).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    mapRef.current = map;

    createTileLayer(map);
    renderAllSegments(map, cssVars);
    addMapListeners(map);

    const watchId = createWatchedLocationMarker(map, cssVars);

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    drawingActiveRef.current = drawingModeActive;
  }, [drawingModeActive]);

  return <div ref={containerRef} className={styles.container} />;

  function renderAllSegments(map: L.Map, cssVars: CSSStyleDeclaration) {
    const saved = loadSegments();
    segmentsRef.current = saved;
    saved.forEach((seg) => renderSegment(seg, map, cssVars));
  }

  function addMapListeners(map: L.Map) {
    map.on('click', (e) => {
      if (!drawingActiveRef.current) return;
      addControlMarker({ latlng: e.latlng, state: drawingStateRef.current, map });
    });
  }

  function addPolyline({
    count,
    state,
    map,
    latlng,
  }: {
    count: number;
    state: DrawingState;
    map: L.Map;
    latlng: L.LatLng;
  }) {
    const legIndex = count - 2;
    const from = state.controlPoints[count - 2];
    const to = latlng;

    state.routePolylines[legIndex] = null;
    state.routeCoordinates[legIndex] = null;

    fetchRoute(from, to).then((coords) => {
      if (!drawingActiveRef.current) return;
      state.routeCoordinates[legIndex] = coords;
      const polyline = L.polyline(coords, {
        color: '#555555',
        weight: 5,
        opacity: 0.85,
      }).addTo(map);
      state.routePolylines[legIndex] = polyline;
    });
  }

  function addControlMarker({
    latlng,
    state,
    map,
  }: {
    latlng: L.LatLng;
    state: DrawingState;
    map: L.Map;
  }) {
    const marker = L.circleMarker(latlng, {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: '#1a1a1a',
      fillOpacity: 1,
    }).addTo(map);

    state.controlPoints.push(latlng);
    state.controlMarkers.push(marker);

    const count = state.controlPoints.length;
    onControlPointCountChange(count);

    if (count >= 2) {
      addPolyline({ count, state, map, latlng });
    }
  }

  function clearDrawingState() {
    const state = drawingStateRef.current;
    const map = mapRef.current;
    if (map) {
      state.controlMarkers.forEach((m) => m.remove());
      state.routePolylines.forEach((p) => p?.remove());
    }
    drawingStateRef.current = {
      controlPoints: [],
      controlMarkers: [],
      routePolylines: [],
      routeCoordinates: [],
    };
  }

  function saveSegment(rating: number) {
    const state = drawingStateRef.current;
    const map = mapRef.current;
    if (!map) return;
    const cssVars = getComputedStyle(document.documentElement);

    const allCoords = state.routeCoordinates
      .filter((c): c is [number, number][] => c !== null)
      .flat();

    if (allCoords.length > 0) {
      const segment: Segment = {
        id: crypto.randomUUID(),
        rating,
        coordinates: allCoords,
      };
      renderSegment(segment, map, cssVars);
      segmentsRef.current = [...segmentsRef.current, segment];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(segmentsRef.current));
    }

    clearDrawingState();
  }
}

function loadSegments(): Segment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Segment[]) : [];
  } catch {
    return [];
  }
}

function renderSegment(segment: Segment, map: L.Map, cssVars: CSSStyleDeclaration) {
  const color = cssVars.getPropertyValue(`--color-rating-${segment.rating}`).trim();
  L.polyline(segment.coordinates as [number, number][], {
    color,
    weight: 5,
    opacity: 0.85,
  }).addTo(map);
}

async function fetchRoute(from: L.LatLng, to: L.LatLng): Promise<[number, number][]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
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
  const tilesUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://carto.com/attributions">CARTO</a>';
  L.tileLayer(tilesUrl, { attribution, maxZoom: 19 }).addTo(map);
}

function createWatchedLocationMarker(map: L.Map, cssVars: CSSStyleDeclaration) {
  if (!navigator.geolocation) return null;

  const locationDotFill = cssVars.getPropertyValue('--color-location-dot-fill').trim();
  const locationDotBorder = cssVars.getPropertyValue('--color-location-dot-border').trim();

  let locationMarker: L.CircleMarker | null = null;
  let firstFix = true;

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const latlng: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
      if (!locationMarker) {
        locationMarker = L.circleMarker(latlng, {
          radius: 8,
          color: locationDotBorder,
          weight: 2,
          fillColor: locationDotFill,
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

  return watchId;
}
