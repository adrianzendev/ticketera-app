import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { ZodError } from "zod";

import { eventService } from "@/modules/event/services/event.service";
import type { CheckoutFormValues } from "@/modules/order/schemas/checkout.schema";
import { orderSchema, type Order, type OrderLine } from "@/modules/order/schemas/order.schema";
import {
  ORDER_ID_MAX_ATTEMPTS,
  generateOrderId,
  getOrderLines,
  orderService,
} from "@/modules/order/services/order.service";
import { useCartStore, type CartLine } from "@/modules/order/store/cart.store";
import { ORDERS_STORAGE_KEY, useOrderStore } from "@/modules/order/store/order.store";
import type { SeatedZone } from "@/modules/venue/schemas/venue.schema";
import { venueService } from "@/modules/venue/services/venue.service";

const SLUG = "romeo-y-julieta-teatro-municipal";
const event = eventService.getBySlug(SLUG)!;
const venueMap = venueService.getByEventSlug(SLUG)!;
const plateaZone = venueMap.zones.find((z) => z.id === "platea") as SeatedZone;
const seat = plateaZone.rows[0].seats[4];
const galeriaZone = venueMap.zones.find((z) => z.id === "galeria") as SeatedZone;
const galeriaSeatIds = galeriaZone.rows[1].seats.slice(0, 2).map((s) => s.id);
const cartItems = { standing: {}, seated: { platea: [seat.id], galeria: galeriaSeatIds } };

const NOW = new Date("2026-09-29T17:00:00.000Z");
const CARD_NUMBER = "4242424242424242";
const CVV = "731";

const values: CheckoutFormValues = {
  fullName: "Ana Pérez",
  email: "ANA@email.com",
  documentType: "DNI",
  documentNumber: "12345678",
  phone: "+51 987 654 321",
  paymentMethod: "card",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCvv: CVV,
  cardName: "ANA PEREZ",
  acceptedTerms: true,
};

const fixed = (n: number) => () => n;
const options = { delayMs: 0, random: fixed(0), now: () => NOW };

function fillCart() {
  useCartStore.setState({ eventSlug: SLUG, ...structuredClone(cartItems) });
}

function storedJson(): string {
  return sessionStorage.getItem(ORDERS_STORAGE_KEY) ?? "";
}

beforeEach(() => {
  useCartStore.setState({ eventSlug: null, standing: {}, seated: {} });
  useOrderStore.setState({ orders: {} });
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateOrderId", () => {
  it("AC-7: mapea el random a TK-10000..TK-99999", () => {
    expect(generateOrderId(() => 0)).toBe("TK-10000");
    expect(generateOrderId(() => 0.123456)).toBe("TK-21111");
    expect(generateOrderId(() => 0.99999)).toBe("TK-99999");
    expect(generateOrderId()).toMatch(/^TK-\d{5}$/);
  });
});

describe("getOrderLines", () => {
  it("AC-7: agrega etiquetas de asiento y omite ids inexistentes", () => {
    const lines = getOrderLines(
      { standing: { palco: 1 }, seated: { platea: [seat.id, "platea-Z-99"] } },
      event.tiers,
      venueMap,
    );
    const platea = lines.find((line) => line.tierId === "platea")!;
    expect(platea.seatIds).toEqual([seat.id, "platea-Z-99"]);
    expect(platea.seatLabels).toEqual([`Fila ${plateaZone.rows[0].label}, asiento ${seat.number}`]);
    expect(lines.find((line) => line.tierId === "palco")!.seatLabels).toEqual([]);
  });

  it("AC-7: sin venueMap devuelve seatLabels vacíos", () => {
    const lines = getOrderLines({ standing: {}, seated: { platea: [seat.id] } }, event.tiers, null);
    expect(lines).toHaveLength(1);
    expect(lines[0].seatLabels).toEqual([]);
  });

  it("AC-5: OrderLine es asignable a CartLine con seatLabels", () => {
    expectTypeOf<OrderLine>().toExtend<CartLine & { seatLabels: string[] }>();
  });
});

