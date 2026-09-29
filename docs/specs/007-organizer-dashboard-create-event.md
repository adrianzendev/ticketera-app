# 007 — Organizador: panel de eventos y crear evento (`/organizador`, `/organizador/eventos/nuevo`)

Estado: done
Fase: 7 de 7 (organizador; última fase planificada)

## Aprobación
Aprobado por el usuario el 2026-09-29 (confirmado en chat: "si").

## Contexto
El navbar tiene "Vender entradas" con `href="#"`. Esta fase agrega el área del organizador: un panel (`/organizador`) con KPIs de ventas y la lista de eventos del organizador con su estado, y un formulario para crear un evento (`/organizador/eventos/nuevo`) con datos básicos, fecha y lugar, imagen de portada, tipos de entrada dinámicos y vista previa en vivo. Al guardar (borrador o publicado) el evento se agrega a un store mock en `sessionStorage` y el panel lo muestra. Requiere sesión (mock de la fase 6). Sigue los diseños `OrgDashboard`, `OrgDashboardMobile`, `OrgCreate` y `OrgCreateMobile`, responsive en mobile y desktop. Es solo UI/UX con datos mock.

## Alcance
- Incluye:
  - Ola 0 (compartido): schema zod del evento del organizador (con test), el marco de campo de formulario extraído de `auth-form-field.tsx` a `src/components/form/form-field.tsx` (el login y el registro lo usan sin cambio visual), el layout del área `OrganizerShell` (sidebar en desktop, header + `Sheet` en mobile, estados "cargando" y "sin sesión"), la imagen con placeholder `OrganizerEventImage`, y los accesos: "Vender entradas" del navbar → `/organizador`, y el ítem "Panel de organizador" en el menú de cuenta.
  - Módulo `src/modules/organizer/`: 4 eventos mock con tiers (precio, capacidad, vendidas), métricas por evento, KPIs, filtro por estado, unión de eventos mock + creados, formateo de montos (con tests) y store `useOrganizerEventStore` en `sessionStorage` (con test).
  - Lógica del formulario: schema zod de creación con errores por campo y por tipo de entrada (con test), vista previa y construcción del evento (con test), hook `useEventForm` con tiers dinámicos (con test).
  - Ruta `/organizador`: encabezado con "Crear evento", KPIs (Entradas vendidas, Ingresos, Eventos publicados), filtro Todos / Publicados / Borradores, tabla en desktop (`@tanstack/react-table`) y tarjetas en mobile, aviso tras crear un evento y resaltado de ese evento.
  - Ruta `/organizador/eventos/nuevo`: secciones Información básica, Fecha y lugar, Imagen de portada (archivo local con preview, arrastrar o elegir), Tipos de entrada (agregar/quitar, precio, cantidad, capacidad total), vista previa en vivo, "Guardar borrador" y "Publicar evento" con validación accesible; al guardar vuelve al panel mostrando el evento.
- Fuera de alcance (no agregar):
  - Backend, subida real de imágenes, recorte o redimensionado de imágenes, pegar una URL de imagen (el diseño solo tiene subida de archivo).
  - Editar, duplicar, borrar o despublicar eventos. "Editar" y "Ver ventas" solo muestran el aviso "Esta opción estará disponible pronto.".
  - Páginas "Ventas" y "Configuración" del sidebar (no se muestran; ver Cambios al plan). Gráficos (el diseño no tiene). Búsqueda u orden en la lista (el diseño solo tiene el filtro por estado). Estado "Finalizado".
  - Publicar en el catálogo público: los eventos creados **no** aparecen en `/`, `/eventos` ni tienen página de detalle o compra.
  - Editor de mapa de asientos, tiers numerados, colores por tier, fecha de apertura de puertas, edad mínima, dirección del lugar.
  - Roles de organizador, cuentas de organizador distintas de la sesión mock, asociar eventos a un usuario (todos los usuarios con sesión ven los mismos mock más los creados en esa pestaña), aviso de cambios sin guardar al salir del formulario.
  - Dependencias nuevas o componentes shadcn nuevos (el entorno bloquea `ui.shadcn.com`). Modificar `src/modules/event/*`, `src/modules/venue/*`, `src/modules/order/*`, `src/components/ui/*`, `src/lib/validation.ts`, `src/hooks/use-validated-form.ts` o `src/modules/auth/{schemas,services,store,hooks}/*`.

## Módulo destino
- `src/modules/organizer/` (nuevo): `schemas`, `data`, `services`, `store`, `hooks`, `components`.
- Transversal: `src/components/form/form-field.tsx` (nuevo), `src/components/layout/site-navbar.tsx`; ediciones puntuales en `src/modules/auth/components/auth-form-field.tsx` y `account-menu.tsx`.
- Rutas `src/app/organizador/` y `src/app/organizador/eventos/nuevo/`.

## Reutilización
- `src/modules/auth/hooks/use-session.ts`: `useSession()` para el acceso (estados `loading` / `anonymous` / `authenticated`) en `OrganizerShell`.
- `src/modules/auth/store/auth.store.ts`: `useAuthStore((s) => s.logout)` para "Cerrar sesión" del sidebar y del `Sheet`.
- `src/modules/auth/components/auth-form-field.tsx`: su `FieldFrame` + `describedBy` (label, hint, error, `aria-describedby`) se mueve a `src/components/form/form-field.tsx`; `AuthTextField`/`AuthPasswordField` pasan a usarlo sin cambiar su contrato ni su HTML. También su patrón de envío (`flushSync` + foco al primer campo inválido, `<fieldset disabled>`, `Loader2`).
- `src/lib/validation.ts`: tipo `FieldErrors<F>` (sin modificar el archivo).
- `src/hooks/use-validated-form.ts`: patrón `touched` / `submitAttempted` / errores visibles (AC-3 de la spec 006), que `useEventForm` replica para claves por tipo de entrada (ver Cambios al plan). No se modifica.
- Patrón de schemas zod 4 del proyecto: forma permisiva + un único `superRefine` + `transform` (`checkout.schema.ts`, `auth.schema.ts`).
- Patrón de stores persistidos (`order.store.ts`, `auth.store.ts`): `persist` + `createJSONStorage` + `partialize` + `version: 1` + `skipHydration: true` + `merge` validado con zod `.catch(...)`, y rehidratación en cliente con `Promise.resolve(store.persist.rehydrate()).then(...)` (`my-tickets-view.tsx`).
- `src/modules/event/data/categories.mock.ts`: `categories` (opciones del select de categoría y nombre en la vista previa).
- `src/modules/event/data/events.mock.ts`: URLs de Unsplash ya permitidas en `next.config.ts` (se copian como literales en los mock del organizador, no se importan).
- `src/lib/date.ts`: `formatEventDateShort` ("lun 5 oct"), `formatEventDayMonth` (insignia de fecha), `EVENT_TIME_ZONE`.
- `src/modules/order/components/my-tickets-view.tsx`: patrón de tarjeta "sin sesión" (`SignedOutState`) y de bloque `aria-busy` de carga, replicados en `OrganizerShell`.
- `src/modules/order/components/order-confirmation.tsx`: patrón del aviso "Esta opción estará disponible pronto." en un `<p aria-live="polite">`.
- `src/modules/event/components/event-card.tsx`: markup de referencia de la tarjeta del listado (insignia de fecha, categoría, perforación, "Desde"), que la vista previa imita (no se importa: `EventCard` es un `Link` con `Event` completo).
- `@tanstack/react-table` 9.2.4 (ya instalada, primer uso): `useTable`, `tableFeatures({})`, `createColumnHelper`, `table.FlexRender`. API v9 distinta de v8: leer `node_modules/@tanstack/react-table/skills/getting-started/SKILL.md` antes de escribir la tabla.
- `src/components/ui/button.tsx`, `input.tsx`, `sheet.tsx` (menú mobile del panel), `separator.tsx`. `select` y `textarea` nativos con las clases de control del proyecto.
- `src/lib/utils.ts`: `cn()`.
- `lucide-react`: `Ticket`, `LayoutDashboard`, `CalendarDays`, `ChartColumn`, `Plus`, `ArrowLeft`, `Menu`, `LogOut`, `CircleUserRound`, `ImagePlus`, `Trash2`, `Loader2`, `CircleCheck`, `X`.
- `next/image`, `next/link`, `useRouter` de `next/navigation`.
- shadcn a instalar: ninguno. Dependencias nuevas: ninguna.

