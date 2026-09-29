import { describe, expect, it } from "vitest";
import { venueMapSchema, venueZoneSchema } from "@/modules/venue/schemas/venue.schema";

const base = {
  id: "zona",
  tierId: "general",
  name: "Zona",
  shape: "M0 0 H10 V10 H0 Z",
  labelPosition: { x: 5, y: 5 },
};

const seat = { id: "zona-A-1", number: 1, x: 0, y: 0, status: "available" };
const seatedZone = { ...base, kind: "seated", rows: [{ label: "A", seats: [seat] }] };

const map = {
  id: "mapa",
  name: "Mapa",
  viewBox: { width: 100, height: 100 },
  stage: { shape: "M0 0 H10 V10 H0 Z", label: "ESCENARIO", labelPosition: { x: 5, y: 5 } },
  zones: [seatedZone],
};

describe("venueZoneSchema", () => {
  it("AC-2: acepta una zona standing sin rows", () => {
    expect(venueZoneSchema.parse({ ...base, kind: "standing" })).toMatchObject({ kind: "standing" });
  });

  it("AC-2: acepta una zona seated con filas", () => {
    expect(venueZoneSchema.parse(seatedZone)).toMatchObject({ kind: "seated" });
  });

  it("AC-2: rechaza una zona seated sin rows", () => {
    expect(() => venueZoneSchema.parse({ ...base, kind: "seated" })).toThrow();
  });

  it("AC-2: rechaza una zona seated con rows vacío", () => {
    expect(() => venueZoneSchema.parse({ ...base, kind: "seated", rows: [] })).toThrow();
  });

  it("AC-2: rechaza un kind desconocido", () => {
    expect(() => venueZoneSchema.parse({ ...base, kind: "vip" })).toThrow();
  });

  it("AC-2: rechaza un seat.status desconocido", () => {
    const zone = { ...seatedZone, rows: [{ label: "A", seats: [{ ...seat, status: "blocked" }] }] };
    expect(() => venueZoneSchema.parse(zone)).toThrow();
  });

  it.each([0, 1.5])("AC-2: rechaza seat.number %s", (number) => {
    const zone = { ...seatedZone, rows: [{ label: "A", seats: [{ ...seat, number }] }] };
    expect(() => venueZoneSchema.parse(zone)).toThrow();
  });
});

describe("venueMapSchema", () => {
  it("AC-2: acepta un mapa válido", () => {
    expect(venueMapSchema.parse(map).id).toBe("mapa");
  });

  it("AC-2: rechaza zones vacío", () => {
    expect(() => venueMapSchema.parse({ ...map, zones: [] })).toThrow();
  });

  it("AC-2: rechaza un viewBox con ancho 0", () => {
    expect(() => venueMapSchema.parse({ ...map, viewBox: { width: 0, height: 100 } })).toThrow();
  });
});
