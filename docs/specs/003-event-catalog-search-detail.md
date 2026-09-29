# 003 — Catálogo de eventos: búsqueda (`/eventos`) y detalle (`/eventos/[slug]`)

Estado: approved
Fase: 3 de 7 (catálogo; después vienen 4 entradas + mapa de asientos, 5 checkout y confirmación, 6 cuenta, 7 organizador)

## Aprobación
Aprobado por el usuario el 2026-09-29 (confirmado en chat: "si").

## Contexto
La landing (specs 001/002) muestra eventos pero no hay página para explorarlos ni para ver uno. Esta fase agrega la búsqueda con filtros combinables (`/eventos`) y el detalle de evento (`/eventos/[slug]`), responsive mobile + desktop, siguiendo los diseños `Search`, `SearchMobile`, `EventDetail` y `EventDetailMobile`. Es solo UI/UX con datos mock y services sincrónicos, sin backend. Deja listo el enlace a `/eventos/[slug]/entradas`, que se construye en la fase 4.

## Alcance
- Incluye:
  - Contratos zod `ticketTierSchema` y `eventDetailSchema` (extiende `eventSchema`), mock de detalle para los 9 eventos existentes y `eventService` sincrónico (`list`, `getBySlug`, `getRelated`).
  - Store zustand `useEventSearchStore`, independiente del store de la landing (`useEventFiltersStore`), con funciones puras de búsqueda, chips de filtros activos y conteos.
  - Página `/eventos`: barra de búsqueda por texto, sidebar de filtros en desktop (categoría y ciudad con checkbox y contador, mes y rango de precio con radio), resultados con contador `aria-live`, chips removibles, orden por fecha o por precio, estado vacío con "Limpiar filtros". En mobile: chips rápidos de categoría y botón "Filtros" que abre los mismos filtros en un `Sheet`.
  - Página `/eventos/[slug]`: breadcrumb, hero de 2 columnas (apilado en mobile), botones guardar y compartir (solo visuales), "Acerca del evento", "Información importante" (`dl`), "Lugar" (mapa de relleno + dirección + "Cómo llegar"), tarjeta de tiers (`aside` sticky en desktop, barra fija inferior en mobile) y "También te puede interesar".
  - `EventCard` pasa a ser un `Link` a `/eventos/[slug]`, con prop opcional `showDate`.
  - Navbar: los links apuntan a `/eventos`, `/#categorias`, `/#como-funciona`. Landing: "Ver calendario completo" apunta a `/eventos`.
- Fuera de alcance (no agregar):
  - Filtros o búsqueda sincronizados con la URL (`searchParams`); los filtros viven solo en el store y se pierden al recargar.
  - Que `CategoryGrid` o la búsqueda de la landing naveguen a `/eventos` con filtros precargados.
  - Favoritos persistentes (guardar es un toggle local que se pierde al recargar). Compartir real (Web Share API o portapapeles).
  - Mapa real del lugar (Google Maps embebido, Leaflet, etc.): solo un placeholder.
  - Página `/eventos/[slug]/entradas`, selección de tiers, cantidades y mapa de asientos (fase 4). En esta fase los CTAs solo enlazan a esa ruta, que dará 404 hasta la fase 4.
  - Backend o fetch (axios/react-query): los services son funciones sincrónicas sobre los mocks.
  - Monedas distintas de PEN, i18n, paginación o scroll infinito, filtro por fecha exacta en `/eventos`.
  - Modificar `events.mock.ts`, `categories.mock.ts`, `useEventFiltersStore`, `CategoryFilterChips` o `UpcomingEventsGrid`.

## Módulo destino
`src/modules/event/` (schemas, data, services, store, components) + rutas `src/app/eventos/` y `src/app/eventos/[slug]/`. Cambios puntuales de enlaces en `src/components/layout/site-navbar.tsx` y `src/app/page.tsx`.

