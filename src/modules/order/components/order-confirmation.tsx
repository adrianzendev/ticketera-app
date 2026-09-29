"use client";

import {
  ArrowRight,
  CalendarPlus,
  CircleCheck,
  Download,
  Mail,
  QrCode,
  Ticket,
  TicketX,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderTicketCard } from "@/modules/order/components/order-ticket-card";
import type { Order } from "@/modules/order/schemas/order.schema";
import { orderService } from "@/modules/order/services/order.service";
import { useOrderStore } from "@/modules/order/store/order.store";

const NEXT_STEPS: ReadonlyArray<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Mail, title: "Revisa tu correo", text: "Ahí llegan tus entradas y el comprobante de pago." },
  {
    icon: QrCode,
    title: "Muestra tu QR",
    text: "Cada entrada tiene su propio QR. Muéstralo desde tu celular en el ingreso.",
  },
  {
    icon: Ticket,
    title: "Todo en Mis entradas",
    text: "Entra con tu cuenta para ver y descargar tus entradas cuando quieras.",
  },
];

const secondaryActionClassName =
  "h-[50px] gap-1.5 rounded-[14px] border-[1.5px] border-zinc-300 bg-white text-sm font-medium text-foreground lg:h-[54px] lg:gap-2 lg:rounded-2xl lg:px-[22px] lg:text-[15px] [&_svg:not([class*='size-'])]:size-[17px] lg:[&_svg:not([class*='size-'])]:size-[18px]";

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve(useOrderStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <div aria-busy="true" className="min-h-64 w-full max-w-[880px]">
        <span className="sr-only">Cargando tu pedido…</span>
      </div>
    );
  }

  const order = orderService.getById(orderId);
  if (!order) return <OrderNotFound />;

  return (
    <div className="flex w-full max-w-[880px] flex-col gap-6 lg:gap-9">
      <SuccessHeader orderId={order.id} />
      <OrderTicketCard order={order} />
      <OrderActions />
      <NextSteps />
    </div>
  );
}

function OrderNotFound() {
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-3 rounded-3xl border border-zinc-200 bg-white p-6 text-center lg:p-10">
      <span className="flex size-14 items-center justify-center rounded-full bg-zinc-100 text-muted-foreground">
        <TicketX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight">No encontramos este pedido</h1>
      <p className="text-[15px] leading-normal text-muted-foreground">
        Puede que el enlace no sea correcto o que la compra se haya hecho en otra pestaña o sesión.
      </p>
      <Link
        href="/eventos"
        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Explorar eventos
      </Link>
    </div>
  );
}

function SuccessHeader({ orderId }: { orderId: Order["id"] }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center lg:gap-3.5">
      <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700 lg:size-[76px]">
        <CircleCheck className="size-[34px] lg:size-10" aria-hidden="true" />
      </span>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight lg:text-[40px] lg:leading-[1.1]">
        ¡Compra confirmada!
      </h1>
      <p className="max-w-[520px] text-[15px] leading-normal text-muted-foreground lg:text-[17px]">
        Enviamos tus entradas a tu correo. También las tienes siempre en Mis entradas.
      </p>
      <p className="flex h-[34px] items-center rounded-full border border-zinc-200 bg-white px-3.5 text-[13px] text-zinc-700 lg:h-9 lg:px-4 lg:text-sm">
        Pedido N.º <strong className="ml-1.5 font-semibold text-foreground">{orderId}</strong>
      </p>
    </div>
  );
}

function OrderActions() {
  const [showNotice, setShowNotice] = useState(false);
  const notify = () => setShowNotice(true);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:justify-center lg:gap-3">
        <Link
          href="/mis-entradas"
          className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary px-[26px] text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Ver mis entradas
          <ArrowRight className="size-[18px]" aria-hidden="true" />
        </Link>
        <div className="grid grid-cols-2 gap-2.5 lg:flex lg:gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label="Agregar al calendario"
            onClick={notify}
            className={secondaryActionClassName}
          >
            <CalendarPlus aria-hidden="true" />
            <span className="lg:hidden">Calendario</span>
            <span className="hidden lg:inline">Agregar al calendario</span>
          </Button>
          <Button type="button" variant="outline" onClick={notify} className={secondaryActionClassName}>
            <Download aria-hidden="true" />
            Descargar PDF
          </Button>
        </div>
      </div>
      <p
        aria-live="polite"
        className={cn("text-center text-sm text-muted-foreground", showNotice && "mt-3")}
      >
        {showNotice ? "Esta opción estará disponible pronto." : null}
      </p>
    </div>
  );
}

function NextSteps() {
  return (
    <section aria-labelledby="order-next-steps-title" className="flex flex-col gap-2.5 lg:mt-3">
      <h2 id="order-next-steps-title" className="text-lg font-semibold lg:sr-only">
        Qué sigue
      </h2>
      <ol className="flex flex-col gap-2.5 lg:grid lg:grid-cols-3 lg:gap-4">
        {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3.5 rounded-[18px] border border-zinc-200 bg-white px-4 py-3.5 lg:flex-col lg:items-start lg:gap-2.5 lg:rounded-[20px] lg:p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary lg:size-11 lg:rounded-[14px]"
            >
              <Icon className="size-[19px] lg:size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 lg:gap-2.5">
              <h3 className="text-[15px] font-semibold lg:text-base">{title}</h3>
              <span className="text-[13px] leading-normal text-muted-foreground lg:text-sm">
                {text}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
