import { describe, expect, it } from "vitest";

import { EMPTY_EVENT_VALUES, type EventFormData } from "../schemas/event-form.schema";
import { organizerEventSchema } from "../schemas/organizer-event.schema";
import {
  COVER_IMAGE_MAX_BYTES,
  buildOrganizerEvent,
  getCoverImageError,
  getEventFormPreview,
  readFileAsDataUrl,
} from "./event-form.service";

describe("getCoverImageError", () => {
  it("AC-19: rechaza tipos no permitidos", () => {
    expect(getCoverImageError({ type: "image/gif", size: 100 })).toBe(
      "Sube una imagen JPG o PNG.",
    );
  });

  it("AC-19: rechaza imágenes de más de 1 MB", () => {
    expect(getCoverImageError({ type: "image/png", size: COVER_IMAGE_MAX_BYTES + 1 })).toBe(
      "La imagen debe pesar como máximo 1 MB.",
    );
  });

  it("AC-19: acepta JPG y PNG de hasta 1 MB", () => {
    expect(getCoverImageError({ type: "image/jpeg", size: COVER_IMAGE_MAX_BYTES })).toBeNull();
    expect(getCoverImageError({ type: "image/png", size: 10 })).toBeNull();
  });

  it("AC-19: el tipo se revisa antes que el peso", () => {
    expect(getCoverImageError({ type: "image/svg+xml", size: COVER_IMAGE_MAX_BYTES * 2 })).toBe(
      "Sube una imagen JPG o PNG.",
    );
  });
});

describe("readFileAsDataUrl", () => {
  it("AC-19: devuelve un data URL", async () => {
    const blob = new Blob(["hola"], { type: "image/png" });
    await expect(readFileAsDataUrl(blob)).resolves.toMatch(/^data:image\/png;base64,/);
  });
});

describe("getEventFormPreview", () => {
  it("AC-20: valores vacíos", () => {
    expect(getEventFormPreview(EMPTY_EVENT_VALUES)).toEqual({
      categoryName: "Conciertos",
      title: null,
      place: null,
      day: null,
      month: null,
      minPrice: null,
      capacity: 0,
    });
  });

  it("AC-20: completa con lo que haya", () => {
    const preview = getEventFormPreview({
      ...EMPTY_EVENT_VALUES,
      categorySlug: "teatro",
      name: "  Romeo y Julieta ",
      venueName: " ",
      city: " Arequipa ",
      date: "2026-11-14",
      tiers: [
        { key: "1", name: "", price: "120", capacity: "6000" },
        { key: "2", name: "", price: "45,5", capacity: "x" },
      ],
    });
    expect(preview).toEqual({
      categoryName: "Teatro",
      title: "Romeo y Julieta",
      place: "Arequipa",
      day: "14",
      month: "NOV",
      minPrice: 45.5,
      capacity: 6000,
    });
  });

  it("AC-20: lugar y ciudad unidos, categoría desconocida y fecha inválida", () => {
    const preview = getEventFormPreview({
      ...EMPTY_EVENT_VALUES,
      categorySlug: "otra",
      venueName: "Estadio Nacional",
      city: "Lima",
      date: "2026-02-30",
    });
    expect(preview.categoryName).toBe("");
    expect(preview.place).toBe("Estadio Nacional · Lima");
    expect(preview.day).toBeNull();
    expect(preview.month).toBeNull();
  });
});

describe("buildOrganizerEvent", () => {
  const data: EventFormData = {
    title: "Festival de verano",
    categorySlug: "festivales",
    description: "Un festival con bandas nacionales.",
    startDate: "2026-11-14T21:00:00-05:00",
    venueName: "Estadio Nacional",
    city: "Lima",
    imageUrl: null,
    tiers: [
      { name: "General", price: 45.5, capacity: 1500 },
      { name: "VIP", price: 120, capacity: 300 },
    ],
  };

  it("AC-21: construye un evento válido con ids de tier y vendidas en 0", () => {
    const event = buildOrganizerEvent(data, "draft", {
      now: new Date("2026-09-29T17:00:00.000Z"),
      generateId: () => "org-test",
    });
    expect(organizerEventSchema.parse(event)).toEqual(event);
    expect(event).toEqual({
      id: "org-test",
      ...data,
      status: "draft",
      createdAt: "2026-09-29T17:00:00.000Z",
      tiers: [
        { id: "org-test-tier-1", name: "General", price: 45.5, capacity: 1500, sold: 0 },
        { id: "org-test-tier-2", name: "VIP", price: 120, capacity: 300, sold: 0 },
      ],
    });
  });

  it("AC-21: genera un id org- por defecto", () => {
    const event = buildOrganizerEvent(data, "published");
    expect(event.id).toMatch(/^org-.+/);
    expect(event.status).toBe("published");
    expect(organizerEventSchema.safeParse(event).success).toBe(true);
  });
});
