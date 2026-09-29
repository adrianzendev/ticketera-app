import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatEventDateLong, formatEventDateShort } from "@/lib/date";
import { eventService } from "@/modules/event/services/event.service";
import { PurchaseStepsHeader } from "@/modules/order/components/purchase-steps-header";
import { TicketSelection } from "@/modules/order/components/ticket-selection";
import { venueService } from "@/modules/venue/services/venue.service";

type TicketsPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return eventService.list().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: TicketsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = eventService.getBySlug(slug);
  if (!event) return {};
  return { title: `Entradas · ${event.title} | Ticketera` };
}

export default async function TicketsPage({ params }: TicketsPageProps) {
  const { slug } = await params;
  const event = eventService.getBySlug(slug);
  if (!event) notFound();

  const venueMap = venueService.getByEventSlug(slug);
  const eventHref = `/eventos/${slug}`;
  const place = `${event.venueName}, ${event.city}`;

  return (
    <div className="flex flex-1 flex-col bg-zinc-100 pb-28 lg:pb-0">
      <PurchaseStepsHeader currentStep={1} backHref={eventHref} />

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col gap-4 border-b border-zinc-100 bg-white p-4 lg:border-0 lg:bg-transparent lg:px-20 lg:pt-6 lg:pb-7">
          <Link
            href={eventHref}
            className="hidden h-10 w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground lg:flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver al evento
          </Link>
          <div className="flex items-center gap-3 lg:gap-4">
            <Image
              src={event.imageUrl}
              alt=""
              width={64}
              height={64}
              className="size-[52px] shrink-0 rounded-[14px] object-cover lg:size-16 lg:rounded-2xl"
            />
            <div className="flex min-w-0 flex-col gap-px lg:gap-0.5">
              <h1 className="text-[15px] font-semibold lg:text-[26px] lg:leading-tight lg:font-bold lg:tracking-tight">
                {event.title}
              </h1>
              <p className="text-[13px] text-muted-foreground lg:text-[15px]">
                <span className="lg:hidden">{formatEventDateShort(event.startDate)}</span>
                <span className="hidden lg:inline">{formatEventDateLong(event.startDate)}</span>
                {` · ${place}`}
              </p>
            </div>
          </div>
        </section>

        <TicketSelection event={event} venueMap={venueMap} />
      </main>
    </div>
  );
}
