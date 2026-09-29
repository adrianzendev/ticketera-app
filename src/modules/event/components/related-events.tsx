import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { EventCard } from "@/modules/event/components/event-card";
import type { Event } from "@/modules/event/schemas/event.schema";

export function RelatedEvents({ events, categoryName }: { events: Event[]; categoryName: string }) {
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="relacionados" className="w-full bg-muted py-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 md:px-6 lg:gap-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2
            id="relacionados"
            className="text-xl font-bold tracking-tight text-foreground lg:text-[28px]"
          >
            También te puede interesar
          </h2>
          <Link
            href="/eventos"
            className="flex h-11 items-center gap-1.5 text-[15px] font-semibold text-primary hover:text-primary/80"
          >
            Ver más {categoryName.toLowerCase()}
            <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} showDate />
          ))}
        </div>
      </div>
    </section>
  );
}
