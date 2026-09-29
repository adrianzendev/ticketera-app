import { describe, expect, it } from "vitest";

import {
  EMPTY_EVENT_VALUES,
  EVENT_FIELDS,
  MAX_TIERS,
  TIER_FIELDS,
  createEmptyTier,
  createEventFormSchema,
  getEventFieldId,
  getEventFormErrors,
  getFirstInvalidFieldId,
  getTierFieldId,
  parseTierCapacity,
  parseTierPrice,
  toStartDate,
  type EventFormValues,
  type TierFormValues,
} from "./event-form.schema";

const NOW = new Date("2026-09-29T12:00:00-05:00");

const VALID_VALUES: EventFormValues = {
  name: "  Festival de verano 2026 ",
  categorySlug: "festivales",
  description: "  Un festival con bandas nacionales e internacionales.  ",
  date: "2026-11-14",
  time: "21:00",
  venueName: " Estadio Nacional ",
  city: " Lima ",
  imageUrl: null,
  tiers: [
    { key: "1", name: " General ", price: "45,50", capacity: "1500" },
    { key: "2", name: "VIP", price: "120", capacity: "300" },
  ],
};

function withValues(overrides: Partial<EventFormValues>): EventFormValues {
  return { ...VALID_VALUES, ...overrides };
}

function withTier(index: number, overrides: Partial<TierFormValues>): EventFormValues {
  return {
    ...VALID_VALUES,
    tiers: VALID_VALUES.tiers.map((tier, i) => (i === index ? { ...tier, ...overrides } : tier)),
  };
}

function fieldErrors(values: EventFormValues) {
  return getEventFormErrors(values, NOW).fields;
}

function tierErrors(values: EventFormValues, key: string) {
  return getEventFormErrors(values, NOW).tiers[key] ?? {};
}

describe("constantes", () => {
  it("AC-15: orden de campos, tiers y valores vacíos", () => {
    expect(EVENT_FIELDS).toEqual([
      "name",
      "categorySlug",
      "description",
      "date",
      "time",
      "venueName",
      "city",
    ]);
    expect(TIER_FIELDS).toEqual(["name", "price", "capacity"]);
    expect(MAX_TIERS).toBe(10);
    expect(createEmptyTier("7")).toEqual({ key: "7", name: "", price: "", capacity: "" });
    expect(EMPTY_EVENT_VALUES).toEqual({
      name: "",
      categorySlug: "conciertos",
      description: "",
      date: "",
      time: "",
      venueName: "",
      city: "",
      imageUrl: null,
      tiers: [createEmptyTier("1"), createEmptyTier("2")],
    });
  });
});

describe("parseTierPrice", () => {
  it.each([
    ["45", 45],
    ["45.5", 45.5],
    ["45,50", 45.5],
    ["0", 0],
    [" 12 ", 12],
  ])("AC-15: %j → %s", (input, expected) => {
    expect(parseTierPrice(input)).toBe(expected);
  });

  it.each(["", "-1", "abc", "45.123", "1e3"])("AC-15: %j → null", (input) => {
    expect(parseTierPrice(input)).toBeNull();
  });
});

describe("parseTierCapacity", () => {
  it("AC-15: acepta enteros positivos", () => {
    expect(parseTierCapacity("1500")).toBe(1500);
  });

  it.each(["", "0", "1.5", "-3"])("AC-15: %j → null", (input) => {
    expect(parseTierCapacity(input)).toBeNull();
  });
});

describe("toStartDate", () => {
  it("AC-15: arma la fecha ISO en hora de Lima", () => {
    expect(toStartDate("2026-11-14", "21:00")).toBe("2026-11-14T21:00:00-05:00");
  });

  it.each([
    ["2026-02-30", "21:00"],
    ["2026-13-01", "21:00"],
    ["14/11/2026", "21:00"],
    ["", "21:00"],
    ["2026-11-14", "24:00"],
    ["2026-11-14", "9:00"],
    ["2026-11-14", ""],
  ])("AC-15: %j %j → null", (date, time) => {
    expect(toStartDate(date, time)).toBeNull();
  });
});

