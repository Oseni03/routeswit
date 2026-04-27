# GEMINI.md — Antigravity Agent Configuration

# Extends AGENTS.md with Antigravity-specific orchestration rules

@AGENTS.md

---

## Agent Behaviour in Manager View

When using the Manager view to orchestrate parallel agents, follow this task
ownership model to prevent conflicts:

| Domain        | Owns                                                         | Must not touch           |
| ------------- | ------------------------------------------------------------ | ------------------------ |
| DB Agent      | `schema.prisma`, `migrations/`                               | `app/`, `components/`    |
| Server Agent  | `server/*.ts`, `app/api/`, `lib/auth.ts`\*                   | `components/`, `prisma/` |
| UI Agent      | `components/`, `app/dashboard/`, `app/login/`, `app/signup/` | `lib/`, `prisma/`        |
| Auth Agent    | `lib/auth.ts`, `lib/auth-client.ts`, `middleware.ts`         | `polar.ts`, `prisma/`    |
| Billing Agent | `lib/polar.ts`, `server/subscription.ts`, `app/api/`         | `auth.ts`, `prisma/`     |

\* Server Agent may edit `lib/auth.ts` **only** to add the `@better-auth/api-key` plugin
during `/build-api` Step 4. No other structural changes to `auth.ts` are permitted
outside the Auth Agent domain.

Rules for parallel execution:

- Only ONE agent may modify `schema.prisma` at a time. Never run concurrent migrations.
- UI agents may work in parallel safely across different route segments.
- Always show a plan in the Manager view before executing a multi-file task.
- When an agent finishes a domain, it must output a handoff summary before the
  next agent begins.

---

## Skill Assignments

The following skills are active in this project. Antigravity loads them
on-demand when the relevant domain is mentioned:

| Skill                                 | Trigger keywords                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `api-design`                          | api, endpoint, webhook, validation, REST, contracts, versioning                  |
| `better-auth-best-practices`          | auth, session, login, OAuth, middleware, permissions, api key, apiKey            |
| `better-auth-security-best-practices` | auth security, csrf, brute force, cookie, session hardening, key exposure        |
| `polar-billing`                       | billing, subscription, checkout, webhook, entitlement, pricing, plan, upgrade    |
| `prisma-expert`                       | schema, migration, model, database, query, transaction                           |
| `next-best-practices`                 | page, route, layout, Server Component, Server Action, app router, loading, error |
| `react-best-practices`                | hooks, components, performance, state management, useFormState, useActionState   |
| `shadcn`                              | shadcn, ui component, tailwind, primitive, component styling, cn()               |
| `typescript-expert`                   | typescript, strict, generics, type safety, Zod, unknown, type guard              |
| `zustand-manager`                     | store, global state, persist, selector, Zustand, useShallow, modal state, toast  |

Community skills (installed globally) complement these project-specific skills.
Project skills override community skills when they conflict.

---

## Workflows

Two workflows are available under `.agent/workflows/`. Both accept a plain description
OR a PRD (attached file, `@` reference, or pasted content).

### `/build-api` — API-First Feature

Use when the primary deliverable is API routes consumed externally (mobile apps,
third-party integrations, webhooks). Includes the full `@better-auth/api-key` plugin
setup and a companion API key management UI.

**Steps:**

1. Spec (parse PRD or description → structured plan → wait for approval)
2. Schema — DB Agent, Prisma only for app models; BetterAuth owns `apiKey` table
3. Server layer — query functions and Server Actions in `src/server/`
4. API Key plugin setup — install `@better-auth/api-key`, add to `auth.ts` + `auth-client.ts`, run `npx auth migrate`
5. Auth & billing gates — `verifyApiKey()` in every handler; Polar entitlement check
6. Route handlers — Zod validation, standard `{ data }` / `{ error }` response shape
7. API Key management UI — list page, create dialog (one-time reveal), revoke action
8. Types — update `src/types/index.ts`
9. Verification checklist — must be completed before handoff

**Key constraints enforced by this workflow:**

- `enableSessionForAPIKeys` is NEVER set — leaked keys must not impersonate sessions
- `npx auth migrate` runs the BetterAuth migration; `prisma migrate` handles app models
- The `apiKey` table is never manually added to `schema.prisma`
- Create dialog blocks close until the user copies the key (one-time reveal is enforced)
- `src/lib/auth.ts` is only touched to add the plugin — existing plugin order is preserved

