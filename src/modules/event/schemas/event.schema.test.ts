import { describe, expect, it } from "vitest";
import { categorySchema, eventSchema } from "@/modules/event/schemas/event.schema";
import { categories } from "@/modules/event/data/categories.mock";
import { events } from "@/modules/event/data/events.mock";

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