describe("orderService.create", () => {
  it("AC-8: crea el pedido con tarjeta, lo guarda y vacía el carrito", async () => {
    fillCart();
    const order = await orderService.create({ event, values }, { ...options, random: fixed(0.5) });

    const price = (id: string) => event.tiers.find((t) => t.id === id)!.price;
    expect(order.id).toBe("TK-55000");
    expect(order.createdAt).toBe(NOW.toISOString());
    expect(order.count).toBe(3);
    expect(order.total).toBe(price("platea") + price("galeria") * 2);
    expect(order.lines).toEqual(getOrderLines(cartItems, event.tiers, venueMap));
    expect(order.lines.flatMap((line) => line.seatLabels)).toHaveLength(3);
    expect(order.event).toEqual({
      slug: SLUG,
      title: event.title,
      imageUrl: event.imageUrl,
      categoryName: "Teatro",
      venueName: event.venueName,
      city: event.city,
      startDate: event.startDate,
    });
    expect(order.buyer).toEqual({
      fullName: "Ana Pérez",
      email: "ana@email.com",
      documentType: "DNI",
      documentNumber: "12345678",
      phone: "987654321",
    });
    expect(order.paymentMethod).toBe("card");
    expect(order.cardLast4).toBe("4242");
    expect(() => orderSchema.parse(order)).not.toThrow();

    expect(useOrderStore.getState().orders[order.id]).toEqual(order);
    const stored = JSON.parse(storedJson());
    expect(stored.version).toBe(1);
    expect(stored.state).toEqual({ orders: { [order.id]: order } });

    const cart = useCartStore.getState();
    expect({ eventSlug: cart.eventSlug, standing: cart.standing, seated: cart.seated }).toEqual({
      eventSlug: SLUG,
      standing: {},
      seated: {},
    });
  });

  it("AC-8: nunca guarda el número completo, el CVV ni el vencimiento", async () => {
    fillCart();
    await orderService.create({ event, values }, options);
    const json = storedJson();
    expect(json).not.toContain(CARD_NUMBER);
    expect(json).not.toContain(CVV);
    expect(json).not.toContain("12/30");
    expect(json).not.toMatch(/cardNumber|cardCvv|cardExpiry/);
  });

  it("AC-8: con yape cardLast4 es null", async () => {
    fillCart();
    const order = await orderService.create(
      { event, values: { ...values, paymentMethod: "yape", cardNumber: "" } },
      options,
    );
    expect(order.cardLast4).toBeNull();
    expect(order.paymentMethod).toBe("yape");
  });

  it("AC-8: con valores inválidos rechaza con ZodError sin guardar ni vaciar", async () => {
    fillCart();
    await expect(
      orderService.create({ event, values: { ...values, email: "x" } }, options),
    ).rejects.toBeInstanceOf(ZodError);
    expect(useOrderStore.getState().orders).toEqual({});
    expect(sessionStorage.getItem(ORDERS_STORAGE_KEY)).toBeNull();
    expect(useCartStore.getState().seated).toEqual(cartItems.seated);
  });

  it("AC-8: rechaza con CART_EMPTY si el carrito está vacío", async () => {
    useCartStore.setState({ eventSlug: SLUG, standing: {}, seated: {} });
    await expect(orderService.create({ event, values }, options)).rejects.toThrow("CART_EMPTY");
    expect(useOrderStore.getState().orders).toEqual({});
  });

  it("AC-8: rechaza con CART_EMPTY si el carrito es de otro evento", async () => {
    fillCart();
    useCartStore.setState({ eventSlug: "otro-evento" });
    await expect(orderService.create({ event, values }, options)).rejects.toThrow("CART_EMPTY");
    expect(useCartStore.getState().seated).toEqual(cartItems.seated);
  });

  it("AC-8: ante colisión de id reintenta con otro", async () => {
    fillCart();
    const first = await orderService.create({ event, values }, options);
    expect(first.id).toBe("TK-10000");

    fillCart();
    const sequence = [0, 0, 0.5];
    const second = await orderService.create(
      { event, values },
      { ...options, random: () => sequence.shift() ?? 0 },
    );
    expect(second.id).toBe("TK-55000");
    expect(Object.keys(useOrderStore.getState().orders).sort()).toEqual(["TK-10000", "TK-55000"]);
  });

  it("AC-8: falla con ORDER_ID_COLLISION tras ORDER_ID_MAX_ATTEMPTS sin guardar ni vaciar", async () => {
    fillCart();
    await orderService.create({ event, values }, options);
    fillCart();
    const random = vi.fn(() => 0);

    await expect(orderService.create({ event, values }, { ...options, random })).rejects.toThrow(
      "ORDER_ID_COLLISION",
    );
    expect(random).toHaveBeenCalledTimes(ORDER_ID_MAX_ATTEMPTS);
    expect(Object.keys(useOrderStore.getState().orders)).toEqual(["TK-10000"]);
    expect(useCartStore.getState().seated).toEqual(cartItems.seated);
  });

  it("AC-8: conserva un pedido previo guardado en sessionStorage", async () => {
    fillCart();
    const previous = await orderService.create({ event, values }, options);
    useOrderStore.setState({ orders: {} }, false);
    sessionStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({ state: { orders: { [previous.id]: previous } }, version: 1 }),
    );

    fillCart();
    const next = await orderService.create({ event, values }, { ...options, random: fixed(0.5) });

    const stored = JSON.parse(storedJson()).state.orders as Record<string, Order>;
    expect(Object.keys(stored).sort()).toEqual([previous.id, next.id].sort());
    expect(useOrderStore.getState().orders[previous.id]).toEqual(previous);
  });

  it("AC-8: no resuelve antes de delayMs", async () => {
    vi.useFakeTimers();
    fillCart();
    let resolved = false;
    const promise = orderService
      .create({ event, values }, { ...options, delayMs: 1000 })
      .then((order) => {
        resolved = true;
        return order;
      });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
    expect(useOrderStore.getState().orders).toEqual({});

    await vi.advanceTimersByTimeAsync(1);
    await promise;
    expect(resolved).toBe(true);
  });
});

describe("orderService.getById", () => {
  it("AC-9: devuelve el pedido existente o null", async () => {
    fillCart();
    const order = await orderService.create({ event, values }, options);
    expect(orderService.getById(order.id)).toEqual(order);
    expect(orderService.getById("TK-00000")).toBeNull();
    expect(orderService.getById("toString")).toBeNull();
  });
});
