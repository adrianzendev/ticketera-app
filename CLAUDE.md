# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project references

Read these before creating or changing files:

- `docs/SETUP.md` — source of truth for folder structure (domain modules under `src/modules/<domain>/`), file naming, best practices (SOLID, DRY, KISS, YAGNI, reuse-before-create, shadcn-first) and the SDD methodology.
- `docs/specs/` — SDD specs, one per feature: `<NNN>-<feature-slug>.md`.
- `.claude/agents/` — SDD subagents:
  - `orquestador` — classifies a task as BUILD or SDD and returns a phased plan with waves and file ownership. Read-only.
  - `spec` — writes the spec in `docs/specs/`. Never touches `src/`.
  - `developer` — implements one spec task, only its own files. Refuses to start unless the spec is `approved`.
  - `reviewer` — validates a task against its spec and `docs/SETUP.md`. Returns `APPROVED` or `CHANGES_REQUESTED`. Read-only.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build (Turbopack)
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm run test` — Vitest + React Testing Library, single run (`npm run test:watch` for watch mode)
- `npx vitest run path/to/file.test.ts` — run a single test file; add `-t "name"` to filter by test name

Installing dev dependencies needs `--legacy-peer-deps`: `shadcn` pulls `@babel/core` 7 while `@vitejs/plugin-react` pulls a peer on 8.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict)
- Tailwind CSS v4 (config lives in `src/app/globals.css`, no `tailwind.config.*` file)
- shadcn/ui — style `base-nova`, icon lib `lucide-react`, base color `neutral` (see `components.json`). Add components with `npx shadcn add <name>`; generated into `src/components/ui`.
- `@tanstack/react-query` for server-state/data fetching
- `@tanstack/react-table` for tables
- `zustand` for client state
- `zod` for schema validation
- `axios` for HTTP requests

## Architecture

- `src/app` — App Router routes, layouts, `globals.css`
- `src/app/providers.tsx` — client component wrapping the tree with `QueryClientProvider`; mounted in `src/app/layout.tsx`. A single `QueryClient` is created per client session via `useState`. Add any other app-wide client providers here rather than in `layout.tsx` directly (layout stays a server component).
- `src/components/ui` — shadcn-generated primitives (do not hand-edit generated internals; regenerate via the CLI instead)
- `src/lib/utils.ts` — shadcn's `cn()` class-merge helper
- Import alias `@/*` → `src/*` (see `tsconfig.json`)

No zustand stores, axios client instance, or zod schemas exist yet — create them per-feature (e.g. `src/lib/api-client.ts` for a configured axios instance) rather than assuming a location.

## Workflow: SDD vs build

Subagents cannot launch other subagents, so the main session runs this loop with the agents listed in Project references:

1. For any non-trivial development task, launch `orquestador` first. It returns `MODO: BUILD` or `MODO: SDD` plus a plan.
2. `BUILD`: implement directly in the main session following its indications. Stop here.
3. `SDD`: launch `spec` with the requirement and the plan. It writes `docs/specs/<NNN>-<slug>.md` with `Estado: draft` (open questions) or `Estado: pending-approval`. Resolve open questions with the user and have `spec` update the file.
4. **Human approval gate (blocking).** Show the user the spec path, scope, tasks and acceptance criteria, and ask for explicit approval. Do not launch any `developer` until the user approves in chat. Only then set `Estado: approved` in the spec, and record who approved and the date under `Aprobación`. Approval of one spec does not carry over to another, and any later edit to scope, contracts, tasks or ACs puts the spec back to `pending-approval` and needs approval again.
5. Run the spec's tasks wave by wave. Wave 0 (setup: dependencies, `npx shadcn add`, shared files) runs alone. All `developer` tasks of the same wave are launched in a single message so they run in parallel; each one only touches its own files, so they do not conflict.
6. After each developer finishes, launch `reviewer` for that task (reviewers of the same wave can also run in parallel).
7. On `CHANGES_REQUESTED`, send the reviewer report back to a `developer` for that same task, then review again. Max 3 iterations per task; if it still fails, stop and report to the user.
8. A developer reporting `BLOCKED` (needs a file it does not own, or spec not approved) is resolved by the main session before the next wave, never by another parallel developer. If resolving it changes the spec, go back to step 4.
9. When all waves are approved: run `npm run build` once, set `Estado: done` in the spec, and report the next planned phase (if any) instead of starting it. Each new phase gets its own spec and its own approval.

## Notes

- `AGENTS.md` is auto-generated/re-written by `next dev` (see the file's own header) — keep it committed as-is rather than editing by hand.
