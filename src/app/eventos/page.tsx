import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { EventSearchBar } from "@/modules/event/components/event-search-bar";
import {
  EventSearchFilters,
  EventSearchMobileFilters,
} from "@/modules/event/components/event-search-filters";
import { EventSearchResults } from "@/modules/event/components/event-search-results";
import { eventService } from "@/modules/event/services/event.service";

export const metadata: Metadata = {
  title: "Explora eventos | Ticketera",
};

export default function EventosPage() {
  const events = eventService.list();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col bg-muted">
        <section className="border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pt-5 pb-[18px] md:gap-5 md:px-6 md:pt-9 md:pb-8">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-foreground md:text-4xl">
              Explora eventos
            </h1>
            <EventSearchBar />
            <div className="lg:hidden">
              <EventSearchMobileFilters events={events} />
            </div>
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-10 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-20 lg:grid-cols-[288px_minmax(0,1fr)]">
          <aside
            aria-label="Filtros"
            className="hidden rounded-[22px] border border-border bg-background px-6 pt-2 pb-6 lg:block"
          >
            <EventSearchFilters events={events} />
          </aside>
          <EventSearchResults events={events} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
