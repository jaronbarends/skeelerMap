import { isCreateSegmentMode, type MapUIMode } from '@/lib/mapUIMode';
import type { RatingValue } from '@/lib/segments';

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
  onStartCreateMarker: () => void;
}

export default function SegmentCreationPanel({
  mode,
  isPending,
  onCancel,
  onRatingSelect,
  onStartCreateMarker,
}: Props) {
  if (!isCreateSegmentMode(mode)) {
    return null;
  }

  return (
    <Panel>
      <PanelHeader onClose={onCancel}>
        <h1 className="hln-2">Segment toevoegen</h1>
      </PanelHeader>
      <PanelBody>
        {mode === 'drawSegment' && (
          <>
            <p>
              Klik minstens 2 punten om een segment te maken
              <br />
              of{' '}
              <button
                className={styles.inlineLinkButton}
                type="button"
                onClick={onStartCreateMarker}
              >
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
      </PanelBody>
    </Panel>
  );
}
