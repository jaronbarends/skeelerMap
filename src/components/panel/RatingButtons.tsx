import { RATINGS, type Rating } from '@/lib/segments';

import PanelInstruction from './PanelInstruction';

import styles from './RatingButtons.module.css';

interface Props {
  onRatingSelect: (rating: number) => void;
  currentRating?: number;
}

export default function RatingButtons({ onRatingSelect, currentRating }: Props) {
  return (
    <>
      <PanelInstruction>Kies kwaliteit om op te slaan</PanelInstruction>
      <div className={styles.ratings}>
        {RATINGS.map((rating) => (
          <RatingButton
            key={rating.value}
            rating={rating}
            onRatingSelect={onRatingSelect}
            isCurrent={rating.value === currentRating}
          />
        ))}
      </div>
    </>
  );
}

interface RatingButtonProps {
  rating: Rating;
  onRatingSelect: (rating: number) => void;
  isCurrent: boolean;
}

function RatingButton({ rating, onRatingSelect, isCurrent }: RatingButtonProps) {
  return (
    <button
      className={`${styles.ratingButton}${isCurrent ? ` ${styles.current}` : ''}`}
      onClick={() => onRatingSelect(rating.value)}
      data-rating={rating.value}
    >
      <span className={styles.emoji}>{rating.emoji}</span>
      <span className={styles.stars}>{rating.stars}</span>
      <span className={styles.label}>{rating.label}</span>
    </button>
  );
}
