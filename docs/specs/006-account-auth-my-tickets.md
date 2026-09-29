# 006 — Cuenta: ingreso, registro y Mis entradas (`/ingresar`, `/mis-entradas`)

Estado: pending-approval
Fase: 6 de 7 (cuenta y Mis entradas; después viene 7 organizador)

## Aprobación
Pendiente.

## Contexto
La confirmación de compra (spec 005) enlaza a `/mis-entradas`, que todavía no existe, y el navbar tiene "Iniciar sesión" con `href="#"`. Esta fase agrega una cuenta simulada: la ruta `/ingresar` con las pestañas Iniciar sesión / Crear cuenta, una sesión mock persistida en el navegador y la ruta `/mis-entradas` con los pedidos del usuario (próximos y pasados) y el detalle de cada entrada con su QR decorativo. El navbar refleja la sesión y el checkout prellena nombre y correo si hay sesión. Sigue los diseños `Auth`, `AuthMobile`, `MyTickets` y `MyTicketsMobile`, responsive en mobile y desktop. Es solo UI/UX con datos mock.

## Alcance
- Incluye:
  - Extracción transversal (ola 0) de las reglas de nombre y correo y del manejo de errores visibles de formulario, que ya existen en el checkout y ahora también usan los formularios de cuenta: `src/lib/validation.ts` y el hook `src/hooks/use-validated-form.ts`. `checkout.schema.ts` y `use-checkout-form.ts` pasan a usarlos sin cambiar su comportamiento ni sus contratos.
  - Módulo `src/modules/auth/`: schemas zod de login y registro (con test), cuentas mock (usuario demo), `authService` mock con demora y errores simulados (con test), store de sesión `useAuthStore` (zustand + `persist` en `localStorage`, `skipHydration`) con `login`, `register` y `logout` (con test), y el hook `useSession` que rehidrata la sesión sin romper el SSR (con test). Helper `getSafeRedirect` para `?redirect=`.
  - Ruta `/ingresar`: panel de marca, pestañas Iniciar sesión / Crear cuenta, validación accesible, mostrar u ocultar la contraseña, credenciales demo visibles con botón para completarlas, errores simulados, "¿Olvidaste tu contraseña?" solo visual y redirección a `?redirect=` tras ingresar.
  - Navbar (`site-navbar.tsx`): sin sesión, "Iniciar sesión" → `/ingresar?redirect=<ruta actual>`; con sesión, link "Mis entradas" y menú de cuenta (nombre, correo, "Mis entradas", "Cerrar sesión") en desktop y en mobile (header y `Sheet`), sin desajustes de hidratación.
  - Checkout: si hay sesión, el nombre y el correo del comprador vienen prellenados (editables).
  - Pedidos mock del usuario demo (2 próximos y 1 pasado), helpers puros para unir pedidos mock y de la sesión, separarlos en próximos y pasados, y expandir un pedido en entradas individuales (código, zona, asiento, semilla del QR) (con test). Helpers de fecha `formatEventTime` y `formatEventDayMonth` en `src/lib/date.ts`.
  - Ruta `/mis-entradas`: estado sin sesión con link a `/ingresar?redirect=%2Fmis-entradas`, filtro Próximas / Pasadas con contadores, lista de pedidos y detalle de la entrada seleccionada en la misma página (maestro-detalle), con navegación entre entradas del pedido, QR decorativo, datos (zona, asiento, titular, código, estado) y acciones solo visuales. Estados vacíos.
  - Extracción de la perforación decorativa del ticket a `TicketPerforation`, que usan `OrderTicketCard` (sin cambio visual) y el detalle de Mis entradas.
- Fuera de alcance (no agregar):
  - Autenticación real, backend, tokens, cookies, hash de contraseñas, OAuth o login social (el diseño no lo incluye), recuperación de contraseña, verificación de correo, edición de perfil, página de cuenta, cambio de contraseña, "recordarme".
  - Proteger rutas en el servidor (middleware/proxy) o redirigir automáticamente desde `/mis-entradas` sin sesión: se muestra un estado con link.
  - Persistir entre recargas las cuentas creadas con "Crear cuenta" (solo viven en memoria mientras la pestaña está abierta; la sesión sí persiste). Sincronizar la sesión entre pestañas.
  - Asociar pedidos a un id de usuario o cambiar `orderSchema`. Transferir, revender o cancelar entradas. Generar un QR real, un PDF o un `.ics` ("Descargar PDF" y "Agregar al calendario" solo muestran un aviso).
  - Preseleccionar un pedido por URL (`/mis-entradas?pedido=...`) o cambiar el link "Ver mis entradas" de la confirmación.
  - Páginas `/terminos` y `/privacidad` (siguen dando 404, igual que en la fase 5). Organizador y "Vender entradas" (fase 7; su link sigue en `#`).
  - Dependencias nuevas, `react-hook-form` o componentes shadcn nuevos (el entorno bloquea `ui.shadcn.com`).
  - Migrar a `src/lib/date.ts` los formateadores de `event-card.tsx`, `event-detail-info.tsx` o `featured-carousel.tsx`. Modificar `src/modules/event/*`, `src/modules/venue/*`, `src/components/ui/*`, `order.schema.ts`, `order.store.ts`, `order.service.ts` o `cart.store.ts`.

## Módulo destino
- `src/modules/auth/` (nuevo): `schemas`, `data`, `services`, `store`, `hooks`, `components`.
- `src/modules/order/` (existente): `data/orders.mock.ts`, `services/ticket.service.ts`, componentes de Mis entradas, `ticket-perforation.tsx`; ediciones puntuales en `checkout.schema.ts`, `use-checkout-form.ts`, `checkout-view.tsx` y `order-ticket-card.tsx`.
- Transversal: `src/lib/validation.ts`, `src/hooks/use-validated-form.ts`, `src/lib/date.ts`, `src/components/layout/site-navbar.tsx`.
- Rutas `src/app/ingresar/` y `src/app/mis-entradas/`.

## Reutilización
- `src/modules/order/schemas/checkout.schema.ts`: sus reglas de `fullName` y `email` se mueven a `src/lib/validation.ts` (mismos mensajes y regex) y `getCheckoutErrors` pasa a delegar en `getFieldErrors`. Patrón "forma permisiva + un único `superRefine` + `transform`" (nota de zod 4 de la spec 005), que repiten los schemas de auth.
- `src/modules/order/hooks/use-checkout-form.ts`: su lógica (`touched`, `submitAttempted`, errores visibles, primer campo inválido) se generaliza en `useValidatedForm`, y `useCheckoutForm` queda como envoltorio con el mismo contrato. Los formularios de cuenta usan `useValidatedForm`.
- `src/modules/order/components/checkout-form.tsx`: patrón accesible de campos (`id`, `label htmlFor`, `aria-invalid`, `aria-describedby="<id>-error"`, `<p className="text-sm text-destructive">`) y clases de control (`h-[52px] rounded-[14px] border-zinc-300 ... text-base lg:text-[15px]`). Se replica en `auth-form-field.tsx` (no se exporta nada nuevo de `checkout-form.tsx`).
- `src/modules/order/components/checkout-view.tsx`: patrón de foco al primer campo inválido con `flushSync` + `document.getElementById(...)?.focus()`, y de `<p role="alert">` para errores del servicio.
- Patrón de rehidratación de specs 004/005: `Promise.resolve(store.persist.rehydrate()).then(...)` en un `useEffect`, y `skipHydration: true` en los stores persistidos.
- `src/modules/order/store/order.store.ts`: `useOrderStore` (pedidos de la sesión en `sessionStorage`); solo lectura y `persist.rehydrate()`.
- `src/modules/order/schemas/order.schema.ts`: `Order`, `orderSchema` (para validar los pedidos mock en el test).
- `src/modules/order/store/cart.store.ts`: `formatTicketCount`.
- `src/modules/order/components/qr-pattern.tsx`: `QrPattern` para el QR de cada entrada.
- `src/modules/order/components/order-ticket-card.tsx`: su perforación se extrae a `TicketPerforation`.
- `src/modules/order/components/order-confirmation.tsx`: patrón del aviso "Esta opción estará disponible pronto." en un `<p aria-live="polite">`.
- `src/lib/date.ts`: `formatEventDateLong`, `formatEventDateShort`, `EVENT_TIME_ZONE` (se agregan dos helpers).
- `src/modules/event/data/events.mock.ts` y `event-details.mock.ts`: fuente de títulos, imágenes (Unsplash, dominio ya permitido), sedes, fechas y tiers para los snapshots de los pedidos mock (se copian como literales, no se importan).
- `src/modules/venue/services/venue.service.ts`: `venueService.getByEventSlug`, `findSeat` (solo en el test, para comprobar que el asiento del pedido mock existe).
- `src/components/layout/site-header.tsx` y `site-footer.tsx`: en `/mis-entradas`.
- `src/components/ui/button.tsx`, `input.tsx`, `popover.tsx` (menú de cuenta), `sheet.tsx` (menú mobile existente), `separator.tsx` (opcional en el menú). Checkbox nativo con `accent-primary`, como el checkout.
- `src/lib/utils.ts`: `cn()`.
- `lucide-react`: `Ticket`, `Eye`, `EyeOff`, `Loader2`, `CircleUserRound`, `LogOut`, `Calendar`, `Clock`, `MapPin`, `ChevronLeft`, `ChevronRight`, `Download`, `CalendarPlus`, `LogIn`.
- `next/image`, `next/link`, `useRouter` y `usePathname` de `next/navigation`.
- shadcn a instalar: ninguno. Dependencias nuevas: ninguna.

