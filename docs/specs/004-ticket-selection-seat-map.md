# 004 — Selección de entradas y mapa de asientos (`/eventos/[slug]/entradas`)

Estado: approved
Fase: 4 de 7 (entradas + mapa de asientos; después vienen 5 checkout y confirmación, 6 cuenta, 7 organizador)

## Aprobación
Aprobado por el usuario el 2026-09-29 (confirmado en chat: "si").

## Contexto
El detalle de evento (spec 003) enlaza a `/eventos/[slug]/entradas`, que todavía no existe. Esta fase construye el paso 1 de la compra: el usuario elige zona en un mapa del recinto (SVG propio con zoom/pan/pinch), la cantidad por tier (zonas de pie) o los asientos numerados (zonas con asiento), y ve el resumen "Tu compra" con el total. Sigue los diseños `Tickets` y `TicketsMobile`, responsive mobile + desktop. Es solo UI/UX con datos mock y services sincrónicos, sin backend. El carrito se guarda en `sessionStorage` para que la fase 5 (checkout) lo lea.

## Alcance
- Incluye:
  - Dependencia `react-zoom-pan-pinch@4.2.0` (decisión tomada: SVG propio + esta librería; descartadas `react-konva` por su peer `react ^19.3.0` frente al 19.2.8 instalado, `seatmap-canvas` por su peer `react 18` y `seatchart` por estar abandonada).
  - Módulo nuevo `src/modules/venue/`: contrato zod del mapa de recinto (`venueMapSchema`), un mock con 2 recintos (un estadio con zonas de pie y tribunas numeradas, y un teatro con plateas numeradas) asignados a 2 eventos por `slug`, y `venueService` con helpers puros.
  - Módulo nuevo `src/modules/order/`: store zustand `useCartStore` con `persist` en `sessionStorage`, y funciones puras de total, conteo y líneas.
  - Helper transversal `getContrastTextColor` en `src/lib/color.ts`, para que los labels del mapa se lean sobre cualquier color de tier.
  - Componentes de venue: `ZoomableCanvas` (zoom/pan/pinch con botones +/−/restablecer), `VenueZoneMap` (zonas SVG accesibles) y `SeatPicker` (asientos por fila, con leyenda).
  - Componentes de order: `PurchaseStepsHeader` (Entradas → Datos y pago → Confirmación, con variante compacta en mobile), `TierQuantityList` (contador +/− por tier de pie; asientos elegidos para tiers con asiento), `OrderSummary` (`aside` sticky en desktop) y `OrderMobileBar` (barra fija inferior en mobile), y el contenedor cliente `TicketSelection`.
  - Ruta `src/app/eventos/[slug]/entradas/page.tsx`. Un evento sin mapa usa solo la lista de tiers con contadores. Un evento agotado muestra el estado agotado, sin mapa ni contadores.
- Fuera de alcance (no agregar):
  - Checkout, datos del comprador, pago y confirmación (fase 5). "Continuar" enlaza a `/checkout`, que dará 404 hasta la fase 5.
  - Reservas reales, bloqueo temporal de asientos, temporizador de reserva, disponibilidad en tiempo real o revalidar el carrito contra el mock al volver a la página.
  - Editor de mapas para el organizador (fase 7). Mapas para los 7 eventos restantes (usan el modo sin mapa).
  - Backend o fetch (axios/react-query): los services son funciones sincrónicas sobre los mocks.
  - Botón "Vaciar carrito", cupones, cargos por servicio, impuestos, monedas distintas de PEN, i18n.
  - Resaltar en el mapa general los asientos elegidos, "mejor asiento disponible" o selección automática de asientos contiguos.
  - Zoom con la rueda del mouse (ver AC-17).
  - Modificar archivos de `src/modules/event/` (schemas, mocks, services, store, componentes), `src/components/layout/*` o `src/components/ui/*`.

## Módulo destino
- `src/modules/venue/` (nuevo): schemas, data, services, components.
- `src/modules/order/` (nuevo): store, components.
- `src/lib/color.ts` (transversal).
- Ruta `src/app/eventos/[slug]/entradas/`.

## Reutilización
- `src/modules/event/schemas/event.schema.ts` — `TicketTier`, `EventDetail`. Los tiers del mapa se referencian por `tierId`, no se redefinen: precio, nombre, color y estado siempre salen de `EventDetail.tiers`.
- `src/modules/event/services/event.service.ts` — `eventService.getBySlug(slug)` para el evento y `eventService.list()` para `generateStaticParams`. No se importan `events.mock.ts` ni `event-details.mock.ts` desde la ruta ni desde los componentes (solo desde el test del mock de venue, para verificar coherencia).
- `src/components/ui/button.tsx` — botones +/−, zoom y CTA deshabilitado. `src/components/ui/card.tsx` puede usarse para las secciones. `src/components/ui/badge.tsx` para "Últimas entradas".
- `src/lib/utils.ts` — `cn()`.
- `zustand` (`create`, `persist`, `createJSONStorage` de `zustand/middleware`) — ya instalado (^5).
- `lucide-react` — `Ticket`, `Lock`, `ArrowLeft`, `ArrowRight`, `Plus`, `Minus`, `RotateCcw`, `Armchair`.
- `next/image` para la miniatura del evento (el dominio de Unsplash ya está permitido por las fases anteriores).
- No se usan componentes en curso de la spec 003 (`event-detail-info.tsx`, `event-tier-summary.tsx`, `event-card.tsx`). El formato de fecha se hace con `Intl.DateTimeFormat` dentro de la página (ver "Cambios al plan").
- shadcn a instalar: ninguno (el entorno bloquea `ui.shadcn.com`). Se usan los componentes ya instalados o HTML/SVG nativo.
- Dependencia nueva: `react-zoom-pan-pinch@4.2.0`.

