import Button from '@/components/button/Button';
import { isCreateMarkerMode, isCreateSegmentMode, type MapUIMode } from '@/lib/mapUIMode';
import type { MarkerType } from '@/lib/markers';
import type { RatingValue } from '@/lib/segments';

import MarkerForm from './MarkerForm';
import Panel from './Panel';
import PanelBody from './PanelBody';
import PanelHeader from './PanelHeader';
import RatingSection from './RatingSection';

import styles from './SegmentCreationPanel.module.css';

interface Props {
  mode: MapUIMode;
  isPending: boolean;
  onCancel: () => void;
  onRatingSelect: (ratingValue: RatingValue) => void;
  onAddMarkerStart: () => void;
  onCancelMarker: () => void;
  onSaveMarker: (type: MarkerType, description: string | null) => void;
}

export default function SegmentCreationPanel({
  mode,
  isPending,
  onCancel,
  onRatingSelect,
  onAddMarkerStart,
  onCancelMarker,
  onSaveMarker,
}: Props) {
  if (!isCreateSegmentMode(mode) && !isCreateMarkerMode(mode)) {
    return null;
  }

  const title = isCreateSegmentMode(mode) ? 'Segment toevoegen' : 'Waarschuwing toevoegen';

  return (
    <Panel>
      <PanelHeader onClose={onCancel}>
        <h1 className="hln-2">{title}</h1>
      </PanelHeader>
      <PanelBody>
        {mode === 'drawSegment' && (
          <>
            <p>
              Klik minstens 2 punten om een segment te maken
              <br />
              of{' '}
              <button className={styles.inlineLinkButton} type="button" onClick={onAddMarkerStart}>
                voeg een waarschuwing toe
              </button>
            </p>
          </>
        )}

        {mode === 'rateSegment' && (
          <RatingSection
            isPending={isPending}
            isReadyToRate={true}
            onRatingSelect={onRatingSelect}
          />
        )}

        {mode === 'placeMarker' && (
          <>
            <p>Tik op de kaart om de locatie te kiezen</p>
            <Button label="Annuleren" variant="secondary" onClick={onCancelMarker} />
          </>
        )}

        {mode === 'markerForm' && (
          <MarkerForm
            defaultMarkerType="danger"
            defaultDescription=""
            onSave={onSaveMarker}
            onCancel={onCancelMarker}
          />
        )}
      </PanelBody>
    </Panel>
  );
}
