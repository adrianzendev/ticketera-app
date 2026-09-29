import type { SeatRow, SeatStatus, VenueMap } from "@/modules/venue/schemas/venue.schema";

type BuildRowsOptions = {
  zoneId: string;
  rowLabels: string[];
  seatsPerRow: number;
  spacing: number;
  statusOf: (rowIndex: number, seatNumber: number) => SeatStatus;
};

function buildRows({ zoneId, rowLabels, seatsPerRow, spacing, statusOf }: BuildRowsOptions): SeatRow[] {
  return rowLabels.map((label, rowIndex) => ({
    label,
    seats: Array.from({ length: seatsPerRow }, (_, i) => {
      const number = i + 1;
      return {
        id: `${zoneId}-${label}-${number}`,
        number,
        x: i * spacing,
        y: rowIndex * spacing,
        status: statusOf(rowIndex, number),
      };
    }),
  }));
}

const SPACING = 16;

const estadioNacional: VenueMap = {
  id: "estadio-nacional",
  name: "Estadio Nacional",
  viewBox: { width: 800, height: 560 },
  stage: {
    shape: "M250 30 H550 V100 H250 Z",
    label: "ESCENARIO",
    labelPosition: { x: 400, y: 65 },
  },
  zones: [
    {
      kind: "standing",
      id: "campo-preferencial",
      tierId: "preferencial",
      name: "Campo Preferencial",
      shape: "M220 120 H580 V240 H220 Z",
      labelPosition: { x: 400, y: 180 },
    },
    {
      kind: "standing",
      id: "campo-general",
      tierId: "general",
      name: "Campo General",
      shape: "M220 255 H580 V520 H220 Z",
      labelPosition: { x: 400, y: 388 },
    },
    {
      kind: "seated",
      id: "tribuna-vip",
      tierId: "vip",
      name: "Tribuna VIP",
      shape: "M60 120 H200 V520 H60 Z",
      labelPosition: { x: 130, y: 320 },
      rows: buildRows({
        zoneId: "tribuna-vip",
        rowLabels: ["A", "B", "C", "D", "E"],
        seatsPerRow: 12,
        spacing: SPACING,
        statusOf: (r, n) => ((r * 3 + n) % 5 === 0 ? "available" : (r + n) % 4 === 0 ? "reserved" : "sold"),
      }),
    },
    {
      kind: "seated",
      id: "palco-este",
      tierId: "palco",
      name: "Palco",
      shape: "M600 120 H740 V520 H600 Z",
      labelPosition: { x: 670, y: 320 },
      rows: buildRows({
        zoneId: "palco-este",
        rowLabels: ["A", "B", "C"],
        seatsPerRow: 8,
        spacing: SPACING,
        statusOf: (r, n) => ((r + n) % 3 === 0 ? "reserved" : "sold"),
      }),
    },
  ],
};

const teatroMunicipal: VenueMap = {
  id: "teatro-municipal",
  name: "Teatro Municipal",
  viewBox: { width: 800, height: 580 },
  stage: {
    shape: "M200 30 H600 V110 H200 Z",
    label: "ESCENARIO",
    labelPosition: { x: 400, y: 70 },
  },
  zones: [
    {
      kind: "seated",
      id: "platea",
      tierId: "platea",
      name: "Platea",
      shape: "M180 140 H620 V360 H180 Z",
      labelPosition: { x: 400, y: 250 },
      rows: buildRows({
        zoneId: "platea",
        rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
        seatsPerRow: 16,
        spacing: SPACING,
        statusOf: (r, n) => ((r * 7 + n) % 6 === 0 ? "sold" : (r + n) % 9 === 0 ? "reserved" : "available"),
      }),
    },
    {
      kind: "seated",
      id: "palco",
      tierId: "palco",
      name: "Palco",
      shape: "M140 380 H660 V450 H140 Z",
      labelPosition: { x: 400, y: 415 },
      rows: buildRows({
        zoneId: "palco",
        rowLabels: ["A", "B", "C"],
        seatsPerRow: 10,
        spacing: SPACING,
        statusOf: (r, n) => ((r + n) % 4 === 0 ? "sold" : (r * 2 + n) % 7 === 0 ? "reserved" : "available"),
      }),
    },
    {
      kind: "seated",
      id: "galeria",
      tierId: "galeria",
      name: "Galería",
      shape: "M100 470 H700 V550 H100 Z",
      labelPosition: { x: 400, y: 510 },
      rows: buildRows({
        zoneId: "galeria",
        rowLabels: ["A", "B", "C", "D"],
        seatsPerRow: 20,
        spacing: SPACING,
        statusOf: (r, n) => ((r * 5 + n) % 8 === 0 ? "sold" : (r + n) % 11 === 0 ? "reserved" : "available"),
      }),
    },
  ],
};

export const venueMaps: Record<string, VenueMap> = {
  "noches-de-rock-lima": estadioNacional,
  "romeo-y-julieta-teatro-municipal": teatroMunicipal,
};
