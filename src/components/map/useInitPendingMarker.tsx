import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { RefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server.browser';
import { FaLocationDot } from 'react-icons/fa6';

import styles from './MapView.module.css';

export function useInitPendingMarker(
  mapRef: RefObject<L.Map | null>,
  pendingMarkerLocation: { lat: number; lng: number } | null
) {
  const pendingMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (!pendingMarkerLocation) {
      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;
      return;
    }

    const svgHtml = renderToStaticMarkup(<FaLocationDot />);
    const size = 32;
    const icon = L.divIcon({
      className: '',
      html: `<div class="${styles.pendingMapMarker}">${svgHtml}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });

    if (!pendingMarkerRef.current) {
      pendingMarkerRef.current = L.marker([pendingMarkerLocation.lat, pendingMarkerLocation.lng], {
        icon,
      }).addTo(map);
      pendingMarkerRef.current.setZIndexOffset(1000);
    } else {
      pendingMarkerRef.current.setLatLng([pendingMarkerLocation.lat, pendingMarkerLocation.lng]);
      pendingMarkerRef.current.setIcon(icon);
    }

    return () => {
      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;
    };
  }, [mapRef, pendingMarkerLocation]);
}
