'use client';

import { useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import { tilesProvider } from '@/lib/tilesProvider';
import { mapColors } from '@/styles/mapColorTokens';
import { Segment } from '@/types/segment';
import styles from './MapView.module.css';

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
  getSegmentCoords: () => [number, number][];
  onSegmentSaved: () => void;
  centerOnLocation: () => void;
}

interface MapProps {
  ref?: React.Ref<MapHandle>;
  drawingModeActive: boolean;
  fetchSegments: (abortSignal: AbortSignal) => Promise<Segment[]>;
  segments: Segment[];
  selectedSegment: Segment | null;
  onControlPointCountChange: (count: number) => void;
  onSegmentSelect: (segment: Segment) => void;
  onSegmentDragUpdate: (segmentId: string, newCoordinates: [number, number][]) => void;
  onSegmentDragEnd: (segmentId: string, newCoordinates: [number, number][]) => void;
}

// we can't name this component Map, because that might conflict with javascript's Map object
export default function MapView({
  ref,
  drawingModeActive,
  fetchSegments,
  segments,
  selectedSegment,
  onControlPointCountChange,
  onSegmentSelect,
  onSegmentDragUpdate,
  onSegmentDragEnd,
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
  const segmentLayersRef = useRef<Map<string, L.Polyline>>(new Map());
  const selectionMarkersRef = useRef<{
    start: L.Marker;
    end: L.Marker;
    debounceTimer: ReturnType<typeof setTimeout> | null;
  } | null>(null);
  const lastPositionRef = useRef<L.LatLngExpression | null>(null);

  // expose methods to the ref in parent component
  useImperativeHandle(
    ref,
    () => ({
      cancelDrawing: clearTempSegment,
      getSegmentCoords,
      onSegmentSaved: clearTempSegment,
      centerOnLocation,
    }),
    []
  );

  useEffect(initializeMapEffect, []);
  useEffect(updateRenderedSegmentsEffect, [segments]);
  // depend on id only — coordinate updates during drag must not recreate markers
  useEffect(updateSelectedSegmentEffect, [selectedSegment?.id]);
  useEffect(() => {
    // we need a ref here, because Leaflet's event callbacks will close over it. So we can't just use drawingModeActive directly.
    drawingActiveRef.current = drawingModeActive;
  }, [drawingModeActive]);

  // return the component's DOM element
  return <div ref={containerRef} className={styles.container} />;

  // internal functions

  function initializeMapEffect() {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = L.map(container, { zoomControl: false }).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM
    );
    mapRef.current = map;

    createTileLayer(map);
    addControlMarkerListeners(map);
    const userLocationWatchId = createWatchedLocationMarker(map, onPositionUpdate);

    // in React's strict mode, this function will be called twice. In that case we want to abort the fetch request. Otherwise, we would end up with two parallel fetch requests.
    const abortController = new AbortController();
    fetchSegments(abortController.signal);

    // cleanup function, runs every time this effect function runs again
    return () => {
      abortController.abort();
      if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
      }
      map.remove();
      mapRef.current = null;
    };
  }

  function updateRenderedSegmentsEffect() {
    const map = mapRef.current;
    if (!map) return;

    for (const segment of segments) {
      const polyline = segmentLayersRef.current.get(segment.id);
      if (!polyline) {
        renderSegment(segment, map);
      } else {
        const color = mapColors.rating[String(segment.rating) as keyof typeof mapColors.rating];
        if (polyline.options.color !== color) {
          polyline.setStyle({ color });
        }
        // update coordinates (e.g. after drag)
        polyline.setLatLngs(segment.coordinates);
      }
    }

    for (const [id, polyline] of segmentLayersRef.current) {
      if (!segments.find((s) => s.id === id)) {
        polyline.remove();
        segmentLayersRef.current.delete(id);
      }
    }
  }

  function updateSelectedSegmentEffect() {
    const map = mapRef.current;
    if (!map) return;
    if (!selectedSegment) return;

    const polyline = segmentLayersRef.current.get(selectedSegment.id);
    if (!polyline) return;

    polyline.setStyle({ weight: 8 });

    const segment = selectedSegment;
    const dragEnabled = window.matchMedia('(pointer: fine)').matches;
    const color = mapColors.rating[String(segment.rating) as keyof typeof mapColors.rating];
    const startCoord = segment.coordinates[0];
    const endCoord = segment.coordinates[segment.coordinates.length - 1];

    const startMarker = L.marker(startCoord, {
      icon: createEndpointIcon(color),
      draggable: dragEnabled,
    }).addTo(map);

    const endMarker = L.marker(endCoord, {
      icon: createEndpointIcon(color),
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
      if (!markers) return;
      if (markers.debounceTimer) {
        clearTimeout(markers.debounceTimer);
      }
      markers.debounceTimer = setTimeout(async () => {
        const coords = await fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
        onSegmentDragUpdate(segment.id, coords);
      }, 200);
    }

    async function handleDragEnd() {
      const markers = selectionMarkersRef.current;
      if (!markers) return;
      if (markers.debounceTimer) {
        clearTimeout(markers.debounceTimer);
        markers.debounceTimer = null;
      }
      const coords = await fetchRoute(startMarker.getLatLng(), endMarker.getLatLng());
      onSegmentDragEnd(segment.id, coords);
    }
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
        onSegmentSelect(segment);
      }
    });

    segmentLayersRef.current.set(segment.id, polyline);
  }

  function addControlMarkerListeners(map: L.Map) {
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

function createEndpointIcon(borderColor: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background-color:#000000;border:3px solid ${borderColor};cursor:grab;box-sizing:border-box;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

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
