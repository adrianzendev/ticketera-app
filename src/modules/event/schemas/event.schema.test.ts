import { describe, expect, it } from "vitest";
import {
  categorySchema,
  eventDetailSchema,
  eventSchema,
  ticketTierSchema,
} from "@/modules/event/schemas/event.schema";
import { categories } from "@/modules/event/data/categories.mock";
import { events } from "@/modules/event/data/events.mock";
import { eventDetails } from "@/modules/event/data/event-details.mock";

describe("event mock data", () => {
  it("has at least 5 categories, all valid", () => {
    expect(categories.length).toBeGreaterThanOrEqual(5);
    for (const category of categories) {
      expect(() => categorySchema.parse(category)).not.toThrow();
    }
  });

  it("has at least 8 events, all valid, with at least 3 featured", () => {
    expect(events.length).toBeGreaterThanOrEqual(8);
    for (const event of events) {
      expect(() => eventSchema.parse(event)).not.toThrow();
    }
    expect(events.filter((e) => e.featured).length).toBeGreaterThanOrEqual(3);
  });

  it("every event references an existing category", () => {
    const categorySlugs = new Set(categories.map((c) => c.slug));
    for (const event of events) {
      expect(categorySlugs.has(event.categorySlug)).toBe(true);
    }
  });
});

const validTier = { id: "general", name: "General", price: 100, color: "#6366F1", status: "available" };

describe("ticketTierSchema", () => {
  it("AC-3: acepta un tier válido", () => {
    expect(() => ticketTierSchema.parse(validTier)).not.toThrow();
  });

  it("AC-3: rechaza un color que no es hex", () => {
    expect(() => ticketTierSchema.parse({ ...validTier, color: "red" })).toThrow();
    expect(() => ticketTierSchema.parse({ ...validTier, color: "#FFF" })).toThrow();
  });

  it("AC-3: rechaza un precio negativo", () => {
    expect(() => ticketTierSchema.parse({ ...validTier, price: -1 })).toThrow();
  });

  it("AC-3: rechaza un status desconocido", () => {
    expect(() => ticketTierSchema.parse({ ...validTier, status: "reserved" })).toThrow();
  });
});

describe("eventDetailSchema", () => {
  const base = events[0];
  const extra = eventDetails[base.slug];

  it("AC-3: rechaza tiers vacíos", () => {
    expect(() => eventDetailSchema.parse({ ...base, ...extra, tiers: [] })).toThrow();
  });

  it("AC-3: rechaza doorsOpenAt sin formato ISO con offset", () => {
    expect(() => eventDetailSchema.parse({ ...base, ...extra, doorsOpenAt: "18:30" })).toThrow();
  });
});

describe("event detail mock data", () => {
  const extraKeys = ["description", "doorsOpenAt", "minAge", "venueAddress", "tiers"].sort();

  it("AC-4: hay una entrada por cada slug de events.mock y solo esas", () => {
    expect(Object.keys(eventDetails).sort()).toEqual(events.map((e) => e.slug).sort());
    expect(Object.keys(eventDetails)).toHaveLength(9);
  });

  it("AC-4: cada entrada contiene solo los campos de EventDetailExtra", () => {
    for (const extra of Object.values(eventDetails)) {
      expect(Object.keys(extra).sort()).toEqual(extraKeys);
    }
  });

  it("AC-4: cada evento combinado con su detalle pasa eventDetailSchema", () => {
    for (const event of events) {
      expect(() => eventDetailSchema.parse({ ...event, ...eventDetails[event.slug] })).not.toThrow();
    }
  });

  it("AC-4: cada evento tiene entre 3 y 5 tiers con id únicos", () => {
    for (const { tiers } of Object.values(eventDetails)) {
      expect(tiers.length).toBeGreaterThanOrEqual(3);
      expect(tiers.length).toBeLessThanOrEqual(5);
      expect(new Set(tiers.map((t) => t.id)).size).toBe(tiers.length);
    }
  });

  it("AC-4: doorsOpenAt es anterior a startDate", () => {
    for (const event of events) {
      expect(Date.parse(eventDetails[event.slug].doorsOpenAt)).toBeLessThan(Date.parse(event.startDate));
    }
  });

  it("AC-4: hay eventos con minAge null y con minAge numérico", () => {
    const ages = Object.values(eventDetails).map((d) => d.minAge);
    expect(ages.some((a) => a === null)).toBe(true);
    expect(ages.some((a) => typeof a === "number")).toBe(true);
  });

  it("AC-5a: si no está agotado, priceFrom es el menor precio entre tiers no agotados", () => {
    for (const event of events.filter((e) => e.status !== "sold_out")) {
      const prices = eventDetails[event.slug].tiers.filter((t) => t.status !== "sold_out").map((t) => t.price);
      expect(event.priceFrom).toBe(Math.min(...prices));
    }
  });

  it("AC-5b: si está agotado, todos sus tiers están agotados y priceFrom es el menor precio", () => {
    const soldOut = events.filter((e) => e.status === "sold_out");
    expect(soldOut.length).toBeGreaterThan(0);
    for (const event of soldOut) {
      const { tiers } = eventDetails[event.slug];
      expect(tiers.every((t) => t.status === "sold_out")).toBe(true);
      expect(event.priceFrom).toBe(Math.min(...tiers.map((t) => t.price)));
    }
  });

  it("AC-5c: si está en last_tickets, al menos un tier está en last_tickets", () => {
    for (const event of events.filter((e) => e.status === "last_tickets")) {
      expect(eventDetails[event.slug].tiers.some((t) => t.status === "last_tickets")).toBe(true);
    }
  });

  it("AC-5d: si está available, al menos un tier está available", () => {
    for (const event of events.filter((e) => e.status === "available")) {
      expect(eventDetails[event.slug].tiers.some((t) => t.status === "available")).toBe(true);
    }
  });

  it("AC-5e: al menos un evento no agotado tiene un tier agotado", () => {
    const hasSoldOutTier = events
      .filter((e) => e.status !== "sold_out")
      .some((e) => eventDetails[e.slug].tiers.some((t) => t.status === "sold_out"));
    expect(hasSoldOutTier).toBe(true);
  });
});
