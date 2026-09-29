import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Event, EventDetail } from "@/modules/event/schemas/event.schema";

const ctaClassName =
  "flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 font-semibold text-accent-foreground transition-colors hover:bg-accent/90";

export function EventBuyCta({
  event,
  className,
  children,
}: {
  event: Pick<Event, "slug" | "status">;
  className?: string;
  children: ReactNode;
}) {
  if (event.status === "sold_out") {
    return (
      <Button disabled className={cn(ctaClassName, "bg-muted text-muted-foreground", className)}>
        Agotado
      </Button>
    );
  }

  return (
    <Link href={`/eventos/${event.slug}/entradas`} className={cn(ctaClassName, className)}>
      {children}
    </Link>
  );
}

export function EventTierSummary({ event, className }: { event: EventDetail; className?: string }) {
  return (
    <aside
      aria-label="Entradas"
      className={cn(
        "flex flex-col gap-5 rounded-3xl border border-border bg-white p-6 shadow-[0_20px_40px_-28px_rgba(24,24,27,0.35)] lg:sticky lg:top-6 lg:p-7",
        className,
      )}
    >
      <p className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Entradas desde</span>
        {" "}
        <span className="text-[30px] font-bold tracking-tight text-orange-700">
          S/ {event.priceFrom}
        </span>
      </p>

      <ul className="flex flex-col border-t border-border">
        {event.tiers.map((tier) => {
          const soldOut = tier.status === "sold_out";
          return (
            <li
              key={tier.id}
              className="flex min-h-14 items-center justify-between gap-3 border-b border-border"
            >
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-[4px]"
                  style={{ backgroundColor: tier.color }}
                />
                <span
                  className={cn(
                    "text-[15px] font-medium",
                    soldOut ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {tier.name}
                </span>
                {tier.status === "last_tickets" && (
                  <span className="flex h-6 items-center rounded-full bg-orange-100 px-2 text-[11px] font-semibold text-orange-800">
                    Últimas
                  </span>
                )}
              </span>
              {soldOut ? (
                <span className="text-sm font-semibold text-muted-foreground">Agotado</span>
              ) : (
                <span className="text-[15px] font-semibold text-foreground">S/ {tier.price}</span>
              )}
            </li>
          );
        })}
      </ul>

      <EventBuyCta event={event} className="h-14 text-base">
        Elegir entradas
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </EventBuyCta>

      <p className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
        <Lock className="size-4" aria-hidden="true" />
        Pago seguro · Entrada digital con QR
      </p>
    </aside>
  );
}

export function EventMobileBuyBar({ event }: { event: Event }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-white px-4 pt-3 pb-5 shadow-[0_-12px_24px_-18px_rgba(24,24,27,0.35)] lg:hidden">
      <p className="flex flex-col">
        <span className="text-xs text-muted-foreground">Desde</span>
        {" "}
        <span className="text-[22px] font-bold tracking-tight text-orange-700">
          S/ {event.priceFrom}
        </span>
      </p>
      <EventBuyCta event={event} className="h-[52px] text-[15px]">
        Comprar entradas
        <ArrowRight className="size-[18px]" aria-hidden="true" />
      </EventBuyCta>
    </div>
  );
}