## Contratos
```ts
// src/modules/venue/schemas/venue.schema.ts
import { z } from "zod";

export const pointSchema = z.object({ x: z.number(), y: z.number() });
export type Point = z.infer<typeof pointSchema>;

export const seatStatusSchema = z.enum(["available", "reserved", "sold"]);
export type SeatStatus = z.infer<typeof seatStatusSchema>;

export const seatSchema = z.object({
  id: z.string().min(1),                 // "<zoneId>-<rowLabel>-<number>", único en todo el mapa
  number: z.number().int().positive(),
  x: z.number(),                         // coordenadas del plano de asientos de la zona (no del recinto)
  y: z.number(),
  status: seatStatusSchema,
});
export type Seat = z.infer<typeof seatSchema>;

export const seatRowSchema = z.object({
  label: z.string().min(1),              // "A", "B", ...
  seats: z.array(seatSchema).min(1),
});
export type SeatRow = z.infer<typeof seatRowSchema>;

const zoneBaseSchema = z.object({
  id: z.string().min(1),
  tierId: z.string().min(1),             // id de un TicketTier del evento
  name: z.string().min(1),               // "Campo General", "Platea", ...
  shape: z.string().min(1),              // atributo `d` de un <path> SVG, en coordenadas del recinto
  labelPosition: pointSchema,            // centro del label, en coordenadas del recinto
});

export const standingZoneSchema = zoneBaseSchema.extend({ kind: z.literal("standing") });
export const seatedZoneSchema = zoneBaseSchema.extend({
  kind: z.literal("seated"),
  rows: z.array(seatRowSchema).min(1),
});
export const venueZoneSchema = z.discriminatedUnion("kind", [standingZoneSchema, seatedZoneSchema]);
export type StandingZone = z.infer<typeof standingZoneSchema>;
export type SeatedZone = z.infer<typeof seatedZoneSchema>;
export type VenueZone = z.infer<typeof venueZoneSchema>;

export const venueMapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),               // "Estadio Nacional", "Teatro Municipal"
  viewBox: z.object({ width: z.number().positive(), height: z.number().positive() }), // se renderiza "0 0 width height"
  stage: z.object({
    shape: z.string().min(1),            // `d` del escenario/cancha
    label: z.string().min(1),            // "ESCENARIO"
    labelPosition: pointSchema,
  }),
  zones: z.array(venueZoneSchema).min(1),
});
export type VenueMap = z.infer<typeof venueMapSchema>;

// src/modules/venue/data/venue-maps.mock.ts
export const venueMaps: Record<string, VenueMap>; // clave = slug del evento; 2 entradas (ver AC-4)

// src/modules/venue/services/venue.service.ts
export const SEAT_RADIUS = 5;              // radio de dibujo del asiento, en unidades del plano de la zona
export const venueService: {
  getByEventSlug(slug: string): VenueMap | null; // null si el evento no tiene mapa
};
export function getSeatsViewBox(zone: SeatedZone, padding?: number): string; // padding = 28 por defecto
export function findSeat(map: VenueMap, seatId: string): { zone: SeatedZone; row: SeatRow; seat: Seat } | null;
export function formatSeatLabel(rowLabel: string, seatNumber: number): string; // ("A", 5) -> "Fila A, asiento 5"
export function isZoneAvailable(zone: VenueZone, tier: TicketTier | undefined): boolean;
export function getZoneByTierId(map: VenueMap, tierId: string): VenueZone | null;

// src/lib/color.ts
export function getContrastTextColor(hex: string): "#18181B" | "#FFFFFF";

// src/modules/order/store/cart.store.ts
export const MAX_TICKETS_PER_ZONE = 6;
export const CART_STORAGE_KEY = "ticketera-cart";

export type CartItems = {
  standing: Record<string, number>;      // tierId -> cantidad (> 0; la clave se borra al llegar a 0)
  seated: Record<string, string[]>;      // tierId -> seatIds (length > 0; la clave se borra al quedar vacío)
};

export type CartState = CartItems & {
  eventSlug: string | null;
  setEvent: (slug: string) => void;      // si slug !== eventSlug: guarda slug y vacía standing y seated; si es igual, no hace nada
  increment: (tierId: string) => void;   // +1 hasta MAX_TICKETS_PER_ZONE
  decrement: (tierId: string) => void;   // −1; en 0 borra la clave; si no existe, no hace nada
  toggleSeat: (tierId: string, seatId: string) => void; // quita si está; agrega si hay cupo (< MAX); si no, no hace nada
  clear: () => void;                     // vacía standing y seated, conserva eventSlug
};
export const useCartStore: UseBoundStore<Mutate<StoreApi<CartState>, [["zustand/persist", unknown]]>>;

export type CartLine = {
  tierId: string;
  name: string;                          // nombre del tier
  unitPrice: number;
  qty: number;                           // standing: cantidad; seated: seatIds.length
  seatIds: string[];                     // [] en standing
  amount: number;                        // unitPrice * qty
};

export function getTierCount(items: CartItems, tierId: string): number;
export function getCartCount(items: CartItems): number;
export function getCartLines(items: CartItems, tiers: TicketTier[]): CartLine[]; // en el orden de `tiers`; ignora tierIds que no estén en `tiers`
export function getCartTotal(items: CartItems, tiers: TicketTier[]): number;     // suma de amount de getCartLines
export function formatTicketCount(count: number): string; // 1 -> "1 entrada", 0/n -> "n entradas"

// src/modules/venue/components/zoomable-canvas.tsx
export function ZoomableCanvas(props: {
  label: string;                         // aria-label de la región, ej. "Mapa de Estadio Nacional"
  children: ReactNode;                   // un <svg>
  maxScale?: number;                     // 4 por defecto
  className?: string;
}): JSX.Element;

// src/modules/venue/components/venue-zone-map.tsx
export function VenueZoneMap(props: {
  map: VenueMap;
  tiers: TicketTier[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  className?: string;
}): JSX.Element;

// src/modules/venue/components/seat-picker.tsx
export function SeatPicker(props: {
  zone: SeatedZone;
  tier: TicketTier;
  selectedSeatIds: string[];
  max: number;
  onToggleSeat: (seatId: string) => void;
  className?: string;
}): JSX.Element;

// src/modules/order/components/purchase-steps-header.tsx
export const PURCHASE_STEPS: ReadonlyArray<{ label: string; mobileTitle: string }>;
// [{ "Entradas", "Elige tus entradas" }, { "Datos y pago", "Datos y pago" }, { "Confirmación", "Confirmación" }]
export function PurchaseStepsHeader(props: { currentStep: 1 | 2 | 3; backHref: string }): JSX.Element;

// src/modules/order/components/order-summary.tsx (reutilizable en la fase 5)
type OrderSummaryProps = {
  lines: Array<CartLine & { seatLabels: string[] }>;
  total: number;
  count: number;
  continueHref: string;                  // "/checkout"
  className?: string;
};
export function OrderSummary(props: OrderSummaryProps): JSX.Element;
export function OrderMobileBar(props: Omit<OrderSummaryProps, "lines">): JSX.Element;

// src/modules/order/components/ticket-selection.tsx ("use client")
export function TicketSelection(props: { event: EventDetail; venueMap: VenueMap | null }): JSX.Element;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| T0 | 0 | Setup: dependencia de zoom | `package.json`, `package-lock.json` | — | AC-1 |
| T1 | 1 | Módulo venue: contrato, mock, service y color | `src/modules/venue/schemas/venue.schema.ts`, `src/modules/venue/schemas/venue.schema.test.ts`, `src/modules/venue/data/venue-maps.mock.ts`, `src/modules/venue/data/venue-maps.mock.test.ts`, `src/modules/venue/services/venue.service.ts`, `src/modules/venue/services/venue.service.test.ts`, `src/lib/color.ts`, `src/lib/color.test.ts` | T0 | AC-2 a AC-7 |
| T2 | 1 | Carrito: store y funciones puras | `src/modules/order/store/cart.store.ts`, `src/modules/order/store/cart.store.test.ts` | T0 | AC-8 a AC-12 |
| T3 | 2 | Componentes de mapa: zoom, zonas y asientos | `src/modules/venue/components/zoomable-canvas.tsx`, `src/modules/venue/components/venue-zone-map.tsx`, `src/modules/venue/components/seat-picker.tsx` | T0, T1 | AC-13 a AC-18 |
| T4 | 2 | Ruta `/entradas` y componentes de compra | `src/app/eventos/[slug]/entradas/page.tsx`, `src/modules/order/components/purchase-steps-header.tsx`, `src/modules/order/components/tier-quantity-list.tsx`, `src/modules/order/components/order-summary.tsx`, `src/modules/order/components/ticket-selection.tsx` | T1, T2 (y usa `VenueZoneMap`/`SeatPicker` de T3 sin editarlos) | AC-19 a AC-28 |

Notas de ejecución:
- T4 importa `VenueZoneMap` y `SeatPicker` según las firmas de Contratos y **no edita** archivos de T3. Si T3 no terminó, T4 igual puede escribir su código contra el contrato; `npm run build` se corre al final de la ola.
- T3 y T4 no editan `venue.schema.ts`, `venue.service.ts` ni `cart.store.ts`. Si falta algo en esos contratos, reportan `BLOCKED`.
- T0: `npm install react-zoom-pan-pinch@4.2.0 --legacy-peer-deps`. Si `node_modules` no está instalado, correr antes `npm install --legacy-peer-deps`.
- T3: antes de escribir, lee los tipos de `node_modules/react-zoom-pan-pinch` (4.2.0) para `TransformWrapper`, `TransformComponent`, `useControls` y las opciones `panning`, `wheel`, `pinch` y `onTransformed`.
- T4: antes de escribir la página, lee la guía de Next 16 en `node_modules/next/dist/docs/` sobre páginas dinámicas, `params` como `Promise`, `generateStaticParams`, `generateMetadata` y `notFound()`.

## Criterios de aceptación

### Setup (T0)
- AC-1: `package.json` tiene `"react-zoom-pan-pinch": "4.2.0"` (versión exacta, sin `^`) en `dependencies`, y `package-lock.json` está actualizado. No se agrega ni se quita ninguna otra dependencia.

### Módulo venue (T1)
- AC-2: `venue.schema.ts` exporta los schemas y tipos de Contratos. `venueZoneSchema` es un `z.discriminatedUnion("kind", ...)`, así que una zona `seated` sin `rows` (o con `rows: []`) y una `seat.status` desconocida fallan `parse`. No redefine `TicketTier`: solo guarda `tierId`.
- AC-3: `venue-maps.mock.ts` exporta `venueMaps` y cada valor pasa `venueMapSchema.parse`. Los asientos se generan con un helper local determinista (por ejemplo `buildRows({ zoneId, rowLabels, seatsPerRow, spacing, statusOf })`), sin `Math.random`, sin `Date` y sin escribir cada asiento a mano.
- AC-4: `venueMaps` tiene exactamente estas 2 claves:
  - `"noches-de-rock-lima"` → estadio (`name: "Estadio Nacional"`), con escenario arriba, al menos 2 zonas `standing` de tipo campo y al menos 2 zonas `seated` de tribuna/palco numeradas. Cubre los 4 tiers del evento: `general` y `preferencial` como `standing`, `vip` y `palco` como `seated`.
  - `"romeo-y-julieta-teatro-municipal"` → teatro (`name: "Teatro Municipal"`), con escenario y solo zonas `seated`: `platea`, `palco` y `galeria`.
- AC-5: invariantes del mock, para cada mapa y su evento (`eventDetails[slug]`):
  - (a) `zone.id` es único dentro del mapa, y `seat.id` es único en todo el mapa y sigue el formato `"<zoneId>-<rowLabel>-<number>"`; los `row.label` son únicos dentro de la zona y los `seat.number` son únicos dentro de la fila;
  - (b) cada `zone.tierId` existe en `tiers` del evento, cada tier del evento tiene **exactamente una** zona (relación 1:1 entre tier y zona);
  - (c) si el tier es `sold_out`, su zona `seated` no tiene asientos `available`;
  - (d) si el tier no es `sold_out` y su zona es `seated`, tiene al menos un asiento `available`; si el tier es `last_tickets`, menos del 30% de sus asientos está `available`;
  - (e) cada zona `seated` tiene al menos un asiento `reserved` o `sold` (para que se vean todos los estados);
  - (f) la distancia entre centros de dos asientos de la misma zona es ≥ `2 * SEAT_RADIUS + 2`;
  - (g) `labelPosition` de cada zona y del escenario está dentro de `[0, width] × [0, height]` del `viewBox`.
- AC-6: `venueService.getByEventSlug(slug)` devuelve el mapa de `venueMaps[slug]`, o `null` si no existe (por ejemplo `"noche-de-stand-up-cusco"` o un slug inventado). Los helpers:
  - `getSeatsViewBox(zone, padding = 28)` devuelve `"minX minY width height"` con `minX = min(x) − padding`, `minY = min(y) − padding`, `width = max(x) − min(x) + 2·padding` y `height = max(y) − min(y) + 2·padding`, sobre los centros de todos los asientos de la zona;
  - `findSeat(map, seatId)` devuelve `{ zone, row, seat }` o `null` si el id no existe o está en una zona `standing`;
  - `formatSeatLabel("A", 5)` devuelve `"Fila A, asiento 5"`;
  - `isZoneAvailable(zone, tier)` devuelve `false` si `tier` es `undefined`, si `tier.status === "sold_out"` o si la zona es `seated` y no tiene asientos `available`; en otro caso `true`;
  - `getZoneByTierId(map, tierId)` devuelve la zona de ese tier o `null`.
- AC-7: `getContrastTextColor(hex)` calcula la luminancia relativa WCAG del color y devuelve `"#18181B"` o `"#FFFFFF"`, el que tenga mayor contraste. Ejemplos verificables: `"#FFFFFF"` → `"#18181B"`, `"#000000"` → `"#FFFFFF"`, `"#F59E0B"` → `"#18181B"`, `"#4F46E5"` → `"#FFFFFF"`.

### Carrito (T2)
- AC-8: `useCartStore` arranca con `{ eventSlug: null, standing: {}, seated: {} }` y usa `persist` con `name: CART_STORAGE_KEY`, `storage: createJSONStorage(() => sessionStorage)`, `partialize` que guarda solo `eventSlug`, `standing` y `seated`, `version: 1` y `skipHydration: true` (la rehidratación la dispara el cliente, ver AC-27). Después de una acción, `sessionStorage.getItem("ticketera-cart")` contiene el estado nuevo.
- AC-9: `setEvent(slug)` con un slug distinto al actual guarda `eventSlug` y vacía `standing` y `seated`; con el mismo slug no cambia nada (el carrito se conserva al recargar la página del mismo evento). `clear()` vacía los items y conserva `eventSlug`.
- AC-10: `increment(tierId)` suma 1 hasta `MAX_TICKETS_PER_ZONE` (6) y después no hace nada. `decrement(tierId)` resta 1, borra la clave al llegar a 0 y no hace nada si la clave no existe (nunca hay cantidades ≤ 0). `toggleSeat(tierId, seatId)` quita el asiento si ya está (y borra la clave si queda vacía), lo agrega si `seatIds.length < 6` y no hace nada si ya hay 6. El límite de 6 se cuenta por tier (= zona, por AC-5b) y es independiente entre tiers.
- AC-11: funciones puras, sin leer el store:
  - `getTierCount(items, tierId)` devuelve la cantidad (standing) o `seatIds.length` (seated), o 0;
  - `getCartCount(items)` suma todas las cantidades y todos los asientos;
  - `getCartLines(items, tiers)` devuelve una línea por tier con cantidad > 0, en el orden de `tiers`, con `amount = unitPrice * qty`, `seatIds: []` en standing e ignora tierIds que no estén en `tiers`;
  - `getCartTotal(items, tiers)` es la suma de `amount`;
  - `formatTicketCount(1)` es `"1 entrada"`, `formatTicketCount(0)` es `"0 entradas"` y `formatTicketCount(3)` es `"3 entradas"`.
- AC-12: `cart.store.test.ts` cubre AC-8 a AC-11 con al menos estos casos: estado inicial; persistencia en `sessionStorage`; `setEvent` con slug nuevo resetea y con el mismo conserva; `increment` hasta el límite; `decrement` hasta borrar la clave y sin clave; `toggleSeat` agrega, quita y respeta el límite; límites independientes entre dos tiers; `clear`; `getCartLines` (orden, tier desconocido ignorado, seated); `getCartTotal` y `getCartCount` con standing + seated mezclados; `formatTicketCount`. Resetea el store y `sessionStorage` entre tests (`useCartStore.setState(...)` y `sessionStorage.clear()`).

### Componentes de mapa (T3)
- AC-13: `ZoomableCanvas` es `"use client"` y envuelve `children` en `TransformWrapper` + `TransformComponent` de `react-zoom-pan-pinch`, con `minScale={1}`, `maxScale` (4 por defecto), `wheel={{ disabled: true }}`, pinch habilitado y `panning.disabled` en `true` mientras la escala sea 1 (se sigue con `onTransformed`), para que en mobile el arrastre con un dedo haga scroll de la página si no hay zoom. Es un contenedor `role="region"` con `aria-label={label}`. Tiene un grupo de 3 `Button` (variante `outline`, 40px o más) con `aria-label` "Acercar", "Alejar" y "Restablecer zoom", íconos `Plus`, `Minus` y `RotateCcw`, que llaman a `zoomIn`, `zoomOut` y `resetTransform` (con `useControls` o las funciones del render prop). "Alejar" y "Restablecer zoom" están `disabled` con escala 1, y "Acercar" con escala máxima.
- AC-14: `VenueZoneMap` es `"use client"` y renderiza, dentro de `ZoomableCanvas` con `label="Mapa de <map.name>"`, un `<svg viewBox="0 0 <width> <height>">` con `className="h-auto w-full"`:
  - el escenario como `<path d={stage.shape}>` oscuro (`#18181B`) con su `<text>` en blanco, `aria-hidden`;
  - una `<g>` por zona con un `<path d={zone.shape}>` y un `<text>` en `labelPosition` con el nombre de la zona y, debajo, `"S/ <price>"` o `"Agotado"`. El `<text>` es `aria-hidden` y `pointer-events-none`.
