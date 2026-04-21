/* NOTE: this file needs to be .tsx instead of .ts because of the use of renderToStaticMarkup */
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { renderToStaticMarkup } from 'react-dom/server.browser';

import { getIconByName } from '@/lib/getIconByName';
import {
  isCreateMarkerMode,
  isCreateSegmentMode,
  isMarkerDetailsMode,
  MapUIMode,
} from '@/lib/mapUIMode';
import { Marker } from '@/lib/markers';
import { MARKER_TYPES } from '@/lib/markers';

import styles from './MapView.module.css';

export function useInitMarkersLayer(
  mapRef: RefObject<L.Map | null>,
  markers: Marker[],
  mode: MapUIMode,
  onMarkerSelect: (marker: Marker) => void
) {
  // Refs mirror props so Leaflet event callbacks always call the latest
  // version without needing to be listed as effect dependencies.
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(markers);
  const modeRef = useRef(mode);
  const onMarkerSelectRef = useRef(onMarkerSelect);

  useEffect(() => {
    markersRef.current = markers;
    modeRef.current = mode;
    onMarkerSelectRef.current = onMarkerSelect;
  }, [markers, mode, onMarkerSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markerLayerGroupRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = group;

    for (const m of markers) {
      const iconName = MARKER_TYPES[m.type].iconName;
      const Icon = getIconByName(iconName);
      const svgHtml = renderToStaticMarkup(<Icon />);
      const icon = L.divIcon({
        className: '',
        html: `<div class="${styles.mapMarker}">${svgHtml}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const layer = L.marker([m.lat, m.lng], { icon }).addTo(group);
      layer.on('click', (e) => {
        const currentMode = modeRef.current;
        if (
          // do not allow selecting a marker when in create marker or create segment mode
          isCreateMarkerMode(currentMode) ||
          isCreateSegmentMode(currentMode)
        ) {
          return;
        }
        L.DomEvent.stopPropagation(e);
        const latestMarker = markersRef.current.find((marker) => marker.id === m.id) ?? m;
        onMarkerSelectRef.current(latestMarker);
      });
    }

    mapRef.current?.on('zoomend', (e) => {
      const zoomLevel = e.target.getZoom();
      const shouldShow =
        zoomLevel >= 12 ||
        isCreateMarkerMode(modeRef.current) ||
        isMarkerDetailsMode(modeRef.current);
      if (shouldShow) {
        group.addTo(map);
      } else {
        group.remove();
      }
    });

    return () => {
      group.remove();
      markerLayerGroupRef.current = null;
    };
  }, [mapRef, markers]);
}
