import { useEffect, useState } from 'react';

import ProgressBar from '@/components/ProgressBar';
import { getIconByName } from '@/lib/getIconByName';
import { useCountdownTimer } from '@/lib/useCountdownTimer';

import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 4 * 1000;

interface Props {
  onDismiss: () => void;
  message: string;
}

export default function Toast({ onDismiss, message }: Props) {
  const [isPaused, setIsPaused] = useState(false);
  const { percentage, isComplete } = useCountdownTimer({
    durationMs: AUTO_DISMISS_MS,
    isPaused,
    resetToken: message,
  });

  useEffect(() => {
    if (isComplete) {
      onDismiss();
    }
  }, [isComplete, onDismiss]);

  return (
    <button
      className={styles.toast}
      onClick={onDismiss}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {getIconByName('circleCheck')()} {message}
      <ProgressBar percentage={percentage} isCountdown />
    </button>
  );
}
