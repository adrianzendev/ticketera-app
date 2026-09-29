import { beforeEach, describe, expect, it } from "vitest";
import type { Event } from "@/modules/event/schemas/event.schema";
import {
  countBy,
  formatMonthLabel,
  getActiveFilterChips,
  getAvailableMonths,
  searchEvents,
  useEventSearchStore,
  type EventSearchFilters,
} from "@/modules/event/store/event-search.store";

function makeEvent(overrides: Partial<Event> & Pick<Event, "id" | "slug">): Event {
  return {
    title: overrides.slug,
    imageUrl: "https://example.com/e.jpg",
    categorySlug: "conciertos",
    venueName: "Estadio Nacional",
    city: "Lima",
    startDate: "2026-10-15T20:00:00-05:00",
    priceFrom: 80,
    currency: "PEN",
    featured: false,
    status: "available",
    ...overrides,
  };
}

const events: Event[] = [
  makeEvent({
    id: "1",
    slug: "rock-fest",
    title: "Rock Fest Lima",
    categorySlug: "conciertos",
    city: "Lima",
    startDate: "2026-11-20T20:00:00-05:00",
    priceFrom: 150,
  }),
  makeEvent({
    id: "2",
    slug: "teatro-clasico",
    title: "Teatro Clásico",
    categorySlug: "teatro",
    venueName: "Gran Teatro Nacional",
    city: "Lima",
    startDate: "2026-10-01T19:00:00-05:00",
    priceFrom: 50,
  }),
  makeEvent({
    id: "3",
    slug: "comedia-en-vivo",
    title: "Comedia en Vivo",
    categorySlug: "comedia",
    venueName: "Centro de Convenciones",
    city: "Arequipa",
    startDate: "2026-10-20T21:00:00-05:00",
    priceFrom: 30,
    status: "sold_out",
  }),
  makeEvent({
    id: "4",
    slug: "festival-jazz",
    title: "Festival de Jazz",
    categorySlug: "conciertos",
    venueName: "Plaza de Armas",
    city: "Cusco",
    startDate: "2026-12-05T18:00:00-05:00",
    priceFrom: 150,
  }),
  makeEvent({
    id: "5",
    slug: "opera-gala",
    title: "Ópera de Gala",
    categorySlug: "teatro",
    city: "Arequipa",
    startDate: "2026-10-31T23:30:00-05:00",
    priceFrom: 320,
  }),
];

const baseFilters: EventSearchFilters = {
  search: "",
  categories: [],
  cities: [],
  month: null,
  priceRange: "any",
  sort: "date",
};

const slugs = (list: Event[]) => list.map((e) => e.slug);

const initialState = {
  search: "",
  categories: [],
  cities: [],
  month: null,
  priceRange: "any" as const,
  sort: "date" as const,
};

describe("useEventSearchStore", () => {
  beforeEach(() => {
    useEventSearchStore.setState(initialState);
  });

  it("AC-8: arranca con el estado inicial", () => {
    const s = useEventSearchStore.getState();
    expect({
      search: s.search,
      categories: s.categories,
      cities: s.cities,
      month: s.month,
      priceRange: s.priceRange,
      sort: s.sort,
    }).toEqual(initialState);
  });

  it("AC-8: toggleCategory y toggleCity agregan y quitan", () => {
    const { toggleCategory, toggleCity } = useEventSearchStore.getState();
    toggleCategory("teatro");
    toggleCategory("comedia");
    toggleCity("Lima");
    expect(useEventSearchStore.getState().categories).toEqual(["teatro", "comedia"]);
    expect(useEventSearchStore.getState().cities).toEqual(["Lima"]);
    toggleCategory("teatro");
    toggleCity("Lima");
    expect(useEventSearchStore.getState().categories).toEqual(["comedia"]);
    expect(useEventSearchStore.getState().cities).toEqual([]);
  });

  it("AC-8: clearFilters resetea filtros y conserva search y sort", () => {
    const s = useEventSearchStore.getState();
    s.setSearch("rock");
    s.setSort("price");
    s.toggleCategory("teatro");
    s.toggleCity("Lima");
    s.setMonth("2026-10");
    s.setPriceRange("u50");
    useEventSearchStore.getState().clearFilters();
    const after = useEventSearchStore.getState();
    expect(after.categories).toEqual([]);
    expect(after.cities).toEqual([]);
    expect(after.month).toBeNull();
    expect(after.priceRange).toBe("any");
    expect(after.search).toBe("rock");
    expect(after.sort).toBe("price");
  });
});

