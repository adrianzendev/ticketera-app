import Image from "next/image";

import { formatEventDateLong } from "@/lib/date";
import { QrPattern } from "@/modules/order/components/qr-pattern";
import type { Order } from "@/modules/order/schemas/order.schema";

export function OrderTicketCard({ order }: { order: Order }) {
  const { event } = order;
  const titleId = `order-ticket-${order.id}-title`;
  const zones = order.lines.map((line) => line.name).join(", ");
  const seatLabels = order.lines.flatMap((line) => line.seatLabels);

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white lg:min-h-[232px] lg:flex-row"
    >
      <div className="relative h-[130px] w-full shrink-0 lg:h-auto lg:w-[200px]">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 200px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5 py-[18px] lg:gap-2 lg:px-7 lg:py-[26px]">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-primary uppercase lg:text-xs">
          {event.categoryName}
        </span>
        <h2
          id={titleId}
          className="text-xl leading-tight font-bold tracking-tight lg:text-2xl"
        >
          {event.title}
        </h2>
        <p className="text-sm text-muted-foreground lg:text-[15px]">
          {`${formatEventDateLong(event.startDate)} · ${event.venueName}, ${event.city}`}
        </p>

        <dl className="mt-2 grid grid-cols-3 gap-2 lg:mt-auto lg:flex lg:gap-7 lg:pt-2">
          <div className="flex min-w-0 flex-col">
            <dt className="text-[11px] text-muted-foreground lg:text-xs">Zona</dt>
            <dd className="text-sm font-semibold break-words lg:text-base">{zones}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-[11px] text-muted-foreground lg:text-xs">Entradas</dt>
            <dd className="text-sm font-semibold tabular-nums lg:text-base">{order.count}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-[11px] text-muted-foreground lg:text-xs">
              Total<span className="hidden lg:inline"> pagado</span>
            </dt>
            <dd className="text-sm font-semibold tabular-nums lg:text-base">S/ {order.total}</dd>
          </div>
        </dl>

        {seatLabels.length > 0 && (
          <p className="text-[13px] text-muted-foreground">Asientos: {seatLabels.join("; ")}</p>
        )}
      </div>

      <div
        aria-hidden="true"
        className="relative shrink-0 border-t-[1.5px] border-dashed border-zinc-300 lg:border-t-0 lg:border-l-[1.5px]"
      >
        <span className="absolute -top-3 -left-3 size-6 rounded-full border border-zinc-200 bg-zinc-100" />
        <span className="absolute -top-3 -right-3 size-6 rounded-full border border-zinc-200 bg-zinc-100 lg:top-auto lg:right-auto lg:-bottom-3 lg:-left-3" />
      </div>

      <div className="flex flex-col items-center justify-center gap-2.5 p-[22px] lg:w-[220px] lg:shrink-0 lg:p-0">
        <QrPattern seed={Number(order.id.slice(3))} className="size-[168px] lg:size-[126px]" />
        <span className="text-[13px] text-muted-foreground">Entrada 1 de {order.count}</span>
      </div>
    </article>
  );
}
