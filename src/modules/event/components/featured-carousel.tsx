"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { categories } from "@/modules/event/data/categories.mock";
import { events } from "@/modules/event/data/events.mock";
import { useEventFiltersStore } from "@/modules/event/store/event-filters.store";

function formatDateLong(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(iso)
  );
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromLocalDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const SLIDE_DURATION_MS = 6000;

export function FeaturedCarousel() {
  const search = useEventFiltersStore((s) => s.search);
  const setSearch = useEventFiltersStore((s) => s.setSearch);
  const date = useEventFiltersStore((s) => s.date);
  const setDate = useEventFiltersStore((s) => s.setDate);
  const maxPrice = useEventFiltersStore((s) => s.maxPrice);
  const setMaxPrice = useEventFiltersStore((s) => s.setMaxPrice);

  const featuredEvents = events.filter((event) => event.featured);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % featuredEvents.length);
    }, SLIDE_DURATION_MS);
  }, [stop, featuredEvents.length]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with a browser media query on mount
      setPlaying(false);
      return;
    }
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(i: number) {
    const n = featuredEvents.length;
    setIndex(((i % n) + n) % n);
    if (playing) start();
  }

  function toggle() {
    if (playing) {
      stop();
      setPlaying(false);
    } else {
      start();
      setPlaying(true);
    }
  }

  const current = featuredEvents[index];
  const currentCategory = categories.find((c) => c.slug === current.categorySlug);

  return (
    <div className="flex flex-col gap-6">
      {/* Intro + búsqueda */}
      <section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 px-4 pt-8 pb-4 md:flex-row md:items-end md:px-10">
        <div className="flex max-w-xl flex-col gap-3">
          <h1 className="text-[40px] leading-[1.08] font-bold tracking-tight text-balance md:text-[48px]">
            Encuentra tu próximo plan en vivo
          </h1>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            Conciertos, deportes, teatro y festivales. Compra seguro y recibe tu entrada al
            instante.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            document.querySelector("#eventos")?.scrollIntoView({ behavior: "smooth" });
          }}
          role="search"
          className="flex w-full items-stretch gap-0 rounded-[22px] border border-border bg-background p-2 shadow-[0_12px_32px_-16px_rgba(24,24,27,0.22)] md:w-[672px]"
        >
          <label className="flex grow cursor-text flex-col justify-center gap-0.5 rounded-2xl px-4 py-1.5">
            <span className="text-xs font-semibold">Qué quieres ver</span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Artista, evento o ciudad"
              className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0"
            />
          </label>

          <span className="my-3 w-px bg-border" />

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-auto w-[150px] flex-col items-start justify-center gap-0.5 rounded-2xl px-4 py-1.5 text-left font-normal"
                />
              }
            >
              <span className="text-xs font-semibold">Fecha</span>
              <span className="text-[15px] text-muted-foreground">
                {date ? fromLocalDateKey(date).toLocaleDateString("es-PE") : "Cualquier día"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date ? fromLocalDateKey(date) : undefined}
                onSelect={(d) => setDate(d ? toLocalDateKey(d) : null)}
              />
            </PopoverContent>
          </Popover>

          <span className="my-3 w-px bg-border" />

          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-auto w-[160px] flex-col items-start justify-center gap-0.5 rounded-2xl px-4 py-1.5 text-left font-normal"
                />
              }
            >
              <span className="text-xs font-semibold">Precio</span>
              <span className="text-[15px] text-muted-foreground">
                {maxPrice != null ? `Hasta S/ ${maxPrice}` : "Cualquier precio"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="flex w-56 flex-col gap-2">
              <span className="text-sm font-medium">Precio máximo (S/)</span>
              <Input
                type="number"
                min={0}
                placeholder="Sin límite"
                value={maxPrice ?? ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" size="lg" className="ml-1 gap-2 self-center rounded-2xl bg-accent px-6 text-accent-foreground hover:bg-accent/90">
            <Search className="size-[18px]" />
            Buscar
          </Button>
        </form>
      </section>

      {/* Carrusel destacados */}
      <section
        aria-roledescription="carrusel"
        aria-label="Eventos destacados"
        className="mx-auto flex w-full max-w-7xl flex-col gap-[22px] px-4 pb-6 md:px-10"
      >
        <div className="grid h-[420px] grid-cols-1 overflow-hidden rounded-[32px] md:h-[520px] md:grid-cols-[520px_minmax(0,1fr)]">
          <div className="flex flex-col bg-indigo-950 p-8 text-white md:p-12">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="rounded-full border-none bg-accent text-accent-foreground">
                  Destacado
                </Badge>
                {currentCategory && (
                  <Badge className="rounded-full border border-white/30 bg-transparent text-white">
                    {currentCategory.name}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium text-indigo-200 tabular-nums">
                {String(index + 1).padStart(2, "0")} / {String(featuredEvents.length).padStart(2, "0")}
              </span>
            </div>

            <h2 className="mt-7 text-[32px] leading-[1.1] font-bold tracking-tight text-balance md:text-[44px]">
              {current.title}
            </h2>

            <div className="mt-5 flex flex-col gap-2.5 text-[15px] text-indigo-100 md:text-base">
              <span className="flex items-center gap-2.5">
                <CalendarIcon className="size-[18px]" />
                {formatDateLong(current.startDate)}
              </span>
              <span className="flex items-center gap-2.5">
                <MapPin className="size-[18px]" />
                {current.venueName}, {current.city}
              </span>
            </div>

            <div className="grow" />

            <div className="flex items-baseline gap-2">
              <span className="text-sm text-indigo-200">Desde</span>
              <span className="text-[28px] font-bold tracking-tight md:text-[30px]">
                S/ {current.priceFrom}
              </span>
            </div>

            <div className="mt-3.5 flex gap-2.5">
              <Button
                size="lg"
                className="grow gap-2 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Comprar entradas
                <ChevronRight className="size-[18px]" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-[1.5px] border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Ver detalles
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden bg-indigo-950">
            {featuredEvents.map((event, i) => (
              <Image
                key={event.id}
                src={event.imageUrl}
                alt={event.title}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover transition-opacity duration-700"
                style={{ opacity: i === index ? 1 : 0 }}
              />
            ))}
            {current.status === "last_tickets" && (
              <span className="absolute top-6 left-6 flex h-[34px] items-center rounded-full bg-orange-100 px-3.5 text-[13px] font-semibold text-orange-800">
                Últimas entradas
              </span>
            )}
            <div className="absolute right-6 bottom-6 flex gap-1 rounded-full bg-white p-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                aria-label="Evento anterior"
                onClick={() => goTo(index - 1)}
                className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pausar carrusel" : "Reproducir carrusel"}
                onClick={toggle}
                className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button
                type="button"
                aria-label="Evento siguiente"
                onClick={() => goTo(index + 1)}
                className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${featuredEvents.length}, minmax(0, 1fr))` }}
        >
          {featuredEvents.map((event, i) => {
            const active = i === index;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ver ${event.title}`}
                aria-current={active}
                className="flex cursor-pointer flex-col gap-3.5 border-0 bg-transparent p-0 text-left"
              >
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-border">
                  {active && playing && (
                    <span
                      key={`${event.id}-${index}`}
                      className="block h-full animate-[tk-progress_6s_linear_forwards] bg-primary"
                    />
                  )}
                  {active && !playing && <span className="block h-full w-full bg-primary" />}
                </span>
                <span className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                      style={{ opacity: active ? 1 : 0.72 }}
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span
                      className={`truncate text-sm font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {event.title}
                    </span>
                    <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                      {formatDateShort(event.startDate)} · {event.city}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
