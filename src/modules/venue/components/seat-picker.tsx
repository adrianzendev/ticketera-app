"use client";

import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import type { TicketTier } from "@/modules/event/schemas/event.schema";
import type { Seat, SeatedZone } from "@/modules/venue/schemas/venue.schema";
import { SEAT_RADIUS, formatSeatLabel, getSeatsViewBox } from "@/modules/venue/services/venue.service";

import { ZoomableCanvas } from "./zoomable-canvas";

type SeatVisualState = "available" | "selected" | "reserved" | "sold";

// `fill: null` significa "usar el color del tier".
const SEAT_STATUS_STYLES: Record<SeatVisualState, { label: string; fill: string | null }> = {
  available: { label: "Disponible", fill: null },
  selected: { label: "Seleccionado", fill: "#18181B" },
  reserved: { label: "Reservado", fill: "#A1A1AA" },
  sold: { label: "Vendido", fill: "#D4D4D8" },
};

const LEGEND_ORDER: SeatVisualState[] = ["available", "selected", "reserved", "sold"];
const ROW_LABEL_OFFSET = 16;

function getSeatFill(state: SeatVisualState, tierColor: string): string {
  return SEAT_STATUS_STYLES[state].fill ?? tierColor;
}

type SeatPickerProps = {
  zone: SeatedZone;
  tier: TicketTier;
  selectedSeatIds: string[];
  max: number;
  onToggleSeat: (seatId: string) => void;
  className?: string;
};

export function SeatPicker({ zone, tier, selectedSeatIds, max, onToggleSeat, className }: SeatPickerProps) {
  const selectedCount = selectedSeatIds.length;
  const isAtMax = selectedCount >= max;

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Elige tus asientos · {zone.name}</h3>
        <p aria-live="polite" className="text-sm text-zinc-600">
          {selectedCount} de {max} asientos elegidos
        </p>
      </div>

      <ZoomableCanvas label={`Asientos de ${zone.name}`}>
        <svg viewBox={getSeatsViewBox(zone)} className="h-auto w-full">
          {zone.rows.map((row) => (
            <g key={row.label}>
              <text
                x={Math.min(...row.seats.map((seat) => seat.x)) - ROW_LABEL_OFFSET}
                y={row.seats[0].y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={600}
                fill="#52525B"
                aria-hidden="true"
                className="pointer-events-none select-none"
              >
                {row.label}
              </text>
              {row.seats.map((seat) => (
                <SeatCircle
                  key={seat.id}
                  seat={seat}
                  label={formatSeatLabel(row.label, seat.number)}
                  tierColor={tier.color}
                  selected={selectedSeatIds.includes(seat.id)}
                  blockedByMax={isAtMax}
                  onToggle={onToggleSeat}
                />
              ))}
            </g>
          ))}
        </svg>
      </ZoomableCanvas>

      {isAtMax && (
        <p className="text-sm font-medium text-orange-700">
          Llegaste al máximo de {max} asientos por zona.
        </p>
      )}

      <ul aria-label="Leyenda de asientos" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
        {LEGEND_ORDER.map((state) => (
          <li key={state} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: getSeatFill(state, tier.color) }}
            />
            {SEAT_STATUS_STYLES[state].label}
          </li>
        ))}
      </ul>
    </section>
  );
}

type SeatCircleProps = {
  seat: Seat;
  label: string;
  tierColor: string;
  selected: boolean;
  blockedByMax: boolean;
  onToggle: (seatId: string) => void;
};

function SeatCircle({ seat, label, tierColor, selected, blockedByMax, onToggle }: SeatCircleProps) {
  const unavailable = seat.status !== "available";
  const state: SeatVisualState = unavailable ? seat.status : selected ? "selected" : "available";
  const interactive = !unavailable && (selected || !blockedByMax);

  const handleKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (interactive) onToggle(seat.id);
  };

  return (
    <circle
      cx={seat.x}
      cy={seat.y}
      r={SEAT_RADIUS}
      fill={getSeatFill(state, tierColor)}
      role="button"
      tabIndex={unavailable ? -1 : 0}
      aria-label={unavailable ? `${label}, no disponible` : label}
      aria-pressed={unavailable ? undefined : selected}
      aria-disabled={interactive ? undefined : "true"}
      onClick={interactive ? () => onToggle(seat.id) : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "outline-none focus-visible:stroke-[#4F46E5] focus-visible:stroke-2",
        interactive ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed",
      )}
    />
  );
}
