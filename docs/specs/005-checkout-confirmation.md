# 005 — Checkout y confirmación (`/checkout`, `/checkout/confirmacion/[orderId]`)

Estado: approved
Fase: 5 de 7 (checkout y confirmación; después vienen 6 cuenta y 7 organizador)

## Aprobación
Aprobado por el usuario el 2026-09-29 (confirmado en chat: "si").

## Contexto
El paso 1 de la compra (spec 004) deja el carrito en `sessionStorage` y su CTA "Continuar" enlaza a `/checkout`, que todavía no existe. Esta fase construye los pasos 2 y 3. El paso 2 son los datos del comprador y el pago, con reserva de 10 minutos, validación en cliente y un resumen del pedido. El paso 3 es la confirmación: una entrada estilo ticket con QR decorativo, las acciones y la sección "Qué sigue". Sigue los diseños `Checkout`, `CheckoutMobile`, `Confirmation` y `ConfirmationMobile`, responsive en mobile y desktop. Es solo UI/UX con datos mock: el pago es simulado y el pedido se guarda en `sessionStorage`.

## Alcance
- Incluye:
  - `checkoutSchema` (zod) con validación por tipo de documento, celular peruano, método de pago `card | yape | cash` y datos de tarjeta condicionales (Luhn, vencimiento MM/AA no vencido, CVV y nombre en la tarjeta). También helpers puros de formato de tarjeta y de errores por campo.
  - Contrato `orderSchema`, store `useOrderStore` (zustand + `persist` en `sessionStorage`) y `orderService` mock: valida, simula el pago con demora, crea el pedido `TK-XXXXX`, lo guarda y vacía el carrito.
  - Hook `useCountdown` (reserva de 10:00) y hook `useCheckoutForm` (estado del formulario, errores visibles y foco).
  - Helper transversal de fechas `src/lib/date.ts` (3.er consumidor del mismo formato, ver "Cambios al plan"). La página `/entradas` pasa a usarlo.
  - `PurchaseStepsHeader` extendido: pasos completados con check, `backHref`/`backLabel` configurables y la variante del paso 3.
  - `OrderSummary` refactorizado: extrae `OrderLineList` y `OrderTotal` para reusarlos en el checkout, sin cambio visual en `/entradas`.
  - Ruta `/checkout`: temporizador, formulario, bloque condicional según el método de pago, resumen (`aside` sticky en desktop, plegable en mobile), botón "Pagar S/ X" con envío simulado, y estados de carrito vacío y de reserva expirada.
  - Ruta `/checkout/confirmacion/[orderId]`: encabezado de éxito, número de pedido, entrada estilo ticket con QR decorativo en SVG determinista, acciones ("Ver mis entradas" como link placeholder, "Agregar al calendario" y "Descargar PDF" solo visuales) y "Qué sigue". Estado de pedido no encontrado.
- Fuera de alcance (no agregar):
  - Pagos reales, pasarela, tokenización, flujo de QR de Yape o código de PagoEfectivo (solo el texto informativo del diseño), emails, backend, axios/react-query.
  - Cuenta, login y la página "Mis entradas" (fase 6). El link "Ver mis entradas" apunta a `/mis-entradas`, que dará 404 hasta la fase 6. Las páginas `/terminos` y `/privacidad` tampoco se crean.
  - Persistir el temporizador entre recargas (recargar `/checkout` reinicia la reserva a 10:00), bloquear asientos o revalidar la disponibilidad del carrito contra el mock.
  - Generar un QR real, un archivo `.ics` o un PDF. Mostrar un QR por entrada con navegación entre entradas (se muestra solo "Entrada 1 de N").
  - Cupones, cargos por servicio, impuestos, comprobante o factura, guardar datos del comprador para otra compra.
  - `react-hook-form` u otras dependencias nuevas. Componentes shadcn nuevos (el entorno bloquea `ui.shadcn.com`).
  - Modificar `src/modules/event/*`, `src/modules/venue/*`, `src/components/layout/*`, `src/components/ui/*` o `cart.store.ts`. Tampoco se migran a `src/lib/date.ts` los formateadores de `event-detail-info.tsx`, `event-card.tsx` ni `featured-carousel.tsx` (queda para un refactor posterior).

## Módulo destino
- `src/modules/order/` (existente): schemas, store, services, hooks, components.
- `src/lib/date.ts` (transversal).
- Rutas `src/app/checkout/` y `src/app/checkout/confirmacion/[orderId]/`.

## Reutilización
- `src/modules/order/store/cart.store.ts`: `useCartStore` (con `persist.rehydrate()` y `clear()`, que conserva `eventSlug`), `getCartLines`, `getCartTotal`, `getCartCount`, `formatTicketCount`, `CartItems`, `CartLine`. No se edita.
- Patrón de rehidratación de AC-27 de la spec 004: `Promise.resolve(store.persist.rehydrate()).then(...)` dentro de un `useEffect`. En el checkout **no** se llama a `setEvent`.
- `src/modules/order/components/purchase-steps-header.tsx`: `PurchaseStepsHeader` con `currentStep={2}` y `{3}` (se extiende en T2).
- `src/modules/order/components/order-summary.tsx`: el markup de las líneas y del total se extrae a `OrderLineList` y `OrderTotal` (T3) y lo usan `OrderSummary` y el resumen del checkout. Se mantiene el estilo del CTA naranja (`bg-accent text-accent-foreground`) para "Pagar".
- `src/modules/event/services/event.service.ts`: `eventService.getBySlug(slug)` para el evento del carrito. Sus datos son síncronos y se pueden usar desde un componente cliente.
- `src/modules/event/data/categories.mock.ts`: solo desde `order.service.ts`, para el nombre de la categoría en el snapshot del pedido (el mismo patrón que usa `src/app/eventos/[slug]/page.tsx`).
- `src/modules/venue/services/venue.service.ts`: `venueService.getByEventSlug`, `findSeat`, `formatSeatLabel` para las etiquetas de asiento (dentro de `getOrderLines`).
- `src/modules/event/schemas/event.schema.ts`: `EventDetail`, `TicketTier`.
- `src/components/ui/button.tsx` (botones, incluido `Pagar`), `src/components/ui/input.tsx` (inputs de texto: ya estiliza `aria-invalid`). Para el select, los radios y el checkbox se usa HTML nativo (`select`, `input type="radio"`, `input type="checkbox"`, `label`, `fieldset`/`legend`). `card.tsx` y `badge.tsx` son opcionales.
- `src/lib/utils.ts`: `cn()`.
- `lucide-react`: `Lock`, `Clock`, `Check`, `ChevronDown`, `Smartphone`, `Store`, `Loader2`, `CircleCheck`, `ArrowRight`, `ArrowLeft`, `CalendarPlus`, `Download`, `Mail`, `QrCode`, `Ticket`, `TicketX`/`ShoppingCart` (estados vacíos).
- `next/image` (el dominio de Unsplash ya está permitido), `next/link`, `useRouter` de `next/navigation`.
- shadcn a instalar: ninguno. Dependencias nuevas: ninguna. **No hay ola 0.**

