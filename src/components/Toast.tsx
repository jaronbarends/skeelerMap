'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { getIconByName } from '@/lib/getIconByName';
import { type ToastKey, isToastKey, getToastMessage } from '@/lib/toastMessages';

import styles from './Toast.module.css';

const AUTO_DISMISS_MS = 4 * 1000;

export default function Toast() {
  const { message, onDismiss } = useInitToast();

  if (!message) {
    return null;
  }

  return <ToastPanel onDismiss={onDismiss} message={message} />;
}

function useInitToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const message = getMessageFromSearchParams();
  return { message, onDismiss };

  function onDismiss() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const newUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  }

  function getMessageFromSearchParams(): string {
    const rawToastKey = searchParams.get('toast');
    const toastKey: ToastKey | null = isToastKey(rawToastKey) ? rawToastKey : null;
    const message = toastKey ? (getToastMessage(toastKey) ?? '') : '';
    return message;
  }
}

interface ToastPanelProps {
  onDismiss: () => void;
  message: string;
}

function ToastPanel({ onDismiss, message }: ToastPanelProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { percentage, isComplete } = useCountdownTimer({
    durationMs: AUTO_DISMISS_MS,
    isPaused,
  });

  useEffect(() => {
    if (isComplete) {
      onDismiss();
    }
  }, [isComplete, onDismiss]);

  return (
    <div className={styles.wrapper} aria-live="polite">
      <button
        className={styles.toast}
        onClick={onDismiss}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {getIconByName('circleCheck')()} {message}
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
}

function useCountdownTimer({ durationMs, isPaused }: UseCountdownTimerProps): {
  percentage: number;
  isComplete: boolean;
} {
  const [progressMs, setProgressMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalMs = 20;
  const stepMs = intervalMs;
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
  }, [isPaused, durationMs, intervalMs, stepMs]);

  return {
    percentage: progressMs / durationMs,
    isComplete,
  };
}
