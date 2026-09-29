import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTicketCount, type CartLine } from "@/modules/order/store/cart.store";

type OrderSummaryProps = {
  lines: Array<CartLine & { seatLabels: string[] }>;
  total: number;
  count: number;
  continueHref: string;
  className?: string;
};

const ctaClassName =
  "flex items-center justify-center gap-2 font-semibold transition-colors";

function ContinueCta({
  count,
  href,
  className,
}: {
  count: number;
  href: string;
  className?: string;
}) {
  if (count === 0) {
    return (
      <Button
        disabled
        className={cn(ctaClassName, "bg-zinc-200 text-muted-foreground disabled:opacity-100", className)}
      >
        Continuar
      </Button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(ctaClassName, "bg-accent text-accent-foreground hover:bg-accent/90", className)}
    >
      Continuar
      <ArrowRight className="size-[18px]" aria-hidden="true" />
    </Link>
  );
}

export function OrderSummary({ lines, total, count, continueHref, className }: OrderSummaryProps) {
  return (
    <aside
      aria-label="Resumen de la compra"
      className={cn(
        "hidden flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-7 shadow-[0_20px_40px_-28px_rgba(24,24,27,0.35)] lg:sticky lg:top-6 lg:flex",
        className,
      )}
    >
      <h2 className="text-xl font-semibold">Tu compra</h2>

      {lines.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {lines.map((line) => (
            <li key={line.tierId} className="flex flex-col gap-1 text-[15px]">
              <span className="flex justify-between gap-3">
                <span>
                  {line.qty} × {line.name}
                </span>
                <span className="font-semibold tabular-nums">S/ {line.amount}</span>
              </span>
              {line.seatLabels.length > 0 && (
                <span className="text-[13px] text-muted-foreground">
                  {line.seatLabels.join("; ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border-[1.5px] border-dashed border-zinc-300 p-5 text-center text-sm leading-normal text-muted-foreground">
          Todavía no elegiste entradas. Toca una zona o usa los botones +.
        </p>
      )}

      <p className="flex items-baseline justify-between border-t-[1.5px] border-dashed border-zinc-300 pt-[18px]">
        <span className="text-[15px] font-medium">
          Total{" "}
          <span className="font-normal text-muted-foreground">({formatTicketCount(count)})</span>
        </span>
        <span className="text-[28px] font-bold tracking-tight tabular-nums">S/ {total}</span>
      </p>

      <ContinueCta count={count} href={continueHref} className="h-14 rounded-2xl text-base" />
    </aside>
  );
}

export function OrderMobileBar({ total, count, continueHref, className }: Omit<OrderSummaryProps, "lines">) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 pt-3 pb-5 shadow-[0_-12px_24px_-18px_rgba(24,24,27,0.35)] lg:hidden",
        className,
      )}
    >
      <p aria-live="polite" className="flex flex-col">
        <span className="text-xs text-muted-foreground">Total · {formatTicketCount(count)}</span>
        <span className="text-[22px] font-bold tracking-tight tabular-nums">S/ {total}</span>
      </p>
      <ContinueCta count={count} href={continueHref} className="h-[52px] rounded-[15px] px-6 text-[15px]" />
    </div>
  );
}
