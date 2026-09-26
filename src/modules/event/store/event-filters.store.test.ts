import { describe, expect, it } from "vitest";
import { filterEvents } from "@/modules/event/store/event-filters.store";
import type { Event } from "@/modules/event/schemas/event.schema";

const events: Event[] = [
  {
    id: "1",
    slug: "rock-fest",
    title: "Rock Fest Lima",
    imageUrl: "https://example.com/1.jpg",
    categorySlug: "musica",
    venueName: "Estadio Nacional",
    city: "Lima",
    startDate: "2026-10-15T20:00:00-05:00",
    priceFrom: 80,
    currency: "PEN",
    featured: true,
    status: "available",
  },
  {
    id: "2",
    slug: "teatro-clasico",
    title: "Teatro Clásico",
    imageUrl: "https://example.com/2.jpg",
    categorySlug: "teatro",
    venueName: "Gran Teatro Nacional",
    city: "Lima",
    startDate: "2026-11-01T19:00:00-05:00",
    priceFrom: 50,
    currency: "PEN",
    featured: false,
    status: "available",
  },
  {
    id: "3",
    slug: "comedia-en-vivo",
    title: "Comedia en Vivo",
    imageUrl: "https://example.com/3.jpg",
    categorySlug: "comedia",
    venueName: "Centro de Convenciones",
    city: "Arequipa",
    startDate: "2026-10-15T21:00:00-05:00",
    priceFrom: 30,
    currency: "PEN",
    featured: false,
    status: "available",
  },
  {
    id: "4",
    slug: "festival-jazz",
    title: "Festival de Jazz",
    imageUrl: "https://example.com/4.jpg",
    categorySlug: "musica",
    venueName: "Parque de la Exposición",
    city: "Lima",
    startDate: "2026-12-05T18:00:00-05:00",
    priceFrom: 120,
    currency: "PEN",
    featured: true,
    status: "available",
  },
];

describe("filterEvents", () => {
  it("returns all events unchanged when no filters are set", () => {
    const result = filterEvents(events, { search: "", date: null, maxPrice: null });
    expect(result).toEqual(events);
  });

  it("filters by search across title, venueName and city (case-insensitive)", () => {
    const result = filterEvents(events, { search: "lima", date: null, maxPrice: null });
    expect(result.map((e) => e.id)).toEqual(["1", "2", "4"]);
  });

  it("filters by local calendar day of startDate", () => {
    const result = filterEvents(events, { search: "", date: "2026-10-15", maxPrice: null });
    expect(result.map((e) => e.id)).toEqual(["1", "3"]);
  });

  it("filters by maxPrice", () => {
    const result = filterEvents(events, { search: "", date: null, maxPrice: 50 });
    expect(result.map((e) => e.id)).toEqual(["2", "3"]);
  });

  it("combines filters with AND", () => {
    const result = filterEvents(events, { search: "lima", date: null, maxPrice: 100 });
    expect(result.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("returns an empty array when no event matches", () => {
    const result = filterEvents(events, { search: "cusco", date: null, maxPrice: null });
    expect(result).toEqual([]);
  });
});
