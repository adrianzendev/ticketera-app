# 002 — Navbar/topbar con búsqueda, hero con swiper, más categorías

Estado: done
Fase: 2 de N (iteración sobre la landing de la spec 001, ya implementada)

## Aprobación
Aprobado por el usuario el 2026-09-26 (confirmado en chat: pidió los 4 cambios y lanzar agentes en paralelo de inmediato — se documentan defaults abajo, corregibles).

## Contexto
Iteración de UX sobre la landing (spec 001): separar header en navbar + topbar de búsqueda (texto/fecha/precio) sticky, reemplazar el carrusel del hero (shadcn/embla) por Swiper, y ampliar+rediseñar el grid de categorías con cards e íconos más vistosos.

## Alcance
- Incluye:
  - `swiper` como dependencia del hero (reemplaza embla solo ahí; `src/components/ui/carousel.tsx` queda sin uso, no se borra — YAGNI, no rompe nada dejarlo).
  - Store zustand `event-filters` con texto/fecha/precio máximo; filtrado client-side sobre el mock (funcional, no solo visual — 9 items, costo trivial).
  - `site-navbar.tsx` (logo + nav categorías + menú mobile) separado de `site-topbar.tsx` (búsqueda texto + fecha + precio), ambos `sticky` apilados (navbar `top-0`, topbar `top-16`), CSS puro, sin JS de scroll.
  - Categorías: de 6 a 10, cada una en `Card` con badge de ícono circular a color (`bg-primary/10 text-primary` o similar), no solo texto+ícono plano.
  - `UpcomingEventsGrid` lee del store filtrado en vez de la lista completa.
- Fuera de alcance: persistir filtros en URL, filtro por categoría en la topbar (ya existe nav por categoría separado), backend/fetch real, tests de UI visual (sí test del store: lógica de filtrado).

## Módulo destino
`src/modules/event/` (store, categorías) + `src/components/layout/` (navbar/topbar)

## Reutilización
- `src/modules/event/schemas/event.schema.ts`, `data/events.mock.ts`, `data/categories.mock.ts` — se reutilizan tal cual (categories.mock se amplía, no se reescribe el shape).
- `src/components/ui/{input,card,badge,button}.tsx` — reutilizados en topbar/categorías.
- `zustand` — ya es dependencia del proyecto, no se instala nada nuevo salvo `swiper`.
- `src/components/layout/site-header.tsx` se reescribe para componer `SiteNavbar` + `SiteTopbar` bajo el mismo export `SiteHeader`, así `src/app/page.tsx` no cambia.

## Contratos
```ts
// src/modules/event/store/event-filters.store.ts
type EventFilters = {
  search: string;
  date: string | null;   // "YYYY-MM-DD" o null = cualquier fecha
  maxPrice: number | null; // null = sin tope
  setSearch: (v: string) => void;
  setDate: (v: string | null) => void;
  setMaxPrice: (v: number | null) => void;
};
// export const useEventFiltersStore: UseBoundStore<StoreApi<EventFilters>>
// export function filterEvents(events: Event[], filters: EventFilters): Event[]
```

## Tareas
| ID | Ola | Título | Archivos propios | Depende de | ACs |
|----|-----|--------|------------------|------------|-----|
| A1 | 1 | Store de filtros (zustand) + lógica de filtrado | `src/modules/event/store/event-filters.store.ts`, `src/modules/event/store/event-filters.store.test.ts` | — | AC-1, AC-2 |
| A2 | 1 | Categorías: ampliar mock + rediseño con Card | `src/modules/event/data/categories.mock.ts`, `src/modules/event/components/category-grid.tsx` | — | AC-3 |
| A3 | 1 | Hero con Swiper | `src/modules/event/components/featured-carousel.tsx` | — | AC-4 |
| B1 | 2 | Navbar + Topbar sticky | `src/components/layout/site-navbar.tsx`, `src/components/layout/site-topbar.tsx`, `src/components/layout/site-header.tsx` | A1 | AC-5, AC-6 |
| B2 | 2 | Grid conectado al store | `src/modules/event/components/upcoming-events-grid.tsx` | A1 | AC-7 |

## Criterios de aceptación
- AC-1: `filterEvents` filtra por coincidencia parcial case-insensitive de `search` en `title`/`venueName`/`city`; por `date` igual al día de `startDate` (zona local); por `maxPrice` con `priceFrom <= maxPrice`. Cualquier filtro en `null`/`""` no restringe.
- AC-2: test cubre AC-1 con al menos: solo texto, solo fecha, solo precio, combinación, y "sin filtros devuelve todo".
- AC-3: `categories.mock.ts` tiene ≥10 categorías; `category-grid.tsx` envuelve cada una en `Card` con un círculo de ícono a color (fondo tintado + ícono `lucide-react` del color primario/acento), no texto plano.
- AC-4: `featured-carousel.tsx` usa `swiper/react` (`Swiper`, `SwiperSlide`) con navegación (flechas) y paginación (bullets) para los eventos `featured: true`; se elimina el uso de `@/components/ui/carousel` en ese archivo.
- AC-5: `site-topbar.tsx` tiene input de texto (`Input`), selector de fecha (`<input type="date">` nativo — no shadcn `calendar`, no instalado, YAGNI) y selector de precio máximo (`select` o `Input type="number"`), todos conectados al store de A1.
- AC-6: `site-navbar.tsx` es `sticky top-0 z-40`; `site-topbar.tsx` es `sticky top-16 z-30`; ambos permanecen visibles al hacer scroll (verificable leyendo las clases, sin JS de scroll).
- AC-7: `upcoming-events-grid.tsx` renderiza `filterEvents(events.filter(e => !e.featured), filters)` leyendo `filters` del store — cambiar cualquier filtro cambia el grid sin recargar la página.

## Tests requeridos
- `src/modules/event/store/event-filters.store.test.ts` — cubre AC-1/AC-2.
- Resto (categorías, navbar/topbar, hero, grid) son composición visual sobre lógica ya testeada → sin test unitario obligatorio.

## Cambios al plan
Sin orquestador disponible en esta sesión (mismo issue que spec 001): plan armado directamente. Aprobación fast-track porque el usuario pidió explícitamente lanzar el desarrollo en paralelo de inmediato; cualquier ajuste a los defaults (filtro funcional vs. solo visual, cantidad de categorías) se corrige después si no calza.

## Preguntas abiertas
ninguna
