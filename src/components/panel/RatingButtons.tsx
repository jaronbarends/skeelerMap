import PanelInstruction from './PanelInstruction';
import styles from './RatingButtons.module.css';

const RATINGS = [
  { value: 1, label: 'Kansloos', emoji: '💀', stars: '★' },
  { value: 2, label: 'Slecht', emoji: '😬', stars: '★★' },
  { value: 3, label: 'Redelijk', emoji: '🙂', stars: '★★★' },
  { value: 4, label: 'Goed', emoji: '😎', stars: '★★★★' },
  { value: 5, label: 'Geweldig', emoji: '🔥', stars: '★★★★★' },
] as const;
type Rating = (typeof RATINGS)[number];

interface Props {
  onRatingSelect: (rating: number) => void;
}

export default function RatingButtons({ onRatingSelect }: Props) {
  return (
    <>
      <PanelInstruction>Kies kwaliteit om op te slaan</PanelInstruction>
      <div className={styles.ratings}>
        {RATINGS.map((rating) => (
          <RatingButton key={rating.value} {...{ rating, onRatingSelect }} />
        ))}
      </div>
    </>
  );
}

interface RatingButtonProps {
  rating: Rating;
  onRatingSelect: (rating: number) => void;
}

function RatingButton({ rating, onRatingSelect }: RatingButtonProps) {
  return (
    <button
      className={styles.ratingButton}
      onClick={() => onRatingSelect(rating.value)}
      data-rating={rating.value}
    >
      <span className={styles.emoji}>{rating.emoji}</span>
      <span className={styles.stars}>{rating.stars}</span>
      <span className={styles.label}>{rating.label}</span>
    </button>
  );
}
