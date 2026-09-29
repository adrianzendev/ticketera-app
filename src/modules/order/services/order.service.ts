import type { EventDetail, TicketTier } from "@/modules/event/schemas/event.schema";
import { categories } from "@/modules/event/data/categories.mock";
import { checkoutSchema, type CheckoutFormValues } from "@/modules/order/schemas/checkout.schema";
import { orderSchema, type Order, type OrderLine } from "@/modules/order/schemas/order.schema";
import {
  getCartCount,
  getCartLines,
  getCartTotal,
  useCartStore,
  type CartItems,
} from "@/modules/order/store/cart.store";
import { useOrderStore } from "@/modules/order/store/order.store";
import type { VenueMap } from "@/modules/venue/schemas/venue.schema";
import { findSeat, formatSeatLabel, venueService } from "@/modules/venue/services/venue.service";

export const SIMULATED_PAYMENT_DELAY_MS = 1200;
export const ORDER_ID_MAX_ATTEMPTS = 10;

export function generateOrderId(random: () => number = Math.random): string {
  return `TK-${10000 + Math.floor(random() * 90000)}`;
}

function getSeatLabels(venueMap: VenueMap | null, seatIds: string[]): string[] {
  if (!venueMap) return [];
  return seatIds.flatMap((seatId) => {
    const found = findSeat(venueMap, seatId);
    return found ? [formatSeatLabel(found.row.label, found.seat.number)] : [];
  });
}

export function getOrderLines(
  items: CartItems,
  tiers: TicketTier[],
  venueMap: VenueMap | null,
): OrderLine[] {
  return getCartLines(items, tiers).map((line) => ({
    ...line,
    seatLabels: getSeatLabels(venueMap, line.seatIds),
  }));
}

export type CreateOrderInput = { event: EventDetail; values: CheckoutFormValues };
export type CreateOrderOptions = { delayMs?: number; random?: () => number; now?: () => Date };

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function generateUniqueOrderId(existing: Record<string, Order>, random: () => number): string {
  for (let attempt = 0; attempt < ORDER_ID_MAX_ATTEMPTS; attempt++) {
    const id = generateOrderId(random);
    if (!Object.hasOwn(existing, id)) return id;
  }
  throw new Error("ORDER_ID_COLLISION");
}

export const orderService = {
  async create(
    { event, values }: CreateOrderInput,
    {
      delayMs = SIMULATED_PAYMENT_DELAY_MS,
      random = Math.random,
      now = () => new Date(),
    }: CreateOrderOptions = {},
  ): Promise<Order> {
    const data = checkoutSchema.parse(values);

    const { eventSlug, standing, seated } = useCartStore.getState();
    const cart: CartItems = { standing, seated };
    if (eventSlug !== event.slug || getCartCount(cart) === 0) throw new Error("CART_EMPTY");

    await wait(delayMs);

    // Sin rehidratar, addOrder pisaría en sessionStorage los pedidos de compras anteriores.
    await useOrderStore.persist.rehydrate();

    const id = generateUniqueOrderId(useOrderStore.getState().orders, random);

    const order = orderSchema.parse({
      id,
      createdAt: now().toISOString(),
      event: {
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        categoryName:
          categories.find((c) => c.slug === event.categorySlug)?.name ?? event.categorySlug,
        venueName: event.venueName,
        city: event.city,
        startDate: event.startDate,
      },
      lines: getOrderLines(cart, event.tiers, venueService.getByEventSlug(event.slug)),
      count: getCartCount(cart),
      total: getCartTotal(cart, event.tiers),
      buyer: {
        fullName: data.fullName,
        email: data.email,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        phone: data.phone,
      },
      paymentMethod: data.paymentMethod,
      cardLast4: data.paymentMethod === "card" ? data.cardNumber.slice(-4) : null,
    } satisfies Order);

    useOrderStore.getState().addOrder(order);
    useCartStore.getState().clear();
    return order;
  },

  getById(id: string): Order | null {
    const { orders } = useOrderStore.getState();
    return Object.hasOwn(orders, id) ? orders[id] : null;
  },
};
