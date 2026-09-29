import { Armchair, Minus, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TicketTier } from "@/modules/event/schemas/event.schema";
import { getTierCount, type CartItems } from "@/modules/order/store/cart.store";
import type { VenueMap } from "@/modules/venue/schemas/venue.schema";
import { getZoneByTierId } from "@/modules/venue/services/venue.service";

type TierQuantityListProps = {
  tiers: TicketTier[];
  venueMap: VenueMap | null;
  items: CartItems;
  seatLabelsByTier: Record<string, string[]>;
  selectedZoneId: string | null;
  max: number;
  onIncrement: (tierId: string) => void;
  onDecrement: (tierId: string) => void;
  onSelectZone: (zoneId: string) => void;
};

const counterButtonClassName = "size-11 rounded-[11px] lg:size-10 [&_svg:not([class*='size-'])]:size-[18px]";

export function TierQuantityList({
  tiers,
  venueMap,
  items,
  seatLabelsByTier,
  selectedZoneId,
  max,
  onIncrement,
  onDecrement,
  onSelectZone,
}: TierQuantityListProps) {
  return (
    <>
      <ul className="flex flex-col">
        {tiers.map((tier) => {
          const zone = venueMap ? getZoneByTierId(venueMap, tier.id) : null;
          const qty = getTierCount(items, tier.id);
          const seatLabels = seatLabelsByTier[tier.id] ?? [];

          return (
            <li
              key={tier.id}
              className={cn(
                "-mx-2 flex min-h-[72px] items-center gap-3 rounded-xl border-t border-zinc-100 px-2 py-3 lg:-mx-3 lg:min-h-[76px] lg:gap-4 lg:rounded-[14px] lg:px-3",
                zone !== null && zone.id === selectedZoneId && "bg-indigo-50",
              )}
            >
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-[4px] lg:size-3.5"
                style={{ backgroundColor: tier.color }}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold lg:text-base">
                  {tier.name}
                  {tier.status === "last_tickets" && (
                    <Badge className="h-6 rounded-full bg-orange-100 px-2 text-[11px] font-semibold text-orange-800">
                      Últimas entradas
                    </Badge>
                  )}
                </span>
                <span className="text-[13px] text-muted-foreground lg:text-sm">S/ {tier.price} c/u</span>
                {zone?.kind === "seated" && tier.status !== "sold_out" && (
                  <span className="text-[13px] text-foreground">
                    {seatLabels.length > 0 ? seatLabels.join("; ") : "Sin asientos elegidos"}
                  </span>
                )}
              </span>

              {tier.status === "sold_out" ? (
                <span className="flex h-11 shrink-0 items-center rounded-xl bg-zinc-100 px-3.5 text-[13px] font-semibold text-muted-foreground lg:px-4 lg:text-sm">
                  Agotado
                </span>
              ) : zone?.kind === "seated" ? (
                <Button
                  variant="outline"
                  onClick={() => onSelectZone(zone.id)}
                  className="h-11 shrink-0 rounded-xl px-3 lg:h-10"
                >
                  <Armchair aria-hidden="true" />
                  Elegir asientos
                </Button>
              ) : (
                <span className="flex shrink-0 items-center gap-0.5 rounded-[13px] border border-zinc-200 p-0.5 lg:gap-1 lg:rounded-[14px] lg:p-[3px]">
                  <Button
                    variant="ghost"
                    aria-label={`Quitar una entrada de ${tier.name}`}
                    disabled={qty === 0}
                    onClick={() => onDecrement(tier.id)}
                    className={cn(counterButtonClassName, "bg-zinc-100 text-foreground hover:bg-zinc-200")}
                  >
                    <Minus aria-hidden="true" />
                  </Button>
                  <span
                    aria-live="polite"
                    className="w-[26px] text-center text-[15px] font-semibold tabular-nums lg:w-8 lg:text-base"
                  >
                    {qty}
                  </span>
                  <Button
                    aria-label={`Agregar una entrada de ${tier.name}`}
                    disabled={qty >= max}
                    onClick={() => onIncrement(tier.id)}
                    className={cn(counterButtonClassName, "bg-zinc-900 text-white hover:bg-zinc-800")}
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="border-t border-zinc-100 pt-3 pb-3.5 text-xs text-muted-foreground lg:pt-3.5 lg:pb-[18px] lg:text-[13px]">
        Máximo {max} entradas por zona.
      </p>
    </>
  );
}
