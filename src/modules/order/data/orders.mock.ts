import type { Order } from "@/modules/order/schemas/order.schema";

// Snapshots copiados de events.mock.ts: un pedido guarda el evento tal como era al comprarlo.
const DEMO_BUYER: Order["buyer"] = {
  fullName: "Ana Torres",
  email: "demo@ticketera.pe",
  documentType: "DNI",
  documentNumber: "45678912",
  phone: "987654321",
};

export const DEMO_ORDERS: ReadonlyArray<Order> = [
  {
    id: "TK-24817",
    createdAt: "2026-09-10T15:20:00.000Z",
    event: {
      slug: "noches-de-rock-lima",
      title: "Noches de Rock — Lima",
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
      categoryName: "Conciertos",
      venueName: "Estadio Nacional",
      city: "Lima",
      startDate: "2026-11-14T21:00:00-05:00",
    },
    lines: [
      {
        tierId: "general",
        name: "General",
        unitPrice: 120,
        qty: 2,
        seatIds: [],
        seatLabels: [],
        amount: 240,
      },
    ],
    count: 2,
    total: 240,
    buyer: DEMO_BUYER,
    paymentMethod: "card",
    cardLast4: "4242",
  },
  {
    id: "TK-24790",
    createdAt: "2026-09-12T18:05:00.000Z",
    event: {
      slug: "romeo-y-julieta-teatro-municipal",
      title: "Romeo y Julieta",
      imageUrl:
        "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=1200&auto=format&fit=crop",
      categoryName: "Teatro",
      venueName: "Teatro Municipal",
      city: "Lima",
      startDate: "2026-10-22T20:00:00-05:00",
    },
    lines: [
      {
        tierId: "platea",
        name: "Platea",
        unitPrice: 120,
        qty: 1,
        seatIds: ["platea-C-8"],
        seatLabels: ["Fila C, asiento 8"],
        amount: 120,
      },
    ],
    count: 1,
    total: 120,
    buyer: DEMO_BUYER,
    paymentMethod: "card",
    cardLast4: "4242",
  },
  {
    id: "TK-19342",
    createdAt: "2026-07-20T14:00:00.000Z",
    event: {
      slug: "festival-sonido-andino",
      title: "Festival Sonido Andino",
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
      categoryName: "Festivales",
      venueName: "Costa Verde",
      city: "Lima",
      startDate: "2026-08-15T18:00:00-05:00",
    },
    lines: [
      {
        tierId: "general",
        name: "General",
        unitPrice: 95,
        qty: 2,
        seatIds: [],
        seatLabels: [],
        amount: 190,
      },
    ],
    count: 2,
    total: 190,
    buyer: DEMO_BUYER,
    paymentMethod: "card",
    cardLast4: "4242",
  },
];
