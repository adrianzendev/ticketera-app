import { events } from "@/modules/event/data/events.mock";
import { eventDetails } from "@/modules/event/data/event-details.mock";
import type { Event, EventDetail } from "@/modules/event/schemas/event.schema";

const byStartDate = (a: Event, b: Event) => Date.parse(a.startDate) - Date.parse(b.startDate);

export const eventService = {
  list(): Event[] {
    return [...events].sort(byStartDate);
  },

  getBySlug(slug: string): EventDetail | null {
    const event = events.find((e) => e.slug === slug);
    const extra = eventDetails[slug];
    if (!event || !extra) return null;
    return { ...event, ...extra };
  },

  getRelated(slug: string, limit = 4): Event[] {
    const current = events.find((e) => e.slug === slug);
    if (!current) return [];
    const others = eventService.list().filter((e) => e.slug !== slug);
    const sameCategory = others.filter((e) => e.categorySlug === current.categorySlug);
    const rest = others.filter((e) => e.categorySlug !== current.categorySlug);
    return [...sameCategory, ...rest].slice(0, limit);
  },
};
