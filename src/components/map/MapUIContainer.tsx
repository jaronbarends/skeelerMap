'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import DrawingPanel from '@/components/drawing-panel/DrawingPanel';
import styles from './MapUIContainer.module.css';
import type { MapHandle } from './Map';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const [drawingModeActive, setDrawingModeActive] = useState(false);
  const [controlPointCount, setControlPointCount] = useState(0);

  return (
    <>
      <Map
        ref={mapRef}
        drawingModeActive={drawingModeActive}
        onControlPointCountChange={setControlPointCount}
      />
      {!drawingModeActive && (
        <button
          className={styles.addButton}
          onClick={() => setDrawingModeActive(true)}
          aria-label="Segment toevoegen"
        >
          <FaPlus />
        </button>
      )}
      {drawingModeActive && (
        <DrawingPanel
          controlPointCount={controlPointCount}
          onCancel={handleCancel}
          onRatingSelect={handleRatingSelect}
        />
      )}
    </>
  );

  function handleCancel() {
    mapRef.current?.cancelDrawing();
    setDrawingModeActive(false);
    setControlPointCount(0);
  }

  function handleRatingSelect(rating: number) {
    mapRef.current?.saveSegment(rating);
    setDrawingModeActive(false);
    setControlPointCount(0);
  }
}
