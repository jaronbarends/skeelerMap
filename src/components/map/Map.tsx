'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import { mapColors } from '@/styles/mapColorTokens';
import styles from './Map.module.css';

const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;
const STORAGE_KEY = 'skatemap_segments';

interface Segment {
  id: string;
  rating: number;
  coordinates: [number, number][];
}

interface TempSegment {
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
  const tempSegmentRef = useRef<TempSegment>({
    controlPoints: [],
    controlMarkers: [],
    routePolylines: [],
    routeCoordinates: [],
  });
  const segmentsRef = useRef<Segment[]>([]);

  useImperativeHandle(ref, () => ({ cancelDrawing: clearTempSegment, saveSegment }), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { zoomControl: false }).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    mapRef.current = map;

    createTileLayer(map);
    renderAllSegments(map);
    addMapListeners(map);

    const watchId = createWatchedLocationMarker(map);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    drawingActiveRef.current = drawingModeActive;
  }, [drawingModeActive]);

  return <div ref={containerRef} className={styles.container} />;

  function renderAllSegments(map: L.Map) {
    const segments = loadSegments();
    segmentsRef.current = segments;
    segments.forEach((segment) => renderSegment(segment, map));
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
      color: '#ffffff',
      weight: 2,
      fillColor: mapColors.rating.unknown,
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
        color: mapColors.rating.unknown,
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

  function saveSegment(rating: number) {
    const tempSegment = tempSegmentRef.current;
    const map = mapRef.current;
    if (!map) return;

    const allCoords = tempSegment.routeCoordinates
      .filter((c): c is [number, number][] => c !== null)
      .flat();

    if (allCoords.length > 0) {
      const newSegment: Segment = {
        id: crypto.randomUUID(),
        rating,
        coordinates: allCoords,
      };
      renderSegment(newSegment, map);
      segmentsRef.current = [...segmentsRef.current, newSegment];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(segmentsRef.current));
    }

    clearTempSegment();
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

function renderSegment(segment: Segment, map: L.Map) {
  const color = mapColors.rating[String(segment.rating) as keyof typeof mapColors.rating];
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

function createWatchedLocationMarker(map: L.Map) {
  if (!navigator.geolocation) return null;

  let locationMarker: L.CircleMarker | null = null;
  let firstFix = true;

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const latlng: L.LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
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

  return watchId;
}
