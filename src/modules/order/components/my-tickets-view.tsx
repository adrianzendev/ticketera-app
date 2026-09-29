"use client";

import { Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useSession } from "@/modules/auth/hooks/use-session";
import { OrderList } from "@/modules/order/components/order-list";
import { OrderTicketDetail } from "@/modules/order/components/order-ticket-detail";
import { ticketService } from "@/modules/order/services/ticket.service";
import { useOrderStore } from "@/modules/order/store/order.store";

export type TicketsTab = "upcoming" | "past";

const LOGIN_HREF = `/ingresar?redirect=${encodeURIComponent("/mis-entradas")}`;

const EMPTY_STATE_TEXT: Record<TicketsTab, { title: string; text: string }> = {
  upcoming: {
    title: "Aún no tienes entradas para próximos eventos",
    text: "Cuando compres entradas, las verás aquí.",
  },
  past: {
    title: "Aún no tienes eventos pasados",
    text: "Cuando vayas a tu primer evento, lo verás aquí.",
  },
};

function SignedOutState() {
  return (
    <div className="px-4 py-6 lg:py-14">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl border border-zinc-200 bg-white p-6 text-center lg:p-10">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
          <Ticket className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
          Inicia sesión para ver tus entradas
        </h1>
        <p className="text-[15px] leading-normal text-muted-foreground">
          Tus entradas quedan guardadas en tu cuenta. Ingresa para verlas y mostrar tu QR en el
          evento.
        </p>
        <Link
          href={LOGIN_HREF}
          className="mt-2 flex min-h-11 items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Iniciar sesión
        </Link>
      </section>
    </div>
  );
}

function EmptyTickets({ tab }: { tab: TicketsTab }) {
  const { title, text } = EMPTY_STATE_TEXT[tab];

  return (
    <div className="flex flex-col items-center gap-2.5 rounded-3xl border-[1.5px] border-dashed border-zinc-300 bg-white px-5 py-14 text-center lg:gap-3 lg:rounded-[28px] lg:px-6 lg:py-20">
      <span className="flex size-[52px] items-center justify-center rounded-2xl bg-indigo-50 text-primary lg:size-14 lg:rounded-[18px]">
        <Ticket className="size-6 lg:size-[26px]" aria-hidden="true" />
      </span>
      <h2 className="text-[17px] font-semibold lg:text-xl">{title}</h2>
      <p className="max-w-[420px] text-sm leading-[1.55] text-muted-foreground lg:text-[15px]">
        {text}
      </p>
      <Link
        href="/eventos"
        className="mt-1.5 flex h-12 items-center rounded-[14px] bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-zinc-800 lg:mt-2 lg:px-[22px] lg:text-[15px]"
      >
        Explorar eventos
      </Link>
    </div>
  );
}

function TicketsFilter({
  tab,
  counts,
  onChange,
}: {
  tab: TicketsTab;
  counts: Record<TicketsTab, number>;
  onChange: (tab: TicketsTab) => void;
}) {
  const options: ReadonlyArray<{ value: TicketsTab; label: string }> = [
    { value: "upcoming", label: `Próximas (${counts.upcoming})` },
    { value: "past", label: `Pasadas (${counts.past})` },
  ];

  return (
    <div
      role="group"
      aria-label="Filtrar entradas"
      className="grid grid-cols-2 gap-1 rounded-[14px] border border-zinc-200 bg-white p-1 lg:flex"
    >
      {options.map(({ value, label }) => {
        const active = value === tab;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              "h-11 rounded-[10px] px-[18px] text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:h-10",
              active ? "bg-zinc-900 text-white" : "bg-transparent text-foreground hover:bg-zinc-100",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function UserTickets({ email }: { email: string }) {
  const sessionOrders = useOrderStore((s) => s.orders);
  const [tab, setTab] = useState<TicketsTab>("upcoming");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ordersByDate = ticketService.getUserOrders(email, sessionOrders);
  const orders = ordersByDate[tab];
  const selected = orders.find((order) => order.id === selectedId) ?? orders[0];

  function changeTab(next: TicketsTab) {
    setTab(next);
    setSelectedId(null);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-10">
      <div className="flex flex-col gap-4 pt-[22px] pb-4 lg:flex-row lg:items-end lg:justify-between lg:pt-10 lg:pb-7">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight lg:text-4xl lg:leading-[1.1]">
          Mis entradas
        </h1>
        <TicketsFilter
          tab={tab}
          counts={{ upcoming: ordersByDate.upcoming.length, past: ordersByDate.past.length }}
          onChange={changeTab}
        />
      </div>

      <div className="pb-8 lg:pb-20">
        {selected ? (
          <div className="lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-8">
            <OrderList orders={orders} selectedId={selected.id} onSelect={setSelectedId} />
            <div className="mt-4 min-w-0 lg:mt-0">
              <OrderTicketDetail key={selected.id} order={selected} isPast={tab === "past"} />
            </div>
          </div>
        ) : (
          <EmptyTickets tab={tab} />
        )}
      </div>
    </div>
  );
}

export function MyTicketsView() {
  const { status, user } = useSession();
  const [ordersHydrated, setOrdersHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve(useOrderStore.persist.rehydrate()).then(() => setOrdersHydrated(true));
  }, []);

  if (status === "loading" || !ordersHydrated) {
    return (
      <div aria-busy="true" className="min-h-96 w-full">
        <span className="sr-only">Cargando tus entradas…</span>
      </div>
    );
  }

  if (!user) return <SignedOutState />;

  return <UserTickets email={user.email} />;
}