describe("createEventFormSchema", () => {
  it("AC-16: valores válidos no tienen errores", () => {
    expect(getEventFormErrors(VALID_VALUES, NOW)).toEqual({ fields: {}, tiers: {} });
  });

  it("AC-16: transforma la salida", () => {
    expect(createEventFormSchema(NOW).parse(VALID_VALUES)).toEqual({
      title: "Festival de verano 2026",
      categorySlug: "festivales",
      description: "Un festival con bandas nacionales e internacionales.",
      startDate: "2026-11-14T21:00:00-05:00",
      venueName: "Estadio Nacional",
      city: "Lima",
      imageUrl: null,
      tiers: [
        { name: "General", price: 45.5, capacity: 1500 },
        { name: "VIP", price: 120, capacity: 300 },
      ],
    });
  });

  it("AC-16: conserva una imagen permitida", () => {
    const imageUrl = "data:image/png;base64,iVBORw0KGgo=";
    expect(createEventFormSchema(NOW).parse(withValues({ imageUrl })).imageUrl).toBe(imageUrl);
  });

  it("AC-16: rechaza una imagen no permitida", () => {
    const result = createEventFormSchema(NOW).safeParse(
      withValues({ imageUrl: "https://evil.com/a.png" }),
    );
    expect(result.success).toBe(false);
    expect(fieldErrors(withValues({ imageUrl: "https://evil.com/a.png" }))).toEqual({});
  });

  it.each([
    ["   ", "Ingresa el nombre del evento."],
    ["ab", "Usa entre 3 y 80 caracteres."],
    ["a".repeat(81), "Usa entre 3 y 80 caracteres."],
  ])("AC-16: nombre %j", (name, message) => {
    expect(fieldErrors(withValues({ name })).name).toBe(message);
  });

  it("AC-16: nombre de 80 caracteres es válido", () => {
    expect(fieldErrors(withValues({ name: "a".repeat(80) })).name).toBeUndefined();
  });

  it("AC-16: categoría desconocida", () => {
    expect(fieldErrors(withValues({ categorySlug: "otra" })).categorySlug).toBe(
      "Elige una categoría.",
    );
  });

  it.each([
    ["  ", "Describe tu evento."],
    ["Muy corto", "Cuéntales un poco más: al menos 20 caracteres."],
    ["a".repeat(1001), "Usa como máximo 1000 caracteres."],
  ])("AC-16: descripción %#", (description, message) => {
    expect(fieldErrors(withValues({ description })).description).toBe(message);
  });

  it.each([
    ["", "Elige la fecha del evento."],
    ["2026-02-30", "Ingresa una fecha válida."],
    ["2026/11/14", "Ingresa una fecha válida."],
  ])("AC-16: fecha %j", (date, message) => {
    expect(fieldErrors(withValues({ date })).date).toBe(message);
  });

  it.each([
    ["", "Elige la hora de inicio."],
    ["25:00", "Ingresa una hora válida."],
  ])("AC-16: hora %j", (time, message) => {
    expect(fieldErrors(withValues({ time })).time).toBe(message);
  });

  it("AC-16: fecha y hora pasadas o iguales a now", () => {
    expect(fieldErrors(withValues({ date: "2026-09-29", time: "12:00" })).date).toBe(
      "Elige una fecha y hora futuras.",
    );
    expect(fieldErrors(withValues({ date: "2026-09-28", time: "23:00" })).date).toBe(
      "Elige una fecha y hora futuras.",
    );
    expect(fieldErrors(withValues({ date: "2026-09-29", time: "12:01" })).date).toBeUndefined();
  });

  it.each([
    ["  ", "Ingresa el lugar del evento."],
    ["a".repeat(81), "Usa como máximo 80 caracteres."],
  ])("AC-16: lugar %#", (venueName, message) => {
    expect(fieldErrors(withValues({ venueName })).venueName).toBe(message);
  });

  it.each([
    ["  ", "Ingresa la ciudad."],
    ["a".repeat(61), "Usa como máximo 60 caracteres."],
  ])("AC-16: ciudad %#", (city, message) => {
    expect(fieldErrors(withValues({ city })).city).toBe(message);
  });

  it.each([
    [{ name: " " }, "name", "Ingresa el nombre."],
    [{ name: "a".repeat(41) }, "name", "Usa como máximo 40 caracteres."],
    [{ price: "" }, "price", "Ingresa el precio."],
    [{ price: "abc" }, "price", "Ingresa un monto válido, por ejemplo 45 o 45.50."],
    [{ price: "10000.01" }, "price", "El precio máximo es S/ 10,000."],
    [{ capacity: " " }, "capacity", "Ingresa la cantidad."],
    [{ capacity: "0" }, "capacity", "Ingresa una cantidad entera mayor que 0."],
    [{ capacity: "100001" }, "capacity", "La cantidad máxima es 100,000."],
  ] as const)("AC-16: tier %j", (overrides, field, message) => {
    expect(tierErrors(withTier(1, overrides), "2")[field]).toBe(message);
  });

  it("AC-16: límites de precio y cantidad son válidos", () => {
    expect(tierErrors(withTier(1, { price: "10000", capacity: "100000" }), "2")).toEqual({});
  });

  it("AC-16: nombre de tier repetido solo marca el segundo y siguientes", () => {
    const values = withValues({
      tiers: [
        { key: "1", name: "General", price: "10", capacity: "10" },
        { key: "2", name: " general ", price: "10", capacity: "10" },
        { key: "3", name: "GENERAL", price: "10", capacity: "10" },
      ],
    });
    const { tiers } = getEventFormErrors(values, NOW);
    expect(tiers["1"]).toBeUndefined();
    expect(tiers["2"]?.name).toBe("Ya usaste este nombre.");
    expect(tiers["3"]?.name).toBe("Ya usaste este nombre.");
  });

  it("AC-16: cantidad de tiers fuera de rango", () => {
    const tooFew = createEventFormSchema(NOW).safeParse(withValues({ tiers: [] }));
    const tooMany = createEventFormSchema(NOW).safeParse(
      withValues({
        tiers: Array.from({ length: MAX_TIERS + 1 }, (_, i) => ({
          key: String(i + 1),
          name: `Tipo ${i + 1}`,
          price: "10",
          capacity: "10",
        })),
      }),
    );
    for (const result of [tooFew, tooMany]) {
      expect(result.success).toBe(false);
      expect(result.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ["tiers"],
          message: "Agrega entre 1 y 10 tipos de entrada.",
        }),
      );
    }
  });
});