## Reutilización
- `src/modules/event/schemas/event.schema.ts` — `eventSchema`, `Event`, `Category` se reutilizan. `eventDetailSchema` se construye con `eventSchema.extend(...)`, sin redefinir los campos base.
- `src/modules/event/data/events.mock.ts` — sigue siendo la fuente de los 9 eventos base. El mock de detalle solo agrega los campos extra, indexados por `slug`, y **no duplica** los campos base.
- `src/modules/event/data/categories.mock.ts` — nombres de categoría para filtros, chips, breadcrumb y hero.
- `src/modules/event/store/event-filters.store.ts` — se reutiliza `filterEvents` para el filtro de texto dentro de `searchEvents`, llamándolo como `filterEvents(events, { search, date: null, maxPrice: null })`. No se modifica.
- `src/modules/event/components/event-card.tsx` — se reutiliza en resultados y relacionados (se extiende, no se duplica).
- `src/components/layout/site-header.tsx`, `site-footer.tsx` — layout de ambas páginas.
- `src/components/ui/{button,badge,card,input,separator,sheet}.tsx` — ya instalados. `Sheet` sirve para los filtros en mobile e `Input` para la búsqueda.
- `src/lib/utils.ts` — `cn()`.
- `lucide-react` — íconos (`Calendar`, `Clock`, `MapPin`, `Heart`, `Share2`, `SlidersHorizontal`, `X`, `Search`, `Music`, `User`, `QrCode`, `Lock`, `ArrowRight`).
- shadcn a instalar (Ola 0): `npx shadcn add checkbox radio-group label breadcrumb`.
- No se instala ninguna otra dependencia. Para el orden por fecha o precio se usan `Button` con `aria-pressed`; no se instala `toggle-group`.

