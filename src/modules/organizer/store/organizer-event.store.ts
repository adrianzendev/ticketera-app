import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import {
  organizerEventSchema,
  type OrganizerEvent,
} from "@/modules/organizer/schemas/organizer-event.schema";

// Los eventos creados viven en sessionStorage, como el carrito y los pedidos: es una demo por
// pestaña, sin backend.
export const ORGANIZER_EVENTS_STORAGE_KEY = "ticketera-organizer-events";

export type OrganizerEventState = {
  events: OrganizerEvent[];
  addEvent: (event: OrganizerEvent) => void;
};

const persistedEventsSchema = z.array(organizerEventSchema).catch([]);

// Las portadas son data URLs de hasta 1 MB y pueden llenar la cuota de sessionStorage: si
// setItem lanza, se ignora y el evento queda solo en memoria en vez de romper el guardado.
const safeSessionStorage: StateStorage = {
  getItem: (name) => sessionStorage.getItem(name),
  setItem: (name, value) => {
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // Cuota llena: el estado en memoria sigue siendo válido.
    }
  },
  removeItem: (name) => sessionStorage.removeItem(name),
};

export const useOrganizerEventStore = create<OrganizerEventState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
    }),
    {
      name: ORGANIZER_EVENTS_STORAGE_KEY,
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: ({ events }) => ({ events }),
      version: 1,
      merge: (persisted, current) => ({
        ...current,
        events: persistedEventsSchema.parse(
          (persisted as { events?: unknown } | undefined)?.events,
        ),
      }),
      // La rehidratación la dispara el cliente al montar, para no romper la hidratación SSR.
      skipHydration: true,
    },
  ),
);