- AC-15: accesibilidad y estados de cada zona, usando `isZoneAvailable(zone, tier)` con el tier de `tiers` con el mismo `id`:
  - disponible: la `<g>` tiene `role="button"`, `tabIndex={0}`, `aria-pressed={zone.id === selectedZoneId}` y `aria-label="<zone.name>, S/ <price>"` (con el sufijo `", últimas entradas"` si el tier es `last_tickets`); el `path` usa `fill={tier.color}` y el texto usa `fill={getContrastTextColor(tier.color)}`; click, `Enter` o `Espacio` (con `preventDefault`) llaman a `onSelectZone(zone.id)`;
  - agotada: la `<g>` tiene `role="button"`, `aria-disabled="true"`, `tabIndex={-1}` y `aria-label="<zone.name>, Agotado"`; `path` gris (`#E4E4E7`), texto `#52525B`, `cursor-not-allowed`; click y teclado no llaman a `onSelectZone`;
  - la zona seleccionada tiene un borde de 3 unidades `#18181B` (`stroke`), y cualquier zona enfocada con teclado muestra un borde visible (por ejemplo `focus-visible:stroke-[#4F46E5]` o equivalente); sin `outline` roto sobre el SVG.
- AC-16: `SeatPicker` es `"use client"` y renderiza una `section` con un `h3` "Elige tus asientos · <zone.name>", el texto `"<n> de <max> asientos elegidos"` en un `<p aria-live="polite">`, y dentro de `ZoomableCanvas` (`label="Asientos de <zone.name>"`) un `<svg viewBox={getSeatsViewBox(zone)}>`:
  - por fila, un `<text>` con el `label` de la fila a la izquierda del primer asiento (`x = min(x de la fila) − 16`), `aria-hidden`;
  - por asiento, un `<circle r={SEAT_RADIUS}>` en `(x, y)`.
