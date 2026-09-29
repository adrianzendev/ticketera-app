import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatCountdown, useCountdown } from "./use-countdown";

describe("formatCountdown", () => {
  it("AC-11: formatea MM:SS y lleva los negativos a 00:00", () => {
    expect(formatCountdown(600)).toBe("10:00");
    expect(formatCountdown(588)).toBe("09:48");
    expect(formatCountdown(59)).toBe("00:59");
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(-5)).toBe("00:00");
  });
});

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC-11: arranca con durationSeconds", () => {
    const { result } = renderHook(() => useCountdown({ durationSeconds: 600 }));
    expect(result.current.secondsLeft).toBe(600);
    expect(result.current.formatted).toBe("10:00");
    expect(result.current.isExpired).toBe(false);
  });

  it("AC-11: resta 1 segundo tras 1000 ms", () => {
    const { result } = renderHook(() => useCountdown({ durationSeconds: 600 }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(599);
    expect(result.current.formatted).toBe("09:59");
  });

  it("AC-11: al llegar a 0 expira y llama a onExpire una sola vez", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ durationSeconds: 3, onExpire }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("AC-11: usa la última onExpire sin reiniciar el conteo", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ onExpire }) => useCountdown({ durationSeconds: 3, onExpire }),
      { initialProps: { onExpire: first } },
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ onExpire: second });
    expect(result.current.secondsLeft).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isExpired).toBe(true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("AC-11: limpia el intervalo al desmontar", () => {
    const { unmount } = renderHook(() => useCountdown({ durationSeconds: 600 }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
