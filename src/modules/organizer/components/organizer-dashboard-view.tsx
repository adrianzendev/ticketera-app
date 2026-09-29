"use client";

import { CircleCheck, Plus, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { DashboardKpis } from "@/modules/organizer/components/dashboard-kpis";
import { OrganizerEventCards } from "@/modules/organizer/components/organizer-event-cards";
import { OrganizerEventsTable } from "@/modules/organizer/components/organizer-events-table";
import {
  CREATE_EVENT_HREF,
  ORGANIZER_HOME_HREF,
  OrganizerShell,
} from "@/modules/organizer/components/organizer-shell";
import type { OrganizerEvent } from "@/modules/organizer/schemas/organizer-event.schema";
import {
  EVENT_STATUS_FILTERS,
  filterEventsByStatus,
  getDashboardKpis,
  mergeOrganizerEvents,
  type EventStatusFilter,
} from "@/modules/organizer/services/organizer.service";
import { useOrganizerEventStore } from "@/modules/organizer/store/organizer-event.store";

const focusRingClassName = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const EMPTY_LIST_TEXT: Record<EventStatusFilter, string> = {
  all: "Aún no creaste eventos.",
  published: "No tienes eventos publicados.",
  draft: "No tienes borradores.",
};

function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="flex flex-col gap-1 lg:gap-1.5">
        <h1 className="text-[28px] leading-[1.15] font-bold tracking-tight lg:text-[32px]">
          Resumen
        </h1>
        <p className="text-sm text-zinc-600 lg:text-[15px]">Así van las ventas de tus eventos.</p>
      </div>
      <Link
        href={CREATE_EVENT_HREF}
        className={cn(
          "flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-primary px-[22px] text-[15px] font-semibold text-primary-foreground hover:bg-primary/90",
          focusRingClassName,
        )}
      >
        <Plus className="size-[18px]" aria-hidden="true" />
        Crear evento
      </Link>
    </div>
  );
}

function CreatedNotice({ event, onClose }: { event: OrganizerEvent; onClose: () => void }) {
  const message =
    event.status === "published"
      ? `Publicaste «${event.title}». En esta demo no aparece en el catálogo público.`
      : `Guardaste «${event.title}» como borrador.`;

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900"
    >
      <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm leading-normal font-medium break-words">
        {message}
      </p>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={onClose}
        className={cn(
          "-my-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-green-100",
          focusRingClassName,
        )}
      >
        <X className="size-[18px]" aria-hidden="true" />
      </button>
    </div>
  );
}

function StatusFilter({
  filter,
  onChange,
}: {
  filter: EventStatusFilter;
  onChange: (filter: EventStatusFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filtrar eventos"
      className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-200 p-1 lg:flex lg:bg-zinc-100"
    >
      {EVENT_STATUS_FILTERS.map(({ key, label }) => {
        const active = key === filter;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(key)}
            className={cn(
              "h-10 rounded-[9px] text-[13px] lg:h-9 lg:px-3.5",
              focusRingClassName,
              active
                ? "bg-white font-semibold shadow-[0_2px_8px_-4px_rgba(24,24,27,0.3)]"
                : "bg-transparent font-medium hover:bg-white/60",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyEvents({ filter }: { filter: EventStatusFilter }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[20px] border-[1.5px] border-dashed border-zinc-300 bg-white px-5 py-12 text-center lg:m-6">
      <p className="text-[15px] font-medium">{EMPTY_LIST_TEXT[filter]}</p>
      <Link
        href={CREATE_EVENT_HREF}
        className={cn(
          "flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90",
          focusRingClassName,
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
        Crear evento
      </Link>
    </div>
  );
}

function DashboardContent({ createdId }: { createdId: string | null }) {
  const storeEvents = useOrganizerEventStore((s) => s.events);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<EventStatusFilter>("all");
  const [showActionNotice, setShowActionNotice] = useState(false);
  const [createdNoticeClosed, setCreatedNoticeClosed] = useState(false);

  useEffect(() => {
    void Promise.resolve(useOrganizerEventStore.persist.rehydrate()).then(() =>
      setHydrated(true),
    );
  }, []);

  const handleAction = useCallback(() => setShowActionNotice(true), []);

  if (!hydrated) {
    return (
      <div aria-busy="true" className="min-h-96 w-full">
        <span className="sr-only">Cargando tus eventos…</span>
      </div>
    );
  }

  const events = mergeOrganizerEvents(storeEvents);
  const kpis = getDashboardKpis(events);
  const visibleEvents = filterEventsByStatus(events, filter);
  const createdEvent = createdId ? events.find((event) => event.id === createdId) : undefined;
  const highlightedId = createdEvent?.id ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 pt-[22px] pb-9 lg:gap-8 lg:px-12 lg:py-10">
      <DashboardHeader />
      {createdEvent && !createdNoticeClosed ? (
        <CreatedNotice event={createdEvent} onClose={() => setCreatedNoticeClosed(true)} />
      ) : null}
      <DashboardKpis kpis={kpis} />
      <section
        id="mis-eventos"
        aria-labelledby="mis-eventos-title"
        className="flex scroll-mt-6 flex-col gap-3 lg:gap-0 lg:overflow-hidden lg:rounded-[22px] lg:border lg:border-zinc-200 lg:bg-white"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:border-b lg:border-zinc-100 lg:px-6 lg:py-[18px]">
          <h2 id="mis-eventos-title" className="text-lg font-semibold">
            Mis eventos
          </h2>
          <StatusFilter filter={filter} onChange={setFilter} />
        </div>
        <p
          aria-live="polite"
          className={cn(
            "text-sm text-muted-foreground",
            showActionNotice ? "lg:px-6 lg:pt-3" : "sr-only",
          )}
        >
          {showActionNotice ? "Esta opción estará disponible pronto." : null}
        </p>
        {visibleEvents.length === 0 ? (
          <EmptyEvents filter={filter} />
        ) : (
          <>
            <div className="hidden lg:block">
              <OrganizerEventsTable
                events={visibleEvents}
                highlightedId={highlightedId}
                onAction={handleAction}
              />
            </div>
            <div className="lg:hidden">
              <OrganizerEventCards
                events={visibleEvents}
                highlightedId={highlightedId}
                onAction={handleAction}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export function OrganizerDashboardView({ createdId }: { createdId: string | null }) {
  return (
    <OrganizerShell active="summary" loginRedirect={ORGANIZER_HOME_HREF}>
      <DashboardContent createdId={createdId} />
    </OrganizerShell>
  );
}
