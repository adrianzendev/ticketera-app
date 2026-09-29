import { describe, expect, it } from "vitest";
import type { TicketTier } from "@/modules/event/schemas/event.schema";
import { venueMaps } from "@/modules/venue/data/venue-maps.mock";
import type { SeatedZone, StandingZone, VenueMap } from "@/modules/venue/schemas/venue.schema";
import {
  findSeat,
  formatSeatLabel,
  getSeatsViewBox,
  getZoneByTierId,
  isZoneAvailable,
  venueService,
} from "@/modules/venue/services/venue.service";

const seatedZone: SeatedZone = {
  kind: "seated",
  id: "platea",
  tierId: "platea",
  name: "Platea",
  shape: "M0 0 H10 V10 H0 Z",
  labelPosition: { x: 5, y: 5 },
  rows: [
    {
      label: "A",
      seats: [
        { id: "platea-A-1", number: 1, x: 10, y: 20, status: "sold" },
        { id: "platea-A-2", number: 2, x: 50, y: 20, status: "available" },
      ],
    },
    {
      label: "B",
      seats: [{ id: "platea-B-1", number: 1, x: 30, y: 60, status: "reserved" }],
    },
  ],
};

const standingZone: StandingZone = {
  kind: "standing",
  id: "campo",
  tierId: "general",
  name: "Campo",
  shape: "M0 0 H10 V10 H0 Z",
  labelPosition: { x: 5, y: 5 },
};

const map: VenueMap = {
  id: "mapa",
  name: "Mapa",
  viewBox: { width: 100, height: 100 },
  stage: { shape: "M0 0 H10 V10 H0 Z", label: "ESCENARIO", labelPosition: { x: 5, y: 5 } },
  zones: [standingZone, seatedZone],
};

const tier = (status: TicketTier["status"]): TicketTier => ({
  id: "platea",
  name: "Platea",
  price: 100,
  color: "#EC4899",
  status,
});

describe("venueService.getByEventSlug", () => {
  it("AC-6: devuelve el mapa de un evento con mapa", () => {
    expect(venueService.getByEventSlug("noches-de-rock-lima")).toBe(venueMaps["noches-de-rock-lima"]);
  });

  it("AC-6: devuelve null para un evento sin mapa", () => {
    expect(venueService.getByEventSlug("noche-de-stand-up-cusco")).toBeNull();
  });

  it("AC-6: devuelve null para un slug inexistente", () => {
    expect(venueService.getByEventSlug("no-existe")).toBeNull();
    expect(venueService.getByEventSlug("toString")).toBeNull();
  });
});

describe("getSeatsViewBox", () => {
  it("AC-6: usa padding 28 por defecto", () => {
    expect(getSeatsViewBox(seatedZone)).toBe("-18 -8 96 96");
  });

  it("AC-6: respeta un padding explícito", () => {
    expect(getSeatsViewBox(seatedZone, 10)).toBe("0 10 60 60");
  });
});

describe("findSeat", () => {
  it("AC-6: devuelve zona, fila y asiento para un id válido", () => {
    const result = findSeat(map, "platea-B-1");
    expect(result?.zone).toBe(seatedZone);
    expect(result?.row.label).toBe("B");
    expect(result?.seat.number).toBe(1);
  });

  it("AC-6: devuelve null para un id inexistente", () => {
    expect(findSeat(map, "platea-Z-9")).toBeNull();
  });

  it("AC-6: devuelve null para un id de zona standing", () => {
    expect(findSeat(map, "campo")).toBeNull();
  });
});

describe("formatSeatLabel", () => {
  it("AC-6: formatea fila y número", () => {
    expect(formatSeatLabel("A", 5)).toBe("Fila A, asiento 5");
  });
});

describe("isZoneAvailable", () => {
  it("AC-6: false si el tier es undefined", () => {
    expect(isZoneAvailable(seatedZone, undefined)).toBe(false);
  });

  it("AC-6: false si el tier está sold_out", () => {
    expect(isZoneAvailable(standingZone, tier("sold_out"))).toBe(false);
  });

  it("AC-6: false si la zona seated no tiene asientos available", () => {
    const full: SeatedZone = {
      ...seatedZone,
      rows: [{ label: "A", seats: [{ id: "platea-A-1", number: 1, x: 0, y: 0, status: "sold" }] }],
    };
    expect(isZoneAvailable(full, tier("available"))).toBe(false);
  });

  it("AC-6: true en otro caso (standing o seated con asientos available)", () => {
    expect(isZoneAvailable(standingZone, tier("last_tickets"))).toBe(true);
    expect(isZoneAvailable(seatedZone, tier("available"))).toBe(true);
  });
});

describe("getZoneByTierId", () => {
  it("AC-6: devuelve la zona del tier", () => {
    expect(getZoneByTierId(map, "platea")).toBe(seatedZone);
  });

  it("AC-6: devuelve null si no hay zona para el tier", () => {
    expect(getZoneByTierId(map, "vip")).toBeNull();
  });
});
