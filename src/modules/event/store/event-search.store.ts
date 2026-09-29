import { create } from "zustand";
import type { Event } from "@/modules/event/schemas/event.schema";
import { categories } from "@/modules/event/data/categories.mock";
import { filterEvents } from "@/modules/event/store/event-filters.store";

export type PriceRangeKey = "any" | "u50" | "50-150" | "150-300" | "300+";
export type EventSort = "date" | "price";

export type EventSearchFilters = {
  search: string;
  categories: string[];
  cities: string[];
  month: string | null;
  priceRange: PriceRangeKey;
  sort: EventSort;
};

export type EventSearchState = EventSearchFilters & {
  setSearch: (v: string) => void;
  toggleCategory: (slug: string) => void;
  toggleCity: (city: string) => void;
  setMonth: (v: string | null) => void;
  setPriceRange: (v: PriceRangeKey) => void;
  setSort: (v: EventSort) => void;
  clearFilters: () => void;
};

export type ActiveFilterChip = { key: string; label: string; remove: () => void };

export const PRICE_RANGES: ReadonlyArray<{
  key: PriceRangeKey;
  label: string;
  min: number | null;
  max: number | null;
}> = [
  { key: "any", label: "Cualquier precio", min: null, max: null },
  { key: "u50", label: "Hasta S/ 50", min: null, max: 50 },
  { key: "50-150", label: "S/ 50 – 150", min: 50, max: 150 },
  { key: "150-300", label: "S/ 150 – 300", min: 150, max: 300 },
  { key: "300+", label: "Más de S/ 300", min: 300, max: null },
];

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const initialFilters: Pick<EventSearchFilters, "categories" | "cities" | "month" | "priceRange"> = {
  categories: [],
  cities: [],
  month: null,
  priceRange: "any",
};

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export const useEventSearchStore = create<EventSearchState>((set) => ({
  search: "",
  ...initialFilters,
  sort: "date",
  setSearch: (v) => set({ search: v }),
  toggleCategory: (slug) => set((s) => ({ categories: toggle(s.categories, slug) })),
  toggleCity: (city) => set((s) => ({ cities: toggle(s.cities, city) })),
  setMonth: (v) => set({ month: v }),
  setPriceRange: (v) => set({ priceRange: v }),
  setSort: (v) => set({ sort: v }),
  clearFilters: () => set(initialFilters),
}));

function toMonthKey(iso: string): string {
  // slice evita depender de la zona horaria del runtime
  return iso.slice(0, 7);
}

function byDate(a: Event, b: Event): number {
  return Date.parse(a.startDate) - Date.parse(b.startDate);
}

export function searchEvents(events: Event[], filters: EventSearchFilters): Event[] {
  const range = PRICE_RANGES.find((r) => r.key === filters.priceRange);
  const result = filterEvents(events, { search: filters.search, date: null, maxPrice: null }).filter(
    (event) => {
      if (filters.categories.length && !filters.categories.includes(event.categorySlug)) return false;
      if (filters.cities.length && !filters.cities.includes(event.city)) return false;
      if (filters.month && toMonthKey(event.startDate) !== filters.month) return false;
      if (range?.min != null && event.priceFrom <= range.min) return false;
      if (range?.max != null && event.priceFrom > range.max) return false;
      return true;
    }
  );
  return result.sort(
    filters.sort === "price" ? (a, b) => a.priceFrom - b.priceFrom || byDate(a, b) : byDate
  );
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
}

export function getActiveFilterChips(state: EventSearchState): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [
    ...state.categories.map((slug) => ({
      key: `category:${slug}`,
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
      remove: () => state.toggleCategory(slug),
    })),
    ...state.cities.map((city) => ({
      key: `city:${city}`,
      label: city,
      remove: () => state.toggleCity(city),
    })),
  ];
  if (state.month !== null) {
    chips.push({
      key: `month:${state.month}`,
      label: formatMonthLabel(state.month),
      remove: () => state.setMonth(null),
    });
  }
  if (state.priceRange !== "any") {
    const range = PRICE_RANGES.find((r) => r.key === state.priceRange);
    chips.push({
      key: `price:${state.priceRange}`,
      label: range?.label ?? state.priceRange,
      remove: () => state.setPriceRange("any"),
    });
  }
  return chips;
}

export function countBy(events: Event[], field: "categorySlug" | "city"): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, event) => {
    acc[event[field]] = (acc[event[field]] ?? 0) + 1;
    return acc;
  }, {});
}

export function getAvailableMonths(events: Event[]): string[] {
  return [...new Set(events.map((e) => toMonthKey(e.startDate)))].sort();
}