## Contratos
```ts
// ───────────── Ola 0 (T0) ─────────────

// src/lib/validation.ts
export const PERSON_NAME_MAX_LENGTH = 80;
export function getPersonNameError(value: string): string | null;
// trim; vacío → "Ingresa tu nombre completo."; si no cumple /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/,
// al menos 2 palabras y máx. 80 → "Ingresa tu nombre y apellido, solo con letras."; si no, null.
export function getEmailError(value: string): string | null;
// trim; vacío → "Ingresa tu correo electrónico."; formato (z.email() sobre el valor en minúsculas)
// inválido → "Ingresa un correo válido, por ejemplo tu@email.com."; si no, null.
export function normalizeEmail(value: string): string; // trim + toLowerCase
export type FieldErrors<F extends string> = Partial<Record<F, string>>;
export function getFieldErrors<F extends string>(schema: z.ZodType, values: unknown): FieldErrors<F>;
// safeParse; {} si es válido; si no, el primer mensaje por issue.path[0].

// src/hooks/use-validated-form.ts
export type ValidateResult<D, F extends string> =
  | { success: true; data: D }
  | { success: false; firstInvalidField: F };
export function useValidatedForm<V extends Record<string, unknown>, D>(options: {
  schema: z.ZodType<D, V>;
  fields: ReadonlyArray<keyof V & string>;   // orden visual (primer campo inválido)
  initialValues: V;                          // solo se lee al montar
}): {
  values: V;
  errors: FieldErrors<keyof V & string>;     // solo campos touched, o todos tras validate()
  setField: <K extends keyof V & string>(field: K, value: V[K]) => void;
  blurField: (field: keyof V & string) => void;
  validate: () => ValidateResult<D, keyof V & string>;
};

// src/modules/order/hooks/use-checkout-form.ts — mismo contrato que la spec 005 (AC-26)
export function useCheckoutForm(initialValues?: CheckoutFormValues): ReturnType<typeof useValidatedForm<CheckoutFormValues, CheckoutData>>;

// ───────────── Ola 1 (T1): módulo auth ─────────────

// src/modules/auth/schemas/auth.schema.ts
export const sessionUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export type LoginFormValues = { email: string; password: string };
export type LoginData = LoginFormValues;                  // email normalizado; password tal cual
export type LoginField = keyof LoginFormValues;
export const LOGIN_FIELDS: ReadonlyArray<LoginField>;     // ["email", "password"]
export const EMPTY_LOGIN_VALUES: LoginFormValues;         // { email: "", password: "" }
export const loginSchema: z.ZodType<LoginData, LoginFormValues>;

export type RegisterFormValues = { fullName: string; email: string; password: string; acceptedTerms: boolean };
export type RegisterData = Omit<RegisterFormValues, "acceptedTerms"> & { acceptedTerms: true };
export type RegisterField = keyof RegisterFormValues;
export const REGISTER_FIELDS: ReadonlyArray<RegisterField>; // ["fullName", "email", "password", "acceptedTerms"]
export const EMPTY_REGISTER_VALUES: RegisterFormValues;     // textos "", acceptedTerms false
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos una letra y un número.";
export function isValidPassword(value: string): boolean;
export const registerSchema: z.ZodType<RegisterData, RegisterFormValues>;

// src/modules/auth/data/users.mock.ts
export type AuthAccount = SessionUser & { password: string };
export const DEMO_CREDENTIALS = { email: "demo@ticketera.pe", password: "Demo1234" } as const;
export const DEMO_ACCOUNTS: ReadonlyArray<AuthAccount>;
// [{ id: "usr-demo", name: "Ana Torres", email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password }]

// src/modules/auth/services/auth.service.ts
export const SIMULATED_AUTH_DELAY_MS = 800;
export type AuthErrorCode = "INVALID_CREDENTIALS" | "EMAIL_TAKEN";
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode | "UNKNOWN", string>;
export function getAuthErrorMessage(error: unknown): string;
export type AuthService = {
  login(values: LoginFormValues): Promise<SessionUser>;
  register(values: RegisterFormValues): Promise<SessionUser>;
};
export function createAuthService(options?: {
  accounts?: ReadonlyArray<AuthAccount>;   // DEMO_ACCOUNTS por defecto; se copia, nunca se muta
  delayMs?: number;                        // SIMULATED_AUTH_DELAY_MS por defecto
  generateId?: () => string;               // `usr-${crypto.randomUUID()}` por defecto
}): AuthService;
export const authService: AuthService;     // = createAuthService()
export const DEFAULT_REDIRECT = "/mis-entradas";
export function getSafeRedirect(value: string | null | undefined, fallback?: string): string;

// src/modules/auth/store/auth.store.ts
export const AUTH_STORAGE_KEY = "ticketera-session";
export type AuthState = {
  user: SessionUser | null;
  login: (values: LoginFormValues) => Promise<SessionUser>;       // authService.login + set({ user })
  register: (values: RegisterFormValues) => Promise<SessionUser>; // authService.register + set({ user })
  logout: () => void;                                             // set({ user: null })
};
export const useAuthStore: UseBoundStore<Mutate<StoreApi<AuthState>, [["zustand/persist", unknown]]>>;

// src/modules/auth/hooks/use-session.ts
export type SessionStatus = "loading" | "authenticated" | "anonymous";
export function useSession(): { status: SessionStatus; user: SessionUser | null };

// ───────────── Ola 1 (T2): pedidos del usuario ─────────────

// src/lib/date.ts (se agregan)
export function formatEventTime(iso: string): string;                          // "21:00" (h23, hora de Lima)
export function formatEventDayMonth(iso: string): { day: string; month: string }; // { day: "14", month: "NOV" }

// src/modules/order/data/orders.mock.ts
export const DEMO_ORDERS: ReadonlyArray<Order>; // 3 pedidos del usuario demo, ver AC-21

// src/modules/order/services/ticket.service.ts
export type OrderTicket = {
  index: number;             // 0..count-1
  code: string;              // "TK-24817-01"
  zone: string;              // nombre de la línea
  seatLabel: string | null;  // "Fila C, asiento 8" o null
  seed: number;              // semilla de QrPattern
};
export function getTicketSeed(orderId: string, index: number): number; // Number(orderId.slice(3)) + index * 13
export function getOrderTickets(order: Order): OrderTicket[];
export function getUserOrders(
  email: string,
  sessionOrders: Record<string, Order>,
  mockOrders?: ReadonlyArray<Order>,   // DEMO_ORDERS por defecto
): Order[];
export type OrdersByDate = { upcoming: Order[]; past: Order[] };
export function splitOrdersByDate(orders: ReadonlyArray<Order>, now: Date): OrdersByDate;
export const ticketService: {
  getUserOrders(email: string, sessionOrders: Record<string, Order>, now?: Date): OrdersByDate;
};

// src/modules/order/components/ticket-perforation.tsx
export function TicketPerforation(props: {
  orientation?: "horizontal" | "responsive"; // "responsive" (default): horizontal en mobile, vertical desde lg
  className?: string;
}): JSX.Element;

// ───────────── Ola 2 (T3): ingreso y navbar ─────────────

// src/modules/auth/components/auth-view.tsx ("use client")
export type AuthMode = "login" | "register";
export function AuthView(props: { redirectTo: string }): JSX.Element;
// src/modules/auth/components/auth-brand-panel.tsx
export function AuthBrandPanel(): JSX.Element;
// src/modules/auth/components/login-form.tsx
export function LoginForm(props: { onSwitchMode: () => void; onSuccess: () => void }): JSX.Element;
// src/modules/auth/components/register-form.tsx
export function RegisterForm(props: { onSwitchMode: () => void; onSuccess: () => void }): JSX.Element;
// src/modules/auth/components/auth-form-field.tsx
export function AuthTextField(props: {
  id: string; label: ReactNode; error?: string; labelAction?: ReactNode;
} & Omit<ComponentProps<"input">, "id">): JSX.Element;
export function AuthPasswordField(props: {
  id: string; label: ReactNode; error?: string; hint?: string; labelAction?: ReactNode;
} & Omit<ComponentProps<"input">, "id" | "type">): JSX.Element;
// src/modules/auth/components/account-menu.tsx ("use client")
export function AccountMenu(props: { user: SessionUser; onLogout: () => void; className?: string }): JSX.Element;

// ───────────── Ola 2 (T4): Mis entradas ─────────────

// src/modules/order/components/my-tickets-view.tsx ("use client")
export type TicketsTab = "upcoming" | "past";
export function MyTicketsView(): JSX.Element;
// src/modules/order/components/order-list.tsx
export function OrderList(props: {
  orders: ReadonlyArray<Order>; selectedId: string; onSelect: (orderId: string) => void;
}): JSX.Element;
// src/modules/order/components/order-ticket-detail.tsx ("use client")
export function OrderTicketDetail(props: { order: Order; isPast: boolean }): JSX.Element;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| T0 | 0 | Validación y formulario compartidos (extracción desde el checkout) | `src/lib/validation.ts`, `src/lib/validation.test.ts`, `src/hooks/use-validated-form.ts`, `src/hooks/use-validated-form.test.ts`, `src/modules/order/schemas/checkout.schema.ts`, `src/modules/order/hooks/use-checkout-form.ts` | — | AC-1 a AC-4 |
| T1 | 1 | Dominio auth: schemas, service, store, sesión y prellenado del checkout | `src/modules/auth/schemas/auth.schema.ts`, `src/modules/auth/schemas/auth.schema.test.ts`, `src/modules/auth/data/users.mock.ts`, `src/modules/auth/services/auth.service.ts`, `src/modules/auth/services/auth.service.test.ts`, `src/modules/auth/store/auth.store.ts`, `src/modules/auth/store/auth.store.test.ts`, `src/modules/auth/hooks/use-session.ts`, `src/modules/auth/hooks/use-session.test.ts`, `src/modules/order/components/checkout-view.tsx` | T0 | AC-5 a AC-13 |
| T2 | 1 | Pedidos del usuario: mock, helpers de entradas, fechas y perforación | `src/lib/date.ts`, `src/lib/date.test.ts`, `src/modules/order/data/orders.mock.ts`, `src/modules/order/services/ticket.service.ts`, `src/modules/order/services/ticket.service.test.ts`, `src/modules/order/components/ticket-perforation.tsx`, `src/modules/order/components/order-ticket-card.tsx` | — | AC-14 a AC-20 |
| T3 | 2 | Ruta `/ingresar` y navbar con sesión | `src/app/ingresar/page.tsx`, `src/modules/auth/components/auth-view.tsx`, `src/modules/auth/components/auth-brand-panel.tsx`, `src/modules/auth/components/login-form.tsx`, `src/modules/auth/components/register-form.tsx`, `src/modules/auth/components/auth-form-field.tsx`, `src/modules/auth/components/account-menu.tsx`, `src/components/layout/site-navbar.tsx` | T0, T1 | AC-21 a AC-32 |
| T4 | 2 | Ruta `/mis-entradas` | `src/app/mis-entradas/page.tsx`, `src/modules/order/components/my-tickets-view.tsx`, `src/modules/order/components/order-list.tsx`, `src/modules/order/components/order-ticket-detail.tsx` | T1, T2 | AC-33 a AC-41 |

Notas de ejecución:
- T0 corre sola (ola 0) porque T1 importa `src/lib/validation.ts` y T3 importa `src/hooks/use-validated-form.ts`. Es un refactor sin cambio de comportamiento: los tests existentes `checkout.schema.test.ts` y `use-checkout-form.test.ts` deben pasar **sin modificarse**.
- T1 y T2 no comparten archivos ni se importan entre sí (T2 escribe el correo demo `"demo@ticketera.pe"` como literal en `orders.mock.ts`). T3 y T4 no comparten archivos; T4 no importa nada de `src/modules/auth/components/*`.
- T3 y T4 no editan archivos de T0, T1 ni T2. Si falta algo en esos contratos, reportan `BLOCKED`.
- T1: zod es 4.x; los schemas de auth usan forma permisiva (`z.string()`, `z.boolean()`) + un único `superRefine` + `transform`, igual que `checkoutSchema`, para reportar todos los campos inválidos a la vez.
- T3 y T4: antes de escribir las páginas, lee en `node_modules/next/dist/docs/` la guía de Next 16 sobre `searchParams` como `Promise` en páginas, `metadata` (`robots`), `useRouter`/`usePathname` de `next/navigation`. Para `Popover`/`Sheet` revisa `src/components/ui/popover.tsx` y `sheet.tsx` (base-ui, prop `render`, igual que el navbar actual).

## Criterios de aceptación

### Validación y formulario compartidos (T0)
- AC-1: `src/lib/validation.ts` exporta lo de Contratos. `getPersonNameError` y `getEmailError` devuelven exactamente los mensajes de AC-2 de la spec 005 para `fullName` y `email` (mismos ejemplos: `"Ana Pérez"` y `"  María José Núñez "` → `null`; `"Ana"` y `"Ana P3rez"` → "Ingresa tu nombre y apellido, solo con letras."; `""` → "Ingresa tu correo electrónico."; `"ana@"` → "Ingresa un correo válido, por ejemplo tu@email.com."; `" Ana@Mail.com "` → `null`). `normalizeEmail(" Ana@Mail.COM ")` → `"ana@mail.com"`. `getFieldErrors(schema, values)` devuelve `{}` si el parse es válido y, si no, un objeto con el primer mensaje de cada `issue.path[0]`.
- AC-2: `checkout.schema.ts` elimina `FULL_NAME_PATTERN`, `FULL_NAME_MAX_LENGTH`, su `emailSchema` local y la lógica de las reglas `fullName`/`email`, y usa `getPersonNameError`, `getEmailError` y `normalizeEmail` de `src/lib/validation.ts`. `getCheckoutErrors(values)` pasa a ser `getFieldErrors<CheckoutField>(checkoutSchema, values)`. Sus exports y su comportamiento no cambian: `checkout.schema.test.ts` pasa sin modificarse.
- AC-3: `useValidatedForm({ schema, fields, initialValues })` implementa, de forma genérica, AC-26 de la spec 005:
  - guarda `values`, un set de campos `touched` y `submitAttempted`;
  - calcula los errores en cada render con `getFieldErrors(schema, values)` y expone en `errors` solo los de campos `touched`, o todos si `submitAttempted`;
  - `blurField` marca el campo como `touched`; `setField` actualiza el valor (un error visible se actualiza o desaparece al corregirlo);
  - `validate()` pone `submitAttempted = true` y devuelve `{ success: true, data: schema.parse(values) }` o `{ success: false, firstInvalidField }`, con el primer campo inválido en el orden de `fields`.
  
  `setField` y `blurField` son estables entre renders (`useCallback`).
- AC-4: `useCheckoutForm(initialValues = EMPTY_CHECKOUT_VALUES)` es un envoltorio de una línea sobre `useValidatedForm({ schema: checkoutSchema, fields: CHECKOUT_FIELDS, initialValues })`. Mantiene el contrato de la spec 005 y `use-checkout-form.test.ts` pasa sin modificarse. `/checkout` no cambia en comportamiento.

### Dominio auth (T1)
- AC-5: `auth.schema.ts` exporta lo de Contratos, con las constantes y el orden indicados. `loginSchema` (forma permisiva + `superRefine` + `transform`):
  - `email`: `getEmailError`; salida con `normalizeEmail`;
  - `password`: `""` → "Ingresa tu contraseña."; no se aplica `trim` ni reglas de formato (una contraseña corta en el login no da error de formato, solo puede fallar como credencial incorrecta). Salida tal cual.
  
  `getFieldErrors(loginSchema, EMPTY_LOGIN_VALUES)` devuelve exactamente las claves `email` y `password`.
- AC-6: `registerSchema` (forma permisiva + `superRefine` + `transform`, todos los errores a la vez):
  - `fullName`: `getPersonNameError`; salida con `trim`;
  - `email`: `getEmailError`; salida con `normalizeEmail`;
  - `password`: `""` → "Crea una contraseña."; si `!isValidPassword(value)` → "Usa al menos 8 caracteres, con una letra y un número.". `isValidPassword` es `true` si la longitud está entre `PASSWORD_MIN_LENGTH` y `PASSWORD_MAX_LENGTH` (sin `trim`), y tiene al menos una letra (`/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/`) y al menos un dígito. Ejemplos: `"Demo1234"` y `"clave 2026"` → `true`; `"abc12"`, `"abcdefgh"`, `"12345678"` y 65 caracteres → `false`;
  - `acceptedTerms` distinto de `true` → "Debes aceptar los términos y condiciones.".
  
  `getFieldErrors(registerSchema, EMPTY_REGISTER_VALUES)` devuelve exactamente `fullName`, `email`, `password` y `acceptedTerms`. Con `{ fullName: " Ana Torres ", email: " ANA@mail.com ", password: "Demo1234", acceptedTerms: true }` la salida es `{ fullName: "Ana Torres", email: "ana@mail.com", password: "Demo1234", acceptedTerms: true }`. `sessionUserSchema` rechaza un objeto sin `id` o con un `email` inválido.
- AC-7: `users.mock.ts` exporta `DEMO_CREDENTIALS` y `DEMO_ACCOUNTS` con exactamente los valores de Contratos. `"Ana Torres"` cumple `getPersonNameError` (así el prellenado del checkout es válido).
- AC-8: `createAuthService(options)` trabaja sobre una **copia** de `accounts` (un `Map` por correo en minúsculas), así que registrar nunca modifica `DEMO_ACCOUNTS` y cada instancia es independiente.
  - `login(values)`: 1) `loginSchema.parse(values)` (si falla, rechaza con el `ZodError` sin esperar); 2) espera `delayMs` con `setTimeout`; 3) busca la cuenta por correo normalizado y compara la contraseña de forma exacta (distingue mayúsculas); si no existe o no coincide, rechaza con `Error("INVALID_CREDENTIALS")` (mismo error en los dos casos, para no revelar qué correos existen); 4) resuelve con `{ id, name, email }`, **sin** `password`.
  - `register(values)`: 1) `registerSchema.parse(values)`; 2) espera `delayMs`; 3) si el correo ya existe (incluido el demo, sin importar mayúsculas), rechaza con `Error("EMAIL_TAKEN")`; 4) agrega la cuenta `{ id: generateId(), name: fullName, email, password }` y resuelve con el `SessionUser` sin `password`. Después, `login` con esas credenciales en la misma instancia funciona.
  - `AUTH_ERROR_MESSAGES`: `INVALID_CREDENTIALS` → "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo."; `EMAIL_TAKEN` → "Ya existe una cuenta con este correo. Inicia sesión."; `UNKNOWN` → "No pudimos completar la operación. Inténtalo de nuevo.". `getAuthErrorMessage(error)` devuelve el mensaje del código si `error` es un `Error` con `message` igual a un `AuthErrorCode`, y `UNKNOWN` en cualquier otro caso.
- AC-9: `getSafeRedirect(value, fallback = DEFAULT_REDIRECT)` devuelve `value` solo si es un string que empieza con `/`, no empieza con `//` ni con `/\`, no contiene `\` y no empieza con `/ingresar`; en cualquier otro caso devuelve `fallback`. Ejemplos: `"/mis-entradas"`, `"/"` y `"/eventos/romeo-y-julieta-teatro-municipal?x=1"` se devuelven igual; `"https://malicioso.com"`, `"//malicioso.com"`, `"/\\malicioso.com"`, `"mis-entradas"`, `""`, `null`, `undefined` y `"/ingresar?redirect=/x"` → `"/mis-entradas"`.
- AC-10: `useAuthStore` arranca con `user: null`. Usa `persist` con `name: AUTH_STORAGE_KEY`, `storage: createJSONStorage(() => localStorage)`, `partialize` que guarda solo `user`, `version: 1` y `skipHydration: true`. En `merge`, el `user` persistido pasa por `sessionUserSchema.nullable().catch(null)`: un valor corrupto o con otra forma queda como `null` sin lanzar. `login`/`register` llaman a `authService` y, al resolver, hacen `set({ user })` y devuelven el usuario; si el service rechaza, el store no cambia y la promesa se rechaza con el mismo error. `logout()` pone `user: null`. El JSON en `localStorage["ticketera-session"]` nunca contiene la contraseña.
- AC-11: `useSession()` lee `user` de `useAuthStore` y un flag local `hydrated` que arranca en `false`, así el primer render en cliente coincide con el SSR. En un `useEffect`: se suscribe con `useAuthStore.persist.onFinishHydration(() => setHydrated(true))` (y la desuscribe al desmontar); si `useAuthStore.persist.hasHydrated()` ya es `true`, pone `hydrated` en `true`; si no, llama a `useAuthStore.persist.rehydrate()`. Devuelve `status: "loading"` mientras `!hydrated`, y después `"authenticated"` si hay `user` o `"anonymous"` si no. Varias instancias montadas a la vez (navbar y página) no rompen: todas terminan en el mismo estado.
- AC-12: la decisión de persistencia queda documentada en un comentario en `auth.store.ts`: la sesión va en `localStorage` (sobrevive a cerrar la pestaña y se comparte entre pestañas nuevas, como una sesión real), mientras que carrito y pedidos siguen en `sessionStorage`.
- AC-13: checkout prellenado (`checkout-view.tsx`):
  - `CheckoutView` usa `useSession()`. El bloque "Cargando tu compra…" se muestra mientras el carrito no esté rehidratado **o** `status === "loading"`, así `CheckoutContent` se monta con la sesión ya conocida;
  - `CheckoutContent` recibe una prop `initialValues: CheckoutFormValues` y llama a `useCheckoutForm(initialValues)`. Con sesión, `initialValues = { ...EMPTY_CHECKOUT_VALUES, fullName: user.name, email: user.email }`; sin sesión, `EMPTY_CHECKOUT_VALUES`;
  - los campos siguen editables y se validan igual; no hay otro cambio visual ni de flujo en `/checkout` (AC-14 a AC-26 de la spec 005 se mantienen).

### Pedidos del usuario (T2)
- AC-14: `src/lib/date.ts` agrega, con `Intl.DateTimeFormat("es-PE", …)` y `timeZone: EVENT_TIME_ZONE`:
  - `formatEventTime`: `hour: "2-digit"`, `minute: "2-digit"`, `hourCycle: "h23"`. `"2026-11-14T21:00:00-05:00"` → `"21:00"`, `"2026-11-15T03:00:00Z"` → `"22:00"`, `"2026-10-22T09:05:00-05:00"` → `"09:05"`;
  - `formatEventDayMonth`: `day: "2-digit"` y `month: "short"` en mayúsculas sin punto. `"2026-11-14T21:00:00-05:00"` → `{ day: "14", month: "NOV" }`, `"2026-10-02T20:00:00-05:00"` → `{ day: "02", month: "OCT" }`, `"2026-11-15T03:00:00Z"` → `{ day: "14", month: "NOV" }`.
  
  Los helpers existentes no cambian.
- AC-15: `DEMO_ORDERS` contiene 3 pedidos que pasan `orderSchema.parse`, todos con `buyer = { fullName: "Ana Torres", email: "demo@ticketera.pe", documentType: "DNI", documentNumber: "45678912", phone: "987654321" }`, `paymentMethod: "card"` y `cardLast4: "4242"`. El `event` es un snapshot copiado como literal de `events.mock.ts` (mismas `imageUrl` de Unsplash):
  1. `TK-24817`: "Noches de Rock — Lima" (`noches-de-rock-lima`, "Conciertos", Estadio Nacional, Lima, `2026-11-14T21:00:00-05:00`), 1 línea General (`tierId: "general"`, S/ 120 × 2, `seatIds: []`, `seatLabels: []`), `count: 2`, `total: 240`, `createdAt: "2026-09-10T15:20:00.000Z"`;
  2. `TK-24790`: "Romeo y Julieta" (`romeo-y-julieta-teatro-municipal`, "Teatro", Teatro Municipal, Lima, `2026-10-22T20:00:00-05:00`), 1 línea Platea (`tierId: "platea"`, S/ 120 × 1) con `seatIds: ["platea-C-8"]` y `seatLabels: ["Fila C, asiento 8"]` (asiento existente en `venueService.getByEventSlug("romeo-y-julieta-teatro-municipal")`), `count: 1`, `total: 120`, `createdAt: "2026-09-12T18:05:00.000Z"`;
  3. `TK-19342` (pasado, edición anterior): "Festival Sonido Andino" (`festival-sonido-andino`, "Festivales", Costa Verde, Lima, `startDate: "2026-08-15T18:00:00-05:00"`), 1 línea General (`tierId: "general"`, S/ 95 × 2), `count: 2`, `total: 190`, `createdAt: "2026-07-20T14:00:00.000Z"`.
- AC-16: `getOrderTickets(order)` recorre `order.lines` en orden y, por cada línea, genera `qty` entradas con `zone: line.name` y `seatLabel: line.seatLabels[i] ?? null` (`i` es la posición dentro de la línea). `index` es global (0..count-1), `code` es `` `${order.id}-${String(index + 1).padStart(2, "0")}` `` y `seed` es `getTicketSeed(order.id, index)`. Para `TK-24817` devuelve 2 entradas con códigos `"TK-24817-01"` y `"TK-24817-02"`, zona "General" y `seatLabel: null`. `getTicketSeed("TK-24817", 0)` → `24817` (misma semilla que el QR de la confirmación) y `getTicketSeed("TK-24817", 1)` → `24830`.
- AC-17: `getUserOrders(email, sessionOrders, mockOrders = DEMO_ORDERS)` devuelve:
  - los pedidos de `mockOrders` cuyo `buyer.email` coincide con `normalizeEmail(email)`;
  - **todos** los pedidos de `sessionOrders` (compras hechas en esta pestaña, sin importar el correo del comprador; ver "Cambios al plan");
  - sin duplicados por `id`: si un id está en los dos, gana el de la sesión.
  
  Con `"DEMO@ticketera.pe"` y `{}` devuelve los 3 mock; con `"otra@mail.com"` y `{}` devuelve `[]`; con `"otra@mail.com"` y un pedido de sesión devuelve ese pedido.
- AC-18: `splitOrdersByDate(orders, now)`: `upcoming` son los pedidos con `new Date(event.startDate) >= now`, ordenados por `startDate` ascendente; `past` son los demás, ordenados por `startDate` descendente. No muta el arreglo de entrada. `ticketService.getUserOrders(email, sessionOrders, now = new Date())` = `splitOrdersByDate(getUserOrders(email, sessionOrders), now)`. Con `now = 2026-09-29T12:00:00-05:00` y el usuario demo: `upcoming` = `[TK-24790, TK-24817]` y `past` = `[TK-19342]`.
- AC-19: `TicketPerforation` es un elemento `aria-hidden="true"` con la línea punteada (`border-dashed border-zinc-300`, 1.5px) y dos medios círculos de 24px (`bg-zinc-100 border border-zinc-200`), con el mismo markup y clases que hoy tiene `OrderTicketCard`:
  - `orientation="horizontal"`: línea superior (`border-t`) con los círculos a izquierda y derecha en todos los breakpoints;
  - `orientation="responsive"` (por defecto): horizontal en mobile y vertical (`lg:border-l`, círculos arriba y abajo) desde `lg`.
- AC-20: `OrderTicketCard` reemplaza su perforación inline por `<TicketPerforation />` y su `seed` por `getTicketSeed(order.id, 0)`. El HTML resultante y la confirmación no cambian visualmente.

### Ruta `/ingresar` y navbar (T3)
- AC-21: `src/app/ingresar/page.tsx` es un server component:
  - tipa `searchParams` como `Promise<{ redirect?: string | string[] }>`, lo espera con `await`, toma el primer valor si es arreglo y calcula `redirectTo = getSafeRedirect(value)`;
  - exporta `metadata = { title: "Ingresar | Ticketera", robots: { index: false } }`;
  - renderiza `<AuthView redirectTo={redirectTo} />` sin `SiteHeader` ni `SiteFooter` (el panel de marca lleva el logo).
- AC-22: layout de `AuthView`:
  - contenedor `min-h-dvh` de una columna en mobile; desde `lg` un grid `lg:grid-cols-2 xl:grid-cols-[640px_minmax(0,1fr)]` con `AuthBrandPanel` a la izquierda y el formulario centrado a la derecha (ancho máximo 440px, `gap-7`);
  - mobile: el formulario va con `px-4 pt-6 pb-8 gap-6`, sin scroll horizontal a 360px.
- AC-23: `AuthBrandPanel` (fondo `bg-indigo-950`, texto blanco):
  - logo con link a `/`: cuadro blanco con `Ticket` en `text-primary` (38px en desktop, 32px en mobile) y "Ticketera" (21px / 18px, bold);
  - desktop (`hidden lg:flex`, `p-10 gap-8`, columna): imagen `next/image` de 440px de alto, `rounded-[28px]`, `object-cover`, con `src` = la imagen de Unsplash de `festival-sonido-andino` (`https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop`) y `alt="Multitud con las manos en alto frente a un escenario con luces doradas durante un festival nocturno"`; debajo un `<p>` de 34px bold "Tus entradas, siempre a mano." y "Compra en minutos y lleva tu QR en el celular." en `text-indigo-200`;
  - mobile (`lg:hidden`): bloque de 210px de alto con `p-4`, overflow oculto, la misma imagen con `alt=""` absoluta a la derecha (170px de ancho, alto completo, `rounded-bl-[40px]`), y a la izquierda (190px de ancho) el logo arriba y los dos textos abajo (22px bold y 13px `text-indigo-200`).
  
  El panel no contiene encabezados (`h1`/`h2`): el único `h1` es el título del formulario.
- AC-24: selector de modo:
  - un `div role="group" aria-label="Elige cómo ingresar"` con fondo `bg-zinc-100`, `p-1`, `rounded-2xl`, grid de 2 columnas, y dos `button type="button"` de 44px ("Iniciar sesión", "Crear cuenta") con `aria-pressed`. El activo es blanco, `font-semibold` y con sombra suave; el inactivo, transparente y `font-medium`;
  - arranca en `"login"`. Cambiar de modo desmonta un formulario y monta el otro (sus valores se pierden, es aceptable);
  - los botones "Crea una gratis" (en login) e "Inicia sesión" (en registro), dentro de un `<p>` centrado "¿No tienes cuenta? …" / "¿Ya tienes cuenta? …", también cambian el modo (vía `onSwitchMode`).
- AC-25: `AuthTextField` y `AuthPasswordField`:
  - label visible (`<label htmlFor={id}>`, 14px `font-medium`) y, opcionalmente, `labelAction` alineado a la derecha en la misma fila;
  - `Input` de `src/components/ui/input.tsx` con 52px de alto, `rounded-[14px]`, `border-zinc-300`, texto de 16px en mobile y 15px desde `lg` (las mismas clases que el checkout);
  - con `error`: `aria-invalid="true"` y `<p id="<id>-error" className="text-sm text-destructive">`. `aria-describedby` junta, en este orden y solo si existen, `"<id>-hint"` y `"<id>-error"`; sin ninguno no se pone el atributo;
  - `AuthPasswordField` agrega un `button type="button"` de 44×44 posicionado dentro del input a la derecha (el input lleva `pr-14`), con `Eye`/`EyeOff` `aria-hidden`, `aria-label` "Mostrar contraseña" / "Ocultar contraseña" y `aria-pressed`, que alterna `type="password"` / `"text"` sin perder el foco ni el valor. Con `hint`, un `<p id="<id>-hint" className="text-[13px] text-muted-foreground">` bajo el input (antes del error).
- AC-26: `LoginForm` (`<form noValidate>`, `useValidatedForm({ schema: loginSchema, fields: LOGIN_FIELDS, initialValues: EMPTY_LOGIN_VALUES })`):
  - `h1` "Hola de nuevo" (26px en mobile, 30px desde `lg`, bold) y "Ingresa para ver tus entradas y comprar más rápido.";
  - un recuadro `bg-indigo-50 text-indigo-900 rounded-2xl` con el texto "¿Solo quieres probar? Usa la cuenta demo:" y las credenciales visibles `demo@ticketera.pe` / `Demo1234` (en `<code>` o `<strong>`, tomadas de `DEMO_CREDENTIALS`), y un `button type="button"` "Usar cuenta demo" (≥ 44px de alto) que hace `setField("email", …)` y `setField("password", …)` con `DEMO_CREDENTIALS`;
  - campos: `id="login-email"` ("Correo electrónico", `type="email"`, `autoComplete="email"`, placeholder "tu@email.com") y `id="login-password"` ("Contraseña", `AuthPasswordField`, `autoComplete="current-password"`), con `onBlur` → `blurField`;
  - `labelAction` del campo contraseña: `button type="button"` con estilo de link (`text-primary font-semibold`, ≥ 32px de alto) "¿Olvidaste tu contraseña?". Al hacer click, un `<p aria-live="polite">` bajo el campo muestra "La recuperación de contraseña estará disponible pronto.". No navega.
- AC-27: `RegisterForm` (`useValidatedForm({ schema: registerSchema, fields: REGISTER_FIELDS, initialValues: EMPTY_REGISTER_VALUES })`):
  - `h1` "Crea tu cuenta" y "Guarda tus entradas y recibe novedades de tus eventos.";
  - campos: `id="register-fullName"` ("Nombre completo", `autoComplete="name"`, placeholder "Tu nombre y apellido"), `id="register-email"` (igual que el login), `id="register-password"` (`autoComplete="new-password"`, `hint={PASSWORD_HINT}`);
  - checkbox nativo `id="register-acceptedTerms"` (20px en desktop y 22px en mobile, `accent-primary`) dentro de un `label` con área táctil ≥ 44px: "Acepto los Términos y condiciones", con "Términos y condiciones" enlazado a `/terminos` (`next/link`). Con error, `aria-invalid` y `aria-describedby="register-acceptedTerms-error"` en el checkbox;
  - no hay campo de confirmación de contraseña ni login social (el diseño no los tiene).
- AC-28: envío (común a los dos formularios), con estado local `"idle" | "submitting"`:
  - `onSubmit` con `preventDefault`; si está en `"submitting"` no hace nada; borra el error del servicio;
  - `validate()` dentro de `flushSync`. Si falla, enfoca `document.getElementById("<login|register>-" + firstInvalidField)`;
  - si pasa, cambia a `"submitting"` y llama a `useAuthStore.getState().login(values)` / `.register(values)`. Mientras tanto, un `<fieldset disabled>` envuelve los campos y el botón de enviar tiene `disabled`, `aria-busy="true"`, `Loader2` con `animate-spin` y el texto "Ingresando…" / "Creando cuenta…";
  - si resuelve, llama a `onSuccess()`; si rechaza, vuelve a `"idle"` y muestra sobre el botón un `<p role="alert" className="... text-destructive">` con `getAuthErrorMessage(error)`. Con `EMAIL_TAKEN`, el mensaje sugiere iniciar sesión (texto de AC-8);
  - botón de enviar: `Button type="submit"`, 54px, `rounded-2xl`, `bg-primary text-primary-foreground`, ancho completo, texto "Iniciar sesión" / "Crear cuenta".
- AC-29: redirección en `AuthView`: usa `useSession()` y `useRouter()`. Cuando `status` pasa a `"authenticated"` (ya había sesión al entrar, o tras `onSuccess`), llama una sola vez a `router.replace(redirectTo)`. Mientras `status` es `"loading"` o `"authenticated"`, en lugar del formulario muestra un bloque `aria-busy="true"` con el texto `sr-only` "Cargando…" (el panel de marca sí se ve), para que no parpadee el formulario.
- AC-30: navbar (`site-navbar.tsx`) usa `useSession()`, `usePathname()` y `useAuthStore((s) => s.logout)`:
  - `loginHref`: `/ingresar?redirect=${encodeURIComponent(pathname)}`, o `/ingresar` si `pathname` empieza con `/ingresar`;
  - `status === "loading"`: el área de sesión de desktop renderiza un espaciador vacío `aria-hidden` del mismo alto (44px) y ningún botón de sesión; en mobile no se muestra el botón de cuenta. El HTML del servidor y el primer render del cliente coinciden (sin warnings de hidratación);
  - `"anonymous"` (desktop): "Iniciar sesión" (`Button variant="ghost"` con `render={<Link href={loginHref} />}`) y "Vender entradas" (sin cambios, `href="#"`);
  - `"authenticated"` (desktop): un link "Mis entradas" a `/mis-entradas` (44px, `rounded-xl`, `bg-indigo-50 text-indigo-800 font-semibold`, ícono `Ticket` `aria-hidden`, con `aria-current="page"` si `pathname === "/mis-entradas"`) y `<AccountMenu>`. "Vender entradas" no se muestra con sesión en desktop (como el diseño).
- AC-31: `AccountMenu` usa `Popover` de `src/components/ui/popover.tsx`:
  - disparador: botón redondo de 44px con borde `border-[1.5px] border-zinc-300`, ícono `CircleUserRound` `aria-hidden` y `aria-label="Mi cuenta"`;
  - contenido: el nombre (`font-semibold`) y el correo (`text-muted-foreground`, `break-all`), un separador, un link "Mis entradas" (ícono `Ticket`) a `/mis-entradas` y un `button` "Cerrar sesión" (ícono `LogOut`), cada uno ≥ 44px de alto;
  - "Cerrar sesión" cierra el popover y llama a `onLogout` (→ `logout()`); no navega. Si la página actual es `/mis-entradas`, esta pasa al estado sin sesión (AC-35). Al hacer click en "Mis entradas" el popover se cierra;
  - se usa en desktop y en mobile (en mobile va en el header, a la izquierda del botón "Abrir menú", solo con sesión, como el diseño mobile).
- AC-32: `Sheet` mobile (menú existente): los links de navegación no cambian. Debajo:
  - sin sesión: `Button` "Iniciar sesión" (ícono `LogIn`) con link a `loginHref`, y "Vender entradas" como hoy;
  - con sesión: el nombre y el correo del usuario, "Mis entradas" (link a `/mis-entradas`), "Cerrar sesión" (`button`, llama a `logout()` y cierra el `Sheet`) y "Vender entradas";
  - con `"loading"`: solo "Vender entradas".

### Ruta `/mis-entradas` (T4)
- AC-33: `src/app/mis-entradas/page.tsx` es un server component (sin `"use client"`) que exporta `metadata = { title: "Mis entradas | Ticketera", robots: { index: false } }` y renderiza `SiteHeader`, un `<main className="flex flex-1 flex-col bg-zinc-100">` con `<MyTicketsView />`, y `SiteFooter`.
- AC-34: `MyTicketsView` usa `useSession()` y rehidrata el store de pedidos al montar con `Promise.resolve(useOrderStore.persist.rehydrate()).then(() => setOrdersHydrated(true))`. Mientras `status === "loading"` o `!ordersHydrated`, muestra un bloque `aria-busy="true"` con el texto `sr-only` "Cargando tus entradas…" (sin el estado sin sesión ni la lista, para que no parpadeen).
- AC-35: sin sesión (`"anonymous"`): una tarjeta blanca centrada (`max-w-xl`, `rounded-3xl`, borde) con ícono `Ticket` en un cuadro `bg-indigo-50 text-primary`, `h1` "Inicia sesión para ver tus entradas", el texto "Tus entradas quedan guardadas en tu cuenta. Ingresa para verlas y mostrar tu QR en el evento." y un link primario "Iniciar sesión" (≥ 44px) a `/ingresar?redirect=%2Fmis-entradas`. No redirige automáticamente.
- AC-36: con sesión, `ticketService.getUserOrders(user.email, useOrderStore.getState().orders)` (con `now` = `new Date()` al renderizar) da `upcoming` y `past`. Cabecera (en un contenedor `mx-auto w-full max-w-7xl px-4 md:px-10`):
  - desktop: fila con `items-end justify-between`, `pt-10 pb-7`, `h1` "Mis entradas" (36px bold) a la izquierda y el filtro a la derecha;
  - mobile: columna `pt-[22px] pb-4 gap-4`, `h1` de 28px y el filtro a todo el ancho (grid de 2 columnas);
  - filtro: `div role="group" aria-label="Filtrar entradas"` blanco con borde `zinc-200`, `p-1`, `rounded-[14px]`, y dos `button type="button"` con `aria-pressed`: "Próximas (n)" y "Pasadas (n)" con los conteos. El activo es `bg-zinc-900 text-white`; el inactivo, transparente. Alto: 44px en mobile, 40px desde `lg`. Arranca en `"upcoming"`.
- AC-37: contenido del filtro activo (lista de `upcoming` o `past`):
  - vacío: una tarjeta con borde punteado (`border-[1.5px] border-dashed border-zinc-300`, `rounded-[28px]` en desktop y `rounded-3xl` en mobile, fondo blanco, centrada), ícono `Ticket` en un cuadro `bg-indigo-50 text-primary`, título y texto, y un link "Explorar eventos" a `/eventos` (48px, `bg-zinc-900 text-white`). Textos: en Pasadas, "Aún no tienes eventos pasados" / "Cuando vayas a tu primer evento, lo verás aquí."; en Próximas, "Aún no tienes entradas para próximos eventos" / "Cuando compres entradas, las verás aquí.";
  - con pedidos: estado local `selectedId` (arranca en `null`; al cambiar de filtro vuelve a `null`). El pedido seleccionado es el de `selectedId` en la lista, o el primero si no está. Desktop: grid `lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-8 items-start` con `OrderList` a la izquierda y `<OrderTicketDetail key={order.id} order={order} isPast={tab === "past"} />` a la derecha. Mobile: `OrderList` arriba y el detalle debajo (`mt-4`), con `pb-8`.
- AC-38: `OrderList` es un `ul aria-label="Pedidos"`. Cada `li` contiene un `button type="button"` con `aria-pressed={seleccionado}` y `onClick={() => onSelect(order.id)}`, fondo blanco, `border-2` (`border-primary` si está seleccionado, `border-zinc-200` si no), `text-left`, que muestra:
  - la miniatura (`next/image`, `alt=""`, 72px y `rounded-[14px]` en desktop; 56px y `rounded-xl` en mobile);
  - el título (`truncate`, 16px / 14px, `font-semibold`), `"<formatEventDateShort> · <city>"` y `"<formatTicketCount(count)> · <zonas>"` en `text-primary` (zonas = nombres de las líneas unidos por ", ").
  
  Desktop: lista vertical con `gap-3`, botones a todo el ancho, `rounded-[20px] p-3.5`. Mobile: fila con scroll horizontal (`flex overflow-x-auto gap-2.5`, sin barra visible, con `-mx-4 px-4` para llegar al borde), ítems `shrink-0` de 270px, `rounded-[18px] p-2.5`. La página no tiene scroll horizontal a 360px (solo la lista).
- AC-39: `OrderTicketDetail` es un `article aria-labelledby` (a su `h2`) blanco con borde `zinc-200`, `rounded-[28px]` (26px en mobile) y `overflow-hidden`:
  - imagen del evento (`next/image`, `alt=""`, `object-cover`, 200px de alto en desktop y 150px en mobile) con una insignia de fecha blanca arriba a la izquierda (60px / 52px de ancho, `rounded-2xl`): `month` (11px / 10px, bold, `tracking-[0.08em]`, `text-primary`) y `day` (24px / 20px, bold) de `formatEventDayMonth(event.startDate)`;
  - `h2` con el título (28px desktop / 21px mobile, bold) y una lista `ul` de datos con íconos `aria-hidden`: desktop en fila con wrap (`Calendar` + `formatEventDateLong`, `Clock` + `formatEventTime`, `MapPin` + `"<venueName>, <city>"`); mobile en columna (`Calendar` + `"<formatEventDateShort> · <formatEventTime>"`, `MapPin` + sede);
  - `<TicketPerforation orientation="horizontal" />`;
  - bloque de la entrada: desktop en fila (`gap-9`, `px-8 pt-7 pb-8`) con el QR a la izquierda y la información a la derecha; mobile en columna centrada (`px-5 pt-[22px] pb-6`, `gap-[18px]`). El QR es un cuadro blanco con borde `zinc-200`, `rounded-[18px]`, `p-3`, de 200px en desktop y 220px en mobile, con `<QrPattern seed={ticket.seed} className="size-full" />`.
- AC-40: navegación entre entradas del pedido (estado local `ticketIndex`, arranca en 0; el `key` del padre lo reinicia al cambiar de pedido), con `tickets = getOrderTickets(order)`:
  - un `<p aria-live="polite">` "Entrada {ticketIndex + 1} de {tickets.length}" (20px bold en desktop, 16px `font-semibold` en mobile);
  - dos `button type="button"` de 44×44 con borde, `ChevronLeft`/`ChevronRight` `aria-hidden` y `aria-label` "Entrada anterior" / "Entrada siguiente", `disabled` en los extremos (con 1 entrada, los dos quedan deshabilitados, como el diseño). Desktop: el texto a la izquierda y los botones juntos a la derecha; mobile: botón, texto y botón en fila con `justify-between`;
  - un `<dl>` en grid de 2 columnas con pares `dt` (12px / 11px, `text-muted-foreground`) y `dd` (16px / 15px, `font-semibold`): "Zona" (`ticket.zone`), "Asiento" (solo si `ticket.seatLabel`), "Titular" (`order.buyer.fullName`), "Código" (`ticket.code`, `tabular-nums`) y "Estado": "Válida" en `text-green-700` si `!isPast`, o "Evento finalizado" en `text-muted-foreground` si `isPast`;
  - al cambiar de entrada cambian el QR, el código y la zona/asiento.
- AC-41: acciones de la entrada (`Button type="button" variant="outline"`, 48px, `rounded-[14px]`, `border-[1.5px]`):
  - "Descargar PDF" (ícono `Download`, borde `zinc-900`, `font-semibold`; en mobile el texto visible es "PDF" y en los dos breakpoints lleva `aria-label="Descargar PDF"`);
  - "Agregar al calendario" (ícono `CalendarPlus`, borde `zinc-300`; en mobile el texto visible es "Calendario", `aria-label="Agregar al calendario"`), solo si `!isPast`;
  - desktop en fila con `gap-2.5`; mobile en grid de 2 columnas a todo el ancho (1 columna si solo está "PDF");
  - al hacer click en cualquiera, un `<p aria-live="polite">` debajo muestra "Esta opción estará disponible pronto.". No generan archivos ni navegan.

## Tests requeridos
- `src/lib/validation.test.ts`: los ejemplos de AC-1 para `getPersonNameError`, `getEmailError` y `normalizeEmail`, y `getFieldErrors` con un schema pequeño (válido → `{}`, inválido → primer mensaje por campo). Cubre AC-1.
- `src/hooks/use-validated-form.test.ts`: con `renderHook` y un schema pequeño de 2 campos: sin errores al inicio; `blurField` muestra solo el error de ese campo; `setField` con un valor válido lo quita; `validate()` inválido devuelve el primer campo según `fields` y hace visibles todos los errores; `validate()` válido devuelve `data` transformado; `initialValues` se respeta. Cubre AC-3.
- Existentes, **sin modificar**: `src/modules/order/schemas/checkout.schema.test.ts` y `src/modules/order/hooks/use-checkout-form.test.ts` deben pasar. Cubren AC-2 y AC-4.
- `src/modules/auth/schemas/auth.schema.test.ts`: los ejemplos y mensajes de AC-5 y AC-6 (todos los errores a la vez con valores vacíos, la contraseña corta en el login sin error de formato, los casos de `isValidPassword`, la normalización de la salida, `sessionUserSchema`), y que `DEMO_ACCOUNTS[0].name` pasa `getPersonNameError` (AC-7). Cubre AC-5 a AC-7.
- `src/modules/auth/services/auth.service.test.ts`: con `createAuthService({ delayMs: 0, generateId: () => "usr-test" })`: login demo correcto (sin `password` en el resultado, correo con mayúsculas y espacios también funciona); contraseña incorrecta y correo inexistente → `INVALID_CREDENTIALS`; valores inválidos → `ZodError`; register ok y luego login con esas credenciales; register con el correo demo (en mayúsculas) → `EMAIL_TAKEN`; dos instancias no comparten cuentas y `DEMO_ACCOUNTS` no cambia; con `vi.useFakeTimers()` la promesa no resuelve antes de `delayMs`; `getAuthErrorMessage` con los 2 códigos, un `Error` cualquiera y un valor que no es `Error`; todos los ejemplos de `getSafeRedirect` (AC-9). Cubre AC-8 y AC-9.
- `src/modules/auth/store/auth.store.test.ts`: con fake timers (`vi.advanceTimersByTimeAsync(SIMULATED_AUTH_DELAY_MS)`): `login` demo guarda el `user` en el store y en `localStorage["ticketera-session"]` (sin contraseña, `partialize` solo con `user`); un login fallido deja `user: null` y rechaza; `register` guarda el usuario (usa un correo único); `logout` lo borra; `rehydrate()` con un JSON corrupto o con otra forma en `localStorage` deja `user: null` sin lanzar, y con un usuario válido lo restaura. Entre tests se resetea el store y `localStorage`. Cubre AC-10.
- `src/modules/auth/hooks/use-session.test.ts`: con `renderHook`: el primer render es `"loading"`; con un usuario válido en `localStorage` pasa a `"authenticated"` con ese `user`; sin nada pasa a `"anonymous"`; tras `logout()` pasa a `"anonymous"`; dos hooks montados a la vez terminan en el mismo estado. Cubre AC-11.
- `src/lib/date.test.ts` (se extiende): los ejemplos de AC-14; los tests existentes siguen pasando. Cubre AC-14.
- `src/modules/order/services/ticket.service.test.ts`: los 3 `DEMO_ORDERS` pasan `orderSchema.parse`, tienen ids únicos, `buyer.email === "demo@ticketera.pe"`, `count` igual a la suma de `qty` y `total` igual a la suma de `amount`; el asiento de `TK-24790` existe en el mapa del evento (`findSeat` sobre `venueService.getByEventSlug(...)`) y su etiqueta coincide con `formatSeatLabel`. `getOrderTickets` y `getTicketSeed` con los ejemplos de AC-16 y el asiento de `TK-24790`; `getUserOrders` con los casos de AC-17 (incluida la deduplicación); `splitOrdersByDate` con `now` fijo, el orden de AC-18 y que no muta la entrada. Cubre AC-15 a AC-18.
- UI (`TicketPerforation`, `OrderTicketCard`, `AuthView`, `AuthBrandPanel`, `LoginForm`, `RegisterForm`, `AuthTextField`, `AuthPasswordField`, `AccountMenu`, `SiteNavbar`, `MyTicketsView`, `OrderList`, `OrderTicketDetail`, `CheckoutView`, páginas): composición sobre lógica ya testeada, sin test unitario obligatorio. El reviewer los valida leyendo el código contra AC-13, AC-19 a AC-41. Al final se ejecutan `npm run test` (incluidos los tests de las fases 3 a 5) y `npm run build`, y se revisa en el navegador que no hay warnings de hidratación en `/`, `/eventos`, `/ingresar`, `/mis-entradas` y `/checkout` con y sin sesión.

## Cambios al plan
- **Ola 0 con la extracción de validación y formulario** (`src/lib/validation.ts`, `src/hooks/use-validated-form.ts`): las reglas de nombre y correo y la lógica de errores visibles de `useCheckoutForm` se necesitaban también en login y registro; copiarlas violaría DRY. Se extraen y el checkout pasa a usarlas sin cambio de comportamiento (sus tests no se tocan). Usar la misma regla de nombre en registro y checkout garantiza que el nombre prellenado sea válido en el checkout.
- **Ruta `/ingresar`** (en español, como `/eventos` y `/mis-entradas`), con `?redirect=` saneado por `getSafeRedirect` (solo rutas internas; evita open redirect). Por defecto vuelve a `/mis-entradas`. El navbar pasa la ruta actual como `redirect`.
- **Sesión en `localStorage`** (no `sessionStorage`): una sesión debe sobrevivir a cerrar la pestaña y verse en pestañas nuevas; carrito y pedidos siguen en `sessionStorage` porque son de la compra en curso. Se persiste solo `{ id, name, email }`, nunca la contraseña, y se valida con zod al rehidratar.
- **Cuentas registradas solo en memoria**: `createAuthService` mantiene su propia copia de las cuentas (inyectable, para tests independientes). Persistir cuentas con contraseña en el navegador, aunque sea mock, sería un mal patrón; tras recargar, una cuenta creada ya no puede volver a ingresar, pero su sesión persiste hasta cerrar sesión. La cuenta demo siempre funciona.
- **Store con `login`/`register`/`logout` que delegan en `authService`** (SRP: el service valida credenciales, el store guarda la sesión). `useSession` centraliza la rehidratación y el estado `"loading"` para no romper el SSR en navbar, `/ingresar`, `/mis-entradas` y checkout.
- **El diseño no tiene login social, confirmación de contraseña ni reglas de contraseña visibles**: no se agrega login social ni confirmación. Las reglas se definen aquí (8 a 64 caracteres, al menos una letra y un número) y se muestran como ayuda bajo el campo en el registro. Las credenciales demo se muestran en un recuadro con botón "Usar cuenta demo" (el diseño no lo incluye; lo pide el plan para poder probar).
- **Detalle de la entrada en la misma página (maestro-detalle)**, como el diseño, en lugar de modal o ruta: lista de pedidos + entrada seleccionada con navegación "Entrada n de N". En mobile la lista es horizontal con scroll y el detalle va debajo.
- **Filtro "Próximas / Pasadas"** con contadores, como el diseño (botones `aria-pressed`, el mismo patrón que las pestañas de `/ingresar`). Se agrega 1 pedido pasado mock para que el filtro tenga contenido; el estado vacío del diseño se ve con una cuenta nueva.
- **Qué pedidos ve el usuario**: los mock del usuario demo (por correo) más **todos** los pedidos creados en esta pestaña (`order.store`), sin filtrar por correo del comprador. `Order` no tiene id de usuario y cambiar `orderSchema` queda fuera de alcance; así el flujo "comprar → Ver mis entradas → iniciar sesión" siempre muestra la compra recién hecha.
- **Entradas individuales derivadas del pedido** (`getOrderTickets`): código `TK-XXXXX-NN`, zona y asiento por entrada, y semilla de QR con `index = 0` igual a la de la confirmación (la entrada 1 muestra el mismo QR en los dos lugares). Se agregan `formatEventTime` y `formatEventDayMonth` a `src/lib/date.ts`.
- **`TicketPerforation`** se extrae de `OrderTicketCard` (T2, ola 1) para reusarla en el detalle sin editar la tarjeta en paralelo.
- **Checkout prellenado incluido** (cambio chico en `checkout-view.tsx`, en T1): `useCheckoutForm` ya aceptaba `initialValues`; solo se espera a que la sesión esté rehidratada antes de montar el formulario.
- **Navbar**: con sesión, en desktop se ve "Mis entradas" + menú de cuenta y se oculta "Vender entradas" (como el diseño); en el `Sheet` mobile "Vender entradas" se mantiene siempre. Durante `"loading"` se reserva el espacio sin mostrar botones de sesión, para evitar el parpadeo y los desajustes de hidratación.
- Son 4 tareas de desarrollo (T1 a T4) más la ola 0 (T0), en 3 olas.

## Preguntas abiertas
ninguna