### `/build-feature` — Full-Stack SaaS Feature

Use when the feature includes a user-facing UI within the dashboard. Server layer
is built before any UI component.

**Steps:**

1. Spec (parse PRD or description → structured plan → wait for approval)
2. Schema — DB Agent
3. Server layer — query functions + Server Actions in `src/server/`
4. Auth & billing gates — session checks, Polar entitlement
5. API surface — conditional; only for webhooks or external consumption
6. UI — pages → Server Components → Client Components → Zustand stores → styling
7. Types — update `src/types/index.ts`
8. Verification checklist

**Key constraints enforced by this workflow:**

- No component is built before the Server Action it calls exists
- `"use client"` only for event handlers, browser APIs, or stateful hooks
- `@/lib/auth.ts` is never imported in a Client Component — `auth-client.ts` only
- Zustand stores are in `src/zustand/stores/` only; never colocated with components
- `shadcn/ui` files in `@/components/ui/` are never edited — compose in feature folders

### Choosing the right workflow

| Situation                                  | Workflow                            |
| ------------------------------------------ | ----------------------------------- |
| Building a REST API for external consumers | `/build-api`                        |
| Adding API key management to settings      | `/build-api`                        |
| Building a webhook receiver                | `/build-api`                        |
| Adding a dashboard page + form             | `/build-feature`                    |
| Building an internal settings flow         | `/build-feature`                    |
| Feature needs both UI and external API     | `/build-api` (it includes UI steps) |

---

## API Key Plugin — Project Rules

The `@better-auth/api-key` plugin is the sole mechanism for external API authentication.
These rules apply project-wide, not just inside workflows:

- **Single source of config:** `src/lib/auth.ts` — the `apiKey([...])` plugin call
  is the only place key configs (prefixes, rate limits, permissions, storage mode) are defined.
- **Single source of client methods:** `authClient.apiKey.*` from `src/lib/auth-client.ts` —
  used in Client Components for create, list, delete, and update operations.
- **Server-side verification only:** Route handlers call `auth.api.verifyApiKey()` directly.
  Never expose raw key verification to the client.
- **`enableSessionForAPIKeys` is permanently off.** A compromised API key must not
  grant full session-level access. Use `verification.key.referenceId` to identify the owner.
- **BetterAuth owns the `apiKey` table.** Never add an `api_keys` model to `schema.prisma`.
  Run `npx auth migrate` (not `prisma migrate`) when adding or updating the plugin.
- **One-time reveal enforced in UI.** The `key` value is returned only at creation.
  The create dialog must block dismissal until the user has copied the key.
- **Billing gate on key creation.** Check the user's Polar plan before allowing
  `authClient.apiKey.create()` — enforce this in the Server Action or route handler
  that backs the create flow, not in the UI.

---

## Feature Implementation Order

When building any new SaaS feature, the agent MUST follow this sequence:

1. **Spec** — Describe what the feature does, what DB changes it needs, what UI it
   requires, and what auth/billing checks apply. Get explicit approval before writing code.
2. **Schema** — Update `schema.prisma`. Format, migrate, generate.
3. **Server layer** — Server Actions and query functions in `src/server/`.
4. **Auth/Billing gates** — Session checks and Polar entitlement enforcement.
5. **API surface** — Only if webhooks or external consumption is needed.
6. **UI** — Server Components first, then Client Components where required.
7. **Types** — Update `src/types/index.ts` for any new shared types.

Never skip steps or reorder them. No UI component before the Server Action it calls.

---

## Global Never-Do List (Supplement to AGENTS.md §11)

In addition to the constraints in `AGENTS.md`, agents must never:

- Enable `enableSessionForAPIKeys` on the BetterAuth API Key plugin.
- Add an `api_keys` model to `schema.prisma` — BetterAuth manages this table.
- Run `npx auth migrate` and `prisma migrate dev` for the same feature without
  understanding which table each command owns.
- Call `auth.api.verifyApiKey()` from a Client Component — server-side only.
- Import `src/lib/auth.ts` in a Client Component — use `src/lib/auth-client.ts`.
- Edit files in `@/components/ui/` — wrap and compose in feature component folders.
- Create an API route as a substitute for a Server Action for form mutations.
- Gate a feature on the client side only — always enforce entitlement server-side first.
- Use `useStore.getState()` inside a React component — use the hook selector instead.
- Build a UI component before the Server Action or query function it depends on exists.
