import { beforeEach, describe, expect, it } from "vitest";
import type { TicketTier } from "@/modules/event/schemas/event.schema";
import {
  CART_STORAGE_KEY,
  MAX_TICKETS_PER_ZONE,
  formatTicketCount,
  getCartCount,
  getCartLines,
  getCartTotal,
  getTierCount,
  useCartStore,
  type CartItems,
} from "@/modules/order/store/cart.store";

const tiers: TicketTier[] = [
  { id: "general", name: "General", price: 80, color: "#F59E0B", status: "available" },
  { id: "vip", name: "VIP", price: 250, color: "#4F46E5", status: "last_tickets" },
  { id: "palco", name: "Palco", price: 400, color: "#6366F1", status: "available" },
];

function items(): CartItems {
  const { standing, seated } = useCartStore.getState();
  return { standing, seated };
}

beforeEach(() => {
  useCartStore.setState({ eventSlug: null, standing: {}, seated: {} });
  sessionStorage.clear();
});

describe("useCartStore", () => {
  it("AC-8: arranca vacío y sin evento", () => {
    const { eventSlug, standing, seated } = useCartStore.getState();
    expect({ eventSlug, standing, seated }).toEqual({ eventSlug: null, standing: {}, seated: {} });
  });

  it("AC-8: persiste solo eventSlug, standing y seated en sessionStorage con version 1", () => {
    useCartStore.getState().setEvent("noches-de-rock-lima");
    useCartStore.getState().increment("general");
    useCartStore.getState().toggleSeat("vip", "vip-A-1");

    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw as string);
    expect(stored).toEqual({
      state: {
        eventSlug: "noches-de-rock-lima",
        standing: { general: 1 },
        seated: { vip: ["vip-A-1"] },
      },
      version: 1,
    });
  });

  it("AC-8: usa skipHydration y la clave de storage esperada", () => {
    const options = useCartStore.persist.getOptions();
    expect(options.name).toBe(CART_STORAGE_KEY);
    expect(options.skipHydration).toBe(true);
    expect(options.version).toBe(1);
  });

  it("AC-8: rehidrata desde sessionStorage", async () => {
    sessionStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: { eventSlug: "romeo", standing: { general: 2 }, seated: {} },
        version: 1,
      })
    );
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().eventSlug).toBe("romeo");
    expect(useCartStore.getState().standing).toEqual({ general: 2 });
  });

  it("AC-9: setEvent con slug nuevo guarda el slug y vacía los items", () => {
    useCartStore.setState({ eventSlug: "a", standing: { general: 2 }, seated: { vip: ["v-1"] } });
    useCartStore.getState().setEvent("b");
    const { eventSlug, standing, seated } = useCartStore.getState();
    expect({ eventSlug, standing, seated }).toEqual({ eventSlug: "b", standing: {}, seated: {} });
  });

  it("AC-9: setEvent con el mismo slug conserva el carrito", () => {
    useCartStore.setState({ eventSlug: "a", standing: { general: 2 }, seated: { vip: ["v-1"] } });
    useCartStore.getState().setEvent("a");
    expect(useCartStore.getState().eventSlug).toBe("a");
    expect(items()).toEqual({ standing: { general: 2 }, seated: { vip: ["v-1"] } });
  });

  it("AC-9: clear vacía los items y conserva eventSlug", () => {
    useCartStore.setState({ eventSlug: "a", standing: { general: 2 }, seated: { vip: ["v-1"] } });
    useCartStore.getState().clear();
    expect(useCartStore.getState().eventSlug).toBe("a");
    expect(items()).toEqual({ standing: {}, seated: {} });
  });

  it("AC-10: increment suma hasta MAX_TICKETS_PER_ZONE y luego no hace nada", () => {
    expect(MAX_TICKETS_PER_ZONE).toBe(6);
    for (let i = 0; i < 8; i++) useCartStore.getState().increment("general");
    expect(useCartStore.getState().standing).toEqual({ general: 6 });
  });

  it("AC-10: decrement resta, borra la clave en 0 y no hace nada sin clave", () => {
    useCartStore.setState({ standing: { general: 2 } });
    useCartStore.getState().decrement("general");
    expect(useCartStore.getState().standing).toEqual({ general: 1 });
    useCartStore.getState().decrement("general");
    expect(useCartStore.getState().standing).toEqual({});
    useCartStore.getState().decrement("general");
    expect(useCartStore.getState().standing).toEqual({});
  });

  it("AC-10: toggleSeat agrega y quita, y borra la clave al quedar vacía", () => {
    useCartStore.getState().toggleSeat("vip", "vip-A-1");
    useCartStore.getState().toggleSeat("vip", "vip-A-2");
    expect(useCartStore.getState().seated).toEqual({ vip: ["vip-A-1", "vip-A-2"] });
    useCartStore.getState().toggleSeat("vip", "vip-A-1");
    expect(useCartStore.getState().seated).toEqual({ vip: ["vip-A-2"] });
    useCartStore.getState().toggleSeat("vip", "vip-A-2");
    expect(useCartStore.getState().seated).toEqual({});
  });

  it("AC-10: toggleSeat no agrega un séptimo asiento pero permite quitar", () => {
    for (let i = 1; i <= 7; i++) useCartStore.getState().toggleSeat("vip", `vip-A-${i}`);
    expect(useCartStore.getState().seated.vip).toHaveLength(6);
    expect(useCartStore.getState().seated.vip).not.toContain("vip-A-7");
    useCartStore.getState().toggleSeat("vip", "vip-A-1");
    expect(useCartStore.getState().seated.vip).toHaveLength(5);
  });

  it("AC-10: el límite es independiente entre tiers", () => {
    for (let i = 0; i < 6; i++) useCartStore.getState().increment("general");
    useCartStore.getState().increment("preferencial");
    for (let i = 1; i <= 6; i++) useCartStore.getState().toggleSeat("vip", `vip-A-${i}`);
    useCartStore.getState().toggleSeat("palco", "palco-A-1");
    expect(useCartStore.getState().standing).toEqual({ general: 6, preferencial: 1 });
    expect(useCartStore.getState().seated.vip).toHaveLength(6);
    expect(useCartStore.getState().seated.palco).toEqual(["palco-A-1"]);
  });
});

