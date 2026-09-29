"use client";

import { Calendar, Clock, Heart, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatEventLongDate, formatEventTime } from "@/modules/event/components/event-detail-info";
import { EventBuyCta } from "@/modules/event/components/event-tier-summary";
import type { Event } from "@/modules/event/schemas/event.schema";

const iconButtonClassName =
  "flex size-[54px] shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-white/40 text-white transition-colors hover:bg-white/10";

export function EventDetailHero({ event, categoryName }: { event: Event; categoryName: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-indigo-950 lg:h-[460px] lg:grid-cols-[540px_minmax(0,1fr)] lg:rounded-[32px]">
      <div className="relative h-[220px] lg:order-last lg:h-full">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-3.5 p-[22px] pb-6 text-white lg:gap-0 lg:px-12 lg:py-11">
        <Badge className="h-7 rounded-full border border-white/30 bg-transparent px-3 text-xs text-white lg:h-8 lg:px-3.5 lg:text-[13px]">
          {categoryName}
        </Badge>

        <h1 className="text-[28px] leading-[1.12] font-bold tracking-tight text-balance lg:mt-6 lg:text-[46px] lg:leading-[1.08]">
          {event.title}
        </h1>

        <ul className="flex flex-col gap-2 text-sm text-indigo-100 lg:mt-5 lg:gap-2.5 lg:text-base">
          <li className="flex items-center gap-2.5">
            <Calendar className="size-[18px] shrink-0" aria-hidden="true" />
            {formatEventLongDate(event.startDate)}
          </li>
          <li className="flex items-center gap-2.5">
            <Clock className="size-[18px] shrink-0" aria-hidden="true" />
            {formatEventTime(event.startDate)}
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin className="size-[18px] shrink-0" aria-hidden="true" />
            {event.venueName}, {event.city}
          </li>
        </ul>

        <div className="hidden grow lg:block" />

        <div className="mt-2 flex items-center gap-2.5 lg:mt-0">
          <EventBuyCta event={event} className="h-[54px] grow text-center text-sm leading-tight lg:text-base">
            Comprar entradas · desde S/ {event.priceFrom}
          </EventBuyCta>
          <button
            type="button"
            aria-label="Guardar evento"
            aria-pressed={saved}
            onClick={() => setSaved((v) => !v)}
            className={cn(iconButtonClassName, saved && "bg-white/15")}
          >
            <Heart className={cn("size-5", saved && "fill-current")} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Compartir evento" className={iconButtonClassName}>
            <Share2 className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
