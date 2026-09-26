# next-js-template

Template base para proyectos Next.js desarrollados con IA (Claude Code), aprendido en el curso de desarrollo de software con IA de Tecsup.

Incluye un stack listo para usar, una estructura por módulos de dominio y un flujo de trabajo **SDD (Spec Driven Development)** con subagentes de Claude Code.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** strict
- **Tailwind CSS v4** (configuración en `src/app/globals.css`, sin `tailwind.config.*`)
- **shadcn/ui** (estilo `base-nova`, iconos `lucide-react`)
- **@tanstack/react-query** para server state y **@tanstack/react-table** para tablas
- **zustand** para client state, **zod** para validación, **axios** para HTTP
- **Vitest** + **React Testing Library** para tests

## Inicio rápido

```bash
npm install
npm run dev
```

Abrir http://localhost:3000.

> Para instalar dependencias de desarrollo nuevas usar `--legacy-peer-deps` (conflicto de peer `@babel/core` entre `shadcn` y `@vitejs/plugin-react`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Ejecuta el build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (una ejecución) |
| `npm run test:watch` | Vitest en modo watch |

Agregar componentes shadcn: `npx shadcn add <nombre>` (se generan en `src/components/ui`).

## Estructura

```
src/
  app/              # solo routing: páginas, layouts, route handlers
    providers.tsx   # QueryClientProvider y otros providers de cliente
  modules/<domain>/ # lógica por dominio: components, hooks, services, schemas, store
  components/ui/    # componentes shadcn (generados por CLI)
  lib/              # utilidades transversales (cn(), cliente axios)
docs/
  SETUP.md          # reglas de estructura, naming y buenas prácticas
  specs/            # specs SDD: <NNN>-<feature-slug>.md
.claude/agents/     # subagentes SDD
```

Las reglas completas (naming, SOLID/DRY/KISS/YAGNI, shadcn primero) están en [`docs/SETUP.md`](docs/SETUP.md).

## Flujo de trabajo con Claude Code (SDD)

El proyecto trae cuatro subagentes en `.claude/agents/`:

| Agente | Rol |
| --- | --- |
| `orquestador` | Clasifica la tarea como `BUILD` (directo) o `SDD` y devuelve un plan por olas |
| `spec` | Escribe la spec en `docs/specs/` (nunca toca `src/`) |
| `developer` | Implementa una tarea de la spec, solo sus archivos. Requiere spec `approved` |
| `reviewer` | Valida la tarea contra la spec y `SETUP.md`: `APPROVED` o `CHANGES_REQUESTED` |

Ciclo: `orquestador` → `spec` → **aprobación humana** → `developer` (en paralelo por ola) → `reviewer` → `npm run build`. El detalle está en [`CLAUDE.md`](CLAUDE.md).

## Skills recomendadas

Para trabajar de forma óptima con Claude Code en este template se recomiendan estas skills/plugins. Los comandos `/plugin` se ejecutan dentro de Claude Code.

| Skill | Para qué sirve | Instalación |
| --- | --- | --- |
| **ui-ux-pro-max** | Sistema de diseño, estilos, paletas, tipografías y guías UX para construir interfaces | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`<br>`/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` |
| **frontend-design** | Dirección estética intencional: evita interfaces genéricas "hechas por IA" | `/plugin install frontend-design@claude-plugins-official` |
| **vercel-labs** (agent-skills) | `vercel-react-best-practices` (rendimiento React/Next.js) y `web-design-guidelines` (auditoría de UI y accesibilidad) | `npx skills add vercel-labs/agent-skills` |
| **ponytail** | Fuerza la solución más simple que funciona: YAGNI, stdlib y dependencias existentes antes que código nuevo | `/plugin marketplace add DietrichGebert/ponytail`<br>`/plugin install ponytail@ponytail` |
| **caveman** | Respuestas comprimidas: menos tokens, misma precisión técnica | `/plugin marketplace add JuliusBrussee/caveman`<br>`/plugin install caveman@caveman` |
| **superpowers** | Flujos disciplinados: brainstorming, planes, TDD, debugging sistemático y code review | `/plugin marketplace add obra/superpowers-marketplace`<br>`/plugin install superpowers@superpowers-marketplace` |

Cómo encajan con el template:

- **Diseño de UI**: `ui-ux-pro-max` y `frontend-design` definen la dirección visual. Los componentes siempre salen de shadcn primero (`docs/SETUP.md`).
- **Calidad de código**: `vercel-react-best-practices` y `web-design-guidelines` para revisar componentes. `ponytail` mantiene el código mínimo, alineado con YAGNI/KISS.
- **Proceso**: `superpowers` complementa el flujo SDD con TDD y debugging. `caveman` reduce el consumo de tokens en sesiones largas.
