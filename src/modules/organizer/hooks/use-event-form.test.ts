import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_EVENT_VALUES, MAX_TIERS, type EventFormValues } from "../schemas/event-form.schema";
import { useEventForm } from "./use-event-form";

const NOW = new Date("2026-09-29T12:00:00-05:00");

const VALID_VALUES: EventFormValues = {
  name: " Festival de verano ",
  categorySlug: "festivales",
  description: "Un festival con bandas nacionales e internacionales.",
  date: "2026-11-14",
  time: "21:00",
  venueName: "Estadio Nacional",
  city: "Lima",
  imageUrl: null,
  tiers: [
    { key: "1", name: "General", price: "45,50", capacity: "1500" },
    { key: "2", name: "VIP", price: "120", capacity: "300" },
  ],
};

function renderForm(initialValues: EventFormValues = EMPTY_EVENT_VALUES) {
  return renderHook(() => useEventForm({ initialValues, now: () => NOW }));
}

describe("useEventForm", () => {
  it("AC-22: arranca sin errores visibles y llama a now una sola vez", () => {
    const now = vi.fn(() => NOW);
    const { result, rerender } = renderHook(() => useEventForm({ now }));
    rerender();
    expect(result.current.errors).toEqual({ fields: {}, tiers: {} });
    expect(result.current.values).toEqual(EMPTY_EVENT_VALUES);
    expect(now).toHaveBeenCalledTimes(1);
  });

  it("AC-22: blurField muestra solo el error de ese campo y setField válido lo quita", () => {
    const { result } = renderForm();
    act(() => result.current.blurField("name"));
    expect(result.current.errors).toEqual({
      fields: { name: "Ingresa el nombre del evento." },
      tiers: {},
    });
    act(() => result.current.setField("name", "Festival de verano"));
    expect(result.current.errors).toEqual({ fields: {}, tiers: {} });
    expect(result.current.values.name).toBe("Festival de verano");
  });

  it("AC-22: setField acepta la imagen", () => {
    const { result } = renderForm();
    act(() => result.current.setField("imageUrl", "data:image/png;base64,iVBORw0KGgo="));
    expect(result.current.values.imageUrl).toBe("data:image/png;base64,iVBORw0KGgo=");
  });

  it("AC-22: blurTierField muestra el error de ese tier y setTierField lo corrige", () => {
    const { result } = renderForm();
    act(() => result.current.blurTierField("2", "price"));
    expect(result.current.errors).toEqual({
      fields: {},
      tiers: { "2": { price: "Ingresa el precio." } },
    });
    act(() => result.current.setTierField("2", "price", "45"));
    expect(result.current.values.tiers[1].price).toBe("45");
    expect(result.current.errors).toEqual({ fields: {}, tiers: {} });
  });

  it("AC-22: addTier devuelve keys nuevas sin repetir tras quitar", () => {
    const { result } = renderForm();
    let key: string | null = null;
    act(() => {
      key = result.current.addTier();
    });
    expect(key).toBe("3");
    act(() => result.current.removeTier("3"));
    act(() => {
      key = result.current.addTier();
    });
    expect(key).toBe("4");
    expect(result.current.values.tiers.map((tier) => tier.key)).toEqual(["1", "2", "4"]);
  });

  it("AC-22: con 10 tiers addTier devuelve null", () => {
    const { result } = renderForm();
    act(() => {
      for (let i = 2; i < MAX_TIERS; i++) result.current.addTier();
    });
    expect(result.current.values.tiers).toHaveLength(MAX_TIERS);
    expect(result.current.canAddTier).toBe(false);
    let key: string | null = "x";
    act(() => {
      key = result.current.addTier();
    });
    expect(key).toBeNull();
    expect(result.current.values.tiers).toHaveLength(MAX_TIERS);
  });

  it("AC-22: removeTier no hace nada con 1 tier", () => {
    const { result } = renderForm();
    act(() => result.current.removeTier("1"));
    expect(result.current.canRemoveTier).toBe(false);
    act(() => result.current.removeTier("2"));
    expect(result.current.values.tiers.map((tier) => tier.key)).toEqual(["2"]);
    expect(result.current.canRemoveTier).toBe(false);
  });

  it("AC-22: removeTier quita las claves tocadas del tier eliminado", () => {
    const { result } = renderForm();
    act(() => {
      result.current.blurTierField("1", "name");
      result.current.blurTierField("2", "name");
    });
    expect(Object.keys(result.current.errors.tiers)).toEqual(["1", "2"]);
    act(() => result.current.removeTier("2"));
    expect(Object.keys(result.current.errors.tiers)).toEqual(["1"]);
    let key: string | null = null;
    act(() => {
      key = result.current.addTier();
    });
    expect(key).toBe("3");
    expect(result.current.errors.tiers["3"]).toBeUndefined();
  });

  it("AC-22: validate inválido devuelve el primer id y muestra todos los errores", () => {
    const { result } = renderForm({
      ...VALID_VALUES,
      city: "",
      tiers: [{ key: "1", name: "General", price: "", capacity: "10" }],
    });
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({ success: false, firstInvalidId: "event-city" });
    expect(result.current.errors).toEqual({
      fields: { city: "Ingresa la ciudad." },
      tiers: { "1": { price: "Ingresa el precio." } },
    });
  });

  it("AC-22: validate válido devuelve los datos transformados", () => {
    const { result } = renderForm(VALID_VALUES);
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({
      success: true,
      data: {
        title: "Festival de verano",
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
      },
    });
  });

  it("AC-22: las funciones son estables entre renders", () => {
    const { result } = renderForm();
    const first = result.current;
    act(() => {
      result.current.setField("name", "Otro");
      result.current.addTier();
    });
    const second = result.current;
    expect(second.setField).toBe(first.setField);
    expect(second.blurField).toBe(first.blurField);
    expect(second.setTierField).toBe(first.setTierField);
    expect(second.blurTierField).toBe(first.blurTierField);
    expect(second.addTier).toBe(first.addTier);
    expect(second.removeTier).toBe(first.removeTier);
  });
});
