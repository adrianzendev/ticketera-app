import { describe, expect, it } from "vitest";

import { ORGANIZER_EVENTS } from "@/modules/organizer/data/organizer-events.mock";
import {
  organizerEventSchema,
  type OrganizerEvent,
} from "@/modules/organizer/schemas/organizer-event.schema";
import {
  EVENT_STATUS_FILTERS,
  filterEventsByStatus,
  formatNumber,
  formatSoles,
  formatTicketTotal,
  getDashboardKpis,
  getEventMetrics,
  mergeOrganizerEvents,
} from "@/modules/organizer/services/organizer.service";

function eventById(id: string): OrganizerEvent {
  const event = ORGANIZER_EVENTS.find((e) => e.id === id);
  if (!event) throw new Error(`No existe ${id}`);
  return event;
}

function createdEvent(id: string, createdAt: string): OrganizerEvent {
  return { ...eventById("org-evt-4"), id, title: `Evento ${id}`, createdAt };
}

describe("ORGANIZER_EVENTS", () => {
  it("AC-9: los 4 eventos pasan organizerEventSchema.parse", () => {
    expect(ORGANIZER_EVENTS).toHaveLength(4);
    for (const event of ORGANIZER_EVENTS) {
      expect(() => organizerEventSchema.parse(event)).not.toThrow();
      expect(event.description.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("AC-9: ids de evento y de tier únicos", () => {
    const ids = ORGANIZER_EVENTS.map((e) => e.id);
    const tierIds = ORGANIZER_EVENTS.flatMap((e) => e.tiers.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(tierIds).size).toBe(tierIds.length);
    expect(tierIds).toContain("org-evt-1-general");
    expect(tierIds).toContain("org-evt-1-vip");
  });

  it("AC-9: orden, estados e imagen del borrador", () => {
    expect(ORGANIZER_EVENTS.map((e) => [e.id, e.status])).toEqual([
      ["org-evt-1", "published"],
      ["org-evt-2", "published"],
      ["org-evt-3", "published"],
      ["org-evt-4", "draft"],
    ]);
    expect(eventById("org-evt-4").imageUrl).toBeNull();
  });
});

describe("getEventMetrics", () => {
  it("AC-10: suma vendidas, capacidad e ingresos por tier en org-evt-1", () => {
    expect(getEventMetrics(eventById("org-evt-1"))).toEqual({
      sold: 7420,
      capacity: 8000,
      revenue: 1101000,
      soldRatio: 0.9275,
    });
  });

  it("AC-10: org-evt-2", () => {
    expect(getEventMetrics(eventById("org-evt-2"))).toMatchObject({
      sold: 312,
      capacity: 420,
      revenue: 17640,
    });
  });

  it("AC-10: borrador sin ventas", () => {
    expect(getEventMetrics(eventById("org-evt-4"))).toMatchObject({
      sold: 0,
      revenue: 0,
      soldRatio: 0,
    });
  });
});

describe("getDashboardKpis", () => {
  it("AC-11: con los mock", () => {
    expect(getDashboardKpis(ORGANIZER_EVENTS)).toEqual({
      sold: 8146,
      revenue: 1137270,
      published: 3,
    });
  });

  it("AC-11: sin eventos", () => {
    expect(getDashboardKpis([])).toEqual({ sold: 0, revenue: 0, published: 0 });
  });
});

describe("filtros y unión", () => {
  it("AC-12: EVENT_STATUS_FILTERS", () => {
    expect(EVENT_STATUS_FILTERS).toEqual([
      { key: "all", label: "Todos" },
      { key: "published", label: "Publicados" },
      { key: "draft", label: "Borradores" },
    ]);
  });

  it("AC-12: filterEventsByStatus con los 3 filtros, sin mutar", () => {
    const input = [...ORGANIZER_EVENTS];
    const snapshot = [...input];

    const all = filterEventsByStatus(input, "all");
    expect(all).toEqual(input);
    expect(all).not.toBe(input);
    expect(filterEventsByStatus(input, "published").map((e) => e.id)).toEqual([
      "org-evt-1",
      "org-evt-2",
      "org-evt-3",
    ]);
    expect(filterEventsByStatus(input, "draft").map((e) => e.id)).toEqual(["org-evt-4"]);
    expect(input).toEqual(snapshot);
  });

  it("AC-12: mergeOrganizerEvents ordena los creados por createdAt descendente y agrega los mock", () => {
    const older = createdEvent("org-a", "2026-09-29T10:00:00.000Z");
    const newer = createdEvent("org-b", "2026-09-29T12:00:00.000Z");
    const created = [older, newer];

    const merged = mergeOrganizerEvents(created);

    expect(merged.map((e) => e.id)).toEqual([
      "org-b",
      "org-a",
      "org-evt-1",
      "org-evt-2",
      "org-evt-3",
      "org-evt-4",
    ]);
    expect(created).toEqual([older, newer]);
  });

  it("AC-12: mergeOrganizerEvents deduplica por id (gana el creado) sin mutar", () => {
    const replacement = { ...eventById("org-evt-2"), title: "Creado", createdAt: "2026-09-29T12:00:00.000Z" };
    const mocks = [eventById("org-evt-1"), eventById("org-evt-2")];
    const mocksSnapshot = [...mocks];

    const merged = mergeOrganizerEvents([replacement], mocks);

    expect(merged.map((e) => e.id)).toEqual(["org-evt-2", "org-evt-1"]);
    expect(merged[0]).toBe(replacement);
    expect(mocks).toEqual(mocksSnapshot);
  });

  it("AC-12: sin creados devuelve los mock en su orden", () => {
    expect(mergeOrganizerEvents([]).map((e) => e.id)).toEqual(ORGANIZER_EVENTS.map((e) => e.id));
  });
});

describe("formateo", () => {
  it.each([
    [0, "0"],
    [420, "420"],
    [7420, "7,420"],
    [1137270, "1,137,270"],
  ])("AC-13: formatNumber(%s) → %s", (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });

  it.each([
    [0, "S/ 0"],
    [120, "S/ 120"],
    [1137270, "S/ 1,137,270"],
    [45.5, "S/ 45.50"],
    [1234.5, "S/ 1,234.50"],
  ])("AC-13: formatSoles(%s) → %s", (value, expected) => {
    expect(formatSoles(value)).toBe(expected);
  });

  it.each([
    [1, "1 entrada"],
    [0, "0 entradas"],
    [1500, "1,500 entradas"],
  ])("AC-13: formatTicketTotal(%s) → %s", (value, expected) => {
    expect(formatTicketTotal(value)).toBe(expected);
  });
});
