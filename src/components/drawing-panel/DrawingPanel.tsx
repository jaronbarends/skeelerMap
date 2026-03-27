import styles from './DrawingPanel.module.css';

const RATINGS = [
  { value: 1, label: 'Terrible', emoji: '💀' },
  { value: 2, label: 'Poor', emoji: '😬' },
  { value: 3, label: 'Okay', emoji: '🙂' },
  { value: 4, label: 'Good', emoji: '😎' },
  { value: 5, label: 'Perfect', emoji: '🔥' },
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
        <p className={styles.instruction}>{getInstruction(controlPointCount)}</p>
        <button className={styles.cancelButton} onClick={onCancel} aria-label="Cancel drawing">
          ×
        </button>
      </div>
      <div className={styles.ratings}>
        {RATINGS.map(({ value, label, emoji }) => (
          <button
            key={value}
            className={`${styles.ratingButton} ${controlPointCount < 2 ? styles.ratingButtonDisabled : ''}`}
            disabled={controlPointCount < 2}
            onClick={() => onRatingSelect(value)}
            style={{ '--rating-color': `var(--color-rating-${value})` } as React.CSSProperties}
          >
            <span className={styles.emoji}>{emoji}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getInstruction(count: number) {
  if (count === 0) return 'Tap the map to start drawing';
  if (count === 1) return 'Tap again to draw the route';
  return 'Tap to add more points, or rate the route below';
}
