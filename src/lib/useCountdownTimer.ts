import { useEffect, useState, useRef } from "react";

interface UseCountdownTimerProps {
  durationMs: number;
  isPaused: boolean;
  resetToken: string;
}

export function useCountdownTimer({
  durationMs,
  isPaused,
  resetToken,
}: UseCountdownTimerProps): {
  percentage: number;
  isComplete: boolean;
} {
  const [progressMs, setProgressMs] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const intervalMs = 20;
  const stepMs = intervalMs;
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    clearInterval(intervalRef.current);
    // setProgress gives a linting error for react-hooks/set-state-in-effect (coming from @jaronbarends/frontend-tooling-config) that we want to ignore with eslint-disable-next-line react-hooks/set-state-in-effect
    // Next's build uses its own ESLint that does not include react-hooks/set-state-in-effect, so build fails because it can't find the rule. So simply ignore next line without specific rule.
    // eslint-disable-next-line
    setProgressMs(0);
    setIsComplete(false);
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
