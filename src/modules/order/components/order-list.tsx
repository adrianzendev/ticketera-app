import Image from "next/image";

import { formatEventDateShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Order } from "@/modules/order/schemas/order.schema";
import { formatTicketCount } from "@/modules/order/store/cart.store";

export function OrderList({
  orders,
  selectedId,
  onSelect,
}: {
  orders: ReadonlyArray<Order>;
  selectedId: string;
  onSelect: (orderId: string) => void;
}) {
  return (
    <ul
      aria-label="Pedidos"
      className="-mx-4 flex gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] md:-mx-10 md:px-10 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {orders.map((order) => {
        const selected = order.id === selectedId;
        const zones = order.lines.map((line) => line.name).join(", ");

        return (
          <li key={order.id} className="shrink-0">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(order.id)}
              className={cn(
                "flex w-[270px] items-center gap-3 rounded-[18px] border-2 bg-white p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:w-full lg:gap-3.5 lg:rounded-[20px] lg:p-3.5",
                selected ? "border-primary" : "border-zinc-200 hover:border-zinc-300",
              )}
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-xl lg:size-[72px] lg:rounded-[14px]">
                <Image
                  src={order.event.imageUrl}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5 lg:gap-[3px]">
                <span className="truncate text-sm font-semibold text-foreground lg:text-base">
                  {order.event.title}
                </span>
                <span className="text-xs text-muted-foreground lg:text-[13px]">
                  {`${formatEventDateShort(order.event.startDate)} · ${order.event.city}`}
                </span>
                <span className="truncate text-xs font-medium text-primary lg:text-[13px]">
                  {`${formatTicketCount(order.count)} · ${zones}`}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
