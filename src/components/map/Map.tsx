"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { colors } from "@/styles/tokens";

const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;

export default function Map() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { zoomControl: false }).setView(
      [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      DEFAULT_ZOOM,
    );

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      },
    ).addTo(map);

    let locationMarker: L.CircleMarker | null = null;
    let watchId: number | null = null;

    if (navigator.geolocation) {
      let firstFix = true;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latlng: L.LatLngExpression = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          if (!locationMarker) {
            locationMarker = L.circleMarker(latlng, {
              radius: 8,
              color: colors.locationDotBorder,
              weight: 2,
              fillColor: colors.locationDotFill,
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
        { enableHighAccuracy: true },
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      map.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ position: "fixed", inset: 0 }} />;
}
