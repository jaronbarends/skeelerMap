"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { colors } from "@/styles/tokens";
import styles from "./Map.module.css";

// Netherlands center
const DEFAULT_CENTER = { lat: 52.1326, lng: 5.2913 } as const;
const DEFAULT_ZOOM = 12;

export default function Map() {
  return (
    <MapContainer
      center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      className={styles.container}
    >
      <MapContent />
    </MapContainer>
  );
}

function MapContent() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Forceer de herberekening direct na de mount
    map.invalidateSize();

    // Optioneel: Luister naar window resize events voor extra robuustheid
    const handleResize = () => {
      map.invalidateSize(); //
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  // const map = useMap(); //

  // useEffect(() => {
  //   map.invalidateSize();
  // }, [map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <UserLocation />
    </>
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

  if (!position) return null; //

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