describe("funciones puras del carrito", () => {
  const mixed: CartItems = {
    standing: { general: 3 },
    seated: { vip: ["vip-A-1", "vip-A-2"], palco: ["palco-B-4"] },
  };

  it("AC-11: getTierCount devuelve cantidad, asientos o 0", () => {
    expect(getTierCount(mixed, "general")).toBe(3);
    expect(getTierCount(mixed, "vip")).toBe(2);
    expect(getTierCount(mixed, "otro")).toBe(0);
  });

  it("AC-11: getCartCount suma standing y seated", () => {
    expect(getCartCount(mixed)).toBe(6);
    expect(getCartCount({ standing: {}, seated: {} })).toBe(0);
  });

  it("AC-11: getCartLines sigue el orden de tiers, ignora tiers desconocidos e incluye asientos", () => {
    const lines = getCartLines(
      { standing: { desconocido: 2, general: 3 }, seated: { palco: ["palco-B-4"], vip: ["vip-A-1", "vip-A-2"] } },
      tiers
    );
    expect(lines).toEqual([
      { tierId: "general", name: "General", unitPrice: 80, qty: 3, seatIds: [], amount: 240 },
      {
        tierId: "vip",
        name: "VIP",
        unitPrice: 250,
        qty: 2,
        seatIds: ["vip-A-1", "vip-A-2"],
        amount: 500,
      },
      { tierId: "palco", name: "Palco", unitPrice: 400, qty: 1, seatIds: ["palco-B-4"], amount: 400 },
    ]);
  });

  it("AC-11: getCartLines vacío sin items", () => {
    expect(getCartLines({ standing: {}, seated: {} }, tiers)).toEqual([]);
  });

  it("AC-11: getCartTotal suma los amount de standing y seated", () => {
    expect(getCartTotal(mixed, tiers)).toBe(240 + 500 + 400);
    expect(getCartTotal({ standing: {}, seated: {} }, tiers)).toBe(0);
  });

  it("AC-11: formatTicketCount usa singular solo para 1", () => {
    expect(formatTicketCount(1)).toBe("1 entrada");
    expect(formatTicketCount(0)).toBe("0 entradas");
    expect(formatTicketCount(3)).toBe("3 entradas");
  });
});
