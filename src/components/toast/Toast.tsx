import { useEffect, useState } from 'react';

import ProgressBar from '@/components/ProgressBar';
import { getIconByName, type IconName } from '@/lib/getIconByName';
import { type ToastType } from '@/lib/toastMessages';
import { useCountdownTimer } from '@/lib/useCountdownTimer';

import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 5 * 1000;

const TYPE_ICON_NAMES = {
  error: 'circleExclamation',
  warning: 'triangleExclamation',
  success: 'circleCheck',
  info: 'circleInfo',
} as const satisfies Record<ToastType, IconName>;

interface Props {
  onDismiss: () => void;
  message: string;
  type: ToastType;
}

export default function Toast({ onDismiss, message, type }: Props) {
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
    <div
      className={styles.toast}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-type={type}
    >
      <span className={styles.content}>
        <ToastIcon type={type} /> {message}
      </span>
      <button className={styles.closeButton} onClick={onDismiss} aria-label="Dismiss">
        {getIconByName('close')({})}
      </button>
      <ProgressBar percentage={percentage} isCountdown />
    </div>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  const Icon = getIconByName(TYPE_ICON_NAMES[type]);
  return <span className={styles.icon}>{Icon({})}</span>;
}
