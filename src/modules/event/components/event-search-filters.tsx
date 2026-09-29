"use client";

import { useId, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { categories } from "@/modules/event/data/categories.mock";
import type { Event } from "@/modules/event/schemas/event.schema";
import {
  PRICE_RANGES,
  countBy,
  formatMonthLabel,
  getActiveFilterChips,
  getAvailableMonths,
  useEventSearchStore,
} from "@/modules/event/store/event-search.store";

type EventsProps = { events: Event[] };

function FilterGroup({ legend, last, children }: { legend: string; last?: boolean; children: ReactNode }) {
  return (
    <fieldset
      className={cn("m-0 flex flex-col gap-0.5 border-0 py-[18px]", !last && "border-b border-border")}
    >
      <legend className="pb-2.5 text-sm font-semibold text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

type OptionProps = {
  type: "checkbox" | "radio";
  name?: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
};

function FilterOption({ type, name, label, count, checked, onChange }: OptionProps) {
  return (
    <label className="flex min-h-[38px] cursor-pointer items-center gap-3 text-sm text-foreground">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="m-0 size-[18px] shrink-0 cursor-pointer accent-primary"
      />
      <span className="grow">{label}</span>
      {count !== undefined && (
        <span className="text-[13px] text-muted-foreground tabular-nums">{count}</span>
      )}
    </label>
  );
}

export function EventSearchFilters({ events }: EventsProps) {
  const groupId = useId();
  const state = useEventSearchStore();
  const hasFilters = getActiveFilterChips(state).length > 0;

  const categoryCounts = countBy(events, "categorySlug");
  const cityCounts = countBy(events, "city");
  const cities = Object.keys(cityCounts).sort((a, b) => a.localeCompare(b, "es"));
  const months = getAvailableMonths(events);

  return (
    <div className="flex flex-col">
      <div className="flex h-[60px] items-center justify-between border-b border-border">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <SlidersHorizontal className="size-[18px]" aria-hidden />
          Filtros
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={state.clearFilters}
            className="h-11 cursor-pointer px-1 text-sm font-semibold text-primary hover:text-primary/80"
          >
            Limpiar
          </button>
        )}
      </div>

      <FilterGroup legend="Categoría">
        {categories.map((c) => (
          <FilterOption
            key={c.slug}
            type="checkbox"
            label={c.name}
            count={categoryCounts[c.slug] ?? 0}
            checked={state.categories.includes(c.slug)}
            onChange={() => state.toggleCategory(c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Ciudad">
        {cities.map((city) => (
          <FilterOption
            key={city}
            type="checkbox"
            label={city}
            count={cityCounts[city]}
            checked={state.cities.includes(city)}
            onChange={() => state.toggleCity(city)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Fecha">
        <FilterOption
          type="radio"
          name={`${groupId}-month`}
          label="Cualquier fecha"
          checked={state.month === null}
          onChange={() => state.setMonth(null)}
        />
        {months.map((month) => (
          <FilterOption
            key={month}
            type="radio"
            name={`${groupId}-month`}
            label={formatMonthLabel(month)}
            checked={state.month === month}
            onChange={() => state.setMonth(month)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Precio desde" last>
        {PRICE_RANGES.map((range) => (
          <FilterOption
            key={range.key}
            type="radio"
            name={`${groupId}-price`}
            label={range.label}
            checked={state.priceRange === range.key}
            onChange={() => state.setPriceRange(range.key)}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

export function EventSearchMobileFilters({ events }: EventsProps) {
  const state = useEventSearchStore();
  const activeCount = getActiveFilterChips(state).length;

  return (
    <div className="flex flex-col gap-4">
      <Sheet>
        <SheetTrigger className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-zinc-300 bg-background px-4 text-sm font-semibold text-foreground hover:bg-muted">
          <SlidersHorizontal className="size-[18px]" aria-hidden />
          Filtros
          {activeCount > 0 && (
            <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              <span className="sr-only">activos: </span>
              {activeCount}
            </span>
          )}
        </SheetTrigger>
        <SheetContent side="left" aria-label="Filtros" className="w-full gap-0 sm:max-w-sm">
          <div className="grow overflow-y-auto px-4 pt-10 pb-4">
            <EventSearchFilters events={events} />
          </div>
          <div className="border-t border-border p-4">
            <SheetClose render={<Button className="h-12 w-full rounded-[14px] text-[15px] font-semibold" />}>
              Ver resultados
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <div
        role="group"
        aria-label="Categorías"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      >
        {categories.map((c) => {
          const active = state.categories.includes(c.slug);
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={active}
              onClick={() => state.toggleCategory(c.slug)}
              className={cn(
                "h-11 shrink-0 cursor-pointer rounded-full border-[1.5px] px-4 text-sm whitespace-nowrap transition-colors",
                active
                  ? "border-foreground bg-foreground font-semibold text-background"
                  : "border-border bg-background font-medium text-foreground hover:bg-muted"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
