import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { EventDetailHero } from "@/modules/event/components/event-detail-hero";
import { EventDetailInfo } from "@/modules/event/components/event-detail-info";
import { EventMobileBuyBar, EventTierSummary } from "@/modules/event/components/event-tier-summary";
import { RelatedEvents } from "@/modules/event/components/related-events";
import { categories } from "@/modules/event/data/categories.mock";
import { eventService } from "@/modules/event/services/event.service";

type EventPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return eventService.list().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = eventService.getBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} | Ticketera`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = eventService.getBySlug(slug);
  if (!event) notFound();

  const categoryName =
    categories.find((c) => c.slug === event.categorySlug)?.name ?? event.categorySlug;
  const related = eventService.getRelated(slug);

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-0">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <nav aria-label="Ruta de navegación" className="py-4 lg:pt-6 lg:pb-5">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li>
                <Link href="/eventos" className="hover:text-foreground">
                  {categoryName}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-4" />
              </li>
              <li>
                <span aria-current="page" className="font-medium text-foreground">
                  {event.title}
                </span>
              </li>
            </ol>
          </nav>

          <EventDetailHero event={event} categoryName={categoryName} />

          <div className="grid grid-cols-1 items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-14 lg:gap-y-12 lg:pt-14 lg:pb-18">
            <EventDetailInfo event={event} />
            <EventTierSummary
              event={event}
              className="order-3 lg:order-none lg:col-start-2 lg:row-span-3 lg:row-start-1"
            />
          </div>
        </div>

        <RelatedEvents events={related} categoryName={categoryName} />
      </main>

      <SiteFooter />
      <EventMobileBuyBar event={event} />
    </div>
  );
}
