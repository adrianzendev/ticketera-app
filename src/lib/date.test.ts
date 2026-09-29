import { describe, expect, it } from "vitest";

import {
  formatEventDateLong,
  formatEventDateShort,
  formatEventDayMonth,
  formatEventTime,
} from "./date";

describe("date", () => {
  it("AC-10: formatEventDateLong devuelve el día largo sin comas", () => {
    expect(formatEventDateLong("2026-11-14T20:00:00-05:00")).toBe("sábado 14 de noviembre");
  });

  it("AC-10: formatEventDateShort devuelve el día corto sin comas ni puntos", () => {
    expect(formatEventDateShort("2026-11-14T20:00:00-05:00")).toBe("sáb 14 nov");
  });

  it("AC-10: muestra la fecha en hora de Lima", () => {
    expect(formatEventDateLong("2026-11-15T03:00:00Z")).toBe("sábado 14 de noviembre");
  });

  it("AC-14: formatEventTime devuelve la hora de Lima en formato 24 h", () => {
    expect(formatEventTime("2026-11-14T21:00:00-05:00")).toBe("21:00");
    expect(formatEventTime("2026-11-15T03:00:00Z")).toBe("22:00");
    expect(formatEventTime("2026-10-22T09:05:00-05:00")).toBe("09:05");
  });

  it("AC-14: formatEventDayMonth devuelve el día con 2 dígitos y el mes en mayúsculas sin punto", () => {
    expect(formatEventDayMonth("2026-11-14T21:00:00-05:00")).toEqual({ day: "14", month: "NOV" });
    expect(formatEventDayMonth("2026-10-02T20:00:00-05:00")).toEqual({ day: "02", month: "OCT" });
    expect(formatEventDayMonth("2026-11-15T03:00:00Z")).toEqual({ day: "14", month: "NOV" });
  });
});
