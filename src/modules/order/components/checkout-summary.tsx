"use client";

import { ChevronDown, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatEventDateShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { EventDetail } from "@/modules/event/schemas/event.schema";
import { OrderLineList, OrderTotal } from "@/modules/order/components/order-summary";
import type { OrderLine } from "@/modules/order/schemas/order.schema";
import { formatTicketCount } from "@/modules/order/store/cart.store";

const SUMMARY_DETAILS_ID = "checkout-summary-details";

type PayState = { total: number; acceptedTerms: boolean; submitting: boolean };

export function PayButton({
  total,
  acceptedTerms,
  submitting,
  hintId,
  className,
}: PayState & { hintId: string; className?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="submit"
        disabled={!acceptedTerms || submitting}
        aria-busy={submitting || undefined}
        aria-describedby={acceptedTerms ? undefined : hintId}
        className={cn(
          "h-[54px] w-full gap-2 rounded-2xl text-base font-semibold disabled:opacity-100 lg:h-14",
          acceptedTerms
            ? "bg-accent text-accent-foreground hover:bg-accent/90"
            : "bg-zinc-200 text-muted-foreground",
          className,
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
            Procesando pago…
          </>
        ) : (
          <>
            <Lock className="size-[18px]" aria-hidden="true" />
            Pagar S/ {total}
          </>
        )}
      </Button>
      {!acceptedTerms && (
        <p id={hintId} className="text-center text-xs text-muted-foreground lg:text-[13px]">
          Acepta los términos para continuar.
        </p>
      )}
    </div>
  );
}

function PaymentError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-center text-sm text-destructive">
      {message}
    </p>
  );
}

export function CheckoutSummary({
  event,
  lines,
  total,
  acceptedTerms,
  submitting,
  changeHref,
  paymentError,
}: PayState & {
  event: EventDetail;
  lines: OrderLine[];
  changeHref: string;
  paymentError?: string | null;
}) {
  return (
    <aside
      aria-label="Resumen de la compra"
      className="hidden flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_20px_40px_-28px_rgba(24,24,27,0.35)] lg:sticky lg:top-6 lg:flex"
    >
      <div className="flex items-center gap-3.5">
        <Image
          src={event.imageUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-2xl object-cover"
        />
        <p className="flex min-w-0 flex-col gap-0.5">
          <span className="text-base font-semibold">{event.title}</span>
          <span className="text-[13px] text-muted-foreground">
            {`${formatEventDateShort(event.startDate)} · ${event.venueName}, ${event.city}`}
          </span>
        </p>
      </div>

      <OrderLineList lines={lines} className="border-t border-zinc-100 pt-[18px]" />

      <Link
        href={changeHref}
        className="w-fit text-sm font-semibold text-primary hover:underline"
      >
        Cambiar entradas
      </Link>

      <OrderTotal total={total} />

      <PaymentError message={paymentError} />

      <PayButton
        total={total}
        acceptedTerms={acceptedTerms}
        submitting={submitting}
        hintId="checkout-pay-hint-desktop"
      />
    </aside>
  );
}

export function CheckoutMobileSummary({
  event,
  lines,
  total,
  count,
  changeHref,
}: {
  event: EventDetail;
  lines: OrderLine[];
  total: number;
  count: number;
  changeHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={SUMMARY_DETAILS_ID}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Image
          src={event.imageUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-xl object-cover"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="text-[15px] font-semibold">{event.title}</span>
          <span className="text-[13px] text-muted-foreground">
            {`${formatTicketCount(count)} · S/ ${total}`}
          </span>
        </span>
        <ChevronDown
          className={cn("size-[18px] shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div id={SUMMARY_DETAILS_ID} hidden={!open} className="px-4 pb-4 text-sm">
        <div className="flex flex-col gap-2.5 border-t border-zinc-100 pt-3">
          <p>{`${formatEventDateShort(event.startDate)} · ${event.venueName}`}</p>
          <OrderLineList lines={lines} className="gap-2.5" />
          <Link
            href={changeHref}
            className="flex min-h-11 w-fit items-center font-semibold text-primary hover:underline"
          >
            Cambiar entradas
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CheckoutPayBar({
  total,
  acceptedTerms,
  submitting,
  paymentError,
}: PayState & { paymentError?: string | null }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 pt-3 pb-5 shadow-[0_-12px_24px_-18px_rgba(24,24,27,0.35)] lg:hidden">
      <PaymentError message={paymentError} />
      <PayButton
        total={total}
        acceptedTerms={acceptedTerms}
        submitting={submitting}
        hintId="checkout-pay-hint-mobile"
      />
    </div>
  );
}
