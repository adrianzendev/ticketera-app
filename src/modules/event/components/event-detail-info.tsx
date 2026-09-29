import { Clock, MapPin, Music, QrCode, User, type LucideIcon } from "lucide-react";

import type { EventDetail } from "@/modules/event/schemas/event.schema";

const EVENT_TIME_ZONE = "America/Lima";

const timeFormatter = new Intl.DateTimeFormat("es-PE", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: EVENT_TIME_ZONE,
});

const longDateFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: EVENT_TIME_ZONE,
});

export function formatEventTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

// es-PE produce "sábado, 14 de noviembre"; el diseño va sin coma.
export function formatEventLongDate(iso: string) {
  return longDateFormatter.format(new Date(iso)).replace(",", "");
}

function getMapsUrl(event: Pick<EventDetail, "venueName" | "venueAddress" | "city">) {
  const query = `${event.venueName}, ${event.venueAddress}, ${event.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const sectionClassName = "flex flex-col gap-3 lg:col-start-1 lg:order-none lg:gap-4";
const headingClassName = "text-xl font-bold tracking-tight text-foreground lg:text-2xl";

function InfoItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border p-3.5 sm:flex-row sm:items-center sm:gap-3.5 sm:rounded-[18px] sm:px-5 sm:py-[18px]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:size-11 sm:rounded-[14px]">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-0.5">
        <dt className="text-xs text-muted-foreground sm:text-[13px]">{label}</dt>
        <dd className="text-[15px] font-semibold text-foreground sm:text-base">{value}</dd>
      </div>
    </div>
  );
}

// Las clases order-* permiten intercalar la tarjeta de entradas (order-3) entre
// "Información importante" y "Lugar" en mobile, sin duplicar marcado.
export function EventDetailInfo({ event }: { event: EventDetail }) {
  return (
    <>
      <section aria-labelledby="acerca-del-evento" className={`order-1 ${sectionClassName}`}>
        <h2 id="acerca-del-evento" className={headingClassName}>
          Acerca del evento
        </h2>
        <p className="text-[15px] leading-relaxed text-muted-foreground lg:text-base">
          {event.description}
        </p>
      </section>

      <section aria-labelledby="informacion-importante" className={`order-2 ${sectionClassName}`}>
        <h2 id="informacion-importante" className={headingClassName}>
          Información importante
        </h2>
        <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
          <InfoItem icon={Clock} label="Apertura de puertas" value={formatEventTime(event.doorsOpenAt)} />
          <InfoItem icon={Music} label="Inicio del show" value={formatEventTime(event.startDate)} />
          <InfoItem
            icon={User}
            label="Edad mínima"
            value={event.minAge === null ? "Todo público" : `+${event.minAge}`}
          />
          <InfoItem icon={QrCode} label="Ingreso" value="Entrada digital con QR" />
        </dl>
      </section>

      <section aria-labelledby="lugar" className={`order-4 ${sectionClassName}`}>
        <h2 id="lugar" className={headingClassName}>
          Lugar
        </h2>
        <div className="overflow-hidden rounded-[20px] border border-border lg:rounded-[22px]">
          <div className="flex h-[170px] flex-col items-center justify-center gap-2 bg-indigo-50 text-indigo-700 lg:h-60">
            <MapPin className="size-8" aria-hidden="true" />
            <span className="text-[13px] font-semibold lg:text-sm">{event.venueName}</span>
          </div>
          <div className="flex items-center justify-between gap-3 px-[18px] py-4 lg:px-6 lg:py-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-foreground lg:text-[17px]">
                {event.venueName}
              </span>
              <span className="text-[13px] text-muted-foreground lg:text-sm">
                {event.venueAddress}, {event.city}
              </span>
            </div>
            <a
              href={getMapsUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 shrink-0 items-center rounded-xl border-[1.5px] border-foreground px-4 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-muted"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
