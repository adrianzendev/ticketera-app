import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TicketTier } from "@/modules/event/schemas/event.schema";

export const MAX_TICKETS_PER_ZONE = 6;
export const CART_STORAGE_KEY = "ticketera-cart";

export type CartItems = {
  standing: Record<string, number>;
  seated: Record<string, string[]>;
};

export type CartState = CartItems & {
  eventSlug: string | null;
  setEvent: (slug: string) => void;
  increment: (tierId: string) => void;
  decrement: (tierId: string) => void;
  toggleSeat: (tierId: string, seatId: string) => void;
  clear: () => void;
};

export type CartLine = {
  tierId: string;
  name: string;
  unitPrice: number;
  qty: number;
  seatIds: string[];
  amount: number;
};

function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const rest = { ...record };
  delete rest[key];
  return rest;
}

const emptyItems = (): CartItems => ({ standing: {}, seated: {} });

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      eventSlug: null,
      ...emptyItems(),
      setEvent: (slug) =>
        set((s) => (s.eventSlug === slug ? s : { eventSlug: slug, ...emptyItems() })),
      increment: (tierId) =>
        set((s) => {
          const qty = s.standing[tierId] ?? 0;
          if (qty >= MAX_TICKETS_PER_ZONE) return s;
          return { standing: { ...s.standing, [tierId]: qty + 1 } };
        }),
      decrement: (tierId) =>
        set((s) => {
          const qty = s.standing[tierId];
          if (qty === undefined) return s;
          return {
            standing:
              qty <= 1 ? omitKey(s.standing, tierId) : { ...s.standing, [tierId]: qty - 1 },
          };
        }),
      toggleSeat: (tierId, seatId) =>
        set((s) => {
          const seatIds = s.seated[tierId] ?? [];
          if (seatIds.includes(seatId)) {
            const next = seatIds.filter((id) => id !== seatId);
            return {
              seated: next.length ? { ...s.seated, [tierId]: next } : omitKey(s.seated, tierId),
            };
          }
          if (seatIds.length >= MAX_TICKETS_PER_ZONE) return s;
          return { seated: { ...s.seated, [tierId]: [...seatIds, seatId] } };
        }),
      clear: () => set(emptyItems()),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ eventSlug, standing, seated }) => ({ eventSlug, standing, seated }),
      version: 1,
      // La rehidratación la dispara el cliente al montar, para no romper la hidratación SSR.
      skipHydration: true,
    }
  )
);

export function getTierCount(items: CartItems, tierId: string): number {
  return items.standing[tierId] ?? items.seated[tierId]?.length ?? 0;
}

export function getCartCount(items: CartItems): number {
  const standing = Object.values(items.standing).reduce((sum, qty) => sum + qty, 0);
  const seated = Object.values(items.seated).reduce((sum, ids) => sum + ids.length, 0);
  return standing + seated;
}

export function getCartLines(items: CartItems, tiers: TicketTier[]): CartLine[] {
  return tiers.flatMap((tier) => {
    const seatIds = items.seated[tier.id] ?? [];
    const qty = items.standing[tier.id] ?? seatIds.length;
    if (qty <= 0) return [];
    return [
      {
        tierId: tier.id,
        name: tier.name,
        unitPrice: tier.price,
        qty,
        seatIds: items.standing[tier.id] !== undefined ? [] : seatIds,
        amount: tier.price * qty,
      },
    ];
  });
}

export function getCartTotal(items: CartItems, tiers: TicketTier[]): number {
  return getCartLines(items, tiers).reduce((sum, line) => sum + line.amount, 0);
}

export function formatTicketCount(count: number): string {
  return `${count} ${count === 1 ? "entrada" : "entradas"}`;
}
