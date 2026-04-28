import styles from './ProgressBar.module.css';

interface Props {
  percentage: number;
  isCountdown?: boolean;
}

export default function ProgressBar({ percentage, isCountdown = false }: Props) {
  const percentageToDisplay = isCountdown ? 100 - percentage * 100 : percentage * 100;
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBarTrack} style={{ width: `${percentageToDisplay}%` }} />
    </div>
  );
}
