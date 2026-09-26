"use client";

import { EventCard } from "@/modules/event/components/event-card";
import { events } from "@/modules/event/data/events.mock";
import { filterEvents, useEventFiltersStore } from "@/modules/event/store/event-filters.store";

export function UpcomingEventsGrid() {
  const search = useEventFiltersStore((s) => s.search);
  const date = useEventFiltersStore((s) => s.date);
  const maxPrice = useEventFiltersStore((s) => s.maxPrice);
  const category = useEventFiltersStore((s) => s.category);

  const nonFeatured = events.filter((event) => !event.featured);
  const upcomingEvents = filterEvents(nonFeatured, { search, date, maxPrice, category });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {upcomingEvents.length === 0 ? (
        <p className="col-span-full py-12 text-center text-muted-foreground">
          No encontramos eventos con esos filtros.
        </p>
      ) : (
        upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
      )}
    </div>
  );
}
