'use client';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { tilesProvider } from '@/lib/tilesProvider';
import { mapColors } from '@/styles/mapColorTokens';

const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;

export function useMapInit(
  containerRef: RefObject<HTMLDivElement | null>,
  fetchMapData: (abortSignal: AbortSignal) => Promise<void>,
  onMapClick: (latlng: L.LatLng) => void
): {
  mapRef: RefObject<L.Map | null>;
  centerOnLocation: () => void;
} {
  const mapRef = useRef<L.Map | null>(null);
  const lastPositionRef = useRef<L.LatLngExpression | null>(null);

  // Refs mirror props so Leaflet event callbacks always call the latest version
  // without needing to be listed as effect dependencies.
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
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
    map.on('click', (e) => {
      onMapClickRef.current(e.latlng);
    });
    const userLocationWatchId = createWatchedLocationMarker(map, onPositionUpdate);

    // in React's strict mode, this function will be called twice. In that case we want to abort the fetch request. Otherwise, we would end up with two parallel fetch requests.
    const abortController = new AbortController();
    fetchMapData(abortController.signal);

    return () => {
      abortController.abort();
      if (userLocationWatchId !== null) {
        navigator.geolocation.clearWatch(userLocationWatchId);
      }
      map.remove();
      mapRef.current = null;
    };
  }, [containerRef, fetchMapData]);

  return { mapRef, centerOnLocation };

  function centerOnLocation() {
    const map = mapRef.current;
    const position = lastPositionRef.current;
    if (!map || !position) return;
    map.setView(position, Math.max(map.getZoom(), 15));
  }

  function onPositionUpdate(latlng: L.LatLngExpression) {
    lastPositionRef.current = latlng;
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
          pane: 'markerPane',
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
