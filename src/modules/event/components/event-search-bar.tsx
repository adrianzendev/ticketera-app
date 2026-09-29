"use client";

import { useId } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventSearchStore } from "@/modules/event/store/event-search.store";

export function EventSearchBar() {
  const inputId = useId();
  const search = useEventSearchStore((s) => s.search);
  const setSearch = useEventSearchStore((s) => s.setSearch);

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex items-stretch gap-2 rounded-[18px] border border-border bg-background p-1.5 shadow-[0_12px_32px_-16px_rgba(24,24,27,0.22)] focus-within:ring-3 focus-within:ring-ring/50 md:rounded-[22px] md:p-2"
    >
      <div className="flex grow flex-col justify-center gap-0.5 px-3 md:px-[18px]">
        <label htmlFor={inputId} className="text-xs font-semibold text-foreground">
          Qué quieres ver
        </label>
        <Input
          id={inputId}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Artista, evento o ciudad"
          className="h-7 border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 md:text-[15px] dark:bg-transparent"
        />
      </div>
      <Button
        type="submit"
        className="h-auto min-h-11 gap-2 rounded-[13px] bg-orange-500 px-4 text-[15px] font-semibold text-foreground hover:bg-orange-600 md:rounded-2xl md:px-7"
      >
        <Search className="size-[18px]" aria-hidden />
        Buscar
      </Button>
    </form>
  );
}