- AC-17: estados de cada asiento (colores en una constante única `SEAT_STATUS_STYLES` que usan tanto los círculos como la leyenda):
  - disponible: `fill={tier.color}`;
  - seleccionado (`seat.id` en `selectedSeatIds`): `fill="#18181B"`;
  - reservado: `fill="#FCD34D"`;
  - vendido: `fill="#D4D4D8"`.
  
  Los asientos disponibles o seleccionados son `role="button"`, `tabIndex={0}`, `aria-pressed` y `aria-label="<formatSeatLabel(row.label, seat.number)>"`, y click, `Enter` o `Espacio` llaman a `onToggleSeat(seat.id)`. Los reservados y vendidos tienen `aria-disabled="true"`, `tabIndex={-1}`, `aria-label` con el sufijo `", no disponible"` y no llaman a `onToggleSeat`. Con `selectedSeatIds.length >= max`, los asientos disponibles no seleccionados también quedan `aria-disabled="true"` y no llaman a `onToggleSeat`, y se muestra `"Llegaste al máximo de <max> asientos por zona."`. Sin selección de asientos arrastrando.
- AC-18: `SeatPicker` muestra una leyenda (`ul aria-label="Leyenda de asientos"`) con 4 ítems: "Disponible", "Seleccionado", "Reservado" y "Vendido", cada uno con un círculo del color de `SEAT_STATUS_STYLES` (el de "Disponible" es `tier.color`). T3 no importa `useCartStore`: toda la selección entra por props.

