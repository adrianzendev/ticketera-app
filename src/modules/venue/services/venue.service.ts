import type { TicketTier } from "@/modules/event/schemas/event.schema";
import { venueMaps } from "@/modules/venue/data/venue-maps.mock";
import type { Seat, SeatRow, SeatedZone, VenueMap, VenueZone } from "@/modules/venue/schemas/venue.schema";

export const SEAT_RADIUS = 5;

export const venueService = {
  getByEventSlug(slug: string): VenueMap | null {
    return Object.hasOwn(venueMaps, slug) ? venueMaps[slug] : null;
  },
};

export function getSeatsViewBox(zone: SeatedZone, padding = 28): string {
  const seats = zone.rows.flatMap((row) => row.seats);
  const xs = seats.map((seat) => seat.x);
  const ys = seats.map((seat) => seat.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX + 2 * padding;
  const height = Math.max(...ys) - minY + 2 * padding;
  return `${minX - padding} ${minY - padding} ${width} ${height}`;
}

export function findSeat(
  map: VenueMap,
  seatId: string,
): { zone: SeatedZone; row: SeatRow; seat: Seat } | null {
  for (const zone of map.zones) {
    if (zone.kind !== "seated") continue;
    for (const row of zone.rows) {
      const seat = row.seats.find((s) => s.id === seatId);
      if (seat) return { zone, row, seat };
    }
  }
  return null;
}

export function formatSeatLabel(rowLabel: string, seatNumber: number): string {
  return `Fila ${rowLabel}, asiento ${seatNumber}`;
}

export function isZoneAvailable(zone: VenueZone, tier: TicketTier | undefined): boolean {
  if (!tier || tier.status === "sold_out") return false;
  if (zone.kind === "standing") return true;
  return zone.rows.some((row) => row.seats.some((seat) => seat.status === "available"));
}

export function getZoneByTierId(map: VenueMap, tierId: string): VenueZone | null {
  return map.zones.find((zone) => zone.tierId === tierId) ?? null;
}