## Contratos
```ts
// src/modules/order/schemas/checkout.schema.ts
import { z } from "zod";

export const documentTypeSchema = z.enum(["DNI", "CE", "PASSPORT"]);
export type DocumentType = z.infer<typeof documentTypeSchema>;
export const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{ value: DocumentType; label: string }>;
// [{ "DNI", "DNI" }, { "CE", "CE" }, { "PASSPORT", "Pasaporte" }]

export const paymentMethodSchema = z.enum(["card", "yape", "cash"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<{ value: PaymentMethod; label: string; mobileLabel: string }>;
// [{ "card", "Tarjeta", "Tarjeta de crédito o débito" }, { "yape", "Yape", "Yape" }, { "cash", "PagoEfectivo", "PagoEfectivo" }]

// Entrada del formulario (z.input): todos los campos de texto son string (pueden estar vacíos).
export type CheckoutFormValues = {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;   // se ignoran si paymentMethod !== "card"
  cardExpiry: string;   // "MM/AA"
  cardCvv: string;
  cardName: string;
  acceptedTerms: boolean;
};
// Salida normalizada (z.output), ver AC-2 y AC-3.
export type CheckoutData = Omit<CheckoutFormValues, "acceptedTerms"> & { acceptedTerms: true };
export const checkoutSchema: z.ZodType<CheckoutData, CheckoutFormValues>;

export type CheckoutField = keyof CheckoutFormValues;
export const CHECKOUT_FIELDS: ReadonlyArray<CheckoutField>;
// orden visual: fullName, email, documentType, documentNumber, phone, paymentMethod,
//               cardNumber, cardExpiry, cardCvv, cardName, acceptedTerms
export const EMPTY_CHECKOUT_VALUES: CheckoutFormValues;
// textos "", documentType "DNI", paymentMethod "card", acceptedTerms false
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export function getCheckoutErrors(values: CheckoutFormValues): CheckoutErrors; // primer mensaje por campo; {} si es válido
export function isValidLuhn(digits: string): boolean;
export function isValidCardExpiry(value: string, now?: Date): boolean;         // "MM/AA", válida hasta el fin de ese mes
export function formatCardNumber(input: string): string;                      // solo dígitos, máx. 19, grupos de 4 con espacio
export function formatCardExpiry(input: string): string;                      // solo dígitos, máx. 4, "MM/AA" (con "/" tras 2 dígitos)

// src/modules/order/schemas/order.schema.ts
export const orderLineSchema = z.object({
  tierId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  qty: z.number().int().positive(),
  seatIds: z.array(z.string()),
  seatLabels: z.array(z.string()),       // "Fila A, asiento 5"; [] en standing
  amount: z.number().nonnegative(),
});
export type OrderLine = z.infer<typeof orderLineSchema>; // = CartLine & { seatLabels: string[] }

export const orderEventSchema = z.object({  // snapshot del evento al comprar
  slug: z.string().min(1),
  title: z.string().min(1),
  imageUrl: z.string().url(),
  categoryName: z.string().min(1),
  venueName: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string().min(1),
});
export type OrderEvent = z.infer<typeof orderEventSchema>;

export const orderBuyerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  documentType: documentTypeSchema,
  documentNumber: z.string().min(1),
  phone: z.string().regex(/^9\d{8}$/),
});

export const orderSchema = z.object({
  id: z.string().regex(/^TK-\d{5}$/),
  createdAt: z.string().datetime(),
  event: orderEventSchema,
  lines: z.array(orderLineSchema).min(1),
  count: z.number().int().positive(),
  total: z.number().nonnegative(),
  buyer: orderBuyerSchema,
  paymentMethod: paymentMethodSchema,
  cardLast4: z.string().regex(/^\d{4}$/).nullable(), // solo con "card"; nunca se guarda el número completo, el CVV ni el vencimiento
});
export type Order = z.infer<typeof orderSchema>;

// src/modules/order/store/order.store.ts
export const ORDERS_STORAGE_KEY = "ticketera-orders";
export type OrderState = {
  orders: Record<string, Order>;         // clave = order.id
  addOrder: (order: Order) => void;
};
export const useOrderStore: UseBoundStore<Mutate<StoreApi<OrderState>, [["zustand/persist", unknown]]>>;

// src/modules/order/services/order.service.ts
export const SIMULATED_PAYMENT_DELAY_MS = 1200;
export const ORDER_ID_MAX_ATTEMPTS = 10;
export function generateOrderId(random?: () => number): string; // "TK-" + (10000 + floor(random() * 90000)); Math.random por defecto
export function getOrderLines(items: CartItems, tiers: TicketTier[], venueMap: VenueMap | null): OrderLine[];
export type CreateOrderInput = { event: EventDetail; values: CheckoutFormValues };
export type CreateOrderOptions = { delayMs?: number; random?: () => number; now?: () => Date };
export const orderService: {
  create(input: CreateOrderInput, options?: CreateOrderOptions): Promise<Order>;
  getById(id: string): Order | null;     // lee useOrderStore (el llamador lo rehidrata antes)
};

// src/lib/date.ts
export const EVENT_TIME_ZONE = "America/Lima";
export function formatEventDateLong(iso: string): string;  // "sábado 14 de noviembre"
export function formatEventDateShort(iso: string): string; // "sáb 14 nov"

// src/modules/order/hooks/use-countdown.ts
export function formatCountdown(totalSeconds: number): string; // "MM:SS"; negativos -> "00:00"
export function useCountdown(options: { durationSeconds: number; onExpire?: () => void }): {
  secondsLeft: number;
  formatted: string;                     // formatCountdown(secondsLeft)
  isExpired: boolean;
};

// src/modules/order/hooks/use-checkout-form.ts
export function useCheckoutForm(initialValues?: CheckoutFormValues): {
  values: CheckoutFormValues;
  errors: CheckoutErrors;                // solo los errores visibles (ver AC-26)
  setField: <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => void;
  blurField: (field: CheckoutField) => void;
  validate: () =>
    | { success: true; data: CheckoutData }
    | { success: false; firstInvalidField: CheckoutField };
};

// src/modules/order/components/qr-pattern.tsx
export const QR_SIZE = 21;
export function buildQrMatrix(seed: number): boolean[][]; // QR_SIZE × QR_SIZE, true = celda oscura
export function QrPattern(props: { seed: number; className?: string }): JSX.Element;

// src/modules/order/components/purchase-steps-header.tsx (extendido)
export function PurchaseStepsHeader(props: {
  currentStep: 1 | 2 | 3;
  backHref?: string;                     // si falta, en mobile se muestra el logo (paso 3)
  backLabel?: string;                    // aria-label del link de volver; "Volver al evento" por defecto
}): JSX.Element;

// src/modules/order/components/order-summary.tsx (se agregan)
export function OrderLineList(props: { lines: OrderLine[]; className?: string }): JSX.Element;
export function OrderTotal(props: { total: number; count?: number; className?: string }): JSX.Element;

// src/modules/order/components/checkout-view.tsx ("use client")
export function CheckoutView(): JSX.Element;

// src/modules/order/components/checkout-form.tsx
export function CheckoutFields(props: {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  onFieldChange: <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => void;
  onFieldBlur: (field: CheckoutField) => void;
}): JSX.Element;

// src/modules/order/components/checkout-summary.tsx
export function PayButton(props: { total: number; acceptedTerms: boolean; submitting: boolean; hintId: string; className?: string }): JSX.Element;
export function CheckoutSummary(props: { event: EventDetail; lines: OrderLine[]; total: number; acceptedTerms: boolean; submitting: boolean; changeHref: string }): JSX.Element;
export function CheckoutMobileSummary(props: { event: EventDetail; lines: OrderLine[]; total: number; count: number; changeHref: string }): JSX.Element;
export function CheckoutPayBar(props: { total: number; acceptedTerms: boolean; submitting: boolean }): JSX.Element;

// src/modules/order/components/order-confirmation.tsx ("use client")
export function OrderConfirmation(props: { orderId: string }): JSX.Element;

// src/modules/order/components/order-ticket-card.tsx
export function OrderTicketCard(props: { order: Order }): JSX.Element;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| T1 | 1 | Dominio pedido: validación, contrato, store y service | `src/modules/order/schemas/checkout.schema.ts`, `src/modules/order/schemas/checkout.schema.test.ts`, `src/modules/order/schemas/order.schema.ts`, `src/modules/order/store/order.store.ts`, `src/modules/order/services/order.service.ts`, `src/modules/order/services/order.service.test.ts`, `src/modules/order/components/ticket-selection.tsx` | — | AC-1 a AC-9 |
| T2 | 1 | Piezas compartidas: fechas, countdown, QR y header de pasos | `src/lib/date.ts`, `src/lib/date.test.ts`, `src/app/eventos/[slug]/entradas/page.tsx`, `src/modules/order/hooks/use-countdown.ts`, `src/modules/order/hooks/use-countdown.test.ts`, `src/modules/order/components/qr-pattern.tsx`, `src/modules/order/components/qr-pattern.test.ts`, `src/modules/order/components/purchase-steps-header.tsx` | — | AC-10 a AC-13 |
| T3 | 2 | Ruta `/checkout`: formulario, resumen y pago simulado | `src/app/checkout/page.tsx`, `src/modules/order/components/checkout-view.tsx`, `src/modules/order/components/checkout-form.tsx`, `src/modules/order/components/checkout-summary.tsx`, `src/modules/order/components/order-summary.tsx`, `src/modules/order/hooks/use-checkout-form.ts`, `src/modules/order/hooks/use-checkout-form.test.ts` | T1, T2 | AC-14 a AC-26 |
| T4 | 2 | Ruta de confirmación | `src/app/checkout/confirmacion/[orderId]/page.tsx`, `src/modules/order/components/order-confirmation.tsx`, `src/modules/order/components/order-ticket-card.tsx` | T1, T2 | AC-27 a AC-32 |

Notas de ejecución:
- No hay ola 0: no hay dependencias nuevas ni componentes shadcn.
- T1 y T2 no comparten archivos ni se importan entre sí. T3 y T4 no comparten archivos. T4 no usa `OrderLineList`/`OrderTotal` de T3.
- T3 y T4 no editan archivos de T1 ni de T2 (`checkout.schema.ts`, `order.schema.ts`, `order.store.ts`, `order.service.ts`, `use-countdown.ts`, `qr-pattern.tsx`, `purchase-steps-header.tsx`, `date.ts`). Si falta algo en esos contratos, reportan `BLOCKED`.
- T1: zod es 4.x. En zod 4, los refinamientos de un `z.object` (`refine`/`superRefine`) **no se ejecutan** si ya hay errores en la forma del objeto. Para cumplir AC-4 (todos los errores a la vez), deja la forma permisiva (`z.string()`, `z.boolean()`) y valida las reglas dentro de un único `superRefine`, o usa la opción `when`. Verifícalo en el test.
- T3 y T4: antes de escribir las páginas, lee en `node_modules/next/dist/docs/` la guía de Next 16 sobre rutas dinámicas (`params` como `Promise`, render dinámico sin `generateStaticParams`), `metadata` (`robots`) y `useRouter` de `next/navigation`.

## Criterios de aceptación

### Dominio pedido (T1)
- AC-1: `checkout.schema.ts` exporta todo lo de Contratos. `DOCUMENT_TYPE_OPTIONS`, `PAYMENT_METHOD_OPTIONS`, `CHECKOUT_FIELDS` y `EMPTY_CHECKOUT_VALUES` tienen exactamente los valores y el orden indicados. `checkoutSchema.safeParse(EMPTY_CHECKOUT_VALUES)` falla.
- AC-2: reglas del comprador, sobre valores con `trim()`. Mensaje entre comillas, uno por campo:
  - `fullName`: vacío → "Ingresa tu nombre completo."; solo letras (con tildes, `ñ`, `ü`), espacios, apóstrofo o guion, al menos 2 palabras y máx. 80 caracteres; si no → "Ingresa tu nombre y apellido, solo con letras.". Ejemplos: `"Ana Pérez"` y `"  María José Núñez "` pasan, `"Ana"` y `"Ana P3rez"` fallan.
  - `email`: vacío → "Ingresa tu correo electrónico."; formato inválido → "Ingresa un correo válido, por ejemplo tu@email.com.". La salida está en minúsculas.
  - `documentNumber` según `documentType` (vacío → "Ingresa tu número de documento."):
    - `DNI`: `^\d{8}$`, si no → "El DNI debe tener 8 dígitos.";
    - `CE`: `^\d{9}$`, si no → "El carné de extranjería debe tener 9 dígitos.";
    - `PASSPORT`: se pasa a mayúsculas y debe cumplir `^[A-Z0-9]{6,12}$`, si no → "El pasaporte debe tener entre 6 y 12 letras o números.".
    
    El error siempre va en `documentNumber` (nunca en `documentType`). Ejemplos: DNI `"12345678"` pasa, `"1234567"` y `"1234567a"` fallan; CE `"123456789"` pasa; pasaporte `"ab123456"` pasa y sale `"AB123456"`, `"AB-123456"` falla.
  - `phone`: se quitan espacios y guiones y se acepta un prefijo opcional `+51` o `51`. Lo que queda debe cumplir `^9\d{8}$`, y la salida son esos 9 dígitos. Vacío → "Ingresa tu número de celular."; inválido → "Ingresa un celular peruano de 9 dígitos que empiece con 9.". Ejemplos: `"987654321"`, `"987 654 321"` y `"+51 987654321"` pasan y salen `"987654321"`; `"887654321"` y `"98765432"` fallan.
- AC-3: reglas del pago:
  - Si `paymentMethod === "card"`:
    - `cardNumber`: sin espacios ni guiones, de 13 a 19 dígitos y `isValidLuhn`. Vacío → "Ingresa el número de tarjeta."; inválido → "El número de tarjeta no es válido.". La salida son solo dígitos.
    - `cardExpiry`: `^(0[1-9]|1[0-2])\/\d{2}$`, si no → "Usa el formato MM/AA.". Si está vencida (`!isValidCardExpiry(value, new Date())`) → "La tarjeta está vencida.". Vacío → "Ingresa la fecha de vencimiento.".
    - `cardCvv`: `^\d{3,4}$`. Vacío → "Ingresa el CVV."; inválido → "El CVV tiene 3 o 4 dígitos.".
    - `cardName`: trim, entre 2 y 26 caracteres, si no → "Ingresa el nombre como aparece en la tarjeta.".
  - Si `paymentMethod` es `"yape"` o `"cash"`, los 4 campos de tarjeta no se validan (aunque tengan basura) y en la salida valen `""`.
  - `acceptedTerms` distinto de `true` → "Debes aceptar los términos y condiciones.".
  - Helpers:
    - `isValidLuhn("4242424242424242")` y `isValidLuhn("4111111111111111")` son `true`, e `isValidLuhn("4242424242424241")` es `false`.
    - `isValidCardExpiry(v, now)` es `true` si el último día del mes `MM` del año `2000 + AA` es igual o posterior a `now`. Con `now = 2026-09-29`: `"09/26"` y `"12/30"` son `true`, `"08/26"` es `false`, y `"13/27"` y `"0927"` son `false`.
    - `formatCardNumber("4242424242424242")` → `"4242 4242 4242 4242"`, `formatCardNumber("4242-42a")` → `"4242 42"`.
    - `formatCardExpiry("0927")` → `"09/27"`, `formatCardExpiry("0")` → `"0"`, `formatCardExpiry("12/345")` → `"12/34"`.
- AC-4: `getCheckoutErrors(values)` devuelve **todos** los campos inválidos a la vez, con el primer mensaje de cada uno. Con `EMPTY_CHECKOUT_VALUES` devuelve exactamente las claves `fullName`, `email`, `documentNumber`, `phone`, `cardNumber`, `cardExpiry`, `cardCvv`, `cardName` y `acceptedTerms`. Con los mismos valores y `paymentMethod: "yape"`, las mismas claves sin las 4 de tarjeta. Con valores válidos devuelve `{}`.
- AC-5: `order.schema.ts` exporta los schemas y tipos de Contratos. Reutiliza `documentTypeSchema` y `paymentMethodSchema` de `checkout.schema.ts` y no los redefine. `OrderLine` es asignable a `CartLine & { seatLabels: string[] }`.
- AC-6: `useOrderStore` arranca con `orders: {}`. Usa `persist` con `name: ORDERS_STORAGE_KEY`, `storage: createJSONStorage(() => sessionStorage)`, `partialize` que guarda solo `orders`, `version: 1` y `skipHydration: true`. `addOrder(order)` agrega o reemplaza `orders[order.id]` sin borrar los demás.
- AC-7: helpers del service:
  - `generateOrderId(() => 0)` → `"TK-10000"`, `generateOrderId(() => 0.123456)` → `"TK-21111"` y `generateOrderId(() => 0.99999)` → `"TK-99999"`. Siempre cumple `^TK-\d{5}$`.
  - `getOrderLines(items, tiers, venueMap)` devuelve `getCartLines(items, tiers)` con `seatLabels` agregado: con `findSeat` + `formatSeatLabel` para cada `seatId`, omite los ids que no encuentra y devuelve `[]` si `venueMap` es `null` o en standing.
- AC-8: `orderService.create({ event, values }, { delayMs = SIMULATED_PAYMENT_DELAY_MS, random = Math.random, now = () => new Date() })` hace, en este orden:
  1. `checkoutSchema.parse(values)`: si falla, la promesa se rechaza con el `ZodError`.
  2. Lee `useCartStore.getState()`. Si `eventSlug !== event.slug` o `getCartCount === 0`, se rechaza con `Error("CART_EMPTY")`.
  3. Espera `delayMs` con `setTimeout`, que es el pago simulado.
  4. `await useOrderStore.persist.rehydrate()`, para no pisar los pedidos anteriores guardados en `sessionStorage`.
  5. Genera el id con `generateOrderId(random)`. Si ya existe en `orders`, genera otro, hasta `ORDER_ID_MAX_ATTEMPTS` intentos; después se rechaza con `Error("ORDER_ID_COLLISION")`.
  6. Arma el `Order`:
     - `createdAt: now().toISOString()`;
     - `event`: snapshot con `categoryName` de `categories` por `event.categorySlug` (si no existe, usa el slug);
     - `lines`: `getOrderLines(cart, event.tiers, venueService.getByEventSlug(event.slug))`;
     - `count` y `total` con `getCartCount` y `getCartTotal`;
     - `buyer`: con los datos normalizados;
     - `paymentMethod`;
     - `cardLast4`: los últimos 4 dígitos con `"card"`, y `null` en otro caso.
  7. Lo valida con `orderSchema.parse`, hace `addOrder`, llama a `useCartStore.getState().clear()` (conserva `eventSlug`) y resuelve con el pedido.
  
  Si falla en los pasos 1, 2 o 5, no guarda nada y el carrito queda intacto. El JSON en `sessionStorage["ticketera-orders"]` nunca contiene el número completo de tarjeta, el CVV ni el vencimiento.
- AC-9: `orderService.getById(id)` devuelve `useOrderStore.getState().orders[id] ?? null`. `ticket-selection.tsx` reemplaza su función local `getSeatLabels` y el `map` de líneas por `getOrderLines(items, event.tiers, venueMap)`. `/entradas` no cambia en comportamiento ni en markup.

### Piezas compartidas (T2)
- AC-10: `src/lib/date.ts` usa `Intl.DateTimeFormat("es-PE", …)` con `timeZone: EVENT_TIME_ZONE` y quita comas y puntos, igual que el `formatDate` actual de `/entradas`. `formatEventDateLong("2026-11-14T20:00:00-05:00")` → `"sábado 14 de noviembre"`, `formatEventDateShort(...)` → `"sáb 14 nov"`, y `formatEventDateLong("2026-11-15T03:00:00Z")` → `"sábado 14 de noviembre"` (se muestra en hora de Lima). `src/app/eventos/[slug]/entradas/page.tsx` elimina sus formateadores y `formatDate` locales y usa estos helpers, con el mismo resultado visible.
- AC-11: `useCountdown({ durationSeconds, onExpire })`:
  - arranca con `secondsLeft = durationSeconds`. Al montar, fija `endAt = Date.now() + durationSeconds * 1000` y cada 1000 ms recalcula `secondsLeft = max(0, ceil((endAt − Date.now()) / 1000))`. Se basa en el reloj, no en contar ticks;
  - al llegar a 0 detiene el intervalo, pone `isExpired: true` y llama a `onExpire` **una sola vez**. Usa la última `onExpire` recibida (con una ref), sin reiniciar el conteo si cambia la función;
  - al desmontar limpia el intervalo.
  
  `formatCountdown(600)` → `"10:00"`, `formatCountdown(588)` → `"09:48"`, `formatCountdown(59)` → `"00:59"`, y `formatCountdown(0)` y `formatCountdown(-5)` → `"00:00"`.
- AC-12: `buildQrMatrix(seed)` es determinista (mismo seed, misma matriz; seeds distintos, matrices distintas) y devuelve `QR_SIZE × QR_SIZE`:
  - tiene 3 marcas de esquina de 7×7 en `(0,0)`, `(0,14)` y `(14,0)`: borde oscuro, anillo claro y núcleo oscuro de 3×3 (filas y columnas 2 a 4). Por ejemplo, en la esquina `(0,0)`: `[0][0..6]` y `[3][3]` son `true`, y `[1][1]` es `false`;
  - la franja separadora de 1 celda alrededor de cada marca, dentro de la grilla, es clara (por ejemplo, `[7][0..7]` es `false`);
  - el resto de celdas se llena en orden fila por fila con `x = (x * 9301 + 49297) % 233280` (con `x` que arranca en `seed`), y la celda es oscura si `x / 233280 > 0.52`, igual que el diseño.
  
  `QrPattern` renderiza un `<svg viewBox="0 0 21 21" aria-hidden="true" focusable="false" shapeRendering="crispEdges">` con un fondo blanco y **un solo** `<path>` oscuro (`#18181B`) con un cuadrado de 1×1 por celda oscura. Sin librerías de QR.
