import { useState } from 'react';

import type { RatingValue } from '@/lib/segments';
import { getIconByName } from '@/lib/getIconByName';
import { MARKER_TYPES, type MarkerType } from '@/lib/markers';

import Button from '@/components/button/Button';
import type { MapUIMode } from '@/components/map/MapUIContainer';

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
  const [markerType, setMarkerType] = useState<MarkerType>('danger');
  const [description, setDescription] = useState<string>('');

  if (
    mode !== 'drawSegment' &&
    mode !== 'rateSegment' &&
    mode !== 'placeMarker' &&
    mode !== 'markerForm'
  ) {
    return null;
  }

  const title =
    mode === 'drawSegment' || mode === 'rateSegment' ? 'Segment toevoegen' : 'Waarschuwing toevoegen';

  return (
    <Panel>
      <PanelHeader onClose={onCancel}>
        <h1 className="hln-2">{title}</h1>
      </PanelHeader>
      <PanelBody>
        {mode === 'drawSegment' && (
          <>
            <p>Klik minstens 2 punten om een segment te maken</p>
            <button className={styles.inlineLinkButton} type="button" onClick={onAddMarkerStart}>
              voeg een waarschuwing toe
            </button>
          </>
        )}

        {mode === 'rateSegment' && (
          <RatingSection isPending={isPending} isReadyToRate={true} onRatingSelect={onRatingSelect} />
        )}

        {mode === 'placeMarker' && (
          <>
            <p>Tik op de kaart om de locatie te kiezen</p>
            <Button label="Annuleren" variant="secondary" onClick={onCancelMarker} />
          </>
        )}

        {mode === 'markerForm' && (
          <form
            className={styles.markerForm}
            onSubmit={(event) => {
              event.preventDefault();
              onSaveMarker(markerType, normalizeDescription(description));
            }}
          >
            <div className={styles.iconPicker} role="radiogroup" aria-label="Type waarschuwing">
              {getMarkerTypes().map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.iconCard}${type === markerType ? ` ${styles.selected}` : ''}`}
                  onClick={() => setMarkerType(type)}
                  role="radio"
                  aria-checked={type === markerType}
                >
                  <span className={styles.icon}>{getIconByName(MARKER_TYPES[type].iconName)({})}</span>
                  <span className={styles.iconTitle}>{MARKER_TYPES[type].title}</span>
                </button>
              ))}
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Toelichting (optioneel)</span>
              <input
                className={styles.input}
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <div className={styles.actions}>
              <Button label="Opslaan" variant="primary" type="submit" />
              <Button label="Annuleren" variant="secondary" onClick={onCancelMarker} />
            </div>
          </form>
        )}
      </PanelBody>
    </Panel>
  );

  function getMarkerTypes(): MarkerType[] {
    return Object.keys(MARKER_TYPES) as MarkerType[];
  }

  function normalizeDescription(raw: string): string | null {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }
}
