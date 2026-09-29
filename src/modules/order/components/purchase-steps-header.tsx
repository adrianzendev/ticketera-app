import { ArrowLeft, Lock, Ticket } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";

export const PURCHASE_STEPS: ReadonlyArray<{ label: string; mobileTitle: string }> = [
  { label: "Entradas", mobileTitle: "Elige tus entradas" },
  { label: "Datos y pago", mobileTitle: "Datos y pago" },
  { label: "Confirmación", mobileTitle: "Confirmación" },
];

export function PurchaseStepsHeader({
  currentStep,
  backHref,
}: {
  currentStep: 1 | 2 | 3;
  backHref: string;
}) {
  const current = PURCHASE_STEPS[currentStep - 1];

  return (
    <header className="shrink-0 border-b border-zinc-100 bg-white">
      <div className="hidden h-[76px] items-center justify-between px-20 lg:flex">
        <Link href="/" className="flex w-60 items-center gap-2.5 text-foreground">
          <span className="flex size-[38px] items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
            <Ticket className="size-5" aria-hidden="true" />
          </span>
          <span className="text-[21px] font-bold tracking-tight">Ticketera</span>
        </Link>

        <ol aria-label="Pasos de la compra" className="flex items-center gap-3 text-sm">
          {PURCHASE_STEPS.map((step, index) => {
            const number = index + 1;
            const isCurrent = number === currentStep;
            return (
              <Fragment key={step.label}>
                {index > 0 && <li aria-hidden="true" className="h-[1.5px] w-10 bg-zinc-300" />}
                <li
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2.5",
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[13px]",
                      isCurrent ? "bg-zinc-900 text-white" : "border-[1.5px] border-zinc-300",
                    )}
                  >
                    {number}
                  </span>
                  {step.label}
                </li>
              </Fragment>
            );
          })}
        </ol>

        <span className="flex w-60 items-center justify-end gap-2 text-sm text-muted-foreground">
          <Lock className="size-4" aria-hidden="true" />
          Compra segura
        </span>
      </div>

      <div className="lg:hidden">
        <div className="flex h-[60px] items-center gap-1 pr-3 pl-1.5">
          <Link
            href={backHref}
            aria-label="Volver al evento"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <p className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs text-muted-foreground">Paso {currentStep} de 3</span>
            <span className="truncate text-base font-semibold">{current.mobileTitle}</span>
          </p>
          <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
        <div aria-hidden="true" className="h-[3px] bg-zinc-100">
          <div
            className="h-full bg-primary"
            style={{ width: `${(currentStep / PURCHASE_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}