- AC-13: `PurchaseStepsHeader`:
  - Desktop:
    - los pasos con número menor que `currentStep` se muestran completados: círculo `bg-primary` con ícono `Check` (`aria-hidden`) en lugar del número, y el texto `" (completado)"` en `sr-only`;
    - el separador que va antes del paso `n` es `bg-primary` si `n <= currentStep`, y `bg-zinc-300` si no;
    - el paso actual queda como hoy (círculo oscuro, `aria-current="step"`);
    - "Compra segura" (`Lock`) se muestra con `currentStep < 3`. En el paso 3 queda un espaciador vacío `w-60`, para que el `ol` siga centrado.
  - Mobile:
    - con `backHref`, el link de 44px con `ArrowLeft` y `aria-label={backLabel ?? "Volver al evento"}`, más "Paso n de 3", el `mobileTitle` y `Lock`, igual que hoy;
    - sin `backHref`, el logo (ícono `Ticket` y "Ticketera") con link a `/` a la izquierda y "Paso n de 3" a la derecha, sin `Lock`;
    - la barra de progreso sigue igual (`n/3`, 100% en el paso 3).
  
  Con `currentStep={1}` y `backHref`, el HTML es equivalente al actual, así que `/entradas` no cambia. El componente sigue sin depender del carrito.

