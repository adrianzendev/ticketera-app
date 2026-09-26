# SETUP.md

Reglas de estructura de carpetas, buenas prácticas y metodología de trabajo para este proyecto.

---

## 1. Estructura de carpetas

Proyecto usa **Next.js App Router**. `src/app/` se reserva solo para routing (páginas, layouts, route handlers). Toda la lógica de dominio vive en `src/modules/<domain>/`.

### Reglas

- Un módulo por dominio de negocio (ej. `user`, `auth`, `invoice`), no por tipo técnico.
- Nombres de carpetas de módulo en inglés, singular, kebab-case (`user`, `invoice`, no `usuarios`, no `Users`).
- Dentro de cada módulo, subcarpetas por tipo técnico según se necesiten: `components`, `hooks`, `services`, `types`, `schemas`, `store`. No crear subcarpeta vacía "por si acaso" (YAGNI).
- Archivos: **kebab-case** en el nombre de archivo, **PascalCase** en el export del componente (regla estándar TS/Next.js, igual que shadcn).
  - `user-card.tsx` → `export function UserCard()`
  - `use-user.ts` → `export function useUser()`
  - `user.service.ts` → `export const userService`
  - `user.schema.ts` → `export const userSchema` (zod)
  - `user.store.ts` → `export const useUserStore` (zustand)
- `src/app/<route>/` importa desde `src/modules/<domain>/*`, nunca al revés.
- `src/components/ui/` queda reservado para componentes shadcn (generados por CLI, no editar a mano).
- `src/lib/` queda para utilidades transversales sin dominio propio (ej. `utils.ts`, cliente axios base).

### Ejemplo

```
src/
  app/
    users/
      page.tsx              # importa desde src/modules/user
      [id]/
        page.tsx
  modules/
    user/
      components/
        user-card.tsx        # export UserCard
        user-list.tsx        # export UserList
      hooks/
        use-user.ts           # export useUser (react-query)
        use-users.ts
      services/
        user.service.ts       # export userService (axios calls)
      schemas/
        user.schema.ts         # export userSchema, type User (zod)
      store/
        user.store.ts           # export useUserStore (zustand, si aplica)
  components/
    ui/                          # shadcn: button.tsx, input.tsx, etc.
  lib/
    utils.ts                     # cn()
    api-client.ts                 # instancia axios configurada
```

Un módulo sin necesidad de store, o sin schemas propios, simplemente no crea esa subcarpeta.

---

## 2. Buenas prácticas

Aplicar **SOLID, DRY, KISS, YAGNI** en todo momento: componentes shadcn, componentes de dominio, funciones, hooks, services.

- **YAGNI** — no construir para un caso hipotético futuro. Un módulo empieza con lo mínimo (ej. un service y un hook), se agrega `store`/`schemas` cuando el caso real lo pide.
- **KISS** — la solución más simple que funciona. Preferir función pura antes que clase, hook antes que HOC/render-prop.
- **DRY** — lógica repetida en 2+ lugares se extrae a `hooks/`, `services/` o `lib/`, no se copia.
- **SOLID** — aplicado a nivel de funciones/hooks/services más que a nivel de clases (el proyecto es funcional): cada hook/service con una sola responsabilidad, dependencias inyectadas/parametrizadas en vez de hardcodeadas, extensión sin modificar código existente cuando sea razonable.

### Antes de crear un componente

1. **Buscar en shadcn primero**: si el componente existe en el catálogo de shadcn (`npx shadcn add <name>` o revisar https://ui.shadcn.com), usarlo. No reinventar `button`, `dialog`, `table`, etc.
2. Si no existe en shadcn, crearlo en `src/modules/<domain>/components/` (si es específico de un dominio) o `src/components/` (si es genérico y reutilizable entre dominios) — pensado desde el inicio para ser reutilizable: props claras, sin lógica de negocio hardcodeada adentro.

### Antes de crear cualquier componente, función o hook

**Verificar que no exista ya** en el proyecto (buscar en `src/modules/*`, `src/components/`, `src/lib/`, `src/hooks/`) antes de escribir uno nuevo. Evita duplicados y mantiene DRY.

---

## 3. Metodología: SDD (Spec Driven Development)

Las features siguen Spec Driven Development: la especificación se define antes de escribir código, y el código se valida contra esa especificación. El orquestador decide primero si la tarea necesita SDD o basta el modo build directo (cambios chicos, de 1-2 archivos, sin contratos de datos nuevos).

Las specs viven en `docs/specs/<NNN>-<feature-slug>.md`. Los agentes están en `.claude/agents/` y el loop que los ejecuta está descrito en `CLAUDE.md`.

### Flujo con 4 agentes

1. **Orquestador** — recibe el requerimiento del usuario, coordina el flujo entre los demás agentes, decide orden y dependencias entre tareas, valida que el resultado final cumpla el requerimiento original.
2. **Spec** — traduce el requerimiento en una especificación técnica clara: qué debe hacer la feature, qué módulo/carpeta le corresponde (según sección 1), contratos de datos (tipos, schemas zod), criterios de aceptación. No escribe código de implementación.
   **Aprobación humana (bloqueante):** ninguna spec pasa a desarrollo sin que un humano la apruebe. Estados: `draft` → `pending-approval` → `approved` → `done`. Solo un humano la lleva a `approved`; cualquier cambio posterior en alcance, contratos, tareas o criterios la devuelve a `pending-approval`.
3. **Developer** — solo empieza si la spec está `approved`. Implementa la especificación siguiendo la estructura de carpetas (sección 1) y las buenas prácticas (sección 2). Escribe unit tests para las secciones que lo requieran.
4. **Reviewer** — revisa el código contra la especificación original y contra las reglas de este documento (estructura, SOLID/DRY/KISS/YAGNI, reutilización de shadcn/componentes existentes). Aprueba o devuelve con observaciones al developer.

### Unit testing

Se usa **Vitest + React Testing Library**.

- No todo requiere test: aplicar donde el requerimiento (definido por Spec) lo pida — lógica de negocio (services, hooks, schemas), no cobertura obligatoria de cada componente visual trivial.
- Test junto al archivo que prueba, mismo módulo: `user.service.ts` → `user.service.test.ts`.
