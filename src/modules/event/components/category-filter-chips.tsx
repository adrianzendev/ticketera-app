"use client";

import { cn } from "@/lib/utils";
import { categories } from "@/modules/event/data/categories.mock";
import { useEventFiltersStore } from "@/modules/event/store/event-filters.store";

export function CategoryFilterChips() {
  const category = useEventFiltersStore((s) => s.category);
  const setCategory = useEventFiltersStore((s) => s.setCategory);

  const chips = [{ slug: null, label: "Todos" }, ...categories.map((c) => ({ slug: c.slug, label: c.name }))];

  return (
    <div role="group" aria-label="Filtrar por categoría" className="mt-7 flex flex-wrap gap-2.5">
      {chips.map((chip) => {
        const active = category === chip.slug;
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => setCategory(active && chip.slug !== null ? null : chip.slug)}
            className={cn(
              "h-11 cursor-pointer rounded-full border-[1.5px] px-[18px] text-sm font-semibold transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background font-medium text-foreground hover:bg-muted"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
