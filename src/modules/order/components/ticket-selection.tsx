"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { EventDetail } from "@/modules/event/schemas/event.schema";
import { OrderMobileBar, OrderSummary } from "@/modules/order/components/order-summary";
import { TierQuantityList } from "@/modules/order/components/tier-quantity-list";
import {
  MAX_TICKETS_PER_ZONE,
  getCartCount,
  getCartLines,
  getCartTotal,
  useCartStore,
} from "@/modules/order/store/cart.store";
import { SeatPicker } from "@/modules/venue/components/seat-picker";
import { VenueZoneMap } from "@/modules/venue/components/venue-zone-map";
import type { VenueMap } from "@/modules/venue/schemas/venue.schema";
import { findSeat, formatSeatLabel } from "@/modules/venue/services/venue.service";

const CONTINUE_HREF = "/checkout";

const cardClassName =
  "flex flex-col rounded-[22px] border border-zinc-200 bg-white lg:rounded-3xl";
const headingClassName = "text-lg font-semibold lg:text-xl";

function getSeatLabels(venueMap: VenueMap | null, seatIds: string[]): string[] {
  if (!venueMap) return [];
  return seatIds.flatMap((seatId) => {
    const found = findSeat(venueMap, seatId);
    return found ? [formatSeatLabel(found.row.label, found.seat.number)] : [];
  });
}

export function TicketSelection({
  event,
  venueMap,
}: {
  event: EventDetail;
  venueMap: VenueMap | null;
}) {
  const standing = useCartStore((s) => s.standing);
  const seated = useCartStore((s) => s.seated);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const toggleSeat = useCartStore((s) => s.toggleSeat);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const seatPickerRef = useRef<HTMLDivElement>(null);

  const selectedZone = venueMap?.zones.find((zone) => zone.id === selectedZoneId) ?? null;
  const seatedZone = selectedZone?.kind === "seated" ? selectedZone : null;
  const seatedTier = seatedZone ? event.tiers.find((tier) => tier.id === seatedZone.tierId) : undefined;

  // setEvent tiene que correr sobre el carrito ya rehidratado para saber si es del mismo evento.
  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() =>
      useCartStore.getState().setEvent(event.slug),
    );
  }, [event.slug]);

  const seatedZoneId = seatedZone?.id;
  useEffect(() => {
    if (seatedZoneId) seatPickerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [seatedZoneId]);

  if (event.status === "sold_out") {
    return (
      <div className="px-4 py-4 lg:px-20 lg:pb-20">
        <section className={cn(cardClassName, "items-start gap-3 p-6 lg:p-8")}>
          <h2 className={headingClassName}>Entradas agotadas</h2>
          <p className="text-[15px] text-muted-foreground">Ya no quedan entradas para este evento.</p>
          <Link
            href={`/eventos/${event.slug}`}
            className="flex h-11 items-center rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-foreground hover:bg-muted lg:h-10"
          >
            Volver al evento
          </Link>
        </section>
      </div>
    );
  }

  const items = { standing, seated };
  const lines = getCartLines(items, event.tiers).map((line) => ({
    ...line,
    seatLabels: getSeatLabels(venueMap, line.seatIds),
  }));
  const total = getCartTotal(items, event.tiers);
  const count = getCartCount(items);
  const seatLabelsByTier = Object.fromEntries(lines.map((line) => [line.tierId, line.seatLabels]));

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:px-20 lg:pt-0 lg:pb-20">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          {venueMap && (
            <section className={cn(cardClassName, "gap-3.5 px-4 pt-[18px] pb-4 lg:gap-[18px] lg:px-7 lg:pt-6 lg:pb-7")}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className={headingClassName}>Elige tu zona</h2>
                <span className="text-xs text-muted-foreground lg:text-[13px]">Toca una zona del mapa</span>
              </div>
              <VenueZoneMap
                map={venueMap}
                tiers={event.tiers}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
                className="w-full"
              />
            </section>
          )}

          {seatedZone && seatedTier && (
            <div ref={seatPickerRef} className="scroll-mt-4">
              <SeatPicker
                zone={seatedZone}
                tier={seatedTier}
                selectedSeatIds={seated[seatedTier.id] ?? []}
                max={MAX_TICKETS_PER_ZONE}
                onToggleSeat={(seatId) => toggleSeat(seatedTier.id, seatId)}
                className={cn(cardClassName, "gap-3.5 px-4 pt-[18px] pb-4 lg:gap-[18px] lg:px-7 lg:pt-6 lg:pb-7")}
              />
            </div>
          )}

          <section className={cn(cardClassName, "px-4 py-1 lg:px-7 lg:py-2")}>
            <h2 className={cn(headingClassName, "pt-3.5 pb-1.5 lg:pt-4 lg:pb-2")}>Entradas</h2>
            <TierQuantityList
              tiers={event.tiers}
              venueMap={venueMap}
              items={items}
              seatLabelsByTier={seatLabelsByTier}
              selectedZoneId={selectedZoneId}
              max={MAX_TICKETS_PER_ZONE}
              onIncrement={increment}
              onDecrement={decrement}
              onSelectZone={setSelectedZoneId}
            />
          </section>
        </div>

        <OrderSummary lines={lines} total={total} count={count} continueHref={CONTINUE_HREF} />
      </div>

      <OrderMobileBar total={total} count={count} continueHref={CONTINUE_HREF} />
    </>
  );
}