### Ruta `/checkout` (T3)
- AC-14: `src/app/checkout/page.tsx` es un server component (sin `"use client"`). Exporta `metadata = { title: "Datos y pago | Ticketera", robots: { index: false } }` y renderiza un contenedor `flex flex-1 flex-col bg-zinc-100` con `<CheckoutView />`. No usa `SiteHeader` ni `SiteFooter`.
- AC-15: `CheckoutView` (`"use client"`) rehidrata el carrito al montar con `Promise.resolve(useCartStore.persist.rehydrate()).then(() => setHydrated(true))`, **sin** llamar a `setEvent`. Según el estado, renderiza siempre un `PurchaseStepsHeader currentStep={2}` y además:
  - antes de rehidratar: un bloque `aria-busy="true"` con el texto `sr-only` "Cargando tu compra…". No muestra el formulario ni el estado vacío, para que no aparezcan un instante;
  - carrito vacío (decisión: se muestra un estado, no se redirige): pasa si `eventSlug` es `null`, si `eventService.getBySlug(eventSlug)` devuelve `null` o si `getOrderLines(...)` devuelve `[]`, **mientras el estado de envío sea `"idle"`**. Muestra una tarjeta con el `h1` "No tienes entradas en tu carrito", el texto "Elige un evento y tus entradas para continuar con la compra." y un link "Explorar eventos" a `/eventos` (44px o más). El header usa `backHref="/eventos"` y `backLabel="Volver a eventos"`. No hay formulario, temporizador ni botón de pagar;
  - con items: el checkout, con `backHref="/eventos/<slug>/entradas"` y `backLabel="Volver a entradas"`. Las líneas, el total y el conteo salen de `getOrderLines`, `getCartTotal` y `getCartCount` con `event.tiers` (y `venueService.getByEventSlug(slug)` para los asientos). Los precios no se recalculan en el componente.
