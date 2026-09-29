import { normalizeEmail } from "@/lib/validation";
import { DEMO_ORDERS } from "@/modules/order/data/orders.mock";
import type { Order } from "@/modules/order/schemas/order.schema";

export type OrderTicket = {
  index: number;
  code: string;
  zone: string;
  seatLabel: string | null;
  seed: number;
};

export type OrdersByDate = { upcoming: Order[]; past: Order[] };

// Con index 0 coincide con la semilla del QR de la confirmación.
export function getTicketSeed(orderId: string, index: number): number {
  return Number(orderId.slice(3)) + index * 13;
}

export function getOrderTickets(order: Order): OrderTicket[] {
  const tickets: OrderTicket[] = [];
  for (const line of order.lines) {
    for (let i = 0; i < line.qty; i++) {
      const index = tickets.length;
      tickets.push({
        index,
        code: `${order.id}-${String(index + 1).padStart(2, "0")}`,
        zone: line.name,
        seatLabel: line.seatLabels[i] ?? null,
        seed: getTicketSeed(order.id, index),
      });
    }
  }
  return tickets;
}

// Los pedidos de la sesión no se filtran por correo: Order no tiene id de usuario (ver spec 006).
export function getUserOrders(
  email: string,
  sessionOrders: Record<string, Order>,
  mockOrders: ReadonlyArray<Order> = DEMO_ORDERS,
): Order[] {
  const normalized = normalizeEmail(email);
  const byId = new Map<string, Order>();
  for (const order of mockOrders) {
    if (order.buyer.email === normalized) byId.set(order.id, order);
  }
  for (const order of Object.values(sessionOrders)) {
    byId.set(order.id, order);
  }
  return [...byId.values()];
}

function getStartTime(order: Order): number {
  return new Date(order.event.startDate).getTime();
}

export function splitOrdersByDate(orders: ReadonlyArray<Order>, now: Date): OrdersByDate {
  const nowTime = now.getTime();
  const upcoming = orders
    .filter((order) => getStartTime(order) >= nowTime)
    .sort((a, b) => getStartTime(a) - getStartTime(b));
  const past = orders
    .filter((order) => getStartTime(order) < nowTime)
    .sort((a, b) => getStartTime(b) - getStartTime(a));
  return { upcoming, past };
}

export const ticketService = {
  getUserOrders(
    email: string,
    sessionOrders: Record<string, Order>,
    now: Date = new Date(),
  ): OrdersByDate {
    return splitOrdersByDate(getUserOrders(email, sessionOrders), now);
  },
};
