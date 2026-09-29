import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Order } from "@/modules/order/schemas/order.schema";

export const ORDERS_STORAGE_KEY = "ticketera-orders";

export type OrderState = {
  orders: Record<string, Order>;
  addOrder: (order: Order) => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: {},
      addOrder: (order) => set((s) => ({ orders: { ...s.orders, [order.id]: order } })),
    }),
    {
      name: ORDERS_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ orders }) => ({ orders }),
      version: 1,
      // La rehidratación la dispara el cliente al montar, para no romper la hidratación SSR.
      skipHydration: true,
    },
  ),
);
