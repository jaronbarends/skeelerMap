'use client';

import L from 'leaflet';
import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { MapUIMode } from '@/lib/mapUIMode';
import { Segment } from '@/lib/segments';
import { mapColors } from '@/styles/mapColorTokens';

export function useInitSegmentLayers(
  mapRef: RefObject<L.Map | null>,
  segments: Segment[],
  onSegmentSelect: (segment: Segment) => void,
  creationModeActive: boolean,
  mode: MapUIMode
): {
  segmentLayersRef: RefObject<Map<string, L.Polyline>>;
} {
  // create Map (js Map, don't confuse with map showing streets) that contains the polylines for the segments
  const segmentLayersRef = useRef<Map<string, L.Polyline>>(new Map());

  // Refs mirror props so Leaflet event callbacks always call the latest version
  // without needing to be listed as effect dependencies.
  const onSegmentSelectRef = useRef(onSegmentSelect);
  const segmentsRef = useRef(segments);
  const creationModeActiveRef = useRef(creationModeActive);
  const modeRef = useRef(mode);

  const renderSegment = useCallback(function renderSegment(segment: Segment, map: L.Map) {
    if (!map) {
      // eslint-disable-next-line no-console
      console.error('Map not found');
    }
    const color = mapColors.rating[String(segment.ratingValue) as keyof typeof mapColors.rating];
    const polyline = L.polyline(segment.coordinates, {
      color,
      weight: 5,
      opacity: 0.85,
    }).addTo(map);

    polyline.on('click', (e) => {
      if (modeRef.current === 'placeMarker') {
        // user wants to indicate marker location, not select a segment
        return;
      }
      L.DomEvent.stopPropagation(e);
      if (!creationModeActiveRef.current) {
        // Look up the latest segment from the ref — the captured `segment` may have stale
        // coordinates if the segment was dragged after this click handler was registered.
        const latestSegment = segmentsRef.current.find((s) => s.id === segment.id) ?? segment;
        onSegmentSelectRef.current(latestSegment);
      }
    });

    segmentLayersRef.current.set(segment.id, polyline);
  }, []);

  useEffect(() => {
    onSegmentSelectRef.current = onSegmentSelect;
    segmentsRef.current = segments;
    creationModeActiveRef.current = creationModeActive;
    modeRef.current = mode;
  }, [onSegmentSelect, segments, creationModeActive, mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    for (const segment of segments) {
      const polyline = segmentLayersRef.current.get(segment.id);
      if (!polyline) {
        renderSegment(segment, map);
      } else {
        const color =
          mapColors.rating[String(segment.ratingValue) as keyof typeof mapColors.rating];
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
  }, [segments, renderSegment, mapRef]);

  // Clear the layer map on unmount so stale polyline refs don't prevent re-render after remount
  useEffect(() => {
    const layerMap = segmentLayersRef.current;
    return () => {
      for (const polyline of layerMap.values()) {
        polyline.remove();
      }
      layerMap.clear();
    };
  }, []);

  return { segmentLayersRef };
}