- AC-16: reserva:
  - el checkout usa `useCountdown({ durationSeconds: RESERVATION_SECONDS })`, con la constante local `RESERVATION_SECONDS = 600`, que solo se monta en el estado con items;
  - el aviso es un `<p>` con borde y fondo naranja (`border-orange-200 bg-orange-50 text-orange-800`), el ícono `Clock` y el texto "Reservamos tus entradas por **MM:SS**. Completa el pago antes de que se liberen.". El tiempo va en un `<strong role="timer" className="tabular-nums">`;
  - no se anuncia cada segundo. Hay una región `sr-only aria-live="polite"` que queda vacía hasta que `secondsLeft <= 60`, y entonces dice "Queda menos de 1 minuto para completar el pago.";
  - al expirar, si el envío está en `"idle"`, llama a `useCartStore.getState().clear()` y pasa al estado expirado: una tarjeta con el `h1` "Tu reserva expiró" (con `tabIndex={-1}` y foco al aparecer), el texto "Pasaron 10 minutos y liberamos tus entradas. Vuelve a elegirlas para continuar." y un link "Elegir entradas de nuevo" a `/eventos/<slug>/entradas`. Si expira durante el envío, se ignora.
- AC-17: `CheckoutFields` renderiza, dentro del `<form noValidate>` de `CheckoutView`, dos secciones como tarjetas blancas (`rounded-[20px] lg:rounded-3xl border border-zinc-200 bg-white`):
  - "Datos del comprador" (`h2`), con la ayuda "Enviaremos tus entradas al correo que indiques.";
  - "Método de pago" (`h2`).
  
  Cada campo tiene `id="checkout-<campo>"` y un `<label htmlFor>` visible. Los inputs de texto usan `Input` de `src/components/ui/input.tsx` con una altura de 52px, y el texto a 16px en mobile para evitar el zoom de iOS. Atributos:
  - nombre: `autoComplete="name"`, placeholder "Como figura en tu documento";
  - correo: `type="email"`, `autoComplete="email"`, placeholder "tu@email.com";
  - celular: `type="tel"`, `autoComplete="tel"`, `inputMode="tel"`, placeholder "Número de celular";
  - tarjeta: `inputMode="numeric"`, `autoComplete="cc-number"`, placeholder "0000 0000 0000 0000", con el valor pasado por `formatCardNumber` en cada cambio;
  - vencimiento: `inputMode="numeric"`, `autoComplete="cc-exp"`, placeholder "MM/AA", `formatCardExpiry` en cada cambio;
  - CVV: `inputMode="numeric"`, `autoComplete="cc-csc"`, `maxLength={4}`, placeholder "3 o 4 dígitos", solo dígitos;
  - nombre en la tarjeta: `autoComplete="cc-name"`, placeholder "Como aparece en la tarjeta".
  
  Desktop: los datos del comprador van en una grilla de 2 columnas y la tarjeta en una grilla de 4 (número `col-span-2`, vencimiento, CVV, y el nombre `col-span-4`). Mobile: una columna, con vencimiento y CVV en 2 columnas.
