import Image from "next/image";
import { MapPin } from "lucide-react";

import { categories } from "@/modules/event/data/categories.mock";
import type { Event } from "@/modules/event/schemas/event.schema";

function eventDateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("es-PE", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-PE", { month: "short" }).format(date).toUpperCase(),
  };
}

export function EventCard({ event }: { event: Event }) {
  const category = categories.find((c) => c.slug === event.categorySlug);
  const { day, month } = eventDateParts(event.startDate);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[22px] border border-border bg-white">
      <div className="relative h-[184px] bg-border">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 flex w-14 flex-col items-center rounded-[14px] bg-white pt-1.5 pb-[7px] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]">
          <span className="text-[11px] font-bold tracking-wide text-indigo-600 uppercase">
            {month}
          </span>
          <span className="text-[22px] font-bold text-foreground">{day}</span>
        </span>
        {event.status === "last_tickets" && (
          <span className="absolute top-3 right-3 flex h-7 items-center rounded-full bg-orange-100 px-3 text-xs font-semibold text-orange-800">
            Últimas entradas
          </span>
        )}
        {event.status === "sold_out" && (
          <span className="absolute top-3 right-3 flex h-7 items-center rounded-full bg-foreground px-3 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex grow flex-col gap-2 px-5 pt-[18px]">
        {category && (
          <span className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            {category.name}
          </span>
        )}
        <span className="line-clamp-2 min-h-[46px] text-[17px] font-semibold text-foreground">
          {event.title}
        </span>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {event.venueName} · {event.city}
        </span>
      </div>

      <div className="relative mt-[18px] h-0 border-t-[1.5px] border-dashed border-zinc-300">
        <span className="absolute -top-2.5 -left-2.5 size-5 rounded-full border border-border bg-muted" />
        <span className="absolute -top-2.5 -right-2.5 size-5 rounded-full border border-border bg-muted" />
      </div>

      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Desde</span>
          <span className="text-[19px] font-bold text-orange-700">S/ {event.priceFrom}</span>
        </div>
        {event.status === "sold_out" ? (
          <span className="flex h-11 items-center rounded-xl bg-muted px-4 text-sm font-semibold text-muted-foreground">
            Agotado
          </span>
        ) : (
          <span className="flex h-11 items-center rounded-xl border-[1.5px] border-foreground px-4 text-sm font-semibold text-foreground">
            Ver entradas
          </span>
        )}
      </div>
    </div>
  );
}
