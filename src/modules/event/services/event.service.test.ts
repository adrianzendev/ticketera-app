import { describe, expect, it } from "vitest";
import { eventService } from "@/modules/event/services/event.service";
import { eventDetailSchema } from "@/modules/event/schemas/event.schema";
import { events } from "@/modules/event/data/events.mock";

const time = (iso: string) => Date.parse(iso);

describe("eventService.list", () => {
  it("AC-6: devuelve los 9 eventos en orden ascendente de startDate", () => {
    const list = eventService.list();
    expect(list).toHaveLength(9);
    for (let i = 1; i < list.length; i++) {
      expect(time(list[i - 1].startDate)).toBeLessThanOrEqual(time(list[i].startDate));
    }
  });

  it("AC-6: devuelve un array nuevo en cada llamada", () => {
    const first = eventService.list();
    first.pop();
    first.reverse();
    const second = eventService.list();
    expect(second).not.toBe(first);
    expect(second).toHaveLength(9);
    expect(time(second[0].startDate)).toBeLessThanOrEqual(time(second[1].startDate));
  });
});

describe("eventService.getBySlug", () => {
  it("AC-6: devuelve un EventDetail válido con los campos base del mock", () => {
    const base = events[0];
    const detail = eventService.getBySlug(base.slug);
    expect(detail).not.toBeNull();
    expect(() => eventDetailSchema.parse(detail)).not.toThrow();
    expect(detail).toMatchObject(base);
  });

  it("AC-6: devuelve null para un slug inexistente", () => {
    expect(eventService.getBySlug("no-existe")).toBeNull();
  });
});

describe("eventService.getRelated", () => {
  it("AC-7: nunca incluye el evento consultado", () => {
    for (const event of events) {
      expect(eventService.getRelated(event.slug, 20).map((e) => e.slug)).not.toContain(event.slug);
    }
  });

  it("AC-7: primero la misma categoría y luego el resto, ambos por fecha ascendente", () => {
    const current = events.find((e) => e.slug === "noches-de-rock-lima")!;
    const related = eventService.getRelated(current.slug, 20);
    expect(related).toHaveLength(8);
    const firstOther = related.findIndex((e) => e.categorySlug !== current.categorySlug);
    const same = related.slice(0, firstOther);
    const rest = related.slice(firstOther);
    expect(same.every((e) => e.categorySlug === current.categorySlug)).toBe(true);
    expect(rest.every((e) => e.categorySlug !== current.categorySlug)).toBe(true);
    for (const group of [same, rest]) {
      for (let i = 1; i < group.length; i++) {
        expect(time(group[i - 1].startDate)).toBeLessThanOrEqual(time(group[i].startDate));
      }
    }
  });

  it("AC-7: respeta limit y usa 4 por defecto", () => {
    expect(eventService.getRelated("noches-de-rock-lima")).toHaveLength(4);
    expect(eventService.getRelated("noches-de-rock-lima", 2)).toHaveLength(2);
  });

  it("AC-7: getRelated('noches-de-rock-lima')[0] es sinfonica-nacional-en-vivo", () => {
    expect(eventService.getRelated("noches-de-rock-lima")[0].slug).toBe("sinfonica-nacional-en-vivo");
  });

  it("AC-7: devuelve [] si el slug no existe", () => {
    expect(eventService.getRelated("no-existe")).toEqual([]);
  });
});
