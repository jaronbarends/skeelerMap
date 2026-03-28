'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import FabButton from '@/components/FabButton';
import FabContainer from '@/components/FabContainer';
import DrawingPanel from '@/components/drawing-panel/DrawingPanel';
import styles from './MapUIContainer.module.css';
import type { MapHandle } from './Map';

const Map = dynamic(() => import('./Map'), { ssr: false });

export default function MapUIContainer() {
  const mapRef = useRef<MapHandle>(null);
  const [drawingModeActive, setDrawingModeActive] = useState(false);
  const [controlPointCount, setControlPointCount] = useState(0);

  return (
    <div className={styles.component}>
      <Map
        ref={mapRef}
        drawingModeActive={drawingModeActive}
        onControlPointCountChange={setControlPointCount}
      />

      <FabContainer>
        <FabButton
          onClick={() => setDrawingModeActive(true)}
          ariaLabel="Segment toevoegen"
          disabled={drawingModeActive}
          iconName="plus"
        />
      </FabContainer>

      {drawingModeActive && (
        <DrawingPanel
          controlPointCount={controlPointCount}
          onCancel={handleCancel}
          onRatingSelect={handleRatingSelect}
        />
      )}
    </div>
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
