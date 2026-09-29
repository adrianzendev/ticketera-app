"use client";

import type { KeyboardEvent } from "react";

import { getContrastTextColor } from "@/lib/color";
import { cn } from "@/lib/utils";
import type { TicketTier } from "@/modules/event/schemas/event.schema";
import type { VenueMap, VenueZone } from "@/modules/venue/schemas/venue.schema";
import { isZoneAvailable } from "@/modules/venue/services/venue.service";

import { ZoomableCanvas } from "./zoomable-canvas";

const STAGE_FILL = "#18181B";
const SELECTED_STROKE = "#18181B";
const SOLD_OUT_FILL = "#E4E4E7";
const SOLD_OUT_TEXT = "#52525B";

type VenueZoneMapProps = {
  map: VenueMap;
  tiers: TicketTier[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  className?: string;
};

export function VenueZoneMap({ map, tiers, selectedZoneId, onSelectZone, className }: VenueZoneMapProps) {
  const { width, height } = map.viewBox;

  return (
    <ZoomableCanvas label={`Mapa de ${map.name}`} className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <g aria-hidden="true">
          <path d={map.stage.shape} fill={STAGE_FILL} />
          <text
            x={map.stage.labelPosition.x}
            y={map.stage.labelPosition.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontWeight={700}
            letterSpacing="0.16em"
            // En mobile el SVG se reduce ~3x: se agranda el texto en unidades del viewBox para que siga legible.
            className="pointer-events-none select-none text-[24px] lg:text-[16px]"
          >
            {map.stage.label}
          </text>
        </g>
        {map.zones.map((zone) => (
          <ZoneShape
            key={zone.id}
            zone={zone}
            tier={tiers.find((tier) => tier.id === zone.tierId)}
            selected={zone.id === selectedZoneId}
            onSelect={onSelectZone}
          />
        ))}
      </svg>
    </ZoomableCanvas>
  );
}

type ZoneShapeProps = {
  zone: VenueZone;
  tier: TicketTier | undefined;
  selected: boolean;
  onSelect: (zoneId: string) => void;
};

function ZoneShape({ zone, tier, selected, onSelect }: ZoneShapeProps) {
  const available = tier !== undefined && isZoneAvailable(zone, tier);
  const fill = available ? tier.color : SOLD_OUT_FILL;
  const textFill = available ? getContrastTextColor(tier.color) : SOLD_OUT_TEXT;
  const priceText = available ? `S/ ${tier.price}` : "Agotado";
  const ariaLabel = available
    ? `${zone.name}, S/ ${tier.price}${tier.status === "last_tickets" ? ", últimas entradas" : ""}`
    : `${zone.name}, Agotado`;

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (available) onSelect(zone.id);
  };

  return (
    <g
      role="button"
      tabIndex={available ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={available ? selected : undefined}
      aria-disabled={available ? undefined : "true"}
      onClick={available ? () => onSelect(zone.id) : undefined}
      onKeyDown={handleKeyDown}
      className={cn("group outline-none", available ? "cursor-pointer" : "cursor-not-allowed")}
    >
      <path
        d={zone.shape}
        fill={fill}
        stroke={selected ? SELECTED_STROKE : "#FFFFFF"}
        strokeWidth={3}
        strokeLinejoin="round"
        className={cn(
          "transition-opacity group-focus-visible:stroke-[#4F46E5]",
          available && "group-hover:opacity-90",
        )}
      />
      <text
        x={zone.labelPosition.x}
        y={zone.labelPosition.y}
        textAnchor="middle"
        fill={textFill}
        aria-hidden="true"
        className="pointer-events-none select-none"
      >
        <tspan x={zone.labelPosition.x} dy="-0.2em" fontWeight={600} className="text-[24px] lg:text-[18px]">
          {zone.name}
        </tspan>
        <tspan x={zone.labelPosition.x} dy="1.3em" className="text-[20px] lg:text-[15px]">
          {priceText}
        </tspan>
      </text>
    </g>
  );
}