## Contratos
```ts
// src/modules/event/schemas/event.schema.ts  (se agrega; lo existente no cambia)
export const ticketTierStatusSchema = z.enum(["available", "last_tickets", "sold_out"]);

export const ticketTierSchema = z.object({
  id: z.string(),
  name: z.string(),                                  // "General", "VIP", ...
  price: z.number().nonnegative(),                   // PEN
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),      // color del indicador del tier
  status: ticketTierStatusSchema,
});
export type TicketTier = z.infer<typeof ticketTierSchema>;

export const eventDetailSchema = eventSchema.extend({
  description: z.string().min(1),
  doorsOpenAt: z.string().datetime({ offset: true }), // ISO con offset, anterior a startDate
  minAge: z.number().int().nonnegative().nullable(),  // null = todo público
  venueAddress: z.string().min(1),
  tiers: z.array(ticketTierSchema).min(1),
});
export type EventDetail = z.infer<typeof eventDetailSchema>;

// src/modules/event/data/event-details.mock.ts
export type EventDetailExtra = Omit<EventDetail, keyof Event>;
export const eventDetails: Record<string, EventDetailExtra>; // clave = slug; 9 entradas

// src/modules/event/services/event.service.ts
export const eventService: {
  list(): Event[];                                   // todos los eventos, orden ascendente por startDate, copia nueva
  getBySlug(slug: string): EventDetail | null;       // Event base + extra; null si el slug no existe o no tiene detalle
  getRelated(slug: string, limit?: number): Event[]; // limit = 4 por defecto
};

// src/modules/event/store/event-search.store.ts
export type PriceRangeKey = "any" | "u50" | "50-150" | "150-300" | "300+";
export type EventSort = "date" | "price";

export type EventSearchFilters = {
  search: string;
  categories: string[];      // categorySlug[]
  cities: string[];          // city[]
  month: string | null;      // "YYYY-MM" o null = cualquier fecha
  priceRange: PriceRangeKey;
  sort: EventSort;
};

export type EventSearchState = EventSearchFilters & {
  setSearch: (v: string) => void;
  toggleCategory: (slug: string) => void;
  toggleCity: (city: string) => void;
  setMonth: (v: string | null) => void;
  setPriceRange: (v: PriceRangeKey) => void;
  setSort: (v: EventSort) => void;
  clearFilters: () => void;  // resetea categories, cities, month, priceRange; NO toca search ni sort
};
export const useEventSearchStore: UseBoundStore<StoreApi<EventSearchState>>;

// min exclusivo, max inclusivo; null = sin límite
export const PRICE_RANGES: ReadonlyArray<{ key: PriceRangeKey; label: string; min: number | null; max: number | null }>;
// [{ "any","Cualquier precio",null,null }, { "u50","Hasta S/ 50",null,50 }, { "50-150","S/ 50 – 150",50,150 },
//  { "150-300","S/ 150 – 300",150,300 }, { "300+","Más de S/ 300",300,null }]

export type ActiveFilterChip = { key: string; label: string; remove: () => void };

export function searchEvents(events: Event[], filters: EventSearchFilters): Event[];
export function getActiveFilterChips(state: EventSearchState): ActiveFilterChip[];
export function countBy(events: Event[], field: "categorySlug" | "city"): Record<string, number>;
export function getAvailableMonths(events: Event[]): string[];   // "YYYY-MM" únicos, ascendentes
export function formatMonthLabel(month: string): string;         // "2026-10" -> "Octubre 2026"

// src/modules/event/components/event-card.tsx
export function EventCard(props: { event: Event; showDate?: boolean }): JSX.Element;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| S0 | 0 | Setup: shadcn y enlaces de navegación | `src/components/ui/checkbox.tsx`, `src/components/ui/radio-group.tsx`, `src/components/ui/label.tsx`, `src/components/ui/breadcrumb.tsx`, `package.json` / `package-lock.json` (solo si el CLI los toca), `src/components/layout/site-navbar.tsx`, `src/app/page.tsx` | — | AC-1, AC-2 |
| T1 | 1 | Contratos, mock de detalle y service | `src/modules/event/schemas/event.schema.ts`, `src/modules/event/schemas/event.schema.test.ts`, `src/modules/event/data/event-details.mock.ts`, `src/modules/event/services/event.service.ts`, `src/modules/event/services/event.service.test.ts` | S0 | AC-3, AC-4, AC-5, AC-6, AC-7 |
| T2 | 1 | Store de búsqueda y funciones puras | `src/modules/event/store/event-search.store.ts`, `src/modules/event/store/event-search.store.test.ts` | S0 | AC-8, AC-9, AC-10, AC-11, AC-12 |
| T3 | 2 | Página `/eventos` y `EventCard` enlazable | `src/app/eventos/page.tsx`, `src/modules/event/components/event-search-bar.tsx`, `src/modules/event/components/event-search-filters.tsx`, `src/modules/event/components/event-search-results.tsx`, `src/modules/event/components/event-card.tsx` | T1, T2 | AC-13 a AC-19 |
| T4 | 2 | Página `/eventos/[slug]` | `src/app/eventos/[slug]/page.tsx`, `src/modules/event/components/event-detail-hero.tsx`, `src/modules/event/components/event-detail-info.tsx`, `src/modules/event/components/event-tier-summary.tsx`, `src/modules/event/components/related-events.tsx` | T1 (y usa `EventCard` de T3 sin editarlo) | AC-20 a AC-27 |

Notas de ejecución:
- T4 importa `EventCard` como `<EventCard event={e} />` y **no edita** `event-card.tsx`, que es de T3. El contrato `{ event: Event; showDate?: boolean }` es compatible hacia atrás, así que T4 compila aunque T3 no haya terminado.
- T3 y T4 obtienen los eventos con `eventService`. No importan `events.mock.ts` ni `event-details.mock.ts` directamente.
- Antes de escribir T4, lee la guía de Next 16 sobre páginas dinámicas, `generateStaticParams`, `generateMetadata` y `params` como `Promise` en `node_modules/next/dist/docs/`. **En este workspace `node_modules` no está instalado**: corre `npm install --legacy-peer-deps` primero.

## Criterios de aceptación

### Setup (S0)
- AC-1: existen `src/components/ui/{checkbox,radio-group,label,breadcrumb}.tsx`, generados por `npx shadcn add` y sin editar a mano.
- AC-2: en `site-navbar.tsx`, `navLinks` es `[{ "Eventos", "/eventos" }, { "Categorías", "/#categorias" }, { "Cómo funciona", "/#como-funciona" }]`, y lo usan tanto el menú de desktop como el `Sheet` mobile. En `src/app/page.tsx`, el link "Ver calendario completo" tiene `href="/eventos"`. No hay otros cambios en esos dos archivos.

### Contratos, mock y service (T1)
- AC-3: `event.schema.ts` exporta `ticketTierStatusSchema`, `ticketTierSchema`, `TicketTier`, `eventDetailSchema` (definido con `eventSchema.extend`) y `EventDetail`, exactamente como en Contratos. `categorySchema`, `eventSchema`, `Category` y `Event` no cambian.
- AC-4: `event-details.mock.ts` exporta `eventDetails` con una entrada por cada `slug` de `events.mock.ts` (9), y solo contiene los campos de `EventDetailExtra`. Cada evento tiene entre 3 y 5 tiers, con `id` únicos dentro del evento. `doorsOpenAt` es anterior a `startDate`. Hay al menos un evento con `minAge: null` y al menos uno con `minAge` numérico.
- AC-5: los tiers del mock son coherentes con el evento base, sin modificar `events.mock.ts`:
  - (a) si `event.status !== "sold_out"`, `event.priceFrom` es igual al menor `price` entre los tiers con `status !== "sold_out"`;
  - (b) si `event.status === "sold_out"`, todos sus tiers están `sold_out` y `event.priceFrom` es igual al menor `price` de sus tiers;
  - (c) si `event.status === "last_tickets"`, al menos un tier está en `last_tickets`;
  - (d) si `event.status === "available"`, al menos un tier está en `available`;
  - (e) al menos un evento no agotado tiene un tier `sold_out`.
- AC-6: `eventService.list()` devuelve los 9 eventos en orden ascendente de `startDate`, en un array nuevo (mutarlo no afecta llamadas posteriores). `eventService.getBySlug(slug)` devuelve un objeto que pasa `eventDetailSchema.parse`, con los campos base idénticos al evento del mock, y devuelve `null` para un slug inexistente.
- AC-7: `eventService.getRelated(slug, limit = 4)`:
  - nunca incluye el evento `slug`;
  - devuelve primero los de la misma `categorySlug`, en orden ascendente de fecha, y después completa con los demás, también por fecha ascendente;
  - devuelve como máximo `limit` elementos;
  - devuelve `[]` si el slug no existe.
  - Ejemplo verificable: `getRelated("noches-de-rock-lima")[0].slug === "sinfonica-nacional-en-vivo"`.

### Store de búsqueda (T2)
- AC-8: `useEventSearchStore` arranca con `{ search: "", categories: [], cities: [], month: null, priceRange: "any", sort: "date" }`. `toggleCategory` y `toggleCity` agregan el valor si no está y lo quitan si ya está. `clearFilters` deja `categories: []`, `cities: []`, `month: null` y `priceRange: "any"`, y conserva `search` y `sort`. El store no importa ni modifica `useEventFiltersStore`.
- AC-9: `searchEvents(events, filters)`:
  - aplica el texto con `filterEvents` de `event-filters.store.ts` (no reimplementa la búsqueda);
  - las categorías y ciudades se combinan con OR dentro del grupo y con AND entre grupos; un grupo vacío no restringe;
  - `month` compara con `startDate.slice(0, 7)`, que no depende de la zona horaria del runtime;
  - `priceRange` filtra `priceFrom` con `min < priceFrom <= max` según `PRICE_RANGES` (un límite `null` no restringe), así que `priceFrom = 50` entra en `"u50"` y no en `"50-150"`;
  - al final ordena: con `"date"`, ascendente por `startDate`; con `"price"`, ascendente por `priceFrom` y, a igual precio, por fecha;
  - no muta el array de entrada;
  - no excluye eventos agotados.
- AC-10: `getActiveFilterChips(state)` devuelve, en este orden:
  - un chip por categoría (label = `name` de `categories.mock`, o el slug si no se encuentra);
  - uno por ciudad (label = ciudad);
  - uno de mes si `month !== null` (label = `formatMonthLabel(month)`);
  - uno de precio si `priceRange !== "any"` (label = label de `PRICE_RANGES`).
  
  `search` y `sort` no generan chip. `key` es único. Cada `remove()` deshace solo ese filtro (`toggleCategory`, `toggleCity`, `setMonth(null)` o `setPriceRange("any")`).
- AC-11: `countBy(events, field)` devuelve un `Record` con la cantidad de eventos por cada valor de `field`. Se calcula sobre la lista que recibe; la UI le pasa el catálogo completo, no el filtrado. `getAvailableMonths(events)` devuelve los `"YYYY-MM"` únicos, en orden ascendente. `formatMonthLabel("2026-10")` devuelve `"Octubre 2026"` (mes en español, con mayúscula inicial) y se calcula sin `Date`, para no depender de la zona horaria.
- AC-12: `event-search.store.test.ts` cubre AC-8 a AC-11 con al menos estos casos:
  - estado inicial y `clearFilters`;
  - toggle agrega y quita;
  - solo texto;
  - OR dentro de categorías;
  - AND categoría + ciudad;
  - mes;
  - bordes de precio (50 y 150);
  - orden por precio con empate;
  - sin filtros devuelve todo ordenado por fecha;
  - chips y su `remove`;
  - `countBy`;
  - `getAvailableMonths` y `formatMonthLabel`.

### Página `/eventos` (T3)
- AC-13: `src/app/eventos/page.tsx` es un server component (sin `"use client"`) que exporta `metadata` con `title: "Explora eventos | Ticketera"`, renderiza `SiteHeader`, un `h1` "Explora eventos", la barra de búsqueda, los filtros y los resultados, y `SiteFooter`. Obtiene la lista con `eventService.list()`, ya sea en la página o en los componentes cliente.
- AC-14: `EventCard` renderiza un `Link` de `next/link` a `/eventos/${event.slug}` como elemento raíz, sin `<a>` ni botones anidados dentro. El contrato es `{ event: Event; showDate?: boolean }`. Con `showDate` muestra una línea con ícono de calendario y la fecha corta, por ejemplo "sáb 14 nov", formateada con `Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Lima" })`. Sin `showDate` se ve igual que hoy, así que la landing no cambia visualmente.
- AC-15: `EventSearchBar` es un `form role="search"` con un `Input type="search"` y un `label` visible o `aria-label` "Qué quieres ver", enlazado a `setSearch` del store. El submit hace `preventDefault` y no navega. El filtrado se aplica mientras se escribe.
- AC-16: `EventSearchFilters` renderiza un bloque "Filtros" con 4 `fieldset`/`legend`:
  - "Categoría": `Checkbox` + `Label` por cada categoría de `categories.mock`, con el contador de `countBy(all, "categorySlug")`;
  - "Ciudad": `Checkbox` + `Label` por cada ciudad distinta del catálogo, en orden alfabético, con el contador de `countBy(all, "city")`;
  - "Fecha": `RadioGroup` con "Cualquier fecha" y un radio por cada mes de `getAvailableMonths(all)` con `formatMonthLabel`;
  - "Precio desde": `RadioGroup` con los 5 `PRICE_RANGES`.
  
  Tiene además un botón "Limpiar" (`clearFilters`), visible solo si hay chips activos. Todos los controles leen del store y escriben en él. Cada control tiene su label asociado y el área clicable mide 38px o más de alto.
