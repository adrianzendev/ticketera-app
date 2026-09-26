# 001 — Landing page de eventos (mock data)

Estado: approved
Fase: 1 de 1 (fase inicial de la feature "event"; futuras páginas — detalle de evento, checkout — serán specs nuevas)

## Aprobación
Aprobado por el usuario el 2026-09-26 (confirmado en chat: "crea tu el spec en base a la tarea para iniciar con el desarrollo")


## Contexto
Primera etapa de la Ticketera: construir la UI de la landing page (venta de entradas a eventos) usando mock data, tomando como referencia visual Ticketmaster y Joinnus. Solo modo claro. Prioridad: reutilizar shadcn/ui, dejar la base de UI lista para que páginas futuras (detalle de evento, checkout) sean rápidas de construir.

## Alcance
- Incluye:
  - Documento de diseño (colores, tipografía, spacing) generado con la skill `ui-ux-pro-max`, modo claro únicamente.
  - Fuente Poppins aplicada globalmente (reemplaza Geist).
  - Módulo `event`: tipos + mock data (eventos y categorías), sin fetch real.
  - Componentes de landing: header/nav, hero con carrusel de eventos destacados, grid de categorías, grid de próximos eventos (con card de evento reutilizable), footer.
  - Página `/` ensamblada con los componentes anteriores.
- Fuera de alcance:
  - Backend / API real, autenticación, checkout, página de detalle de evento.
  - Dark mode.
  - Búsqueda funcional (el input de búsqueda se muestra pero no filtra).
  - Paginación o infinite scroll.
  - Tests de componentes visuales triviales (no hay lógica de negocio en esta fase — ver "Tests requeridos").

## Módulo destino
`src/modules/event/` (dominio) + `src/components/layout/` (header/footer, transversal a futuras páginas)

## Reutilización
- `src/components/ui/button.tsx` — ya instalado, se usa en header/hero/CTAs.
- `src/lib/utils.ts` (`cn`) — merge de clases en todos los componentes nuevos.
- shadcn a instalar (`npx shadcn add <name>`): `card`, `badge`, `carousel` (trae `embla-carousel-react` como dependencia propia del componente, no se instala swiper), `input`, `sheet` (menú mobile), `separator`.
- No se encontró ningún módulo `event`, `src/components/layout/`, ni mock data previos — todo se crea en esta spec.

## Contratos
```ts
// src/modules/event/schemas/event.schema.ts
import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  icon: z.string(), // nombre de icono lucide-react, ej. "Music"
});
export type Category = z.infer<typeof categorySchema>;

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  imageUrl: z.string().url(),
  categorySlug: z.string(),
  venueName: z.string(),
  city: z.string(),
  startDate: z.string(), // ISO 8601
  priceFrom: z.number().nonnegative(),
  currency: z.literal("PEN"),
  featured: z.boolean(),
});
export type Event = z.infer<typeof eventSchema>;
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| T0 | 0 | Setup: shadcn, fuente, doc de diseño | `package.json`, `package-lock.json`, `components.json`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/carousel.tsx`, `src/components/ui/input.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/separator.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `docs/design/landing-page.md` | — | AC-1, AC-2, AC-3 |
| T1 | 1 | Dominio event: schemas + mock data | `src/modules/event/schemas/event.schema.ts`, `src/modules/event/data/categories.mock.ts`, `src/modules/event/data/events.mock.ts` | T0 | AC-4, AC-5 |
| T2 | 1 | Layout transversal: header + footer | `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx` | T0 | AC-6 |
| T3 | 2 | Componentes de evento: card, carrusel destacados, grid categorías, grid próximos eventos | `src/modules/event/components/event-card.tsx`, `src/modules/event/components/featured-carousel.tsx`, `src/modules/event/components/category-grid.tsx`, `src/modules/event/components/upcoming-events-grid.tsx` | T1 | AC-7, AC-8, AC-9, AC-10 |
| T4 | 3 | Ensamblar landing page | `src/app/page.tsx` | T2, T3 | AC-11, AC-12 |

## Criterios de aceptación
- AC-1: `docs/design/landing-page.md` existe y define paleta de color (light mode), tipografía (Poppins, escala de tamaños) y spacing base, generado con la skill `ui-ux-pro-max`.
- AC-2: Poppins es la única fuente aplicada (vía `next/font/google`, variable `--font-sans` en `src/app/layout.tsx`); Geist ya no se referencia en `layout.tsx` ni `globals.css`.
- AC-3: `npm run build` compila sin errores tras instalar los componentes shadcn de T0.
- AC-4: `eventSchema` y `categorySchema` validan sin error contra cada item de `events.mock.ts` y `categories.mock.ts` respectivamente (mínimo 8 eventos, mínimo 5 categorías, con al menos 3 eventos `featured: true`).
- AC-5: cada `event.imageUrl` en el mock resuelve a una URL de imagen pública real (no placeholder roto) — imágenes obtenidas de internet.
- AC-6: `site-header.tsx` incluye logo/nombre, nav de categorías, input de búsqueda (no funcional) y botón de menú mobile (`sheet`); `site-footer.tsx` incluye links de secciones y copyright. Ambos usan solo componentes shadcn instalados + `Button` existente.
- AC-7: `event-card.tsx` recibe un `Event` por props y muestra imagen, título, venue/ciudad, fecha formateada y precio desde; no contiene datos hardcodeados.
- AC-8: `featured-carousel.tsx` usa el componente shadcn `carousel` y renderiza solo los eventos con `featured: true` del mock.
- AC-9: `category-grid.tsx` renderiza una card/badge por cada `Category` del mock con su ícono lucide correspondiente.
- AC-10: `upcoming-events-grid.tsx` renderiza `event-card.tsx` por cada evento no destacado (o todos, a criterio del developer) en un grid responsive (1 col mobile, 2 tablet, 3-4 desktop).
- AC-11: `src/app/page.tsx` importa y ordena: header → hero/carrusel destacados → categorías → próximos eventos → footer, sin lógica de negocio propia (solo composición).
- AC-12: la página es visualmente coherente con `docs/design/landing-page.md` (colores/tipografía aplicados) y no rompe en viewport mobile (375px) ni desktop (1440px).

## Tests requeridos
- `src/modules/event/schemas/event.schema.test.ts` — valida AC-4 (parseo de `eventSchema`/`categorySchema` contra el mock completo, incluyendo el conteo mínimo y el featured count).
- Resto de tareas (T2, T3, T4) son componentes visuales de composición sin lógica de negocio propia → sin test unitario obligatorio, según `docs/SETUP.md`.

## Cambios al plan
- No hubo plan previo de orquestador (agente no disponible en esta sesión); esta spec fue escrita directamente a partir del requerimiento del usuario, siguiendo el mismo criterio de clasificación (SDD: módulo nuevo `event` + múltiples capas).
- 5 tareas en vez del máximo de 4 sugerido: T0 (setup) es infraestructura compartida sin lógica propia: se cuenta aparte porque agrupa recursos compartidos (regla de Ola 0), dejando 4 tareas de desarrollo real (T1-T4).

## Preguntas abiertas
ninguna
