import { FaPlus } from 'react-icons/fa6';
import styles from './DrawingPanel.module.css';

const RATINGS = [
  { value: 1, label: 'Kansloos', emoji: '💀', stars: '★' },
  { value: 2, label: 'Slecht',   emoji: '😬', stars: '★★' },
  { value: 3, label: 'Redelijk', emoji: '🙂', stars: '★★★' },
  { value: 4, label: 'Goed',     emoji: '😎', stars: '★★★★' },
  { value: 5, label: 'Geweldig', emoji: '🔥', stars: '★★★★★' },
] as const;

interface Props {
  controlPointCount: number;
  onCancel: () => void;
  onRatingSelect: (rating: number) => void;
}

export default function DrawingPanel({ controlPointCount, onCancel, onRatingSelect }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Segment toevoegen</span>
        <button className={styles.closeButton} onClick={onCancel} aria-label="Annuleren">
          <FaPlus className={styles.closeIcon} />
        </button>
      </div>
      <p className={styles.instruction}>{getInstruction(controlPointCount)}</p>
      <div className={styles.ratings}>
        {RATINGS.map(({ value, label, emoji, stars }) => (
          <button
            key={value}
            className={`${styles.ratingButton} ${controlPointCount < 2 ? styles.ratingButtonDisabled : ''}`}
            disabled={controlPointCount < 2}
            onClick={() => onRatingSelect(value)}
            style={{ '--rating-color': `var(--color-rating-${value})` } as React.CSSProperties}
          >
            <span className={styles.emoji}>{emoji}</span>
            <span className={styles.stars}>{stars}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getInstruction(count: number) {
  if (count < 2) return 'Klik minstens 2 punten om een segment te maken';
  return 'Kies kwaliteit om op te slaan';
}