describe("searchEvents", () => {
  it("AC-9: sin filtros devuelve todo ordenado por fecha ascendente", () => {
    expect(slugs(searchEvents(events, baseFilters))).toEqual([
      "teatro-clasico",
      "comedia-en-vivo",
      "opera-gala",
      "rock-fest",
      "festival-jazz",
    ]);
  });

  it("AC-9: filtra solo por texto usando filterEvents", () => {
    expect(slugs(searchEvents(events, { ...baseFilters, search: "  JAZZ " }))).toEqual(["festival-jazz"]);
    expect(slugs(searchEvents(events, { ...baseFilters, search: "arequipa" }))).toEqual([
      "comedia-en-vivo",
      "opera-gala",
    ]);
  });

  it("AC-9: combina categorías con OR", () => {
    const result = searchEvents(events, { ...baseFilters, categories: ["teatro", "comedia"] });
    expect(slugs(result)).toEqual(["teatro-clasico", "comedia-en-vivo", "opera-gala"]);
  });

  it("AC-9: combina categoría y ciudad con AND", () => {
    const result = searchEvents(events, {
      ...baseFilters,
      categories: ["teatro"],
      cities: ["Arequipa"],
    });
    expect(slugs(result)).toEqual(["opera-gala"]);
  });

  it("AC-9: filtra por mes con startDate.slice(0, 7)", () => {
    const result = searchEvents(events, { ...baseFilters, month: "2026-10" });
    expect(slugs(result)).toEqual(["teatro-clasico", "comedia-en-vivo", "opera-gala"]);
  });

  it("AC-9: bordes de precio (min exclusivo, max inclusivo)", () => {
    expect(slugs(searchEvents(events, { ...baseFilters, priceRange: "u50" }))).toEqual([
      "teatro-clasico",
      "comedia-en-vivo",
    ]);
    expect(slugs(searchEvents(events, { ...baseFilters, priceRange: "50-150" }))).toEqual([
      "rock-fest",
      "festival-jazz",
    ]);
    expect(searchEvents(events, { ...baseFilters, priceRange: "150-300" })).toEqual([]);
    expect(slugs(searchEvents(events, { ...baseFilters, priceRange: "300+" }))).toEqual(["opera-gala"]);
  });

  it("AC-9: ordena por precio y desempata por fecha", () => {
    expect(slugs(searchEvents(events, { ...baseFilters, sort: "price" }))).toEqual([
      "comedia-en-vivo",
      "teatro-clasico",
      "rock-fest",
      "festival-jazz",
      "opera-gala",
    ]);
  });

  it("AC-9: no muta la entrada y no excluye agotados", () => {
    const input = [...events];
    const result = searchEvents(input, { ...baseFilters, sort: "price" });
    expect(input).toEqual(events);
    expect(result).not.toBe(input);
    expect(slugs(result)).toContain("comedia-en-vivo");
  });
});

describe("getActiveFilterChips", () => {
  beforeEach(() => {
    useEventSearchStore.setState(initialState);
  });

  it("AC-10: sin filtros no hay chips; search y sort no generan chip", () => {
    useEventSearchStore.getState().setSearch("rock");
    useEventSearchStore.getState().setSort("price");
    expect(getActiveFilterChips(useEventSearchStore.getState())).toEqual([]);
  });

  it("AC-10: devuelve chips en orden con labels y keys únicas", () => {
    const s = useEventSearchStore.getState();
    s.toggleCategory("teatro");
    s.toggleCategory("desconocida");
    s.toggleCity("Lima");
    s.setMonth("2026-10");
    s.setPriceRange("50-150");
    const chips = getActiveFilterChips(useEventSearchStore.getState());
    expect(chips.map((c) => c.label)).toEqual([
      "Teatro",
      "desconocida",
      "Lima",
      "Octubre 2026",
      "S/ 50 – 150",
    ]);
    expect(new Set(chips.map((c) => c.key)).size).toBe(chips.length);
  });

  it("AC-10: cada remove deshace solo su filtro", () => {
    const s = useEventSearchStore.getState();
    s.toggleCategory("teatro");
    s.toggleCity("Lima");
    s.setMonth("2026-10");
    s.setPriceRange("u50");

    const labels = () => getActiveFilterChips(useEventSearchStore.getState()).map((c) => c.label);
    const removeByLabel = (label: string) =>
      getActiveFilterChips(useEventSearchStore.getState())
        .find((c) => c.label === label)!
        .remove();

    removeByLabel("Lima");
    expect(useEventSearchStore.getState().cities).toEqual([]);
    expect(labels()).toEqual(["Teatro", "Octubre 2026", "Hasta S/ 50"]);

    removeByLabel("Teatro");
    expect(useEventSearchStore.getState().categories).toEqual([]);
    expect(labels()).toEqual(["Octubre 2026", "Hasta S/ 50"]);

    removeByLabel("Octubre 2026");
    expect(useEventSearchStore.getState().month).toBeNull();
    expect(labels()).toEqual(["Hasta S/ 50"]);

    removeByLabel("Hasta S/ 50");
    expect(useEventSearchStore.getState().priceRange).toBe("any");
    expect(labels()).toEqual([]);
  });
});

describe("helpers", () => {
  it("AC-11: countBy cuenta por categoría y por ciudad", () => {
    expect(countBy(events, "categorySlug")).toEqual({ conciertos: 2, teatro: 2, comedia: 1 });
    expect(countBy(events, "city")).toEqual({ Lima: 2, Arequipa: 2, Cusco: 1 });
    expect(countBy([], "city")).toEqual({});
  });

  it("AC-11: getAvailableMonths devuelve meses únicos ascendentes", () => {
    expect(getAvailableMonths(events)).toEqual(["2026-10", "2026-11", "2026-12"]);
  });

  it("AC-11: formatMonthLabel devuelve el mes en español con mayúscula", () => {
    expect(formatMonthLabel("2026-10")).toBe("Octubre 2026");
    expect(formatMonthLabel("2027-01")).toBe("Enero 2027");
    expect(formatMonthLabel("2026-12")).toBe("Diciembre 2026");
  });
});