- AC-17: `EventSearchResults` renderiza:
  - un contador `<p aria-live="polite">` con "1 evento" o "N eventos" (el total de `searchEvents`);
  - los chips de `getActiveFilterChips` como `button` con `aria-label="Quitar filtro <label>"` e ícono `X`;
  - un selector de orden con dos `Button` "Fecha" y "Precio más bajo", con `aria-pressed` según `sort`;
  - la grilla de `EventCard showDate`, con clases `grid-cols-1` en mobile, `sm:grid-cols-2` y `xl:grid-cols-3`;
  - si hay 0 resultados, el estado vacío con el título "No encontramos eventos con esos filtros", el texto "Prueba quitando algún filtro o buscando otra ciudad." y un botón "Limpiar filtros" que llama a `clearFilters` y además a `setSearch("")`.
- AC-18: layout responsive:
  - desktop (`lg:` y más): grid de 2 columnas, con el sidebar `aside aria-label="Filtros"` de unos 288px a la izquierda, y resultados `section aria-label="Resultados"`;
  - mobile (menos de `lg`): el sidebar está oculto (`hidden lg:block`), y bajo la barra de búsqueda aparecen chips rápidos de categoría (scroll horizontal, `aria-pressed`, llaman a `toggleCategory`) y un botón "Filtros" con la cantidad de filtros activos, que abre un `Sheet` con el **mismo** componente `EventSearchFilters`, sin duplicar el marcado de los filtros.
