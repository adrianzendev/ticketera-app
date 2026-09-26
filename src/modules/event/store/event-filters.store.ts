import { create } from "zustand";
import type { Event } from "@/modules/event/schemas/event.schema";

type EventFiltersState = {
  search: string;
  date: string | null;
  maxPrice: number | null;
  category: string | null;
  setSearch: (v: string) => void;
  setDate: (v: string | null) => void;
  setMaxPrice: (v: number | null) => void;
  setCategory: (v: string | null) => void;
};

export const useEventFiltersStore = create<EventFiltersState>((set) => ({
  search: "",
  date: null,
  maxPrice: null,
  category: null,
  setSearch: (v) => set({ search: v }),
  setDate: (v) => set({ date: v }),
  setMaxPrice: (v) => set({ maxPrice: v }),
  setCategory: (v) => set({ category: v }),
}));

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function filterEvents(
  events: Event[],
  filters: {
    search: string;
    date: string | null;
    maxPrice: number | null;
    category?: string | null;
  }
): Event[] {
  const search = filters.search.trim().toLowerCase();
  return events.filter((event) => {
    if (search) {
      const haystack = `${event.title} ${event.venueName} ${event.city}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.date && toLocalDateKey(event.startDate) !== filters.date) return false;
    if (filters.maxPrice != null && event.priceFrom > filters.maxPrice) return false;
    if (filters.category && event.categorySlug !== filters.category) return false;
    return true;
  });
}
