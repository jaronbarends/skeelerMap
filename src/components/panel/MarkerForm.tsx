import { useState } from 'react';

import Icon from '@/components/Icon';
import Button from '@/components/button/Button';
import { MARKER_TYPES, type MarkerType } from '@/lib/markers';

import styles from './MarkerForm.module.css';

interface Props {
  defaultMarkerType: MarkerType;
  defaultDescription: string;
  onSave: (type: MarkerType, description: string | null) => void;
  onCancel: () => void;
  isPending: boolean;
}

export default function MarkerForm({
  defaultMarkerType,
  defaultDescription,
  onSave,
  onCancel,
  isPending,
}: Props) {
  const [markerType, setMarkerType] = useState<MarkerType>(defaultMarkerType);
  const [description, setDescription] = useState<string>(defaultDescription);

  return isPending ? (
    <p>Bezig met opslaan...</p>
  ) : (
    <form
      className={styles.markerForm}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(markerType, normalizeDescription(description));
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
            <Icon iconName={MARKER_TYPES[type].iconName} size={24} />
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
        <Button label="Annuleren" variant="secondary" type="button" onClick={onCancel} />
      </div>
    </form>
  );
}

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
