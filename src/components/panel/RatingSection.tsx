import { RATINGS, type Rating } from '@/lib/segments';

import PanelInstruction from './PanelInstruction';

import styles from './RatingSection.module.css';

interface Props {
  isPending?: boolean;
  isReadyToRate?: boolean;
  onRatingSelect: (rating: number) => void;
  currentRatingValue?: number;
}

export default function RatingSection({
  isPending,
  isReadyToRate,
  onRatingSelect,
  currentRatingValue,
}: Props) {
  let instruction: string;
  if (isPending) {
    instruction = 'Segment aan het opslaan...';
  } else if (isReadyToRate) {
    instruction = 'Kies kwaliteit om op te slaan';
  } else {
    instruction = 'Klik minstens 2 punten om een segment te maken';
  }

  const showRatingButtons = isReadyToRate && !isPending;
  return (
    <>
      <PanelInstruction>{instruction}</PanelInstruction>
      {showRatingButtons && (
        <RatingButtons onRatingSelect={onRatingSelect} currentRatingValue={currentRatingValue} />
      )}
    </>
  );
}

interface RatingButtonsProps {
  onRatingSelect: (rating: number) => void;
  currentRatingValue?: number;
}

function RatingButtons({ onRatingSelect, currentRatingValue }: RatingButtonsProps) {
  return (
    <div className={styles.ratings}>
      {RATINGS.map((rating) => (
        <RatingButton
          key={rating.value}
          rating={rating}
          onRatingSelect={onRatingSelect}
          isCurrent={rating.value === currentRatingValue}
        />
      ))}
    </div>
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
