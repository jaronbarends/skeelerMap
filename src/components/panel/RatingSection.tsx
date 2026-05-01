import { type ReactNode } from 'react';

import { RATINGS, RatingValue, type Rating } from '@/lib/segments';

import PendingText from '@/components/PendingText';

import styles from './RatingSection.module.css';

interface Props {
  isPending?: boolean;
  isReadyToRate?: boolean;
  onRatingSelect: (ratingValue: RatingValue) => void;
  currentRatingValue?: number;
}

export default function RatingSection({
  isPending,
  isReadyToRate,
  onRatingSelect,
  currentRatingValue,
}: Props) {
  let panelText: ReactNode;
  if (isPending) {
    panelText = (
      <PendingText>
        <p>Segment aan het opslaan...</p>
      </PendingText>
    );
  } else if (isReadyToRate) {
    panelText = <p>Kies kwaliteit om op te slaan</p>;
  } else {
    panelText = <p>Klik minstens 2 punten om een segment te maken</p>;
  }

  const showRatingButtons = isReadyToRate && !isPending;
  return (
    <>
      {panelText}
      {showRatingButtons && (
        <RatingButtons onRatingSelect={onRatingSelect} currentRatingValue={currentRatingValue} />
      )}
    </>
  );
}

interface RatingButtonsProps {
  onRatingSelect: (ratingValue: RatingValue) => void;
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
  onRatingSelect: (ratingValue: RatingValue) => void;
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
