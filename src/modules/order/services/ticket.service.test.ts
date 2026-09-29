import { describe, expect, it } from "vitest";

import { DEMO_ORDERS } from "@/modules/order/data/orders.mock";
import { orderSchema, type Order } from "@/modules/order/schemas/order.schema";
import {
  getOrderTickets,
  getTicketSeed,
  getUserOrders,
  splitOrdersByDate,
  ticketService,
} from "@/modules/order/services/ticket.service";
import { findSeat, formatSeatLabel, venueService } from "@/modules/venue/services/venue.service";

const NOW = new Date("2026-09-29T12:00:00-05:00");

function getDemoOrder(id: string): Order {
  const order = DEMO_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Falta el pedido ${id}`);
  return order;
}

const sessionOrder: Order = {
  ...getDemoOrder("TK-24817"),
  id: "TK-55555",
  buyer: { ...getDemoOrder("TK-24817").buyer, email: "otro@mail.com" },
};

describe("DEMO_ORDERS", () => {
  it("AC-15: son 3 pedidos válidos, con ids únicos y del usuario demo", () => {
    expect(DEMO_ORDERS).toHaveLength(3);
    for (const order of DEMO_ORDERS) {
      expect(() => orderSchema.parse(order)).not.toThrow();
      expect(order.buyer.email).toBe("demo@ticketera.pe");
      expect(order.paymentMethod).toBe("card");
      expect(order.cardLast4).toBe("4242");
    }
    expect(new Set(DEMO_ORDERS.map((o) => o.id)).size).toBe(3);
    expect(DEMO_ORDERS.map((o) => o.id)).toEqual(["TK-24817", "TK-24790", "TK-19342"]);
  });

  it("AC-15: count y total coinciden con las líneas", () => {
    for (const order of DEMO_ORDERS) {
      expect(order.count).toBe(order.lines.reduce((sum, line) => sum + line.qty, 0));
      expect(order.total).toBe(order.lines.reduce((sum, line) => sum + line.amount, 0));
    }
  });

  it("AC-15: el asiento de TK-24790 existe en el mapa del evento y su etiqueta coincide", () => {
    const order = getDemoOrder("TK-24790");
    const map = venueService.getByEventSlug(order.event.slug);
    expect(map).not.toBeNull();
    const found = findSeat(map!, order.lines[0].seatIds[0]);
    expect(found).not.toBeNull();
    expect(formatSeatLabel(found!.row.label, found!.seat.number)).toBe(order.lines[0].seatLabels[0]);
  });
});

describe("getTicketSeed / getOrderTickets", () => {
  it("AC-16: la semilla de la entrada 0 es la de la confirmación", () => {
    expect(getTicketSeed("TK-24817", 0)).toBe(24817);
    expect(getTicketSeed("TK-24817", 1)).toBe(24830);
  });

  it("AC-16: expande TK-24817 en 2 entradas General sin asiento", () => {
    expect(getOrderTickets(getDemoOrder("TK-24817"))).toEqual([
      { index: 0, code: "TK-24817-01", zone: "General", seatLabel: null, seed: 24817 },
      { index: 1, code: "TK-24817-02", zone: "General", seatLabel: null, seed: 24830 },
    ]);
  });

  it("AC-16: TK-24790 tiene 1 entrada con su asiento", () => {
    expect(getOrderTickets(getDemoOrder("TK-24790"))).toEqual([
      { index: 0, code: "TK-24790-01", zone: "Platea", seatLabel: "Fila C, asiento 8", seed: 24790 },
    ]);
  });

  it("AC-16: el index es global entre líneas y el asiento es por posición en la línea", () => {
    const base = getDemoOrder("TK-24790");
    const order: Order = {
      ...base,
      lines: [
        { ...base.lines[0], qty: 2, seatIds: ["a", "b"], seatLabels: ["Fila A, asiento 1", "Fila A, asiento 2"], amount: 240 },
        { tierId: "general", name: "General", unitPrice: 50, qty: 1, seatIds: [], seatLabels: [], amount: 50 },
      ],
      count: 3,
    };
    const tickets = getOrderTickets(order);
    expect(tickets.map((t) => t.index)).toEqual([0, 1, 2]);
    expect(tickets.map((t) => t.code)).toEqual(["TK-24790-01", "TK-24790-02", "TK-24790-03"]);
    expect(tickets.map((t) => t.seatLabel)).toEqual(["Fila A, asiento 1", "Fila A, asiento 2", null]);
    expect(tickets[2]).toMatchObject({ zone: "General", seed: getTicketSeed("TK-24790", 2) });
  });
});

describe("getUserOrders", () => {
  it("AC-17: el usuario demo ve sus 3 pedidos mock sin importar mayúsculas", () => {
    expect(getUserOrders("DEMO@ticketera.pe", {}).map((o) => o.id).sort()).toEqual(
      ["TK-19342", "TK-24790", "TK-24817"],
    );
  });

  it("AC-17: otro usuario sin pedidos de sesión no ve nada", () => {
    expect(getUserOrders("otra@mail.com", {})).toEqual([]);
  });

  it("AC-17: los pedidos de sesión se incluyen sin filtrar por correo", () => {
    expect(getUserOrders("otra@mail.com", { [sessionOrder.id]: sessionOrder })).toEqual([sessionOrder]);
  });

  it("AC-17: sin duplicados; con el mismo id gana el de la sesión", () => {
    const override: Order = { ...getDemoOrder("TK-24817"), total: 999 };
    const result = getUserOrders("demo@ticketera.pe", { [override.id]: override });
    expect(result).toHaveLength(3);
    expect(result.find((o) => o.id === "TK-24817")).toBe(override);
  });

  it("AC-17: acepta mockOrders inyectados", () => {
    expect(getUserOrders("demo@ticketera.pe", {}, [])).toEqual([]);
  });
});

describe("splitOrdersByDate / ticketService", () => {
  it("AC-18: separa en próximas (ascendente) y pasadas (descendente)", () => {
    const orders = [
      { ...getDemoOrder("TK-19342"), id: "TK-10000", event: { ...getDemoOrder("TK-19342").event, startDate: "2026-06-01T18:00:00-05:00" } },
      ...DEMO_ORDERS,
    ];
    const { upcoming, past } = splitOrdersByDate(orders, NOW);
    expect(upcoming.map((o) => o.id)).toEqual(["TK-24790", "TK-24817"]);
    expect(past.map((o) => o.id)).toEqual(["TK-19342", "TK-10000"]);
  });

  it("AC-18: un evento que empieza justo ahora es próximo", () => {
    const order = getDemoOrder("TK-24817");
    const { upcoming, past } = splitOrdersByDate([order], new Date(order.event.startDate));
    expect(upcoming).toEqual([order]);
    expect(past).toEqual([]);
  });

  it("AC-18: no muta el arreglo de entrada", () => {
    const input = [...DEMO_ORDERS];
    const snapshot = [...input];
    splitOrdersByDate(input, NOW);
    expect(input).toEqual(snapshot);
  });

  it("AC-18: ticketService.getUserOrders une y separa los pedidos del usuario demo", () => {
    const { upcoming, past } = ticketService.getUserOrders("demo@ticketera.pe", {}, NOW);
    expect(upcoming.map((o) => o.id)).toEqual(["TK-24790", "TK-24817"]);
    expect(past.map((o) => o.id)).toEqual(["TK-19342"]);
  });
});
