"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { colors } from "@/styles/tokens";
import styles from "./Map.module.css";

// Netherlands center
const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 10;

export default function Map() {
  return (
    <div className={styles.container}>
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocation />
      </MapContainer>
    </div>
  );
}

function UserLocation() {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition((prev) => {
          // Center map on first fix
          if (!prev) map.setView(latlng, Math.max(map.getZoom(), 15));
          return latlng;
        });
      },
      () => {
        // Permission denied or unavailable — stay on default Netherlands view
      },
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  if (!position) return null;

  return (
    <CircleMarker
      center={position}
      radius={8}
      pathOptions={{
        color: colors.locationDotBorder,
        weight: 2,
        fillColor: colors.locationDotFill,
        fillOpacity: 1,
      }}
    />
  );
}