- AC-18: el documento es un `fieldset` con `legend` "Documento de identidad", que contiene:
  - un `select` nativo (`id="checkout-documentType"`, con `label` `sr-only` "Tipo de documento" y las opciones de `DOCUMENT_TYPE_OPTIONS`);
  - el input `id="checkout-documentNumber"` (con `label` `sr-only` "Número de documento").
  
  El placeholder y el `inputMode` dependen del tipo:
  - DNI: "8 dígitos", `numeric`;
  - CE: "9 dígitos", `numeric`;
  - Pasaporte: "Número de pasaporte", `text`.
  
  Si cambia el tipo con el número ya visible como inválido, el error se recalcula en el momento.
- AC-19: el método de pago es un `fieldset` con `legend` `sr-only` "Método de pago" y un radio nativo por cada `PAYMENT_METHOD_OPTIONS` (`name="paymentMethod"`), dentro de un `label` tipo tarjeta de 76px en desktop (3 columnas) y 60px en mobile (apiladas). La tarjeta se marca con `has-[:checked]:border-primary has-[:checked]:bg-indigo-50`, y si no está marcada lleva borde `zinc-200`. El label muestra `mobileLabel` en mobile y `label` desde `lg:`. Debajo, según el método:
  - `card`: los 4 campos de tarjeta;
  - `yape`: `<p>` sobre `bg-indigo-50 text-indigo-800`, con ícono `Smartphone` y el texto "Al continuar te mostraremos un código QR para pagar desde tu app de Yape.";
  - `cash`: el mismo estilo, con ícono `Store` y el texto "Generaremos un código de pago para que pagues en agentes, bodegas o tu banca móvil.".
  
  Los campos de tarjeta se desmontan con otro método, y sus valores se conservan en el estado si se vuelve a `card`. Con teclado, las flechas cambian de método (comportamiento nativo del grupo de radios).
- AC-20: errores accesibles:
  - cada campo con error visible lleva `aria-invalid="true"` y `aria-describedby="checkout-<campo>-error"`, y el mensaje se muestra en `<p id="checkout-<campo>-error" className="text-sm text-destructive">`. Sin error visible, no hay `aria-invalid` ni `aria-describedby` hacia un id que no existe;
  - los errores se ven según AC-26 (después de salir del campo o después de intentar pagar);
  - al enviar con errores se enfoca el primer campo inválido según `CHECKOUT_FIELDS`, con `document.getElementById("checkout-" + field)?.focus()`. Si es `acceptedTerms`, el foco va al checkbox.
- AC-21: términos y botón de pagar:
  - checkbox nativo `id="checkout-acceptedTerms"` (20px en desktop y 22px en mobile, `accent-primary`) con el label "Acepto los Términos y condiciones y la Política de privacidad.". "Términos y condiciones" enlaza a `/terminos` y "Política de privacidad" a `/privacidad`, con `next/link`;
  - `PayButton` es un `Button type="submit"` con el ícono `Lock` y el texto "Pagar S/ <total>", en el estilo del CTA naranja (`bg-accent text-accent-foreground hover:bg-accent/90`), 56px en desktop y 54px en mobile;
  - con `acceptedTerms === false`: `disabled`, gris (`bg-zinc-200 text-muted-foreground`), y debajo el texto "Acepta los términos para continuar." con `id={hintId}` al que apunta el botón con `aria-describedby`;
  - con `submitting`: `disabled`, `aria-busy="true"`, ícono `Loader2` con `animate-spin` y el texto "Procesando pago…";
  - hay dos instancias (en `CheckoutSummary` y en `CheckoutPayBar`) con `hintId` distintos (`checkout-pay-hint-desktop` y `checkout-pay-hint-mobile`). Como cada una está oculta con `display: none` en el otro breakpoint, solo una es alcanzable a la vez.
- AC-22: envío (`onSubmit` del form, con `preventDefault`), con estado local `"idle" | "submitting" | "redirecting" | "expired"`:
  - si no está en `"idle"`, no hace nada;
  - llama a `validate()`. Si falla, enfoca según AC-20;
  - si pasa, cambia a `"submitting"`, deshabilita todos los campos (un `<fieldset disabled>` que envuelve las secciones y el checkbox) y llama a `orderService.create({ event, values })`;
  - si resuelve, cambia a `"redirecting"` y llama a `router.replace("/checkout/confirmacion/<order.id>")`. Con `replace`, el botón "atrás" no vuelve al checkout vacío. Mientras está en `"redirecting"` no se muestra el estado vacío, aunque el carrito ya esté vacío;
  - si se rechaza, vuelve a `"idle"` y muestra arriba del botón de pagar un `<p role="alert">` con "No pudimos procesar el pago. Inténtalo de nuevo.". El mensaje se borra en el siguiente intento.
- AC-23: `CheckoutSummary` es un `aside aria-label="Resumen de la compra"` (`hidden lg:flex`, `lg:sticky lg:top-6`, con el mismo estilo de tarjeta y sombra que `OrderSummary`) que contiene:
  - la miniatura del evento (`next/image`, 64px, `alt=""`), el título y `"<formatEventDateShort> · <venueName>, <city>"`;
  - `OrderLineList` con borde superior;
  - el link "Cambiar entradas" a `changeHref` (`/eventos/<slug>/entradas`);
  - `OrderTotal` sin `count` ("Total" y "S/ <total>");
  - `PayButton`.
  
  En `order-summary.tsx`, `OrderLineList` (la `ul` de líneas con los `seatLabels` separados por "; ") y `OrderTotal` (el `<p>` con borde punteado, "Total", "(n entradas)" solo si recibe `count`, y el monto) se extraen del markup actual. `OrderSummary` pasa a usarlos con las mismas clases, así que `/entradas` no cambia. El tipo de `lines` pasa a ser `OrderLine[]`.
- AC-24: mobile (`lg:hidden`):
  - `CheckoutMobileSummary` es una tarjeta con un `button type="button"` que tiene `aria-expanded` y `aria-controls="checkout-summary-details"`. Muestra la miniatura de 48px, el título, `"<formatTicketCount(count)> · S/ <total>"` y un `ChevronDown` que rota 180° al abrir. Arranca cerrada. Abierta, muestra `id="checkout-summary-details"` con `"<formatEventDateShort> · <venueName>"`, `OrderLineList` y "Cambiar entradas";
  - `CheckoutPayBar` es una barra `fixed inset-x-0 bottom-0 z-40`, dentro del `<form>`, con `PayButton` a todo el ancho y el texto de ayuda. La página agrega padding inferior en mobile (`pb-36 lg:pb-0` o similar) para que la barra no tape el checkbox.
  - Orden en mobile: aviso de reserva, resumen plegable, datos del comprador, método de pago y términos.