### Ruta y componentes de compra (T4)
- AC-19: `src/app/eventos/[slug]/entradas/page.tsx` es un server component (sin `"use client"`):
  - tipa `params` como `Promise<{ slug: string }>` y lo espera con `await`;
  - exporta `generateStaticParams` a partir de `eventService.list()` (los 9 slugs, incluidos los agotados);
  - exporta `generateMetadata`, que devuelve `title: "Entradas · <event.title> | Ticketera"`;
  - llama a `notFound()` de `next/navigation` cuando `eventService.getBySlug` devuelve `null`;
  - obtiene el mapa con `venueService.getByEventSlug(slug)` y le pasa `event` y `venueMap` a `TicketSelection`.
- AC-20: la página no usa `SiteHeader` ni `SiteFooter`. Renderiza `PurchaseStepsHeader currentStep={1} backHref="/eventos/<slug>"`, y debajo el bloque del evento: link "Volver al evento" (ícono `ArrowLeft`, visible desde `lg:`), miniatura con `next/image` (64px en desktop y 52px en mobile, `alt=""`), `h1` con el título, y la línea `"<fecha> · <venueName>, <city>"`. La fecha es larga en desktop ("sábado 14 de noviembre") y corta en mobile ("sáb 14 nov"), formateada con `Intl.DateTimeFormat("es-PE", …)` y `timeZone: "America/Lima"`.
- AC-21: `PurchaseStepsHeader`:
  - desktop (`hidden lg:flex`): logo "Ticketera" (ícono `Ticket`) con link a `/`, un `<ol aria-label="Pasos de la compra">` con los 3 `PURCHASE_STEPS` numerados y separadores `aria-hidden` (el paso actual tiene `aria-current="step"` y círculo relleno oscuro; los demás, borde gris), y a la derecha "Compra segura" con ícono `Lock`;
  - mobile (`lg:hidden`): link de 44px con ícono `ArrowLeft` y `aria-label="Volver al evento"` a `backHref`, `"Paso <n> de 3"`, el `mobileTitle` del paso actual, el ícono `Lock` y una barra de progreso `aria-hidden` con ancho `<n>/3`.
  
  No depende del carrito ni del evento, para poder reutilizarlo en la fase 5.
