import { describe, expect, it } from "vitest";

import { formatEventDateLong, formatEventDateShort } from "./date";

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
});