- AC-19: cambiar cualquier filtro, el texto o el orden actualiza el contador, los chips y la grilla sin recargar ni navegar. Los componentes con estado llevan `"use client"`.

### Página `/eventos/[slug]` (T4)
- AC-20: `src/app/eventos/[slug]/page.tsx` es un server component:
  - tipa `params` como `Promise<{ slug: string }>` y lo espera con `await`;
  - exporta `generateStaticParams` a partir de `eventService.list()`;
  - exporta `generateMetadata`, que devuelve `title: "<event.title> | Ticketera"` y `description` = los primeros 160 caracteres de `description`;
  - llama a `notFound()` de `next/navigation` cuando `eventService.getBySlug` devuelve `null`.
- AC-21: breadcrumb con los componentes shadcn `Breadcrumb*`: "Inicio" (`/`), luego el nombre de la categoría (`/eventos`) y después el título del evento como `BreadcrumbPage` (`aria-current="page"`).
- AC-22: `EventDetailHero`:
  - grid de 2 columnas en `lg:` (texto e imagen con `next/image`) y apilado en mobile, con la imagen arriba;
  - badge con el nombre de la categoría y `h1` con el título;
  - lista de fecha larga ("sábado 14 de noviembre"), hora de inicio ("21:00") y "venueName, city", formateadas con `Intl.DateTimeFormat("es-PE", …)` y `timeZone: "America/Lima"`;
  - CTA "Comprar entradas · desde S/ {priceFrom}" como `Link` a `/eventos/{slug}/entradas`;
  - botón "Guardar evento" (`aria-label`, `aria-pressed` que alterna el ícono `Heart` relleno con estado local `useState`, sin persistencia) y botón "Compartir evento" (`aria-label`, sin comportamiento). Solo el componente que tiene el toggle lleva `"use client"`.