- AC-22: si `event.status === "sold_out"`, `TicketSelection` no renderiza mapa, contadores, `OrderSummary` ni `OrderMobileBar`. Muestra un bloque con el título "Entradas agotadas", el texto "Ya no quedan entradas para este evento." y un link "Volver al evento" a `/eventos/<slug>`. No aparece ningún link a `/checkout`.
- AC-23: con mapa (`venueMap !== null`), `TicketSelection` muestra, en este orden:
  - la sección "Elige tu zona" (`h2`, con el texto de ayuda "Toca una zona del mapa") con `VenueZoneMap`;
  - si la zona seleccionada es `seated`, `SeatPicker` con esa zona, su tier, `seated[tierId] ?? []`, `max = MAX_TICKETS_PER_ZONE` y `onToggleSeat = (seatId) => toggleSeat(tierId, seatId)`; al cambiar a una zona `seated`, el `SeatPicker` hace `scrollIntoView({ behavior: "smooth", block: "start" })`;
  - la sección "Entradas" con `TierQuantityList`.
  
  `selectedZoneId` es estado local (`useState`) y arranca en `null`. Sin mapa (`venueMap === null`) solo se muestra la sección "Entradas", y todos los tiers no agotados usan contador.
- AC-24: `TierQuantityList` renderiza una `ul` con un `li` por tier, en el orden de `event.tiers`, con: cuadro de color (`style={{ backgroundColor: tier.color }}`), nombre, badge "Últimas entradas" si es `last_tickets`, y `"S/ <price> c/u"`. La fila del tier de la zona seleccionada tiene fondo resaltado (por ejemplo `bg-indigo-50`). A la derecha, según el tier:
  - `sold_out`: el texto "Agotado", sin botones;
  - tier con zona `standing`, o cualquier tier si no hay mapa: un contador con dos `Button` de 40px o más en desktop y 44px o más en mobile, `aria-label="Quitar una entrada de <name>"` (`Minus`, `disabled` con cantidad 0) y `aria-label="Agregar una entrada de <name>"` (`Plus`, `disabled` con cantidad `max`), y la cantidad en un `<span aria-live="polite">`;
  - tier con zona `seated`: los asientos elegidos como texto (`formatSeatLabel` separados por "; ", o "Sin asientos elegidos") y un `Button` "Elegir asientos" (`Armchair`) que selecciona esa zona (`onSelectZone`).
  
  Al pie, el texto "Máximo <max> entradas por zona.".