describe("getEventFormErrors", () => {
  it("AC-17: con valores vacíos reporta todos los errores a la vez", () => {
    const errors = getEventFormErrors(EMPTY_EVENT_VALUES, NOW);
    expect(Object.keys(errors.fields).sort()).toEqual(
      ["name", "description", "date", "time", "venueName", "city"].sort(),
    );
    expect(Object.keys(errors.tiers).sort()).toEqual(["1", "2"]);
    for (const key of ["1", "2"]) {
      expect(Object.keys(errors.tiers[key]).sort()).toEqual(["capacity", "name", "price"]);
    }
  });

  it("AC-17: agrupa errores de tier por key, no por índice", () => {
    const values = withValues({
      tiers: [
        { key: "5", name: "General", price: "10", capacity: "10" },
        { key: "9", name: "", price: "10", capacity: "10" },
      ],
    });
    expect(getEventFormErrors(values, NOW).tiers).toEqual({ "9": { name: "Ingresa el nombre." } });
  });
});

describe("ids de campos", () => {
  it("AC-18: arma los ids", () => {
    expect(getEventFieldId("name")).toBe("event-name");
    expect(getTierFieldId("1", "price")).toBe("event-tier-1-price");
  });

  it("AC-18: primer inválido con error solo en el segundo tier", () => {
    const values = withTier(1, { price: "abc", capacity: "" });
    expect(getFirstInvalidFieldId(values, getEventFormErrors(values, NOW))).toBe(
      "event-tier-2-price",
    );
  });

  it("AC-18: un error de campo gana sobre uno de tier", () => {
    const values = { ...withTier(0, { name: "" }), city: "" };
    expect(getFirstInvalidFieldId(values, getEventFormErrors(values, NOW))).toBe("event-city");
  });

  it("AC-18: sin errores devuelve null", () => {
    expect(getFirstInvalidFieldId(VALID_VALUES, getEventFormErrors(VALID_VALUES, NOW))).toBeNull();
  });
});