- AC-25: layout:
  - desktop: el aviso de reserva ocupa todo el ancho (`px-20 pt-6`), y debajo el `<form>` es un grid `lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:px-20`, con las secciones y los términos a la izquierda y `CheckoutSummary` a la derecha;
  - mobile: una columna con `p-4 gap-4` sobre `bg-zinc-100`;
  - ningún elemento produce scroll horizontal a 360px. Los controles interactivos miden 44px o más en mobile, y el checkbox tiene un área táctil de 44px o más a través de su label.
- AC-26: `useCheckoutForm(initialValues = EMPTY_CHECKOUT_VALUES)`:
  - guarda `values`, un set de campos `touched` y el flag `submitAttempted`;
  - los errores se calculan con `getCheckoutErrors(values)` en cada render. `errors` expone solo los de campos `touched` o todos si `submitAttempted`;
  - `blurField` marca el campo como `touched`. `setField` actualiza el valor, así que un error visible se actualiza o desaparece al corregirlo;
  - `validate()` pone `submitAttempted = true` y devuelve `{ success: true, data: checkoutSchema.parse(values) }`, o `{ success: false, firstInvalidField }` con el primer campo inválido en el orden de `CHECKOUT_FIELDS`;
  - al cambiar `paymentMethod` a `"yape"` o `"cash"`, los errores de tarjeta dejan de estar en `errors`.

### Ruta de confirmación (T4)
- AC-27: `src/app/checkout/confirmacion/[orderId]/page.tsx` es un server component:
  - tipa `params` como `Promise<{ orderId: string }>` y lo espera con `await`;
  - no exporta `generateStaticParams` (render dinámico);
  - exporta `metadata = { title: "Compra confirmada | Ticketera", robots: { index: false } }`;
  - renderiza, en un contenedor `bg-zinc-100`, `PurchaseStepsHeader currentStep={3}` (sin `backHref`) y `<OrderConfirmation orderId={orderId} />`. No usa `SiteHeader` ni `SiteFooter`.
  
  Decisión: se usa `/checkout/confirmacion/[orderId]` y no `/checkout/confirmacion`, para que la URL identifique el pedido, se pueda recargar y la fase 6 ("Mis entradas") pueda enlazar a un pedido concreto.
- AC-28: `OrderConfirmation` (`"use client"`) rehidrata el store de pedidos al montar con `Promise.resolve(useOrderStore.persist.rehydrate()).then(() => setHydrated(true))` y después usa `orderService.getById(orderId)`:
  - antes de rehidratar: un bloque `aria-busy="true"` con el texto `sr-only` "Cargando tu pedido…";
  - sin pedido: una tarjeta con el `h1` "No encontramos este pedido", el texto "Puede que el enlace no sea correcto o que la compra se haya hecho en otra pestaña o sesión." y un link "Explorar eventos" a `/eventos`;
  - con pedido: el contenido de AC-29 a AC-32. Solo usa el snapshot `order.event`, sin llamar a `eventService`, y no modifica el carrito.
- AC-29: el encabezado de éxito va centrado:
  - un círculo verde (`bg-green-100 text-green-700`, 76px en desktop y 64px en mobile) con `CircleCheck` `aria-hidden`;
  - el `h1` "¡Compra confirmada!" (40px en desktop y 28px en mobile, bold);
  - el texto "Enviamos tus entradas a tu correo. También las tienes siempre en Mis entradas.";
  - un chip redondeado blanco con borde: "Pedido N.º" y `<strong>{order.id}</strong>`.
- AC-30: `OrderTicketCard` es un `article` con `aria-labelledby` que apunta a su `h2`, borde y `rounded-3xl`, con `overflow-hidden`. Contiene:
  - la imagen del evento (`next/image`, `alt=""`): en desktop es la columna izquierda de 200px a toda la altura, y en mobile ocupa todo el ancho con 130px de alto arriba;
  - la categoría (`order.event.categoryName`, en mayúsculas, `text-primary`, 12px), el `h2` con el título y `"<formatEventDateLong> · <venueName>, <city>"`;
  - un `<dl>` con 3 pares `dt`/`dd`:
    - "Zona": los nombres de `lines` unidos por ", ";
    - "Entradas": `count`;
    - "Total pagado" ("Total" en mobile): `S/ <total>`.
    
    En mobile es una grilla de 3 columnas;
  - si alguna línea tiene `seatLabels`, debajo un `<p>` con "Asientos: " y todas las etiquetas unidas por "; ";
  - una perforación decorativa (`aria-hidden`) con borde punteado y dos medios círculos del color del fondo: vertical entre los datos y el QR en desktop, horizontal sobre el QR en mobile;
  - la columna del QR (220px en desktop, bloque abajo en mobile): `QrPattern` con `seed={Number(order.id.slice(3))}`, de 126px en desktop y 168px en mobile, y el texto "Entrada 1 de <count>".
- AC-31: acciones:
  - un link "Ver mis entradas" (`next/link` a `/mis-entradas`, con `ArrowRight`) en estilo primario (`bg-primary text-primary-foreground`, 54px, `rounded-2xl`);
  - dos `Button type="button" variant="outline"`: "Agregar al calendario" (con `CalendarPlus`; el texto visible es "Calendario" en mobile y el `aria-label` completo va en los dos breakpoints) y "Descargar PDF" (con `Download`), de 54px en desktop y 50px en mobile;
  - al hacer click en cualquiera de los dos, un `<p aria-live="polite">` debajo muestra "Esta opción estará disponible pronto.". No generan archivos ni abren enlaces;
  - desktop: una fila centrada. Mobile: el link primario a todo el ancho y, debajo, los 2 botones en una grilla de 2 columnas.
- AC-32: "Qué sigue" es una `section` con `aria-labelledby` y el `h2` "Qué sigue" (visible en mobile y `lg:sr-only` en desktop, como el diseño). Contiene un `ol` de 3 ítems, cada uno con un ícono en un cuadro `bg-indigo-50 text-primary` (44px en desktop y 40px en mobile, `aria-hidden`), un título y un texto:
  - `Mail`, "Revisa tu correo", "Ahí llegan tus entradas y el comprobante de pago.";
  - `QrCode`, "Muestra tu QR", "Cada entrada tiene su propio QR. Muéstralo desde tu celular en el ingreso.";
  - `Ticket`, "Todo en Mis entradas", "Entra con tu cuenta para ver y descargar tus entradas cuando quieras.".
  
  En desktop es una grilla de 3 columnas y en mobile una lista apilada, con los ítems en fila (ícono y texto). El layout general:
  - desktop: el `main` va centrado con `px-20 pt-14 pb-18` y el contenido tiene un ancho máximo de 880px;
  - mobile: `px-4 pt-7 pb-9` con `gap-6`;
  - no hay scroll horizontal a 360px.

