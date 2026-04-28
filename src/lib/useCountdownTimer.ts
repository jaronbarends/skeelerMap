import { useEffect, useState, useRef } from 'react';

interface UseCountdownTimerProps {
  durationMs: number;
  isPaused: boolean;
  resetToken: string;
}

export function useCountdownTimer({ durationMs, isPaused, resetToken }: UseCountdownTimerProps): {
  percentage: number;
  isComplete: boolean;
} {
  const [progressMs, setProgressMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalMs = 20;
  const stepMs = intervalMs;
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressMs(0);
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
  }, [isPaused, durationMs, intervalMs, stepMs]);

  return {
    percentage: progressMs / durationMs,
    isComplete,
  };
}