- AC-25: `OrderSummary` es un `aside aria-label="Resumen de la compra"` con `h2` "Tu compra":
  - con items: una `ul` con una línea por `CartLine` (`"<qty> × <name>"` y `"S/ <amount>"`; en tiers con asiento, debajo, los `seatLabels`);
  - sin items: el texto "Todavía no elegiste entradas. Toca una zona o usa los botones +." en un recuadro con borde punteado;
  - el total: `"Total (<formatTicketCount(count)>)"` y `"S/ <total>"`;
  - el CTA "Continuar" (ícono `ArrowRight`): con `count > 0` es un `Link` de `next/link` a `continueHref`; con `count === 0` es un `Button disabled`, sin `href`.
  
  En desktop es la columna derecha (`lg:grid-cols-[minmax(0,1fr)_420px]`) con `lg:sticky lg:top-6`, y está oculta en mobile (`hidden lg:flex`).
- AC-26: `OrderMobileBar` (`lg:hidden`) es una barra `fixed inset-x-0 bottom-0 z-40` con `"Total · <formatTicketCount(count)>"` y `"S/ <total>"` dentro de un contenedor `aria-live="polite"`, y el mismo CTA "Continuar" con las mismas reglas que AC-25. La página agrega padding inferior en mobile (por ejemplo `pb-28 lg:pb-0`) para que la barra no tape contenido. No se renderiza si el evento está agotado (AC-22).
- AC-27: estado del carrito en `TicketSelection` (`"use client"`):
  - al montar y cuando cambia `event.slug`, en un `useEffect`, rehidrata y después fija el evento: `Promise.resolve(useCartStore.persist.rehydrate()).then(() => useCartStore.getState().setEvent(event.slug))`. Así, cambiar de evento vacía el carrito, recargar el mismo evento lo conserva y no hay error de hidratación SSR;
  - las líneas, el total y el conteo salen de `getCartLines`, `getCartTotal` y `getCartCount` con `event.tiers`, sin recalcular precios en el componente;
  - los `seatLabels` salen de `findSeat` + `formatSeatLabel` (los ids que `findSeat` no encuentra se omiten);
  - `continueHref` es `"/checkout"`.
- AC-28: layout responsive: en desktop, grid de 2 columnas (contenido y `OrderSummary`), con padding horizontal amplio (`lg:px-20` o similar); en mobile, una sola columna con `px-4`, las secciones como tarjetas blancas con borde y esquinas redondeadas sobre fondo `bg-zinc-100`, y el mapa ocupando todo el ancho de la tarjeta. Ningún elemento produce scroll horizontal a 360px de ancho. Todos los controles interactivos miden 40px o más (44px en mobile), salvo los asientos del SVG, que se amplían con zoom.

