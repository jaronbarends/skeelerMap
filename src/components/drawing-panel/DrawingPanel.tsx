import { FaPlus } from 'react-icons/fa6';
import styles from './DrawingPanel.module.css';

const RATINGS = [
  { value: 1, label: 'Kansloos', emoji: '💀', stars: '★' },
  { value: 2, label: 'Slecht', emoji: '😬', stars: '★★' },
  { value: 3, label: 'Redelijk', emoji: '🙂', stars: '★★★' },
  { value: 4, label: 'Goed', emoji: '😎', stars: '★★★★' },
  { value: 5, label: 'Geweldig', emoji: '🔥', stars: '★★★★★' },
] as const;
type Rating = (typeof RATINGS)[number];

interface Props {
  controlPointCount: number;
  onCancel: () => void;
  onRatingSelect: (rating: number) => void;
}

export default function DrawingPanel({ controlPointCount, onCancel, onRatingSelect }: Props) {
  const disabled = controlPointCount < 2;
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
        {RATINGS.map((rating) => (
          <RatingButton key={rating.value} {...{ rating, disabled, onRatingSelect }} />
        ))}
      </div>
    </div>
  );
}

interface RatingButtonProps {
  rating: Rating;
  disabled: boolean;
  onRatingSelect: (rating: number) => void;
}

function RatingButton({ rating, disabled, onRatingSelect }: RatingButtonProps) {
  return (
    <button
      className={styles.ratingButton}
      onClick={() => onRatingSelect(rating.value)}
      data-rating={rating.value}
      {...{ disabled }}
    >
      <span className={styles.emoji}>{rating.emoji}</span>
      <span className={styles.stars}>{rating.stars}</span>
      <span className={styles.label}>{rating.label}</span>
    </button>
  );
}

function getInstruction(count: number) {
  if (count < 2) return 'Klik minstens 2 punten om een segment te maken';
  return 'Kies kwaliteit om op te slaan';
}
