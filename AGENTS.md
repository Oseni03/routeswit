# AGENTS.md — SaaS Boilerplate: Source of Truth

# Read by: Antigravity, Roo Code, Cline, GitHub Copilot, Gemini CLI, Windsurf

---

## 1. Project Identity

Full-stack SaaS boilerplate on Next.js 15.5.3 (App Router), Prisma ORM 6.16.2, PostgreSQL,
Better Auth 1.3.17, Polar.sh (billing/MoR), Tailwind CSS 4, shadcn/ui, TypeScript strict.

Deployment target: Vercel (frontend + serverless functions).
Database host: Neon (serverless PostgreSQL). Connection pooling via Prisma Accelerate.
Package manager: npm. Monolith (not monorepo).

---

## 2. Directory Map

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes
│   │   ├── accept-invitation/  # Accept invitation endpoint
│   │   ├── auth/               # Better Auth catch-all handler
│   │   ├── integrations/       # Integrations API
│   │   ├── reject-invitation/  # Reject invitation endpoint
│   │   └── subscription/       # Subscription API
│   ├── dashboard/              # Dashboard pages
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                 # React components
│   ├── ui/                     # shadcn/ui primitives — NEVER edit directly
│   ├── app-sidebar.tsx         # App sidebar component
│   ├── nav-main.tsx            # Main navigation
│   ├── nav-user.tsx            # User navigation
│   ├── team-switcher.tsx       # Team switcher
│   ├── dashboard/              # Dashboard components
│   ├── emails/                 # Email templates
│   ├── forms/                  # Form components
│   ├── settings/               # Settings components
│   ├── theme/                  # Theme components
│   └── zustand/                # Zustand-related components
├── config/                     # Configuration files
│   └── site.ts                 # Site configuration
├── hooks/                      # Client-side React hooks
│   └── use-mobile.ts           # Mobile hook
├── lib/                        # Utility libraries
│   ├── auth.ts                 # Better Auth server config (SINGLE SOURCE)
│   ├── auth-client.ts          # Better Auth browser client (SINGLE SOURCE)
│   ├── auth-utils.ts           # Auth utilities
│   ├── middleware.ts           # Middleware
│   ├── prisma.ts               # Prisma singleton (SINGLE SOURCE)
│   ├── polar.ts                # Polar client singleton (SINGLE SOURCE)
│   ├── resend.ts               # Resend client
│   ├── utils.ts                # cn(), formatters, helpers
│   └── auth/                   # Auth-related utilities
├── server/                     # Server-side functions
│   ├── integrations.ts         # Integration functions
│   ├── invitations.ts          # Invitation functions
│   ├── members.ts              # Member functions
│   ├── organizations.ts        # Organization functions
│   ├── permissions.ts          # Permission functions
│   ├── polar.ts                # Polar functions
│   ├── security.ts             # Security functions
│   ├── subscription.ts         # Subscription functions
│   ├── users.ts                # User functions
│   └── versions.ts             # Version functions
├── types/                      # TypeScript types
│   └── index.ts                # Shared TypeScript types & interfaces
├── zustand/                    # Zustand stores
│   ├── providers/              # Store providers
│   └── stores/                 # Store definitions
└── prisma/
    ├── schema.prisma
    └── migrations/