- AC-23: `EventDetailInfo` renderiza tres `section`, cada una con su `h2`:
  - "Acerca del evento" con `description`;
  - "Información importante" como `dl` con 4 pares `dt`/`dd`: "Apertura de puertas" (hora de `doorsOpenAt`), "Inicio del show" (hora de `startDate`), "Edad mínima" (`"+{minAge}"` o `"Todo público"` si es `null`) e "Ingreso" ("Entrada digital con QR"); 2 columnas en `sm:` y 1 en mobile;
  - "Lugar" con un placeholder de mapa (bloque con ícono `MapPin`, sin mapa real), `venueName`, "`venueAddress`, `city`" y un link "Cómo llegar" a `https://www.google.com/maps/search/?api=1&query=<encodeURIComponent(venueName + ", " + venueAddress + ", " + city)>` con `target="_blank" rel="noopener noreferrer"`.
- AC-24: `EventTierSummary` es un `aside aria-label="Entradas"` con:
  - "Entradas desde S/ {priceFrom}";
  - una `ul` de tiers con un cuadro de color (`style={{ backgroundColor: tier.color }}`), el nombre, el badge "Últimas" si `last_tickets` y el precio "S/ {price}", o el texto "Agotado" si `sold_out`;
  - un CTA "Elegir entradas" (`Link` a `/eventos/{slug}/entradas`);
  - la nota "Pago seguro · Entrada digital con QR".
  
  En desktop es la columna derecha (unos 400px) con `lg:sticky lg:top-6`; en mobile aparece dentro del flujo, después de "Información importante".
