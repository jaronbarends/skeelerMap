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
  onMarkerSelect: (marker: Marker) => void,
  selectedMarker: Marker | null
) {
  // Refs mirror props so Leaflet event callbacks always call the latest
  // version without needing to be listed as effect dependencies.
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(markers);
  const markerInstancesMapRef = useRef<Map<string, L.Marker>>(new Map());
  const modeRef = useRef(mode);
  const onMarkerSelectRef = useRef(onMarkerSelect);
  const selectedMarkerRef = useRef(selectedMarker);

  useEffect(() => {
    markersRef.current = markers;
    modeRef.current = mode;
    onMarkerSelectRef.current = onMarkerSelect;
    selectedMarkerRef.current = selectedMarker;
  }, [markers, mode, onMarkerSelect, selectedMarker]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    markerLayerGroupRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = group;

    for (const marker of markers) {
      const iconName = MARKER_TYPES[marker.type].iconName;
      const Icon = getIconByName(iconName);
      const svgHtml = renderToStaticMarkup(<Icon />);
      const icon = L.divIcon({
        className: '',
        html: `<div class="${styles.mapMarker}">${svgHtml}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const markerInstance = L.marker([marker.lat, marker.lng], { icon }).addTo(group);
      markerInstance.on('click', (e) => {
        const currentMode = modeRef.current;
        if (
          // do not allow selecting a marker when in create marker or create segment mode
          isCreateMarkerMode(currentMode) ||
          isCreateSegmentMode(currentMode)
        ) {
          return;
        }
        L.DomEvent.stopPropagation(e);
        const latestMarker = markersRef.current.find((m) => m.id === marker.id) ?? marker;
        onMarkerSelectRef.current(latestMarker);
      });

      markerInstancesMapRef.current.set(marker.id, markerInstance);
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

  useEffect(() => {
    for (const [id, marker] of markerInstancesMapRef.current) {
      const el = marker.getElement()?.querySelector(`.${styles.mapMarker}`);
      if (el) {
        el.classList.toggle(styles.selectedMapMarker, selectedMarkerRef.current?.id === id);
      }
    }
  }, [selectedMarker]);
}