```

---

## 3. TypeScript Rules

- Strict mode always. `"strict": true` in tsconfig. No exceptions.
- No `any`. Use `unknown` and narrow with type guards.
- No `as X` casts unless you add an inline comment explaining why.
- Use `type` for object shapes and unions. Use `interface` only when extending.
- All async functions must have explicit return types.
- Zod schema is the validation layer for ALL external inputs:
  form data, API route params, webhook payloads, env vars.
- Env vars are validated at startup via a `src/env.ts` file using Zod.
  Never access `process.env.X` directly — always import from `@/env`.

---

## 4. Next.js App Router Patterns

- Server Components are the default. Add `"use client"` ONLY for:
    - Event handlers that can't be extracted to Server Actions
    - Browser-only APIs (window, localStorage, IntersectionObserver)
    - Stateful UI driven by hooks (useState, useEffect with subscriptions)
- Data fetching happens in Server Components via direct Prisma calls
  or query functions from `@/server/`.
- Mutations happen via Server Actions in `@/server/`.
  Never use API routes for form mutations — use Server Actions.
- API routes (`/app/api/`) are reserved for:
    - Third-party webhooks (Polar)
    - Better Auth catch-all handler
    - Endpoints consumed by external services
- Route protection: `middleware.ts` at project root intercepts all
  `(dashboard)` routes and validates session via Better Auth.
- Use `loading.tsx` and `error.tsx` for every dynamic segment.
- Use `generateMetadata()` for SEO on all public pages.
- Parallel routes (`@slot`) for modals that should be deep-linkable.

---

## 5. Database & Prisma Rules

- Prisma client SINGLETON in `@/lib/prisma.ts`. Never instantiate elsewhere.
- All DB access in Server Components, Server Actions, or API route handlers.
  Never call Prisma from a client component — ever.
- Schema conventions:
    - Table names: `snake_case`, plural (`users`, `subscriptions`, `api_keys`)
    - Every model must have:
        ```prisma
        id        String   @id @default(cuid())
        createdAt DateTime @default(now()) @map("created_at")
        updatedAt DateTime @updatedAt @map("updated_at")
        ```
    - Use `@map` to keep DB columns snake_case while Prisma fields are camelCase.
    - Soft deletes: add `deletedAt DateTime? @map("deleted_at")` — never hard-delete user data.
- Multi-step writes MUST use `prisma.$transaction([...])`.
- Use `select` to limit returned fields. Never return full user rows
  that include sensitive columns (passwordHash, tokens, secrets).
- After schema changes:
    1. Run `npm db:format` (`prisma format`)
    2. Run `npm db:migrate` (`prisma migrate dev --name <description>`)
    3. Run `npm db:generate` (`prisma generate`)
       Never use `prisma db push` outside of local prototype exploration.

---

## 6. Better Auth Rules

- Auth server config: `@/lib/auth.ts` — THE ONLY place auth is configured.
- Auth browser client: `@/lib/auth-client.ts` — THE ONLY client import.
- Session in Server Components: `auth.api.getSession({ headers: headers() })`
- Session in Client Components: `useSession()` from `@/lib/auth-client`
- Route protection: `middleware.ts` using `auth.api.getSession`.
  Redirect unauthenticated users to `/login`.
- When adding OAuth providers:
    1. Update `@/lib/auth.ts` with the provider config
    2. Add required env vars to `.env.local` AND `.env.example`
    3. Add the callback URL to the provider's dashboard
- Never log raw session tokens, JWT payloads, or auth secrets.
- Better Auth catch-all: `app/api/auth/[...all]/route.ts` — do not modify its
  handler logic. Configure behaviour only in `@/lib/auth.ts`.

---

## 7. Polar.sh Billing Rules

- Polar client singleton: `@/lib/polar.ts`. Never instantiate elsewhere.
- Subscription status is the ONLY source of truth for feature gating.
  It lives in the `subscriptions` Prisma model, synced via webhooks.
- Webhook handlers should live under `app/api/` when added.
    - ALWAYS verify the webhook signature before processing.
    - Idempotency: check if the event has already been processed before writing.
    - Update the DB synchronously within the handler — don't queue it.
- Entitlement checks: implement billing status lookups in `@/server/subscription.ts`.
  Call those functions in Server Components to gate UI.
- Never gate features on the client side only — always enforce on the server.
- Checkout sessions are created via Server Actions, not API routes.

---

## 8. Component & Styling Rules

- shadcn/ui components live in `@/components/ui/`. NEVER edit these files.
  Customise by composing primitives in `src/components/` or feature folders.
- Install components: `npx shadcn@latest add <component>` — never manually copy.
- All class names via `cn()` from `@/lib/utils`. Never string-concatenate classes.
- Tailwind only. No inline `style={{}}`. No separate CSS files except globals.css.
- Named exports for all components. No default exports except page/layout files.
- Component file naming: `kebab-case.tsx`.
- Compound component pattern for complex UI (e.g., `Card`, `Card.Header`, `Card.Body`).

---

## 9. State Management (Zustand)

- Zustand stores live in `@/zustand/`.
- Always use the `create<T>()(...)` pattern with an explicit TypeScript interface.
- Use `useShallow` from `zustand/react/shallow` for all object selectors.
  This prevents unnecessary re-renders when only one field in a slice changes.
- Never call `useStore.getState()` inside a React component — use the hook.
- If a store name ends in `-persistent`, apply the `persist` middleware
  with `localStorage` and a versioned `name` key.
- Stores hold ONLY transient UI state (modals, sidebar, wizard steps).
  Server state (user data, subscriptions) lives in Server Components / React Query.

---

## 10. Commands

| Command               | What it does                                    |
| --------------------- | ----------------------------------------------- |
| `npm dev`             | Start dev server                                |
| `npm build`           | Generate Prisma client and build for production |
| `npm start`           | Start production server                         |
| `npm lint`            | Run ESLint                                      |
| `npm prisma:generate` | Generate Prisma client                          |
| `npm install`         | Install dependencies                            |
| `npm vercel-build`    | Build for Vercel                                |
| `npm db:format`       | Run Prisma format                               |
| `npm db:migrate`      | Run Prisma migrations                           |
| `npm db:generate`     | Generate Prisma client                          |
| `npm db:studio`       | Open Prisma Studio                              |
| `npm db:reset`        | Reset local DB (DESTRUCTIVE — local only)       |

---

## 11. What Agents Must Never Do

- Never modify files in `@/components/ui/` — wrap them instead.
- Never instantiate `PrismaClient` outside `@/lib/prisma.ts`.
- Never instantiate Better Auth outside `@/lib/auth.ts` or `@/lib/auth-client.ts`.
- Never access `process.env` directly — import from `@/env`.
- Never use `prisma db push` in a commit or migration script.
- Never return full user rows from queries — always `select` specific fields.
- Never commit `.env.local` — update `.env.example` instead.
- Never add `"use client"` to a file that only needs data, not interactivity.
- Never use `useEffect` for data fetching — use Server Components or React Query.
- Never run concurrent Prisma migrations — one migration at a time.
