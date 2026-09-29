import { useEffect, useRef, useState } from "react";

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useCountdown({
  durationSeconds,
  onExpire,
}: {
  durationSeconds: number;
  onExpire?: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    // Se recalcula contra el reloj para no desfasarse si la pestaña se congela o los ticks se retrasan.
    const endAt = Date.now() + durationSeconds * 1000;
    const intervalId = setInterval(() => {
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0) {
        clearInterval(intervalId);
        onExpireRef.current?.();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [durationSeconds]);

  return {
    secondsLeft,
    formatted: formatCountdown(secondsLeft),
    isExpired: secondsLeft === 0,
  };
}