## Tests requeridos
- `src/modules/venue/schemas/venue.schema.test.ts`: `venueZoneSchema` acepta una zona `standing` sin `rows` y una `seated` con filas; rechaza una `seated` sin `rows` o con `rows: []`, un `kind` desconocido, un `seat.status` desconocido y un `seat.number` 0 o decimal; `venueMapSchema` rechaza `zones: []` y un `viewBox` con ancho 0. Cubre AC-2.
- `src/modules/venue/data/venue-maps.mock.test.ts`: cada mapa pasa `venueMapSchema.parse`; claves exactas de AC-4 y tipos de zona por tier; invariantes (a) a (g) de AC-5 contra `eventDetails` de `event-details.mock.ts`. Cubre AC-3, AC-4 y AC-5.
- `src/modules/venue/services/venue.service.test.ts`: `getByEventSlug` con slug con mapa, sin mapa e inexistente; `getSeatsViewBox` con una zona fixture de valores conocidos (y con `padding` explícito); `findSeat` con id válido, inexistente y de zona `standing`; `formatSeatLabel`; `isZoneAvailable` en los 4 casos de AC-6; `getZoneByTierId`. Cubre AC-6.
- `src/lib/color.test.ts`: los 4 ejemplos de AC-7. Cubre AC-7.
- `src/modules/order/store/cart.store.test.ts`: casos de AC-12. Cubre AC-8 a AC-12.
- UI (T3, T4) y T0: composición visual sobre lógica ya testeada, sin test unitario obligatorio. El reviewer los valida leyendo el código contra AC-1 y AC-13 a AC-28. Al final se ejecuta `npm run build` para verificar `generateStaticParams`, `generateMetadata`, los tipos y el import de `react-zoom-pan-pinch`.

## Cambios al plan
- Se agrega `src/lib/color.ts` (`getContrastTextColor`, con test) en T1: los colores de tier del mock van de claros (`#F59E0B`) a oscuros (`#6366F1`), y un color de texto fijo no se lee sobre todos. Es transversal (no es de venue), por eso va en `src/lib/`.
- Relación 1:1 tier ↔ zona en cada mapa (AC-5b). Así "máximo 6 por zona" del diseño equivale a "máximo 6 por tier", y el carrito puede guardar items por `tierId`, como pedía el plan, sin ambigüedad.
- Las coordenadas de los asientos son del plano propio de cada zona, no del recinto: `SeatPicker` dibuja solo la zona elegida y calcula el `viewBox` con `getSeatsViewBox`. El mapa general solo dibuja formas de zona. Esto evita que los asientos queden diminutos en el mapa general.
- `venueZoneSchema` es una unión discriminada por `kind`, en lugar de `rows?` opcional. Así el propio schema garantiza que las zonas `seated` tienen filas y las `standing` no.
- El carrito guarda `standing: Record<tierId, qty>` y `seated: Record<tierId, seatIds[]>` en lugar de un array de items, y los precios no se guardan: total y líneas se calculan con los tiers del evento (funciones puras), para no persistir precios desactualizados.
- `persist` con `skipHydration: true` y rehidratación explícita en el cliente (AC-27), para evitar diferencias entre el HTML del servidor y el primer render del cliente.
- Eventos sin mapa (7 de 9): usan la lista de tiers con contadores (entrada general), así todos los eventos no agotados se pueden comprar sin crear 9 mapas.
- La página de entradas usa su propio header de compra (`PurchaseStepsHeader`), no `SiteHeader`/`SiteFooter`, como el diseño.
- Se agrega un componente interno `ZoomableCanvas` (en T3) para no duplicar `TransformWrapper` + controles entre `VenueZoneMap` y `SeatPicker` (DRY). También se agrega el contenedor `TicketSelection` (en T4), que conecta el store con los componentes presentacionales.
- En `TierQuantityList`, los tiers con asiento no tienen contador: muestran los asientos elegidos y un botón "Elegir asientos" que selecciona su zona en el mapa.
- Zoom con la rueda del mouse deshabilitado, y pan deshabilitado a escala 1, para no bloquear el scroll de la página en desktop ni en mobile. El zoom se hace con los botones o con pinch.
- El formato de fecha del bloque del evento se hace con `Intl.DateTimeFormat` dentro de la página y no se importa de `event-detail-info.tsx` (spec 003, en curso). Extraer formateadores de fecha compartidos a `src/lib/` queda como refactor posterior, fuera de esta fase.
- Precios con el formato existente `"S/ <n>"` (sin separador de miles), igual que las fases anteriores.
- Olas: T1 y T2 no comparten archivos. T3 y T4 no comparten archivos; T4 consume las firmas de T3 sin editarlas. Son 4 tareas de desarrollo más la ola 0.

## Preguntas abiertas
ninguna
