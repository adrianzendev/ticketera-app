"use client";

import { SearchX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventCard } from "@/modules/event/components/event-card";
import type { Event } from "@/modules/event/schemas/event.schema";
import {
  getActiveFilterChips,
  searchEvents,
  useEventSearchStore,
  type EventSort,
} from "@/modules/event/store/event-search.store";

const SORT_OPTIONS: ReadonlyArray<{ key: EventSort; label: string }> = [
  { key: "date", label: "Fecha" },
  { key: "price", label: "Precio más bajo" },
];

export function EventSearchResults({ events }: { events: Event[] }) {
  const state = useEventSearchStore();
  const results = searchEvents(events, state);
  const chips = getActiveFilterChips(state);

  const clearAll = () => {
    state.clearFilters();
    state.setSearch("");
  };

  return (
    <section aria-label="Resultados" className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <p aria-live="polite" className="mr-2 text-base font-semibold text-foreground">
            {results.length === 1 ? "1 evento" : `${results.length} eventos`}
          </p>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              aria-label={`Quitar filtro ${chip.label}`}
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 pr-2.5 pl-3.5 text-[13px] font-medium text-indigo-800 hover:bg-indigo-100"
            >
              {chip.label}
              <X className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="text-sm text-muted-foreground">Ordenar por</span>
          <div className="flex gap-1 rounded-[14px] border border-border bg-background p-1">
            {SORT_OPTIONS.map((option) => {
              const pressed = state.sort === option.key;
              return (
                <Button
                  key={option.key}
                  type="button"
                  variant={pressed ? "default" : "ghost"}
                  aria-pressed={pressed}
                  onClick={() => state.setSort(option.key)}
                  className={cn(
                    "h-10 rounded-[10px] px-4 text-sm font-semibold",
                    pressed && "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-[1.5px] border-dashed border-zinc-300 bg-background px-6 py-12 text-center md:py-[72px]">
          <span className="flex size-14 items-center justify-center rounded-[18px] bg-indigo-50 text-indigo-600">
            <SearchX className="size-6" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-foreground md:text-xl">
            No encontramos eventos con esos filtros
          </h2>
          <p className="max-w-[420px] text-[15px] text-muted-foreground">
            Prueba quitando algún filtro o buscando otra ciudad.
          </p>
          <Button
            type="button"
            onClick={clearAll}
            className="mt-2 h-12 rounded-[14px] bg-foreground px-[22px] text-[15px] font-semibold text-background hover:bg-foreground/90"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((event) => (
            <EventCard key={event.id} event={event} showDate />
          ))}
        </div>
      )}
    </section>
  );
}