## Tests requeridos
- `src/modules/order/schemas/checkout.schema.test.ts`: los ejemplos de AC-2 y AC-3, incluida la normalización de la salida (email en minúsculas, celular a 9 dígitos, pasaporte en mayúsculas, tarjeta solo con dígitos, campos de tarjeta `""` con yape/cash); los mensajes exactos de al menos un caso vacío y uno inválido por campo; los casos de `isValidLuhn`, `formatCardNumber` y `formatCardExpiry`; `isValidCardExpiry` con el `now` explícito, y el `cardExpiry` del schema con `vi.useFakeTimers()` + `vi.setSystemTime(new Date("2026-09-29T12:00:00-05:00"))`; y AC-4 (todos los errores a la vez, con card y con yape, y `{}` con valores válidos). Cubre AC-1 a AC-4.
- `src/modules/order/services/order.service.test.ts`: los casos de `generateOrderId` de AC-7; `getOrderLines` con un asiento real del mock (obtenido con `venueService.getByEventSlug("romeo-y-julieta-teatro-municipal")`), un id inexistente omitido y `venueMap` `null`. `create`, con `delayMs: 0` y `random`/`now` inyectados:
  - happy path con card: `id`, `total`, `count`, `lines`, `categoryName`, `cardLast4 = "4242"` y `createdAt` del `now` inyectado, pasa `orderSchema.parse`, queda guardado en el store y en `sessionStorage["ticketera-orders"]`, y el carrito queda vacío con `eventSlug` conservado;
  - yape → `cardLast4: null`;
  - valores inválidos → `ZodError` sin guardar ni vaciar;
  - carrito vacío o de otro evento → `CART_EMPTY`;
  - colisión de id (reintenta con otro id, y falla tras `ORDER_ID_MAX_ATTEMPTS`);
  - un pedido previo escrito en `sessionStorage` se conserva al crear otro;
  - el JSON guardado no contiene el número completo de tarjeta ni el CVV;
  - con fake timers, la promesa no resuelve antes de `delayMs`.
  
  También `getById` con un id existente y uno inexistente. Entre tests se resetean los dos stores y `sessionStorage`. Cubre AC-5 a AC-9 (AC-5 y AC-6 a través de `orderSchema.parse` y la persistencia).
- `src/lib/date.test.ts`: los 3 ejemplos de AC-10. Cubre AC-10.
- `src/modules/order/hooks/use-countdown.test.ts`: con `renderHook` y `vi.useFakeTimers()`, valor inicial, −1 tras 1000 ms, `isExpired` y `onExpire` llamado una sola vez al llegar a 0 (y no de nuevo al avanzar más), el cambio de `onExpire` sin reiniciar el conteo, `vi.getTimerCount() === 0` tras desmontar, y los casos de `formatCountdown`. Cubre AC-11.
- `src/modules/order/components/qr-pattern.test.ts`: tamaño 21×21, determinismo, seeds distintos dan matrices distintas, celdas de las 3 marcas de esquina y del separador (AC-12), y que `QrPattern` renderiza un `svg` `aria-hidden` con un solo `path`. Cubre AC-12.
- `src/modules/order/hooks/use-checkout-form.test.ts`: con `renderHook`, verifica:
  - sin errores visibles al inicio;
  - `blurField("email")` con el email vacío muestra solo el error de `email`;
  - `setField` con un valor válido lo quita;
  - `validate()` con valores vacíos devuelve `firstInvalidField: "fullName"` y hace visibles todos los errores;
  - cambiar a `"yape"` quita los errores de tarjeta;
  - `validate()` con valores válidos devuelve `data` normalizado.
  
  Cubre AC-26.
- UI (`PurchaseStepsHeader`, `CheckoutView`, `CheckoutFields`, `CheckoutSummary`, `OrderConfirmation`, `OrderTicketCard`, páginas): composición sobre lógica ya testeada, sin test unitario obligatorio. El reviewer los valida leyendo el código contra AC-13 a AC-25 y AC-27 a AC-32. Al final se ejecutan `npm run test` (incluidos los tests de las fases 3 y 4, que no deben romperse con los refactors de AC-9, AC-10, AC-13 y AC-23) y `npm run build`.

## Cambios al plan
- **Ruta de confirmación con `[orderId]`** (`/checkout/confirmacion/[orderId]`): la URL identifica el pedido, sobrevive a una recarga, permite varios pedidos en la misma sesión y deja lista la fase 6 para enlazar a un pedido. El estado de pedido no encontrado cubre ids inválidos o de otra sesión.
- **`/checkout` con carrito vacío muestra un estado vacío, no redirige**: la rehidratación ocurre en el cliente, así que una redirección haría parpadear la pantalla y agregaría una entrada al historial. Además, el mismo mecanismo cubre el estado posterior a pagar (`"redirecting"`) y el de reserva expirada.
- **Métodos de pago según el diseño**: `card` ("Tarjeta" / "Tarjeta de crédito o débito"), `yape` ("Yape") y `cash` ("PagoEfectivo"). El diseño agrega el campo "Nombre en la tarjeta" (`cardName`), que se suma al schema.
- **El botón "Pagar" está deshabilitado hasta aceptar los términos**, como el diseño, con el texto de ayuda enlazado por `aria-describedby`. El schema igual exige `acceptedTerms: true`.
- **`useCountdown` es genérico**: no vacía el carrito por su cuenta. Recibe `onExpire`, y es `CheckoutView` quien llama a `clear()` y muestra el estado expirado (SRP). Se basa en `Date.now()` para no desfasarse si la pestaña se congela. La reserva no se persiste entre recargas (fuera de alcance).
- **El pedido es un snapshot** (evento, líneas con `seatLabels`, total y comprador), así que la confirmación no depende de los mocks ni del carrito ya vacío. Solo se guarda `cardLast4`, nunca el número completo, el CVV ni el vencimiento.
- **`getOrderLines` en `order.service.ts`**: une `getCartLines` con las etiquetas de asiento. Lo usan el checkout, el service y `ticket-selection.tsx`, que elimina su función local `getSeatLabels` (DRY, en T1).
- **`src/lib/date.ts`**: el formato de fecha "sin coma ni punto" ya estaba en `/entradas` y lo necesitan el checkout (corto) y la confirmación (largo). Con 3 consumidores se extrae (DRY) y `/entradas` pasa a usarlo (T2). Los formateadores del módulo `event` no se migran en esta fase.
- **`OrderLineList` y `OrderTotal`** se extraen de `OrderSummary` para reusarlos en el resumen del checkout, en vez de duplicar el markup (T3).
- **`PurchaseStepsHeader` se extiende** con pasos completados (check), `backLabel`, `backHref` opcional y la variante del paso 3, según los diseños. Va en la ola 1 (T2) para que T3 y T4 lo usen sin editarlo en paralelo.
- **Hook `useCheckoutForm`** (con test): saca del componente la lógica de errores visibles y del primer campo inválido. No se agrega `react-hook-form`.
- **Pago simulado dentro de `orderService.create`** (promesa con `delayMs`), para que el componente trate el pago como una llamada asíncrona real. Los tests usan `delayMs: 0`.
- **Sin ola 0**: no hay dependencias nuevas ni componentes shadcn. Son 4 tareas en 2 olas: T1 y T2 no comparten archivos ni imports, y T3 y T4 tampoco.
- "Ver mis entradas" apunta a `/mis-entradas` (ruta prevista para la fase 6; 404 hasta entonces). "Agregar al calendario" y "Descargar PDF" solo muestran "Esta opción estará disponible pronto." en una región `aria-live`.

## Preguntas abiertas
ninguna
