import { ArrowLeft, Check, Lock, Ticket } from "lucide-react";
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
  backLabel = "Volver al evento",
}: {
  currentStep: 1 | 2 | 3;
  backHref?: string;
  backLabel?: string;
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
            const isCompleted = number < currentStep;
            return (
              <Fragment key={step.label}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className={cn(
                      "h-[1.5px] w-10",
                      number <= currentStep ? "bg-primary" : "bg-zinc-300",
                    )}
                  />
                )}
                <li
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2.5",
                    isCurrent && "font-semibold text-foreground",
                    isCompleted && "text-foreground",
                    !isCurrent && !isCompleted && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-[13px]",
                      isCurrent && "bg-zinc-900 text-white",
                      isCompleted && "bg-primary text-primary-foreground",
                      !isCurrent && !isCompleted && "border-[1.5px] border-zinc-300",
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-[15px]" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      number
                    )}
                  </span>
                  {step.label}
                  {isCompleted && <span className="sr-only"> (completado)</span>}
                </li>
              </Fragment>
            );
          })}
        </ol>

        {currentStep < 3 ? (
          <span className="flex w-60 items-center justify-end gap-2 text-sm text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            Compra segura
          </span>
        ) : (
          <span aria-hidden="true" className="w-60" />
        )}
      </div>

      <div className="lg:hidden">
        {backHref ? (
          <div className="flex h-[60px] items-center gap-1 pr-3 pl-1.5">
            <Link
              href={backHref}
              aria-label={backLabel}
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
        ) : (
          <div className="flex h-[60px] items-center justify-between px-4">
            <Link href="/" className="flex min-h-11 items-center gap-2 text-foreground">
              <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                <Ticket className="size-[17px]" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight">Ticketera</span>
            </Link>
            <span className="text-xs text-muted-foreground">Paso {currentStep} de 3</span>
          </div>
        )}
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