## Contratos
```ts
// ───────────── Ola 0 (T0) ─────────────

// src/modules/organizer/schemas/organizer-event.schema.ts
export const ORGANIZER_IMAGE_URL_PATTERN: RegExp;
// acepta solo "https://images.unsplash.com/..." o "data:image/(png|jpeg);base64,..."
export function isAllowedOrganizerImageUrl(value: string): boolean;

export const organizerEventStatusSchema = z.enum(["published", "draft"]);
export type OrganizerEventStatus = z.infer<typeof organizerEventStatusSchema>;

export const organizerTierSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),          // soles
    capacity: z.number().int().positive(),
    sold: z.number().int().nonnegative(),
  })
  .refine((t) => t.sold <= t.capacity, { path: ["sold"], message: "Vendidas no puede superar la capacidad." });
export type OrganizerTier = z.infer<typeof organizerTierSchema>;

export const organizerEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string(),
  venueName: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string().datetime({ offset: true }),
  imageUrl: z.string().refine(isAllowedOrganizerImageUrl).nullable(), // null → placeholder
  status: organizerEventStatusSchema,
  tiers: z.array(organizerTierSchema).min(1),
  createdAt: z.string().datetime({ offset: true }),
});
export type OrganizerEvent = z.infer<typeof organizerEventSchema>;

// src/components/form/form-field.tsx
export const FORM_CONTROL_CLASS_NAME: string;
// "h-[52px] rounded-[14px] border-zinc-300 bg-white px-4 text-base md:text-base lg:text-[15px]"
export function getDescribedBy(id: string, options: { hint?: string; error?: string }): string | undefined;
export function FormField(props: {
  id: string; label: ReactNode; error?: string; hint?: string; labelAction?: ReactNode;
  className?: string; children: ReactNode;
}): JSX.Element;

// src/modules/organizer/components/organizer-event-image.tsx
export function OrganizerEventImage(props: {
  src: string | null; sizes: string; className?: string; iconClassName?: string;
}): JSX.Element;

// src/modules/organizer/components/organizer-shell.tsx ("use client")
export type OrganizerSection = "summary" | "events";
export const ORGANIZER_HOME_HREF = "/organizador";
export const ORGANIZER_EVENTS_HREF = "/organizador#mis-eventos";
export const CREATE_EVENT_HREF = "/organizador/eventos/nuevo";
export function OrganizerShell(props: {
  active: OrganizerSection;
  loginRedirect: string;          // ruta a la que vuelve tras iniciar sesión
  mobileHeader?: ReactNode;       // reemplaza el header mobile por defecto
  children: ReactNode;            // solo se monta con sesión
}): JSX.Element;

// ───────────── Ola 1 (T1): datos del organizador ─────────────

// src/modules/organizer/data/organizer-events.mock.ts
export const ORGANIZER_EVENTS: ReadonlyArray<OrganizerEvent>; // 4 eventos, ver AC-9

// src/modules/organizer/services/organizer.service.ts
export type EventMetrics = { sold: number; capacity: number; revenue: number; soldRatio: number };
export function getEventMetrics(event: OrganizerEvent): EventMetrics;
export type DashboardKpis = { sold: number; revenue: number; published: number };
export function getDashboardKpis(events: ReadonlyArray<OrganizerEvent>): DashboardKpis;
export type EventStatusFilter = "all" | OrganizerEventStatus;
export const EVENT_STATUS_FILTERS: ReadonlyArray<{ key: EventStatusFilter; label: string }>;
export function filterEventsByStatus(events: ReadonlyArray<OrganizerEvent>, filter: EventStatusFilter): OrganizerEvent[];
export function mergeOrganizerEvents(
  created: ReadonlyArray<OrganizerEvent>,
  mocks?: ReadonlyArray<OrganizerEvent>,   // ORGANIZER_EVENTS por defecto
): OrganizerEvent[];
export function formatNumber(value: number): string;   // "7,420"
export function formatSoles(amount: number): string;   // "S/ 1,137,270", "S/ 45.50"
export function formatTicketTotal(count: number): string; // "1 entrada", "1,500 entradas"

// src/modules/organizer/store/organizer-event.store.ts
export const ORGANIZER_EVENTS_STORAGE_KEY = "ticketera-organizer-events";
export type OrganizerEventState = {
  events: OrganizerEvent[];                 // solo los creados en esta pestaña, en orden de creación
  addEvent: (event: OrganizerEvent) => void;
};
export const useOrganizerEventStore: UseBoundStore<Mutate<StoreApi<OrganizerEventState>, [["zustand/persist", unknown]]>>;

// ───────────── Ola 1 (T2): formulario de creación ─────────────

// src/modules/organizer/schemas/event-form.schema.ts
export type TierField = "name" | "price" | "capacity";
export type TierFormValues = { key: string; name: string; price: string; capacity: string };
export type EventFormValues = {
  name: string; categorySlug: string; description: string;
  date: string;          // "YYYY-MM-DD" (input date)
  time: string;          // "HH:mm" (input time)
  venueName: string; city: string;
  imageUrl: string | null; // data URL de la portada o null
  tiers: TierFormValues[];
};
export type EventField = Exclude<keyof EventFormValues, "imageUrl" | "tiers">;
export const EVENT_FIELDS: ReadonlyArray<EventField>;
// ["name", "categorySlug", "description", "date", "time", "venueName", "city"]
export const TIER_FIELDS: ReadonlyArray<TierField>;  // ["name", "price", "capacity"]
export const MAX_TIERS = 10;
export const EVENT_NAME_MAX_LENGTH = 80;
export const DESCRIPTION_MIN_LENGTH = 20;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const TIER_MAX_PRICE = 10000;
export const TIER_MAX_CAPACITY = 100000;
export function createEmptyTier(key: string): TierFormValues;  // textos ""
export const EMPTY_EVENT_VALUES: EventFormValues;
// textos "", categorySlug "conciertos", imageUrl null, tiers [createEmptyTier("1"), createEmptyTier("2")]
export function parseTierPrice(value: string): number | null;    // "45,50" → 45.5; inválido → null
export function parseTierCapacity(value: string): number | null; // "1500" → 1500; inválido o 0 → null
export function toStartDate(date: string, time: string): string | null; // "2026-11-14","21:00" → "2026-11-14T21:00:00-05:00"
export type EventFormData = {
  title: string; categorySlug: string; description: string;
  startDate: string;     // ISO con -05:00
  venueName: string; city: string; imageUrl: string | null;
  tiers: Array<{ name: string; price: number; capacity: number }>;
};
export function createEventFormSchema(now: Date): z.ZodType<EventFormData, EventFormValues>;
export type EventFormErrors = {
  fields: FieldErrors<EventField>;
  tiers: Record<string, FieldErrors<TierField>>;   // por TierFormValues.key
};
export function getEventFormErrors(values: EventFormValues, now: Date): EventFormErrors;
export function getEventFieldId(field: EventField): string;              // "event-name"
export function getTierFieldId(key: string, field: TierField): string;   // "event-tier-1-price"
export function getFirstInvalidFieldId(values: EventFormValues, errors: EventFormErrors): string | null;

// src/modules/organizer/services/event-form.service.ts
export const COVER_IMAGE_TYPES: ReadonlyArray<string>;  // ["image/jpeg", "image/png"]
export const COVER_IMAGE_MAX_BYTES = 1_048_576;          // 1 MB
export function getCoverImageError(file: { type: string; size: number }): string | null;
export function readFileAsDataUrl(file: Blob): Promise<string>;
export type EventFormPreview = {
  categoryName: string;
  title: string | null;     // null → placeholder "Nombre del evento"
  place: string | null;     // "Lugar · Ciudad" con lo que haya; null si no hay ninguno
  day: string | null;       // "14"
  month: string | null;     // "NOV"
  minPrice: number | null;
  capacity: number;
};
export function getEventFormPreview(values: EventFormValues): EventFormPreview;
export function buildOrganizerEvent(
  data: EventFormData,
  status: OrganizerEventStatus,
  options?: { now?: Date; generateId?: () => string },  // `org-${crypto.randomUUID()}` por defecto
): OrganizerEvent;

// src/modules/organizer/hooks/use-event-form.ts
export type EventFormValidateResult =
  | { success: true; data: EventFormData }
  | { success: false; firstInvalidId: string };
export function useEventForm(options?: { initialValues?: EventFormValues; now?: () => Date }): {
  values: EventFormValues;
  errors: EventFormErrors;   // solo claves tocadas, o todas tras validate()
  canAddTier: boolean;       // tiers.length < MAX_TIERS
  canRemoveTier: boolean;    // tiers.length > 1
  setField: <K extends EventField | "imageUrl">(field: K, value: EventFormValues[K]) => void;
  blurField: (field: EventField) => void;
  setTierField: (key: string, field: TierField, value: string) => void;
  blurTierField: (key: string, field: TierField) => void;
  addTier: () => string | null;          // devuelve la key nueva, o null si no se pudo
  removeTier: (key: string) => void;
  validate: () => EventFormValidateResult;
};

// ───────────── Ola 2 (T3): panel ─────────────

// src/app/organizador/page.tsx (server)
// src/modules/organizer/components/organizer-dashboard-view.tsx ("use client")
export function OrganizerDashboardView(props: { createdId: string | null }): JSX.Element;
// src/modules/organizer/components/dashboard-kpis.tsx
export function DashboardKpis(props: { kpis: DashboardKpis }): JSX.Element;
// src/modules/organizer/components/organizer-events-table.tsx ("use client")
export function OrganizerEventsTable(props: {
  events: ReadonlyArray<OrganizerEvent>; highlightedId: string | null; onAction: () => void;
}): JSX.Element;
// src/modules/organizer/components/organizer-event-cards.tsx
export function OrganizerEventCards(props: {
  events: ReadonlyArray<OrganizerEvent>; highlightedId: string | null; onAction: () => void;
}): JSX.Element;
// src/modules/organizer/components/event-status-badge.tsx
export function EventStatusBadge(props: { status: OrganizerEventStatus; className?: string }): JSX.Element;
// src/modules/organizer/components/event-sold-progress.tsx
export function EventSoldProgress(props: { metrics: EventMetrics; showLabel?: boolean }): JSX.Element; // showLabel: true por defecto

// ───────────── Ola 2 (T4): crear evento ─────────────

// src/app/organizador/eventos/nuevo/page.tsx (server)
// src/modules/organizer/components/create-event-view.tsx ("use client")
export function CreateEventView(): JSX.Element;
// src/modules/organizer/components/event-form.tsx ("use client")
export function EventForm(): JSX.Element;
// src/modules/organizer/components/tier-fields.tsx
export function TierFields(props: {
  tiers: ReadonlyArray<TierFormValues>;
  errors: EventFormErrors["tiers"];
  canAddTier: boolean; canRemoveTier: boolean;
  onChange: (key: string, field: TierField, value: string) => void;
  onBlur: (key: string, field: TierField) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}): JSX.Element;
// src/modules/organizer/components/cover-image-field.tsx ("use client")
export function CoverImageField(props: {
  value: string | null; onChange: (dataUrl: string | null) => void;
}): JSX.Element;
// src/modules/organizer/components/event-preview-card.tsx
export function EventPreviewCard(props: { preview: EventFormPreview; imageUrl: string | null }): JSX.Element;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| T0 | 0 | Base compartida: schema del evento, campo de formulario, layout del área y accesos | `src/modules/organizer/schemas/organizer-event.schema.ts`, `src/modules/organizer/schemas/organizer-event.schema.test.ts`, `src/components/form/form-field.tsx`, `src/modules/auth/components/auth-form-field.tsx`, `src/modules/organizer/components/organizer-event-image.tsx`, `src/modules/organizer/components/organizer-shell.tsx`, `src/components/layout/site-navbar.tsx`, `src/modules/auth/components/account-menu.tsx` | — | AC-1 a AC-8 |
| T1 | 1 | Datos del organizador: mock, métricas, KPIs y store | `src/modules/organizer/data/organizer-events.mock.ts`, `src/modules/organizer/services/organizer.service.ts`, `src/modules/organizer/services/organizer.service.test.ts`, `src/modules/organizer/store/organizer-event.store.ts`, `src/modules/organizer/store/organizer-event.store.test.ts` | T0 | AC-9 a AC-14 |
| T2 | 1 | Lógica del formulario: schema, vista previa, construcción del evento y hook | `src/modules/organizer/schemas/event-form.schema.ts`, `src/modules/organizer/schemas/event-form.schema.test.ts`, `src/modules/organizer/services/event-form.service.ts`, `src/modules/organizer/services/event-form.service.test.ts`, `src/modules/organizer/hooks/use-event-form.ts`, `src/modules/organizer/hooks/use-event-form.test.ts` | T0 | AC-15 a AC-22 |
| T3 | 2 | Ruta `/organizador` (panel) | `src/app/organizador/page.tsx`, `src/modules/organizer/components/organizer-dashboard-view.tsx`, `src/modules/organizer/components/dashboard-kpis.tsx`, `src/modules/organizer/components/organizer-events-table.tsx`, `src/modules/organizer/components/organizer-event-cards.tsx`, `src/modules/organizer/components/event-status-badge.tsx`, `src/modules/organizer/components/event-sold-progress.tsx` | T0, T1 | AC-23 a AC-30 |
| T4 | 2 | Ruta `/organizador/eventos/nuevo` (crear evento) | `src/app/organizador/eventos/nuevo/page.tsx`, `src/modules/organizer/components/create-event-view.tsx`, `src/modules/organizer/components/event-form.tsx`, `src/modules/organizer/components/tier-fields.tsx`, `src/modules/organizer/components/cover-image-field.tsx`, `src/modules/organizer/components/event-preview-card.tsx` | T0, T1, T2 | AC-31 a AC-40 |

Notas de ejecución:
- T0 corre sola (ola 0): T1 y T2 importan `organizer-event.schema.ts`; T3 y T4 importan `OrganizerShell`, `OrganizerEventImage` y `FormField`. El cambio en `auth-form-field.tsx` es un refactor sin cambio de HTML ni de contrato de `AuthTextField`/`AuthPasswordField`.
- T1 y T2 no comparten archivos ni se importan entre sí: los dos importan solo de T0 (`OrganizerEvent`, `OrganizerEventStatus`, `isAllowedOrganizerImageUrl`) y de módulos existentes.
- T3 y T4 no comparten archivos ni se importan entre sí. El único contrato entre ellas es la URL `/organizador?creado=<id>` (AC-29 y AC-39). T4 importa `formatSoles`/`formatTicketTotal` de T1 y `useOrganizerEventStore` de T1.
- T3 y T4 no editan archivos de T0, T1 ni T2. Si falta algo en esos contratos, reportan `BLOCKED`.
- T3 y T4: antes de escribir las páginas, lee en `node_modules/next/dist/docs/` la guía de Next 16 sobre `searchParams` como `Promise`, `metadata` (`robots`) y `useRouter` de `next/navigation`; y para `next/image` con `data:` URLs (`unoptimized`). T3: lee `node_modules/@tanstack/react-table/skills/getting-started/SKILL.md` (API v9: `useTable`, `tableFeatures`, `table.FlexRender`; no usar `useReactTable` de v8).
- zod es 4.x; `event-form.schema.ts` usa forma permisiva + un único `superRefine` + `transform`, como `checkoutSchema` y `registerSchema`, para reportar todos los errores a la vez.

## Criterios de aceptación

### Base compartida (T0)
- AC-1: `organizer-event.schema.ts` exporta lo de Contratos. `isAllowedOrganizerImageUrl` es `true` para `"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop"`, `"data:image/png;base64,iVBORw0KGgo="` y `"data:image/jpeg;base64,/9j/4AAQ"`, y `false` para `"http://images.unsplash.com/x"`, `"https://evil.com/a.png"`, `"javascript:alert(1)"`, `"data:image/svg+xml;base64,PHN2Zz4="` y `""`. `organizerEventSchema` rechaza: un tier con `sold > capacity`, `tiers: []`, `capacity: 0`, `price: -1`, `status: "ended"` y un `startDate` sin offset (`"2026-11-14T21:00:00"`); acepta `imageUrl: null`.
- AC-2: `src/components/form/form-field.tsx` contiene el `FieldFrame` que hoy está en `auth-form-field.tsx`, renombrado `FormField` (mismo markup: contenedor `flex min-w-0 flex-col gap-2`, fila con `<label htmlFor={id} className="text-sm font-medium">` y `labelAction`, hijo, `<p id="<id>-hint" className="text-[13px] text-muted-foreground">` y `<p id="<id>-error" className="text-sm text-destructive">`), más `className` opcional en el contenedor. `getDescribedBy(id, { hint, error })` junta `"<id>-hint"` y `"<id>-error"` en ese orden, solo los que existen, o `undefined`. `FORM_CONTROL_CLASS_NAME` es la cadena de Contratos. `auth-form-field.tsx` elimina su `FieldFrame`, `describedBy` y `controlClassName` locales y los importa de `form-field.tsx`; el HTML de `/ingresar` no cambia (login y registro se ven y validan igual).
- AC-3: `OrganizerEventImage` renderiza, dentro de un contenedor `relative overflow-hidden bg-indigo-100 text-indigo-700` (con `className`):
  - con `src`: `next/image` `fill`, `alt=""`, `sizes`, `object-cover`, y `unoptimized` cuando `src` empieza con `data:`;
  - sin `src`: el ícono `ImagePlus` centrado, `aria-hidden`, con `iconClassName` (por defecto `size-6`).
- AC-4: `OrganizerShell` usa `useSession()`:
  - `"loading"`: un bloque `min-h-dvh bg-zinc-100` con `aria-busy="true"` y el texto `sr-only` "Cargando…"; no se montan los `children`;
  - `"anonymous"`: página `min-h-dvh bg-zinc-100` con un header blanco (logo de AC-5 con link a `/`) y una tarjeta centrada (`max-w-xl`, `rounded-3xl`, borde `zinc-200`, fondo blanco, igual que `SignedOutState` de Mis entradas) con ícono `Ticket` en un cuadro `bg-indigo-50 text-primary`, `h1` "Inicia sesión para vender entradas", el texto "Crea y gestiona tus eventos desde el panel de organizador. Ingresa con tu cuenta para continuar." y un link primario "Iniciar sesión" (≥ 44px) a `` `/ingresar?redirect=${encodeURIComponent(loginRedirect)}` ``. No redirige automáticamente. No se montan los `children`;
  - `"authenticated"`: el layout de AC-5 con los `children` dentro de un único `<main>` (las páginas no agregan otro `main`).
- AC-5: layout con sesión:
  - contenedor `min-h-dvh bg-zinc-100`; desde `lg` un grid `lg:grid-cols-[264px_minmax(0,1fr)]`;
  - sidebar desktop (`hidden lg:flex`, `aside`, columna, `px-4 py-6 gap-7`, fondo blanco, `border-r border-zinc-200`, `sticky top-0 h-dvh`): logo con link a `/` (cuadro de 36px `rounded-[11px] bg-primary text-primary-foreground` con `Ticket`, "Ticketera" 19px bold y debajo "Organizadores" 12px `font-medium text-zinc-600`); `nav aria-label="Panel"` con dos links de 44px, `rounded-xl`, `gap-3`, 15px: "Resumen" (`LayoutDashboard`) a `ORGANIZER_HOME_HREF` y "Mis eventos" (`CalendarDays`) a `ORGANIZER_EVENTS_HREF`. El de `active` lleva `aria-current="page"`, `bg-indigo-50 text-indigo-800 font-semibold`; el otro `text-zinc-700 font-medium hover:bg-zinc-100`. Al final (empujado con `mt-auto`, `border-t border-zinc-100`, `p-3`): avatar redondo de 40px `bg-indigo-50 text-primary` con `CircleUserRound`, el nombre del usuario (`truncate`, 14px `font-semibold`) y un `button` de 40×40 con `LogOut` `aria-hidden` y `aria-label="Cerrar sesión"` que llama a `logout()` (la página pasa al estado sin sesión, no navega);
  - header mobile (`lg:hidden`): si hay `mobileHeader`, se renderiza tal cual; si no, un `header` de 64px blanco con `border-b border-zinc-100`, el logo (cuadro de 32px, "Ticketera" 17px y "Organizadores" 11px) y un `Button variant="ghost" size="icon"` de 44px con `Menu` y `sr-only` "Abrir menú del panel" que abre un `Sheet`;
  - `Sheet` mobile: `SheetTitle` "Panel de organizador", los mismos dos links (cierran el `Sheet` al hacer click, con el mismo `aria-current`), un separador, el nombre y el correo del usuario (`break-all`), un link "Ir a Ticketera" a `/` y un `button` "Cerrar sesión" (`LogOut`) que llama a `logout()` y cierra el `Sheet`. Todos ≥ 44px;
  - no hay links "Ventas" ni "Configuración".
- AC-6: `ORGANIZER_HOME_HREF`, `ORGANIZER_EVENTS_HREF` y `CREATE_EVENT_HREF` tienen los valores de Contratos y son los únicos literales de esas rutas usados por T3 y T4.
- AC-7: navbar (`site-navbar.tsx`): los dos `render={<Link href="#" />}` de "Vender entradas" (desktop sin sesión y `Sheet` mobile) pasan a `href={ORGANIZER_HOME_HREF}`. No hay otro cambio (con sesión en desktop sigue sin mostrarse, como en la spec 006). Al hacer click en el `Sheet` se cierra.
- AC-8: `AccountMenu` agrega, entre "Mis entradas" y "Cerrar sesión", un link "Panel de organizador" (ícono `LayoutDashboard` `aria-hidden`, mismas clases `itemClassName`) a `ORGANIZER_HOME_HREF` que cierra el popover al hacer click.

### Datos del organizador (T1)
- AC-9: `ORGANIZER_EVENTS` contiene 4 eventos que pasan `organizerEventSchema.parse`, con ids y tier ids únicos, en este orden:
  1. `org-evt-1` "Festival Vive Latino Lima", `festivales`, "Estadio San Marcos", Lima, `2026-10-05T16:00:00-05:00`, `published`, imagen `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop`; tiers General (S/ 120, capacidad 6000, vendidas 5800) y VIP (S/ 250, 2000, 1620); `createdAt: "2026-07-10T15:00:00.000Z"`;
  2. `org-evt-2` "Romeo y Julieta — Obra de Teatro", `teatro`, "Teatro Municipal de Arequipa", Arequipa, `2026-11-02T20:00:00-05:00`, `published`, imagen `https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=1200&auto=format&fit=crop`; tiers Platea (S/ 60, 300, 240) y Mezanine (S/ 45, 120, 72); `createdAt: "2026-08-02T16:30:00.000Z"`;
  3. `org-evt-3` "Circo de las Estrellas", `familiar`, "Parque de la Exposición", Lima, `2026-11-22T17:00:00-05:00`, `published`, imagen `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop`; tier General (S/ 45, 1200, 414); `createdAt: "2026-08-20T14:00:00.000Z"`;
  4. `org-evt-4` "Feria Familiar de Verano", `familiar`, "Parque Selva Alegre", Arequipa, `2026-12-01T10:00:00-05:00`, `draft`, `imageUrl: null`; tier General (S/ 40, 1500, 0); `createdAt: "2026-09-18T19:45:00.000Z"`.
  
  Cada uno con una `description` de al menos 20 caracteres. Tier ids: `"<eventId>-<slug del nombre>"` (p. ej. `"org-evt-1-general"`, `"org-evt-1-vip"`).
- AC-10: `getEventMetrics(event)`: `sold` y `capacity` son las sumas de los tiers, `revenue` es la suma de `price × sold`, y `soldRatio = sold / capacity` limitado a `[0, 1]`. Para `org-evt-1`: `{ sold: 7420, capacity: 8000, revenue: 1101000, soldRatio: 0.9275 }`; para `org-evt-2`: `{ sold: 312, capacity: 420, revenue: 17640 }`; para `org-evt-4`: `sold 0`, `revenue 0`, `soldRatio 0`.
- AC-11: `getDashboardKpis(events)` suma `sold` y `revenue` de **todos** los eventos (los borradores aportan lo que tengan vendido, que en la práctica es 0) y cuenta los `published`. Con `ORGANIZER_EVENTS`: `{ sold: 8146, revenue: 1137270, published: 3 }`. Con `[]`: `{ sold: 0, revenue: 0, published: 0 }`.
- AC-12: `EVENT_STATUS_FILTERS` es `[{ key: "all", label: "Todos" }, { key: "published", label: "Publicados" }, { key: "draft", label: "Borradores" }]`. `filterEventsByStatus` devuelve una copia con todos (`"all"`) o solo los del estado, manteniendo el orden; no muta la entrada. `mergeOrganizerEvents(created, mocks = ORGANIZER_EVENTS)` devuelve los `created` ordenados por `createdAt` descendente y después los `mocks` en su orden, sin duplicados por `id` (gana el creado); no muta las entradas.
- AC-13: formateo determinista (igual en servidor y cliente, sin depender del separador de grupos del runtime; la coma agrupa miles y el punto separa decimales):
  - `formatNumber`: `0` → `"0"`, `420` → `"420"`, `7420` → `"7,420"`, `1137270` → `"1,137,270"`;
  - `formatSoles`: enteros sin decimales y el resto con 2 decimales: `0` → `"S/ 0"`, `120` → `"S/ 120"`, `1137270` → `"S/ 1,137,270"`, `45.5` → `"S/ 45.50"`, `1234.5` → `"S/ 1,234.50"`;
  - `formatTicketTotal`: `1` → `"1 entrada"`, `0` → `"0 entradas"`, `1500` → `"1,500 entradas"`.
- AC-14: `useOrganizerEventStore` arranca con `events: []`; `addEvent(event)` lo agrega al final. `persist` con `name: ORGANIZER_EVENTS_STORAGE_KEY`, `partialize` solo con `events`, `version: 1`, `skipHydration: true`, y `storage: createJSONStorage(() => ...)` sobre `sessionStorage` envuelto para que un `setItem` que lance (cuota llena por imágenes) no propague el error (el evento queda en memoria; comentario en el código). En `merge`, `events` pasa por `z.array(organizerEventSchema).catch([])`: un valor corrupto o con otra forma queda como `[]` sin lanzar. Comentario en el archivo: los eventos creados viven en `sessionStorage` como carrito y pedidos (demo por pestaña).

### Lógica del formulario (T2)
- AC-15: `event-form.schema.ts` exporta lo de Contratos, con las constantes, el orden de `EVENT_FIELDS` y `EMPTY_EVENT_VALUES` indicados. Helpers:
  - `parseTierPrice`: `trim`, reemplaza una coma por punto y acepta `/^\d{1,5}(\.\d{1,2})?$/`: `"45"` → 45, `"45.5"` → 45.5, `"45,50"` → 45.5, `"0"` → 0; `""`, `"-1"`, `"abc"`, `"45.123"`, `"1e3"` → `null`;
  - `parseTierCapacity`: `trim` y `/^\d{1,6}$/`, mayor que 0: `"1500"` → 1500; `""`, `"0"`, `"1.5"`, `"-3"` → `null`;
  - `toStartDate`: `null` si `date` no cumple `/^\d{4}-\d{2}-\d{2}$/`, no es una fecha real (`"2026-02-30"` → `null`) o `time` no cumple `/^([01]\d|2[0-3]):[0-5]\d$/`; si no, `` `${date}T${time}:00-05:00` `` (hora de Lima, sin horario de verano).
- AC-16: `createEventFormSchema(now)` (todos los errores a la vez; mensajes exactos):
  - `name`: `trim`; vacío → "Ingresa el nombre del evento."; menos de 3 o más de `EVENT_NAME_MAX_LENGTH` caracteres → "Usa entre 3 y 80 caracteres.";
  - `categorySlug`: si no es un `slug` de `categories` → "Elige una categoría.";
  - `description`: `trim`; vacío → "Describe tu evento."; menos de 20 → "Cuéntales un poco más: al menos 20 caracteres."; más de 1000 → "Usa como máximo 1000 caracteres.";
  - `date`: vacío → "Elige la fecha del evento."; formato o fecha inválida → "Ingresa una fecha válida.";
  - `time`: vacío → "Elige la hora de inicio."; formato inválido → "Ingresa una hora válida.";
  - si `date` y `time` son válidos y `new Date(toStartDate(...)) <= now` → en `date`: "Elige una fecha y hora futuras.";
  - `venueName`: `trim`; vacío → "Ingresa el lugar del evento."; más de 80 → "Usa como máximo 80 caracteres.";
  - `city`: `trim`; vacío → "Ingresa la ciudad."; más de 60 → "Usa como máximo 60 caracteres.";
  - `imageUrl`: `null` o una cadena que cumple `isAllowedOrganizerImageUrl` (no genera errores de campo en la UI: la imagen se valida al elegir el archivo, AC-19);
  - `tiers` (issue con `path: ["tiers", index, field]`): menos de 1 o más de `MAX_TIERS` → issue con `path: ["tiers"]` "Agrega entre 1 y 10 tipos de entrada."; por tier: `name` vacío (tras `trim`) → "Ingresa el nombre."; más de 40 → "Usa como máximo 40 caracteres."; nombre repetido (comparando `trim` + minúsculas) → "Ya usaste este nombre." en el segundo y siguientes; `price` vacío → "Ingresa el precio."; `parseTierPrice` `null` → "Ingresa un monto válido, por ejemplo 45 o 45.50."; mayor que `TIER_MAX_PRICE` → "El precio máximo es S/ 10,000."; `capacity` vacío → "Ingresa la cantidad."; `parseTierCapacity` `null` → "Ingresa una cantidad entera mayor que 0."; mayor que `TIER_MAX_CAPACITY` → "La cantidad máxima es 100,000.".
  
  Salida (`transform`): `title` = `name.trim()`, textos con `trim`, `startDate` = `toStartDate(date, time)`, `imageUrl` tal cual, `tiers` sin `key` con `name.trim()`, `price` y `capacity` numéricos.
- AC-17: `getEventFormErrors(values, now)` hace `safeParse` y devuelve `{ fields, tiers }` con el primer mensaje por clave: issues con `path[0]` en `EVENT_FIELDS` van a `fields`; issues `["tiers", i, field]` van a `tiers[values.tiers[i].key][field]`. Con `EMPTY_EVENT_VALUES`: `fields` tiene exactamente `name`, `description`, `date`, `time`, `venueName` y `city` (no `categorySlug`), y `tiers` tiene las claves `"1"` y `"2"`, cada una con `name`, `price` y `capacity`. Con valores válidos devuelve `{ fields: {}, tiers: {} }`.
- AC-18: `getEventFieldId(field)` = `` `event-${field}` ``; `getTierFieldId(key, field)` = `` `event-tier-${key}-${field}` ``. `getFirstInvalidFieldId(values, errors)` recorre `EVENT_FIELDS` en orden y después cada tier en el orden de `values.tiers` con `TIER_FIELDS` en orden, y devuelve el id del primero con error, o `null`.
- AC-19: `getCoverImageError(file)`: tipo fuera de `COVER_IMAGE_TYPES` → "Sube una imagen JPG o PNG."; `size > COVER_IMAGE_MAX_BYTES` → "La imagen debe pesar como máximo 1 MB."; si no, `null` (el tipo se revisa primero). `readFileAsDataUrl` usa `FileReader.readAsDataURL` y rechaza si el lector falla.
- AC-20: `getEventFormPreview(values)`:
  - `categoryName`: nombre de la categoría de `categorySlug` en `categories`, o `""` si no existe;
  - `title`: `name.trim()` o `null` si queda vacío;
  - `place`: `venueName.trim()` y `city.trim()` no vacíos unidos por `" · "`, o `null` si los dos están vacíos;
  - `day`/`month`: si `date` es una fecha válida (misma regla que `toStartDate`), `` formatEventDayMonth(`${date}T12:00:00-05:00`) ``; si no, `null` los dos;
  - `minPrice`: el menor `parseTierPrice` no nulo entre los tiers, o `null`;
  - `capacity`: suma de los `parseTierCapacity` no nulos (0 si ninguno).
  
  Ejemplo: tiers `[{ price: "120", capacity: "6000" }, { price: "45,5", capacity: "x" }]` → `minPrice 45.5`, `capacity 6000`.
- AC-21: `buildOrganizerEvent(data, status, { now = new Date(), generateId })` devuelve un `OrganizerEvent` que pasa `organizerEventSchema.parse`: `id = generateId()`, los campos de `data`, `status`, `createdAt = now.toISOString()`, y `tiers` con `` id = `${id}-tier-${i + 1}` ``, `name`, `price`, `capacity` y `sold: 0`.
- AC-22: `useEventForm({ initialValues = EMPTY_EVENT_VALUES, now = () => new Date() })`:
  - `now()` se llama una sola vez al montar (`useState(() => now())`) y esa fecha se usa para validar (así el render es puro);
  - guarda `values`, un set de claves tocadas (`EventField` o `` `${key}.${TierField}` ``) y `submitAttempted`; calcula `getEventFormErrors(values, now)` en cada render y expone en `errors` solo las claves tocadas, o todas si `submitAttempted`;
  - `setField`, `blurField`, `setTierField`, `blurTierField`, `addTier` y `removeTier` son estables entre renders (`useCallback`);
  - `addTier()` agrega `createEmptyTier(key)` al final con una key nueva que nunca repite una anterior (contador que arranca en el mayor `Number(key)` inicial + 1) y la devuelve; con `MAX_TIERS` tiers no hace nada y devuelve `null`;
  - `removeTier(key)` quita ese tier y sus claves tocadas; con 1 tier no hace nada. `canAddTier`/`canRemoveTier` reflejan esos límites;
  - `validate()` pone `submitAttempted = true` y devuelve `{ success: true, data: createEventFormSchema(nowValue).parse(values) }` o `{ success: false, firstInvalidId: getFirstInvalidFieldId(...) }`.

### Ruta `/organizador` (T3)
- AC-23: `src/app/organizador/page.tsx` es un server component: tipa `searchParams` como `Promise<{ creado?: string | string[] }>`, lo espera, toma el primer valor si es arreglo (`null` si no hay), exporta `metadata = { title: "Panel de organizador | Ticketera", robots: { index: false } }` y renderiza `<OrganizerDashboardView createdId={createdId} />` (sin `SiteHeader` ni `SiteFooter`).
- AC-24: `OrganizerDashboardView` renderiza `<OrganizerShell active="summary" loginRedirect={ORGANIZER_HOME_HREF}>`. Dentro, rehidrata `useOrganizerEventStore` al montar (`Promise.resolve(useOrganizerEventStore.persist.rehydrate()).then(() => setHydrated(true))`); mientras no esté rehidratado muestra un bloque `aria-busy="true"` con `sr-only` "Cargando tus eventos…". Luego `events = mergeOrganizerEvents(storeEvents)`, `kpis = getDashboardKpis(events)` y la lista filtrada con `filterEventsByStatus(events, filter)`. Contenido en un contenedor `px-4 pt-[22px] pb-9 gap-5` (mobile) y `lg:px-12 lg:py-10 lg:gap-8`, columna.
- AC-25: encabezado:
  - desktop: fila `items-end justify-between gap-6`; `h1` "Resumen" (32px bold, `tracking-tight`) y "Así van las ventas de tus eventos." (15px `text-zinc-600`) a la izquierda; a la derecha un link "Crear evento" a `CREATE_EVENT_HREF` (50px, `px-[22px]`, `rounded-[14px]`, `bg-primary text-primary-foreground`, 15px `font-semibold`, `Plus` `aria-hidden`);
  - mobile: columna `gap-3.5`, `h1` de 28px, texto de 14px y el link a todo el ancho (centrado, 50px).
- AC-26: `DashboardKpis` es un `dl` con 3 tarjetas blancas (`border border-zinc-200`, `rounded-[20px] p-[18px]` en mobile, `lg:rounded-[22px] lg:p-6`), cada una con `dt` (13px / 14px `text-zinc-600`) y `dd` (`font-bold tabular-nums tracking-tight`):
  - "Entradas vendidas" → `formatNumber(kpis.sold)`; "Ingresos" → `formatSoles(kpis.revenue)`; "Eventos publicados" (texto visible "Publicados" en mobile) → `kpis.published`;
  - desktop: grid de 3 columnas `gap-5`, en ese orden, `dd` de 32px y un ícono `aria-hidden` de 17px en cada `dt` (`Ticket`, `ChartColumn`, `CalendarDays`);
  - mobile: grid de 2 columnas `gap-3`, sin íconos; "Ingresos" va primero ocupando las 2 columnas (`order-first col-span-2`, `dd` de 28px) y las otras dos con `dd` de 22px (se resetea con `lg:order-none lg:col-span-1`).
  
  Con los mock y sin eventos creados muestra "8,146", "S/ 1,137,270" y "3".
- AC-27: sección `section id="mis-eventos" aria-labelledby` (a su `h2` "Mis eventos", 18px `font-semibold`), con `scroll-mt-6`:
  - filtro `div role="group" aria-label="Filtrar eventos"` con un `button type="button"` por `EVENT_STATUS_FILTERS` con `aria-pressed`. El activo es `bg-white font-semibold` con sombra suave; el inactivo, transparente y `font-medium`. Desktop: en la cabecera de la tarjeta (fila `justify-between`, `px-6 py-[18px]`, `border-b border-zinc-100`), fondo `bg-zinc-100`, `p-1`, `rounded-xl`, botones de 36px y 13px. Mobile: bajo el `h2`, grid de 3 columnas a todo el ancho, fondo `bg-zinc-200`, botones de 40px. Arranca en `"all"`;
  - un `<p aria-live="polite">` en la sección muestra "Esta opción estará disponible pronto." cuando se usa "Editar" o "Ver ventas" (vía `onAction`);
  - si la lista filtrada está vacía: un bloque centrado con borde punteado (`border-[1.5px] border-dashed border-zinc-300`, `rounded-[20px]`, fondo blanco, `py-12`) con "No tienes eventos publicados." / "No tienes borradores." / "Aún no creaste eventos." según el filtro, y un link "Crear evento" a `CREATE_EVENT_HREF`.
- AC-28: desktop (`hidden lg:block`), la sección es una tarjeta blanca (`border-zinc-200`, `rounded-[22px]`, `overflow-hidden`) con `OrganizerEventsTable`: un `<table>` semántico (`w-full table-fixed text-sm`) construido con `useTable` de `@tanstack/react-table` v9 (`tableFeatures({})`, columnas con `createColumnHelper`, `table.FlexRender`; columnas y features definidos fuera del render o memoizados):
  - `thead` con `th scope="col"` (12px, `font-semibold uppercase tracking-[0.04em] text-zinc-600`, `px-6 py-3`): "Evento", "Estado" (130px), "Vendidas" (260px), "Ingresos" (150px, alineado a la derecha) y una columna de 140px con encabezado `sr-only` "Acciones";
  - cada fila (`border-t border-zinc-100`, celdas `py-3.5`, primera y última con `px-6`): `OrganizerEventImage` de 52px `rounded-xl` (`sizes="52px"`), título (15px `font-semibold truncate`) y `` `${formatEventDateShort(startDate)} · ${city}` `` (13px `text-zinc-600`); `EventStatusBadge`; `EventSoldProgress`; ingresos `formatSoles(revenue)` (`font-semibold tabular-nums`, derecha), o para borradores un "—" `aria-hidden` con `sr-only` "Sin ingresos"; y un `button type="button"` de 40px (`px-3.5`, `border-[1.5px] border-zinc-300`, `rounded-[11px]`, 13px `font-semibold`) "Ver ventas" (publicado) o "Editar" (borrador) que llama a `onAction`. Los botones llevan `aria-label` `"Ver ventas de <título>"` / `"Editar <título>"`;
  - la fila de `highlightedId` lleva `bg-indigo-50/60`.
- AC-29: mobile (`lg:hidden`), `OrganizerEventCards` es un `ul` (`gap-2.5`) de tarjetas `li` blancas (`border-zinc-200`, `rounded-[20px]`, `p-3.5`, `gap-3`, columna; `border-primary border-2` si es `highlightedId`): fila con imagen de 52px, título (15px `truncate`) y fecha · ciudad (12px), y `EventStatusBadge` (26px, 11px) a la derecha; debajo "`<vendidas>` / `<capacidad>` vendidas" a la izquierda y los ingresos (o "—" como AC-28) a la derecha, en 13px `tabular-nums`, y la barra de progreso; al final el botón de acción a todo el ancho (44px, `rounded-xl`, 14px) con el mismo texto, `aria-label` y `onAction`. La página no tiene scroll horizontal a 360px.
- AC-30: componentes y aviso de creación:
  - `EventStatusBadge`: `span` redondeado (`rounded-full`, 28px de alto en desktop, `px-3`, 12px `font-semibold`): "Publicado" `bg-green-100 text-green-800` o "Borrador" `bg-zinc-100 text-zinc-700`;
  - `EventSoldProgress`: "`<strong>formatNumber(sold)</strong>` / `formatNumber(capacity)` vendidas" (13px, `tabular-nums`, capacidad en `text-zinc-600`) y una barra `aria-hidden` de 6px (`rounded-full bg-zinc-100`) con el relleno `bg-primary` de ancho `` `${Math.round(soldRatio * 100)}%` ``. Con `showLabel={false}` renderiza solo la barra (las tarjetas mobile ponen el texto en su propia fila, AC-29, con el mismo formato);
  - si `createdId` coincide con un evento de la lista unida, sobre los KPIs se muestra un `div role="status"` (`rounded-2xl border border-green-200 bg-green-50 text-green-900 p-4`, `CircleCheck` `aria-hidden`) con "Publicaste «<título>». En esta demo no aparece en el catálogo público." (publicado) o "Guardaste «<título>» como borrador." (borrador), y un `button` de 44×44 con `X` y `aria-label="Cerrar aviso"` que lo oculta (estado local). Ese evento es el `highlightedId` de la tabla y de las tarjetas. Si `createdId` no coincide, no hay aviso ni resaltado.

### Ruta `/organizador/eventos/nuevo` (T4)
- AC-31: `src/app/organizador/eventos/nuevo/page.tsx` es un server component que exporta `metadata = { title: "Crear evento | Ticketera", robots: { index: false } }` y renderiza `<CreateEventView />`. `CreateEventView` renderiza `<OrganizerShell active="events" loginRedirect={CREATE_EVENT_HREF} mobileHeader={...}>` con `<EventForm />`. El `mobileHeader` es un `header` de 60px blanco (`border-b border-zinc-100`, `pl-1.5 pr-3 gap-1`) con un link de 44×44 a `ORGANIZER_HOME_HREF` (`ArrowLeft` `aria-hidden`, `aria-label="Volver al panel"`) y el `h1` "Crear evento" (18px `font-semibold`).
- AC-32: `EventForm` usa `useEventForm()` y renderiza, en un contenedor `px-4 pt-4 pb-28 lg:px-12 lg:pt-8 lg:pb-12`:
  - desktop (`hidden lg:flex`, columna `gap-2.5`, `mb-6`): link "Mis eventos" (32px, 14px `font-medium text-zinc-600`, `ArrowLeft`) a `ORGANIZER_EVENTS_HREF` y el `h1` "Crear evento" (32px bold). Solo un `h1` visible por breakpoint;
  - `<form noValidate>` en grid `lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:items-start`; la columna izquierda tiene las 4 secciones (`gap-4 lg:gap-5`) y las acciones (AC-38); la derecha, la vista previa (AC-37). En mobile, la vista previa va después de las secciones;
  - cada sección es una tarjeta blanca `section aria-labelledby` (`border-zinc-200`, `rounded-[20px] px-4 py-5 gap-4` en mobile, `lg:rounded-[22px] lg:p-7 lg:gap-[18px]`) con `h2` (17px / 18px `font-semibold`).
- AC-33: campos (todos con `FormField`, `id` de `getEventFieldId`, `aria-invalid` y `aria-describedby` con `getDescribedBy`, `onBlur` → `blurField`, error visible de `errors.fields`):
  - "Información básica": "Nombre del evento" (`Input`, `FORM_CONTROL_CLASS_NAME`, `maxLength={80}`, placeholder "Ej. Festival de verano 2026"); "Categoría" (`select` nativo con las clases de control, una `option` por `categories` con `value={slug}` y el `name`); "Descripción" (`textarea` nativo, 120px de alto, `py-3.5`, `resize-y`, `leading-normal`, `maxLength={1000}`, placeholder "Cuenta de qué trata el evento, quiénes se presentan y qué incluye la entrada.");
  - "Fecha y lugar": "Fecha" (`type="date"`) y "Hora de inicio" (`type="time"`) en un grid de 2 columnas en los dos breakpoints (`gap-3 lg:gap-x-5 lg:gap-y-[18px]`, inputs con `min-w-0`); "Lugar" (placeholder "Ej. Estadio Nacional", `maxLength={80}`) y "Ciudad" (placeholder "Ej. Lima", `maxLength={60}`) a todo el ancho en mobile y en las 2 columnas del mismo grid desde `lg`.
- AC-34: "Imagen de portada" (`CoverImageField`):
  - sin imagen: un `label` que envuelve un `input type="file" id="event-image" accept="image/png,image/jpeg"` con `sr-only`, con aspecto de zona de carga (150px / 180px de alto, `border-[1.5px] border-dashed border-indigo-300`, `rounded-2xl lg:rounded-[18px]`, `bg-indigo-50/60 text-indigo-800`, centrado, `focus-within` con anillo `ring-3 ring-ring/50`), ícono `ImagePlus` `aria-hidden`, texto "Subir imagen" en mobile y "Arrastra una imagen o haz clic para subirla" desde `lg` (15px `font-semibold`) y el hint `<p id="event-image-hint">` "JPG o PNG, horizontal (16:9). Máximo 1 MB." (12px / 13px `text-zinc-600`). Acepta soltar un archivo (`onDragOver` con `preventDefault`, `onDrop` toma el primero) y resalta el borde (`border-primary`) mientras se arrastra encima;
  - al elegir o soltar: `getCoverImageError(file)`; si hay error, se muestra en `<p id="event-image-error" className="text-sm text-destructive">` (el input lleva `aria-invalid` y `aria-describedby` con hint y error) y no cambia el valor; si no, `readFileAsDataUrl` → `onChange(dataUrl)` y se borra el error. Si la lectura falla: "No pudimos leer la imagen. Prueba con otra.". El `value` del input se limpia tras cada selección (para poder elegir el mismo archivo otra vez);
  - con imagen: preview 16:9 (`aspect-video`, `rounded-2xl`, `OrganizerEventImage` con `sizes="(min-width: 1024px) 600px, 100vw"`) y debajo dos botones de 44px: "Cambiar imagen" (abre el selector de archivos, `inputRef.current?.click()`) y "Quitar imagen" (`Trash2`, `onChange(null)`).
- AC-35: "Tipos de entrada" (`TierFields`):
  - texto "Cada tipo tiene su precio y su cantidad disponible." (13px / 14px `text-zinc-600`) bajo el `h2`;
  - desktop: una fila de encabezados `aria-hidden` (`hidden lg:grid`, `grid-cols-[minmax(0,1fr)_150px_150px_44px] gap-3`, 13px `font-medium text-zinc-600`): "Nombre", "Precio (S/)", "Cantidad";
  - cada tier es un `fieldset` con `legend` "Tipo de entrada {n}" (`n` = posición + 1): en mobile la legend es visible como "Tipo {n}" (14px `font-semibold`, el resto del texto en `sr-only`), con fondo `bg-zinc-50`, `border-zinc-200`, `rounded-2xl`, `p-3.5`, y el botón de quitar arriba a la derecha; desde `lg` la legend es `sr-only`, sin borde ni fondo ni padding, y los controles van en el grid de 4 columnas de los encabezados;
  - campos con `id` de `getTierFieldId(key, field)`, `FormField` con label visible en mobile ("Nombre", "Precio (S/)", "Cantidad", 13px) y `sr-only` desde `lg`, placeholders "Ej. General", "0", "0"; "Nombre" `maxLength={40}`; "Precio" `inputMode="decimal"`; "Cantidad" `inputMode="numeric"` (los dos `type="text"`, validados por el schema); en mobile "Precio" y "Cantidad" van en un grid de 2 columnas. Errores de `errors[key]` bajo cada control, con `aria-invalid`/`aria-describedby`;
  - botón de quitar: `button type="button"` de 44×44 con `Trash2` `aria-hidden`, `aria-label="Quitar tipo de entrada {n}"`, `disabled` si `!canRemoveTier`. Al quitar, el foco pasa al botón "Agregar tipo de entrada";
  - "Agregar tipo de entrada" (`Plus`): `button type="button"`, `border-[1.5px] border-dashed border-indigo-300 text-indigo-700 font-semibold`, 48px a todo el ancho en mobile y 44px `w-fit px-4` desde `lg`; `disabled` si `!canAddTier`, y en ese caso un texto "Puedes crear hasta 10 tipos de entrada.". Al agregar, el foco pasa al campo "Nombre" del tier nuevo;
  - al final, `p` con `border-t border-zinc-100 pt-3 lg:pt-3.5`, `justify-between`: "Capacidad total" y `<strong>` `formatTicketTotal(preview.capacity)` (`tabular-nums`).
- AC-36: con `EMPTY_EVENT_VALUES` el formulario arranca con categoría "Conciertos" y 2 tiers vacíos, sin errores visibles. Un error aparece al salir (blur) de un campo inválido o al intentar guardar, y desaparece al corregirlo.
- AC-37: vista previa (`EventPreviewCard`, `preview = getEventFormPreview(values)`), dentro de un `aside aria-label="Vista previa"` (`lg:sticky lg:top-8`, `gap-2.5 lg:gap-3`) con el rótulo "Vista previa" (12px / 13px `font-semibold uppercase tracking-[0.06em] text-zinc-600`):
  - desktop (`hidden lg:flex`): tarjeta blanca vertical (`rounded-[22px]`, borde, `overflow-hidden`): imagen de 180px (`OrganizerEventImage` con `imageUrl`, `sizes="340px"`, ícono `size-[34px]`) con la insignia de fecha blanca (56px, `rounded-[14px]`, `month` 11px bold `tracking-[0.08em] text-primary` o "MES", `day` 22px bold o "--") arriba a la izquierda; categoría (12px `uppercase tracking-[0.06em] text-primary font-semibold`), título (17px `font-semibold`, `min-h-[46px]`, `break-words`; "Nombre del evento" en `text-zinc-500` si es `null`), lugar (14px `text-zinc-600`; "Lugar · Ciudad" si es `null`); perforación punteada con dos medios círculos de 20px (como `EventCard`); "Desde" y `formatSoles(minPrice)` (19px bold `text-orange-700`; "S/ —" si es `null`) y un `span` decorativo "Ver entradas" (44px, `border-[1.5px] border-zinc-900`). Debajo, "Así verán tu evento los compradores en el listado." (13px `text-zinc-600`);
  - mobile (`lg:hidden`): tarjeta horizontal de 132px: imagen de 108px de ancho con insignia de 44px (10px / 17px) y, separado por una perforación vertical (`border-l-[1.5px] border-dashed`, medios círculos arriba y abajo), categoría (11px), título (15px, `line-clamp-2`), lugar (12px `truncate`) y "Desde" + precio (16px) al final;
  - la vista previa se actualiza en cada cambio de los campos y de la imagen.
- AC-38: acciones "Guardar borrador" y "Publicar":
  - un único bloque de acciones: en mobile `fixed inset-x-0 bottom-0 z-10` blanco con `border-t border-zinc-200`, sombra superior suave, `px-4 pt-3 pb-5`, grid de 2 columnas `gap-2.5`; desde `lg` `lg:static lg:flex lg:justify-end lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`;
  - "Guardar borrador": `Button type="button" variant="outline"`, 52px, `rounded-[14px]`, `border-[1.5px] border-zinc-300`, 15px `font-semibold`, `lg:px-[22px]`, llama a `save("draft")`;
  - "Publicar evento" (texto visible "Publicar" en mobile, "Publicar evento" desde `lg`): `Button type="submit"`, 52px, `rounded-[14px]`, `bg-primary text-primary-foreground`, `lg:px-6`; el `onSubmit` del form (con `preventDefault`) llama a `save("published")`, así Enter en un campo publica.
- AC-39: `save(status)` (estado local `saving: OrganizerEventStatus | null`):
  - si `saving` no es `null`, no hace nada;
  - `validate()` dentro de `flushSync`; si falla, enfoca `document.getElementById(firstInvalidId)` y no guarda;
  - si pasa: `setSaving(status)`, `event = buildOrganizerEvent(data, status)`, `useOrganizerEventStore.getState().addEvent(event)` y `` router.push(`/organizador?creado=${encodeURIComponent(event.id)}`) ``. Mientras `saving`, los dos botones tienen `disabled` y el que se usó muestra `Loader2 animate-spin` `aria-hidden`, `aria-busy="true"` y el texto "Guardando…" / "Publicando…";
  - antes de guardar el store se rehidrata al montar el formulario (mismo patrón de AC-24, sin bloquear la UI), así `addEvent` no pisa eventos ya guardados en la pestaña.
- AC-40: flujo completo verificable en el navegador: con sesión, desde `/organizador` → "Crear evento" → completar el formulario → "Publicar evento" vuelve a `/organizador?creado=org-…` con el aviso de AC-30, el evento primero en la lista (resaltado, "Publicado", "0 / N vendidas", "S/ 0") y el KPI "Eventos publicados" en 4. Con "Guardar borrador" el evento aparece como "Borrador" con "—" en ingresos y el KPI no cambia. Tras recargar la pestaña, el evento sigue en la lista; en una pestaña nueva, no. `/eventos` no muestra el evento creado.

## Tests requeridos
- `src/modules/organizer/schemas/organizer-event.schema.test.ts`: los casos de `isAllowedOrganizerImageUrl` y de rechazo/aceptación de `organizerEventSchema` de AC-1. Cubre AC-1.
- `src/modules/organizer/services/organizer.service.test.ts`: los 4 `ORGANIZER_EVENTS` pasan `organizerEventSchema.parse`, ids y tier ids únicos, orden y estados de AC-9; `getEventMetrics` con los ejemplos de AC-10; `getDashboardKpis` con los mock y con `[]` (AC-11); `EVENT_STATUS_FILTERS`, `filterEventsByStatus` (los 3 filtros, sin mutar) y `mergeOrganizerEvents` (orden por `createdAt` descendente de los creados, mock después, deduplicación, sin mutar) (AC-12); todos los ejemplos de `formatNumber`, `formatSoles` y `formatTicketTotal` (AC-13). Cubre AC-9 a AC-13.
- `src/modules/organizer/store/organizer-event.store.test.ts`: `addEvent` agrega al final y escribe en `sessionStorage["ticketera-organizer-events"]` (solo `events`); `rehydrate()` con JSON corrupto o con otra forma deja `events: []` sin lanzar y con un evento válido lo restaura; si `sessionStorage.setItem` lanza (`vi.spyOn(Storage.prototype, "setItem")`), `addEvent` no lanza y el evento queda en el store. Se resetea el store y `sessionStorage` entre tests. Cubre AC-14.
- `src/modules/organizer/schemas/event-form.schema.test.ts`: ejemplos de `parseTierPrice`, `parseTierCapacity` y `toStartDate` (AC-15); con `now` fijo (`2026-09-29T12:00:00-05:00`): cada mensaje de AC-16 (incluida la fecha pasada, el nombre de tier repetido y los límites), todos los errores a la vez con `EMPTY_EVENT_VALUES` (AC-17), la salida transformada con valores válidos (`startDate` con `-05:00`, `price` 45.5 desde `"45,50"`, textos con `trim`); `getFirstInvalidFieldId` con un error solo en el segundo tier y con un error en `city` y en un tier (gana `city`) (AC-18). Cubre AC-15 a AC-18.
- `src/modules/organizer/services/event-form.service.test.ts`: `getCoverImageError` (tipo inválido, peso > 1 MB, válido, tipo inválido y pesado → mensaje de tipo); `readFileAsDataUrl` con un `Blob` pequeño devuelve un `data:` URL; `getEventFormPreview` con valores vacíos (todo `null`, `capacity 0`, `categoryName "Conciertos"`) y con el ejemplo de AC-20; `buildOrganizerEvent` con `now` y `generateId` fijos pasa `organizerEventSchema.parse` y tiene los ids de tier y `sold: 0` de AC-21. Cubre AC-19 a AC-21.
- `src/modules/organizer/hooks/use-event-form.test.ts`: con `renderHook` y `now` fijo: sin errores al inicio; `blurField("name")` muestra solo ese error; `setField` con un valor válido lo quita; `blurTierField` muestra el error de ese tier; `addTier` devuelve una key nueva (`"3"`), no repite keys tras quitar y volver a agregar, y devuelve `null` con 10 tiers; `removeTier` no hace nada con 1 tier y quita las claves tocadas del tier eliminado; `validate()` inválido devuelve el `firstInvalidId` esperado y hace visibles todos los errores; `validate()` válido devuelve `data` transformado; las funciones son estables entre renders. Cubre AC-22.
- Existentes, **sin modificar**: todos los tests de las fases 3 a 6 deben pasar (en particular los de `src/modules/auth/*`, que no cambian con AC-2).
- UI (`FormField`, `OrganizerEventImage`, `OrganizerShell`, `SiteNavbar`, `AccountMenu`, `OrganizerDashboardView`, `DashboardKpis`, `OrganizerEventsTable`, `OrganizerEventCards`, `EventStatusBadge`, `EventSoldProgress`, `CreateEventView`, `EventForm`, `TierFields`, `CoverImageField`, `EventPreviewCard`, páginas): composición sobre lógica ya testeada, sin test unitario obligatorio. El reviewer los valida leyendo el código contra AC-2 a AC-8 y AC-23 a AC-40. Al final se ejecutan `npm run test`, `npm run lint` y `npm run build`, y se revisa en el navegador (360px y 1440px) `/organizador` y `/organizador/eventos/nuevo` con y sin sesión, sin scroll horizontal ni warnings de hidratación, además de `/ingresar` (sin cambio visual por AC-2).

## Cambios al plan
- **Sin gráfico, sin búsqueda ni orden**: los diseños `OrgDashboard*` no los tienen; solo KPIs, el filtro Todos / Publicados / Borradores y la lista. No se agrega librería de gráficos.
- **Estados solo "Publicado" y "Borrador"** (como el diseño y su filtro). El estado "Finalizado" del plan queda fuera: no hay filtro ni insignia para él en el diseño.
- **Ola 0 con base compartida** (T0): el schema `OrganizerEvent` (lo importan T1, T2, T3 y T4), `OrganizerShell` y `OrganizerEventImage` (los usan las dos rutas de la ola 2) y la extracción de `FormField` desde `auth-form-field.tsx` a `src/components/form/` (el formulario del organizador necesita el mismo marco de label/hint/error; importar `AuthTextField` desde otro dominio o copiarlo violaría la estructura o DRY). También los accesos (navbar y menú de cuenta), para que ninguna tarea de la ola 2 toque archivos compartidos. Quedan 4 tareas de desarrollo (T1 a T4) más T0, en 3 olas: no hace falta dividir la fase en 7a/7b.
- **Hook propio `useEventForm` en lugar de `useValidatedForm`**: `useValidatedForm` agrupa errores por `issue.path[0]` y recibe una lista fija de campos; el formulario tiene una lista dinámica de tipos de entrada con errores por tier y por campo (`["tiers", i, "price"]`), agregar/quitar y foco al primer inválido entre tiers. Generalizar el hook compartido cambiaría el contrato de 3 consumidores y sus tests; se replica su comportamiento (touched / submitAttempted / errores visibles) en el módulo organizer, reutilizando `FieldErrors` y el patrón de schema zod del proyecto.
- **Misma validación para borrador y publicación** (KISS): un borrador también necesita todos los campos válidos. Evita que el panel tenga que mostrar eventos sin fecha, lugar o tiers.
- **Imagen de portada opcional, como `data:` URL de hasta 1 MB guardada en `sessionStorage`**: sin backend no hay otra forma de mostrar la portada en el panel después de guardar. El límite y el `storage` que ignora errores de cuota evitan que la app se rompa si la pestaña se llena; sin imagen se usa un placeholder (también en el borrador mock). `imageUrl` solo acepta Unsplash o `data:image/png|jpeg`, validado con zod al rehidratar (defensa contra valores manipulados en `sessionStorage`, y `next/image` no falla por hosts no permitidos). El diseño no tiene campo de URL: no se agrega.
- **Eventos creados solo en `sessionStorage`** (como carrito y pedidos) y **no se publican en `/eventos`**: no se toca `src/modules/event/*`. El aviso de "Publicado" lo aclara ("En esta demo no aparece en el catálogo público.").
- **Todos los usuarios con sesión son organizadores** y ven los mismos 4 eventos mock (no hay rol ni asociación a usuario). Los mock usan los datos y fechas del diseño, con tiers que suman sus vendidas y capacidades; los ingresos se calculan por tier (`precio × vendidas`), por eso difieren del total del diseño (que usaba vendidas × precio desde).
- **Sidebar sin "Ventas" ni "Configuración"**: no tienen pantalla en esta fase; mostrar links muertos o deshabilitados no aporta (YAGNI). "Mis eventos" lleva al ancla `#mis-eventos` del panel. "Editar" y "Ver ventas" de cada evento muestran el aviso "Esta opción estará disponible pronto." (patrón de las fases 5 y 6), porque editar queda fuera de alcance.
- **Acceso sin sesión**: `OrganizerShell` muestra una tarjeta con link a `/ingresar?redirect=...` (como Mis entradas), sin redirección automática. El "Cerrar sesión" del sidebar no navega: la página pasa a ese estado.
- **Accesos al panel**: "Vender entradas" del navbar (desktop sin sesión y `Sheet` mobile) → `/organizador`; con sesión en desktop, "Vender entradas" sigue oculto (spec 006) y se agrega "Panel de organizador" al menú de cuenta.
- **Tabla semántica con `@tanstack/react-table` v9** en desktop (el diseño usa una lista con grid y encabezados `aria-hidden`; un `<table>` con `th scope="col"` es más accesible) y **tarjetas en mobile**, como pidió el plan. El filtro se aplica fuera de la tabla con `filterEventsByStatus` (no se registran features de filtrado de la librería).
- **Precio y cantidad como `type="text"` con `inputMode`** en lugar de `type="number"` del diseño: permite validar y mostrar mensajes claros (coma decimal, vacío, notación `1e3`) con el schema, y evita que la rueda del mouse cambie valores.
- **Acciones fijas abajo en mobile** (el diseño lo anota: "fijas abajo en el producto") y en línea al final del formulario en desktop, con un único bloque responsive.

## Preguntas abiertas
ninguna

## Notas de cierre
- AC-28: los `th`/`td` usan `pl-6` en la primera columna, `pl-4` en las intermedias y `pl-4 pr-6` en la última (en lugar de `px-6` en todos los `th`), para que los encabezados queden alineados con sus celdas. Detalle visual, sin cambio funcional.
- AC-34: el hint de la portada es `<span id="event-image-hint" class="block …">` en vez de `<p>`, porque está dentro del `<label>` (un `<p>` ahí es HTML inválido).
- Exports auxiliares en archivos propios: `getEventAction` y `EventRevenue` (`event-status-badge.tsx`), `EventSoldLabel` (`event-sold-progress.tsx`), compartidos entre tabla y tarjetas.
- Verificado en navegador (desktop y mobile): login demo → `/organizador` → crear evento con errores de validación → publicar → vuelve al panel con aviso, evento resaltado primero y KPI de publicados en 4; sin errores de runtime ni warnings de hidratación.
