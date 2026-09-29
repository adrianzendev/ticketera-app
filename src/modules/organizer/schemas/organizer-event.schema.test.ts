import { describe, expect, it } from "vitest";

import {
  isAllowedOrganizerImageUrl,
  organizerEventSchema,
  type OrganizerEvent,
} from "@/modules/organizer/schemas/organizer-event.schema";

const validEvent: OrganizerEvent = {
  id: "org-evt-test",
  title: "Evento de prueba",
  categorySlug: "conciertos",
  description: "Una descripción suficientemente larga.",
  venueName: "Estadio Nacional",
  city: "Lima",
  startDate: "2026-11-14T21:00:00-05:00",
  imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
  status: "published",
  tiers: [{ id: "org-evt-test-general", name: "General", price: 45.5, capacity: 100, sold: 10 }],
  createdAt: "2026-09-29T17:00:00.000Z",
};

describe("isAllowedOrganizerImageUrl", () => {
  it.each([
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    "data:image/png;base64,iVBORw0KGgo=",
    "data:image/jpeg;base64,/9j/4AAQ",
  ])("AC-1: acepta %s", (value) => {
    expect(isAllowedOrganizerImageUrl(value)).toBe(true);
  });

  it.each([
    "http://images.unsplash.com/x",
    "https://evil.com/a.png",
    "javascript:alert(1)",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "",
  ])("AC-1: rechaza %j", (value) => {
    expect(isAllowedOrganizerImageUrl(value)).toBe(false);
  });
});

describe("organizerEventSchema", () => {
  it("AC-1: acepta un evento válido", () => {
    expect(organizerEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("AC-1: acepta imageUrl null", () => {
    expect(organizerEventSchema.safeParse({ ...validEvent, imageUrl: null }).success).toBe(true);
  });

  it("AC-1: rechaza una imageUrl no permitida", () => {
    expect(
      organizerEventSchema.safeParse({ ...validEvent, imageUrl: "https://evil.com/a.png" }).success,
    ).toBe(false);
  });

  it("AC-1: rechaza un tier con sold > capacity", () => {
    const tiers = [{ ...validEvent.tiers[0], sold: 101 }];
    const result = organizerEventSchema.safeParse({ ...validEvent, tiers });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["tiers", 0, "sold"]);
  });

  it("AC-1: rechaza tiers vacío", () => {
    expect(organizerEventSchema.safeParse({ ...validEvent, tiers: [] }).success).toBe(false);
  });

  it("AC-1: rechaza capacity 0", () => {
    const tiers = [{ ...validEvent.tiers[0], capacity: 0, sold: 0 }];
    expect(organizerEventSchema.safeParse({ ...validEvent, tiers }).success).toBe(false);
  });

  it("AC-1: rechaza price negativo", () => {
    const tiers = [{ ...validEvent.tiers[0], price: -1 }];
    expect(organizerEventSchema.safeParse({ ...validEvent, tiers }).success).toBe(false);
  });

  it("AC-1: rechaza status desconocido", () => {
    expect(organizerEventSchema.safeParse({ ...validEvent, status: "ended" }).success).toBe(false);
  });

  it("AC-1: rechaza startDate sin offset", () => {
    expect(
      organizerEventSchema.safeParse({ ...validEvent, startDate: "2026-11-14T21:00:00" }).success,
    ).toBe(false);
  });
});