- AC-25: en mobile (`lg:hidden`) hay una barra `fixed inset-x-0 bottom-0 z-40` con "Desde S/ {priceFrom}" y el CTA a `/eventos/{slug}/entradas`. La página agrega padding inferior en mobile (por ejemplo `pb-24 lg:pb-0`) para que la barra no tape contenido. La barra puede exportarse desde `event-tier-summary.tsx`.
- AC-26: si `event.status === "sold_out"`, los tres CTAs (hero, tarjeta de tiers y barra mobile) se renderizan como `Button disabled` con el texto "Agotado", en lugar de `Link`, así que no hay `href` a `/entradas` en esa página.
- AC-27: `RelatedEvents` recibe `Event[]` (el resultado de `eventService.getRelated(slug)`) y renderiza:
  - la sección "También te puede interesar";
  - un link "Ver más {categoría en minúscula}" a `/eventos`;
  - una grilla de `EventCard showDate` con `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
  
  No renderiza nada si la lista está vacía y no edita `event-card.tsx`.

## Tests requeridos
- `src/modules/event/schemas/event.schema.test.ts` (se amplía y conserva los tests actuales): `ticketTierSchema` rechaza un color que no sea hex, un precio negativo y un status desconocido; `eventDetailSchema` rechaza `tiers: []`. Cada `{ ...event, ...eventDetails[event.slug] }` pasa `eventDetailSchema.parse`. Cubre las invariantes de AC-4 y AC-5 (a–e). Cubre AC-3, AC-4 y AC-5.
- `src/modules/event/services/event.service.test.ts`: orden y copia de `list()`, `getBySlug` con slug válido e inválido, y `getRelated` (se excluye a sí mismo, misma categoría primero, `limit`, ejemplo de AC-7, slug inexistente). Cubre AC-6 y AC-7.
- `src/modules/event/store/event-search.store.test.ts`: casos de AC-12 con fixtures propios de `Event[]`, como en `event-filters.store.test.ts`. Resetea el store entre tests con `useEventSearchStore.setState(...)`. Cubre AC-8 a AC-12.
- UI (T3, T4) y S0: composición visual sobre lógica ya testeada, sin test unitario obligatorio. El reviewer los valida leyendo el código contra AC-1, AC-2 y AC-13 a AC-27. Se ejecuta `npm run build` al final para verificar `generateStaticParams`, `generateMetadata` y los tipos.

## Cambios al plan
- En T2 se agregan dos helpers puros que el plan no nombraba: `getAvailableMonths` y `formatMonthLabel`. Son necesarios para las opciones del filtro de fecha y para el label del chip de mes. Van en el mismo archivo y test de T2; no hay archivos nuevos.
- En T2 se agrega la constante `PRICE_RANGES` (key, label, min, max) como fuente única para el filtro de precio, las opciones de radio y los labels de chips, para no repetir rangos en la UI (DRY).
- `getActiveFilterChips` recibe el estado completo del store (filtros y acciones), porque `remove` necesita llamar a la acción correspondiente. Se precisa el orden de los chips y que `search` y `sort` no generan chip.
- `clearFilters` no resetea `search` ni `sort`, igual que el diseño (el "Limpiar" del sidebar). El botón "Limpiar filtros" del estado vacío sí limpia también `search`, para que el usuario salga del estado vacío con un solo clic.
- Se precisa la regla de `priceFrom` para eventos agotados (AC-5b), que el plan no cubría: todos los tiers agotados y `priceFrom` = tier más barato. Así el mock de detalle es coherente sin tocar `events.mock.ts`.
- `month` se compara con `startDate.slice(0, 7)`, y las fechas del detalle se formatean con `timeZone: "America/Lima"`, para evitar diferencias entre SSR y cliente y tests que dependan de la zona horaria.
- El `EventSearchBar` del diseño de desktop tiene botones "Fecha" y "Precio" dentro de la barra. Se omiten porque duplican los filtros del sidebar (KISS); la barra queda solo con texto + "Buscar".
- "Cómo llegar" enlaza a una búsqueda de Google Maps (URL pública, sin API key ni embebido). El mapa del lugar sigue siendo un placeholder.
- Dependencias: T1 y T2 dependen de S0 solo por orden de olas; no comparten archivos. T4 consume `EventCard` de T3 en la misma ola sin editarlo (el contrato es compatible hacia atrás). No hay archivos compartidos entre tareas de la misma ola.
- `node_modules` no está instalado en el workspace. S0 corre `npm install --legacy-peer-deps` antes de `npx shadcn add`.
- Fases siguientes (cada una con su propia spec y aprobación): 4 entradas + mapa de asientos (SVG propio + `react-zoom-pan-pinch`), en `/eventos/[slug]/entradas`; 5 checkout y confirmación; 6 cuenta; 7 organizador.

## Preguntas abiertas
ninguna
