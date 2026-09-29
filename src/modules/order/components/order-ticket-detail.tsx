"use client";

import {
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  formatEventDateLong,
  formatEventDateShort,
  formatEventDayMonth,
  formatEventTime,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import { QrPattern } from "@/modules/order/components/qr-pattern";
import { TicketPerforation } from "@/modules/order/components/ticket-perforation";
import type { Order } from "@/modules/order/schemas/order.schema";
import { getOrderTickets } from "@/modules/order/services/ticket.service";

const navButtonClassName = "size-11 rounded-xl border-[1.5px] border-zinc-300 bg-white";

const actionClassName =
  "h-12 gap-1.5 rounded-[14px] border-[1.5px] bg-white px-[18px] text-sm text-foreground lg:gap-2 [&_svg:not([class*='size-'])]:size-[18px]";

function TicketField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[11px] text-muted-foreground lg:text-xs">{label}</dt>
      <dd className={cn("text-[15px] font-semibold break-words lg:text-base", className)}>
        {children}
      </dd>
    </div>
  );
}

export function OrderTicketDetail({ order, isPast }: { order: Order; isPast: boolean }) {
  const [ticketIndex, setTicketIndex] = useState(0);
  const [showNotice, setShowNotice] = useState(false);
  const { event } = order;
  const tickets = getOrderTickets(order);
  const ticket = tickets[ticketIndex];
  const { day, month } = formatEventDayMonth(event.startDate);
  const time = formatEventTime(event.startDate);
  const venue = `${event.venueName}, ${event.city}`;
  const titleId = `order-detail-${order.id}-title`;
  const notify = () => setShowNotice(true);

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col overflow-hidden rounded-[26px] border border-zinc-200 bg-white lg:rounded-[28px]"
    >
      <div className="relative h-[150px] bg-zinc-200 lg:h-[200px]">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 860px, 100vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 flex w-[52px] flex-col items-center rounded-2xl bg-white pt-1.5 pb-[7px] lg:top-4 lg:left-4 lg:w-[60px] lg:pt-[7px] lg:pb-2">
          <span className="text-[10px] font-bold tracking-[0.08em] text-primary lg:text-[11px]">
            {month}
          </span>
          <span className="text-xl leading-[1.05] font-bold lg:text-2xl">{day}</span>
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-[18px] lg:gap-3.5 lg:px-8 lg:pt-[26px] lg:pb-6">
        <h2
          id={titleId}
          className="text-[21px] leading-[1.2] font-bold tracking-tight lg:text-[28px] lg:leading-[1.15]"
        >
          {event.title}
        </h2>
        <ul className="hidden flex-wrap gap-x-6 gap-y-2 text-[15px] text-muted-foreground lg:flex">
          <li className="flex items-center gap-2">
            <Calendar className="size-[18px]" aria-hidden="true" />
            {formatEventDateLong(event.startDate)}
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-[18px]" aria-hidden="true" />
            {time}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-[18px]" aria-hidden="true" />
            {venue}
          </li>
        </ul>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground lg:hidden">
          <li className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            {`${formatEventDateShort(event.startDate)} · ${time}`}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {venue}
          </li>
        </ul>
      </div>

      <TicketPerforation orientation="horizontal" />

      <div className="flex flex-col items-center gap-[18px] px-5 pt-[22px] pb-6 lg:flex-row lg:gap-9 lg:px-8 lg:pt-7 lg:pb-8">
        <div className="size-[220px] shrink-0 rounded-[18px] border border-zinc-200 bg-white p-3 lg:size-[200px]">
          <QrPattern seed={ticket.seed} className="size-full" />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-[18px] lg:flex-1">
          <div className="flex items-center justify-between lg:justify-start lg:gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Entrada anterior"
              disabled={ticketIndex === 0}
              onClick={() => setTicketIndex((i) => i - 1)}
              className={cn(navButtonClassName, "order-1 lg:order-2")}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Button>
            <p
              aria-live="polite"
              className="order-2 text-base font-semibold lg:order-1 lg:mr-auto lg:text-xl lg:font-bold"
            >
              Entrada {ticketIndex + 1} de {tickets.length}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Entrada siguiente"
              disabled={ticketIndex >= tickets.length - 1}
              onClick={() => setTicketIndex((i) => i + 1)}
              className={cn(navButtonClassName, "order-3")}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-3.5">
            <TicketField label="Zona">{ticket.zone}</TicketField>
            {ticket.seatLabel && <TicketField label="Asiento">{ticket.seatLabel}</TicketField>}
            <TicketField label="Titular">{order.buyer.fullName}</TicketField>
            <TicketField label="Código" className="tabular-nums">
              {ticket.code}
            </TicketField>
            <TicketField
              label="Estado"
              className={isPast ? "text-muted-foreground" : "text-green-700"}
            >
              {isPast ? "Evento finalizado" : "Válida"}
            </TicketField>
          </dl>

          <div className="flex flex-col">
            <div className={cn("grid gap-2.5 lg:flex", isPast ? "grid-cols-1" : "grid-cols-2")}>
              <Button
                type="button"
                variant="outline"
                aria-label="Descargar PDF"
                onClick={notify}
                className={cn(actionClassName, "border-zinc-900 font-semibold")}
              >
                <Download aria-hidden="true" />
                <span className="lg:hidden">PDF</span>
                <span className="hidden lg:inline">Descargar PDF</span>
              </Button>
              {!isPast && (
                <Button
                  type="button"
                  variant="outline"
                  aria-label="Agregar al calendario"
                  onClick={notify}
                  className={cn(actionClassName, "border-zinc-300 font-medium")}
                >
                  <CalendarPlus aria-hidden="true" />
                  <span className="lg:hidden">Calendario</span>
                  <span className="hidden lg:inline">Agregar al calendario</span>
                </Button>
              )}
            </div>
            <p
              aria-live="polite"
              className={cn("text-sm text-muted-foreground", showNotice && "mt-3")}
            >
              {showNotice ? "Esta opción estará disponible pronto." : null}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
