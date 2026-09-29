import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ORGANIZER_EVENTS } from "@/modules/organizer/data/organizer-events.mock";
import type { OrganizerEvent } from "@/modules/organizer/schemas/organizer-event.schema";
import {
  ORGANIZER_EVENTS_STORAGE_KEY,
  useOrganizerEventStore,
} from "@/modules/organizer/store/organizer-event.store";

const baseEvent = ORGANIZER_EVENTS[3];

function createdEvent(id: string): OrganizerEvent {
  return { ...baseEvent, id, createdAt: "2026-09-29T17:00:00.000Z" };
}

function storedState(): unknown {
  const raw = sessionStorage.getItem(ORGANIZER_EVENTS_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

beforeEach(() => {
  useOrganizerEventStore.setState({ events: [] });
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOrganizerEventStore", () => {
  it("AC-14: arranca sin eventos", () => {
    expect(useOrganizerEventStore.getState().events).toEqual([]);
  });

  it("AC-14: addEvent agrega al final y persiste solo events en sessionStorage", () => {
    const first = createdEvent("org-1");
    const second = createdEvent("org-2");

    useOrganizerEventStore.getState().addEvent(first);
    useOrganizerEventStore.getState().addEvent(second);

    expect(useOrganizerEventStore.getState().events).toEqual([first, second]);
    expect(storedState()).toEqual({ state: { events: [first, second] }, version: 1 });
  });

  it("AC-14: rehydrate restaura un evento válido", async () => {
    const event = createdEvent("org-1");
    sessionStorage.setItem(
      ORGANIZER_EVENTS_STORAGE_KEY,
      JSON.stringify({ state: { events: [event] }, version: 1 }),
    );

    await useOrganizerEventStore.persist.rehydrate();

    expect(useOrganizerEventStore.getState().events).toEqual([event]);
  });

  it("AC-14: rehydrate con JSON corrupto no lanza y deja events vacío", async () => {
    sessionStorage.setItem(ORGANIZER_EVENTS_STORAGE_KEY, "{no es json");

    await expect(useOrganizerEventStore.persist.rehydrate()).resolves.not.toThrow();

    expect(useOrganizerEventStore.getState().events).toEqual([]);
  });

  it("AC-14: rehydrate con otra forma deja events vacío", async () => {
    useOrganizerEventStore.setState({ events: [createdEvent("org-previo")] });
    sessionStorage.setItem(
      ORGANIZER_EVENTS_STORAGE_KEY,
      JSON.stringify({
        state: { events: [{ ...createdEvent("org-1"), imageUrl: "javascript:alert(1)" }] },
        version: 1,
      }),
    );

    await useOrganizerEventStore.persist.rehydrate();

    expect(useOrganizerEventStore.getState().events).toEqual([]);
  });

  it("AC-14: si sessionStorage.setItem lanza, addEvent no lanza y el evento queda en memoria", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    });
    const event = createdEvent("org-1");

    expect(() => useOrganizerEventStore.getState().addEvent(event)).not.toThrow();
    expect(useOrganizerEventStore.getState().events).toEqual([event]);
  });
});
