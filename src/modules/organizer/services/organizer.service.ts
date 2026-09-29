import { ORGANIZER_EVENTS } from "@/modules/organizer/data/organizer-events.mock";
import type {
  OrganizerEvent,
  OrganizerEventStatus,
} from "@/modules/organizer/schemas/organizer-event.schema";

export type EventMetrics = { sold: number; capacity: number; revenue: number; soldRatio: number };

export function getEventMetrics(event: OrganizerEvent): EventMetrics {
  let sold = 0;
  let capacity = 0;
  let revenue = 0;
  for (const tier of event.tiers) {
    sold += tier.sold;
    capacity += tier.capacity;
    revenue += tier.price * tier.sold;
  }
  const soldRatio = capacity > 0 ? Math.min(Math.max(sold / capacity, 0), 1) : 0;
  return { sold, capacity, revenue, soldRatio };
}

export type DashboardKpis = { sold: number; revenue: number; published: number };

export function getDashboardKpis(events: ReadonlyArray<OrganizerEvent>): DashboardKpis {
  return events.reduce<DashboardKpis>(
    (kpis, event) => {
      const { sold, revenue } = getEventMetrics(event);
      return {
        sold: kpis.sold + sold,
        revenue: kpis.revenue + revenue,
        published: kpis.published + (event.status === "published" ? 1 : 0),
      };
    },
    { sold: 0, revenue: 0, published: 0 },
  );
}

export type EventStatusFilter = "all" | OrganizerEventStatus;

export const EVENT_STATUS_FILTERS: ReadonlyArray<{ key: EventStatusFilter; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "draft", label: "Borradores" },
];

export function filterEventsByStatus(
  events: ReadonlyArray<OrganizerEvent>,
  filter: EventStatusFilter,
): OrganizerEvent[] {
  return filter === "all" ? [...events] : events.filter((event) => event.status === filter);
}

export function mergeOrganizerEvents(
  created: ReadonlyArray<OrganizerEvent>,
  mocks: ReadonlyArray<OrganizerEvent> = ORGANIZER_EVENTS,
): OrganizerEvent[] {
  const newestFirst = [...created].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  const seen = new Set<string>();
  return [...newestFirst, ...mocks].filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

// Agrupación manual en vez de Intl.NumberFormat: el separador de miles de "es-PE" varía según
// el ICU del runtime y provocaría diferencias de hidratación entre servidor y cliente.
function formatFixed(value: number, decimals: number): string {
  const [integer, fraction] = Math.abs(value).toFixed(decimals).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${value < 0 ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

export function formatNumber(value: number): string {
  return formatFixed(value, 0);
}

export function formatSoles(amount: number): string {
  return `S/ ${formatFixed(amount, Number.isInteger(amount) ? 0 : 2)}`;
}

export function formatTicketTotal(count: number): string {
  return `${formatNumber(count)} ${count === 1 ? "entrada" : "entradas"}`;
}
