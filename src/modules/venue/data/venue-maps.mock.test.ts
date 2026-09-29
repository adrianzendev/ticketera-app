import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { eventDetails } from "@/modules/event/data/event-details.mock";
import { venueMaps } from "@/modules/venue/data/venue-maps.mock";
import { venueMapSchema, type Seat } from "@/modules/venue/schemas/venue.schema";
import { SEAT_RADIUS } from "@/modules/venue/services/venue.service";

const entries = Object.entries(venueMaps);
const seatsOf = (rows: { seats: Seat[] }[]) => rows.flatMap((row) => row.seats);
const unique = (values: unknown[]) => new Set(values).size === values.length;

describe("venueMaps", () => {
  it.each(entries)("AC-3: %s pasa venueMapSchema.parse", (_, map) => {
    expect(() => venueMapSchema.parse(map)).not.toThrow();
  });

  it("AC-3: los asientos se generan sin Math.random ni Date", () => {
    const source = readFileSync(resolve(__dirname, "venue-maps.mock.ts"), "utf8");
    expect(source).not.toMatch(/Math\.random|Date/);
  });

  it("AC-4: tiene exactamente las 2 claves esperadas", () => {
    expect(Object.keys(venueMaps).sort()).toEqual(
      ["noches-de-rock-lima", "romeo-y-julieta-teatro-municipal"].sort(),
    );
  });

  it("AC-4: el estadio tiene escenario, campo de pie y tribunas numeradas", () => {
    const map = venueMaps["noches-de-rock-lima"];
    expect(map.name).toBe("Estadio Nacional");
    const kindByTier = Object.fromEntries(map.zones.map((z) => [z.tierId, z.kind]));
    expect(kindByTier).toEqual({ general: "standing", preferencial: "standing", vip: "seated", palco: "seated" });
    expect(map.zones.filter((z) => z.kind === "standing").length).toBeGreaterThanOrEqual(2);
    expect(map.zones.filter((z) => z.kind === "seated").length).toBeGreaterThanOrEqual(2);
    for (const zone of map.zones) expect(map.stage.labelPosition.y).toBeLessThan(zone.labelPosition.y);
  });

  it("AC-4: el teatro tiene escenario y solo zonas seated platea, palco y galeria", () => {
    const map = venueMaps["romeo-y-julieta-teatro-municipal"];
    expect(map.name).toBe("Teatro Municipal");
    expect(map.stage.label).toBeTruthy();
    expect(map.zones.every((z) => z.kind === "seated")).toBe(true);
    expect(map.zones.map((z) => z.tierId).sort()).toEqual(["galeria", "palco", "platea"]);
  });
});

describe.each(entries)("AC-5: invariantes de %s", (slug, map) => {
  const tiers = eventDetails[slug].tiers;
  const seatedZones = map.zones.flatMap((z) => (z.kind === "seated" ? [z] : []));

  it("(a) ids de zona, asiento, fila y número únicos; formato de seat.id", () => {
    expect(unique(map.zones.map((z) => z.id))).toBe(true);
    const allSeats = seatedZones.flatMap((z) => seatsOf(z.rows));
    expect(unique(allSeats.map((s) => s.id))).toBe(true);
    for (const zone of seatedZones) {
      expect(unique(zone.rows.map((r) => r.label))).toBe(true);
      for (const row of zone.rows) {
        expect(unique(row.seats.map((s) => s.number))).toBe(true);
        for (const seat of row.seats) expect(seat.id).toBe(`${zone.id}-${row.label}-${seat.number}`);
      }
    }
  });

  it("(b) relación 1:1 entre tier y zona", () => {
    const tierIds = tiers.map((t) => t.id);
    for (const zone of map.zones) expect(tierIds).toContain(zone.tierId);
    for (const tier of tiers) expect(map.zones.filter((z) => z.tierId === tier.id)).toHaveLength(1);
  });

  it("(c) y (d) disponibilidad coherente con el estado del tier", () => {
    for (const zone of seatedZones) {
      const tier = tiers.find((t) => t.id === zone.tierId)!;
      const seats = seatsOf(zone.rows);
      const available = seats.filter((s) => s.status === "available").length;
      if (tier.status === "sold_out") {
        expect(available).toBe(0);
      } else {
        expect(available).toBeGreaterThan(0);
        if (tier.status === "last_tickets") expect(available / seats.length).toBeLessThan(0.3);
      }
    }
  });

  it("(e) cada zona seated tiene al menos un asiento reserved o sold", () => {
    for (const zone of seatedZones) {
      expect(seatsOf(zone.rows).some((s) => s.status !== "available")).toBe(true);
    }
  });

  it("(f) distancia entre asientos de la misma zona >= 2 * SEAT_RADIUS + 2", () => {
    const min = 2 * SEAT_RADIUS + 2;
    for (const zone of seatedZones) {
      const seats = seatsOf(zone.rows);
      let closest = Infinity;
      for (let i = 0; i < seats.length; i++) {
        for (let j = i + 1; j < seats.length; j++) {
          closest = Math.min(closest, Math.hypot(seats[i].x - seats[j].x, seats[i].y - seats[j].y));
        }
      }
      expect(closest).toBeGreaterThanOrEqual(min);
    }
  });

  it("(g) labelPosition de zonas y escenario dentro del viewBox", () => {
    const { width, height } = map.viewBox;
    for (const { x, y } of [map.stage.labelPosition, ...map.zones.map((z) => z.labelPosition)]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(height);
    }
  });
});
