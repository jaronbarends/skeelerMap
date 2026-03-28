'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import AppShell from '@/components/AppShell';
import FabContainer from '@/components/FabContainer';
import DrawingPanel from '@/components/drawing-panel/DrawingPanel';
import styles from './MapUIContainer.module.css';
import type { MapHandle } from './Map';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const [drawingModeActive, setDrawingModeActive] = useState(false);
  const [controlPointCount, setControlPointCount] = useState(0);

  return (
    <AppShell mapAreaRef={mapAreaRef}>
      <Map
        ref={mapRef}
        containerRef={mapAreaRef}
        drawingModeActive={drawingModeActive}
        onControlPointCountChange={setControlPointCount}
      />
      {drawingModeActive && (
        <DrawingPanel
          controlPointCount={controlPointCount}
          onCancel={handleCancel}
          onRatingSelect={handleRatingSelect}
        />
      )}
      {!drawingModeActive && (
        <FabContainer>
          <button
            className={styles.addButton}
            onClick={() => setDrawingModeActive(true)}
            aria-label="Segment toevoegen"
          >
            <FaPlus />
          </button>
        </FabContainer>
      )}
    </AppShell>
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
