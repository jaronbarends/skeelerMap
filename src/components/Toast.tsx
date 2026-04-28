'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

import { getIconByName } from '@/lib/getIconByName';
import { type ToastKey, isToastKey, getToastMessage } from '@/lib/toastMessages';

import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 4 * 1000;

export default function Toast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawToastKey = searchParams.get('toast');
  const toastKey: ToastKey | null = isToastKey(rawToastKey) ? rawToastKey : null;
  const message = toastKey ? getToastMessage(toastKey) : null;
  const [isVisible, setIsVisible] = useState(!!message);
  const [isPaused, setisPaused] = useState(!isVisible);

  const { percentage, isComplete } = useCountdownTimer({
    durationMs: AUTO_DISMISS_MS,
    isPaused,
    resetToken: toastKey,
  });

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setisPaused(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (isComplete && isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      dismiss();
    }
  }, [isComplete, isVisible, dismiss]);

  useEffect(() => {
    if (message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      setisPaused(false);
    }
  }, [message]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className={styles.wrapper} aria-live="polite">
      <button
        className={styles.toast}
        onClick={dismiss}
        onMouseEnter={() => setisPaused(true)}
        onMouseLeave={() => setisPaused(false)}
      >
        {getIconByName('circleCheck')({ className: styles.icon })} {message}
        <ProgressBar percentage={percentage} />
      </button>
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const countdownPercentage = 100 - percentage * 100;
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBarTrack} style={{ width: `${countdownPercentage}%` }} />
    </div>
  );
}

interface UseCountdownTimerProps {
  durationMs: number;
  isPaused: boolean;
  resetToken: string | null;
}

function useCountdownTimer({ durationMs, isPaused, resetToken }: UseCountdownTimerProps): {
  percentage: number;
  isComplete: boolean;
} {
  const [progressMs, setProgressMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalMs = 20;
  const stepMs = intervalMs;
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (resetToken) {
      clearInterval(intervalRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgressMs(0);
      setIsComplete(false);
    }
  }, [resetToken]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setProgressMs((prev) => {
        const newProgressMs = prev + stepMs;
        if (newProgressMs >= durationMs) {
          setIsComplete(true);
          clearInterval(intervalRef.current);
        }
        return newProgressMs;
      });
    }, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, durationMs, intervalMs, stepMs, resetToken]);

  return {
    percentage: progressMs / durationMs,
    isComplete,
  };
}
