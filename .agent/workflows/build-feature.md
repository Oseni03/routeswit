---
description: >
  Scaffold a complete full-stack SaaS feature: parse PRD → schema → server functions →
  auth/billing gates → optional API surface → Server Components → Client Components → types.
  Auth (BetterAuth) and billing (Polar plugin) are already configured — never touch their core setup.
  Trigger: /build-feature <description> OR /build-feature (then paste/attach PRD)
---

# /build-feature — Full-Stack SaaS Feature Workflow

Use this workflow when building a feature that includes both backend logic and
a user-facing UI within the dashboard. The server layer must exist before any UI
is written — a component must never be built before the Server Action it calls exists.

For features whose primary deliverable is an external API (consumed by third-party
clients or mobile apps), use `/build-api` instead.

---

## Accepted Input Formats

This workflow accepts the feature description in any of these forms:

| Format | How to invoke |
|---|---|
| Inline description | `/build-feature Add a team member invite flow with role selection` |
| Attached PRD file | `/build-feature` then attach or `@` reference a `.md` / `.txt` PRD file |
| Pasted PRD content | `/build-feature` then paste the PRD body directly into the chat |

When a PRD is provided, extract from it: objectives, user stories, functional requirements,
data model requirements, auth/billing requirements, UI requirements, and explicitly
excluded scope. If the PRD is ambiguous on any point, flag it in the spec (Step 1)
and wait for clarification before continuing.

---

## Pre-Flight: Skill Loading

Before executing any step, load for this session:

- `prisma-expert` — schema changes, migrations, query patterns
- `typescript-expert` — strict types, Zod inference, return type annotations
- `better-auth-best-practices` — session retrieval in Server Components and Actions
- `polar-billing` — entitlement checks via BetterAuth Polar plugin
- `next-best-practices` — Server Components, Server Actions, App Router patterns
- `react-best-practices` — hooks, Client Components, form handling, performance
- `shadcn` — component selection, `cn()` usage, composition over modification

Load `api-design` only if Step 5 (API surface) runs.

---

## Agent Ownership

| Step | Agent | Files it may touch |
|---|---|---|
| Schema | DB Agent | `prisma/schema.prisma`, `prisma/migrations/` |
| Server layer | Server Agent | `src/server/*.ts` |
| Auth/billing gates | Server Agent | `src/server/*.ts` |
| API surface (conditional) | Server Agent | `src/app/api/**/*.ts` |
| UI — pages & layouts | UI Agent | `src/app/dashboard/**/*.tsx` |
| UI — components | UI Agent | `src/components/**/*.tsx` |
| Types | Server Agent | `src/types/index.ts` |

UI agents may work in parallel across different route segments.
Only ONE agent may touch `schema.prisma` at a time.
DB Agent must hand off before Server Agent. Server Agent must hand off before UI Agent.

---

## Execution Sequence

### Step 1 — Spec

**STOP. Do not write any code yet.**

Parse the provided description or PRD and produce a written spec covering:

1. **Feature summary** — what this feature does and its business purpose.
   If a PRD was provided, quote the primary objective and summarise user stories in one sentence each.

2. **Who can use it** — which user roles and which Polar plan tier can access this feature?
   Name the required plan (free / pro / team) if the feature is gated.

3. **Schema changes** — list every new model, field, or relation needed.
   If none, say so explicitly.

4. **Server functions** — list all query functions and mutations for `src/server/`.
   For each mutation, state: Server Action (default) or API route? (use API routes only
   for webhooks and external consumption — not for form mutations).

5. **API surface** — does any part of this feature need to be consumed externally
   (webhooks, mobile apps, third-party integrations)? If yes, describe the route and
   note that `/build-api` patterns apply for that endpoint.
   If no external surface is needed, Step 5 will be skipped.

6. **UI breakdown:**
   - New pages or layouts: path, route group, data fetched server-side
   - New components: name, server vs client, where it lives in `src/components/`
   - shadcn/ui primitives to use (name them explicitly)
   - Zustand state needed? Apply the decision matrix:
     - ✅ Zustand: modal open/closed, sidebar, wizard step, toast queue, drawer payload
     - ❌ Not Zustand: session data, subscription status, anything fetched from DB
     - If yes, name the store, its location (`src/zustand/stores/`), and its state shape
   - Which dynamic segments need `loading.tsx` and `error.tsx`?

7. **SEO** — which pages need `generateMetadata()`?

8. **Out of scope** — list anything the PRD mentions that will NOT be built this iteration.

Present as a structured Markdown document.
**Wait for explicit user approval before proceeding to Step 2.**
Revise on feedback and wait for approval again.

---

### Step 2 — Schema (DB Agent)

> Activate: DB Agent. Load `prisma-expert` skill.

Apply all schema changes from the approved spec.

Rules (from AGENTS.md §5):
```prisma
model Example {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at") // required for user-generated data
}
```
- Table names: `snake_case`, plural
- Prisma fields: `camelCase` — `@map` to `snake_case` DB column on every field that differs
- Never hard-delete user data — use `deletedAt`
- Multi-step writes → `prisma.$transaction([])`

After editing `schema.prisma`, run in sequence:
```bash
npm run db:format
npm run db:migrate    # concise migration name, e.g. "add_invitations_table"
npm run db:generate
```

**Handoff summary before Step 3:**
"DB Agent complete. Models added: [list]. Modified: [list]. Migration: [name]. Prisma client regenerated. Server Agent may begin."

---

### Step 3 — Server Layer (Server Agent)

> Activate: Server Agent. Load `prisma-expert` + `typescript-expert` skills.

Create or update files in `src/server/` for the query functions and Server Actions
identified in the spec.

**Query functions** (read-only, called from Server Components):
```ts
// src/server/invitations.ts
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

const invitationSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.InvitationSelect

export async function getPendingInvitationsByOrg(
  organizationId: string
): Promise<Prisma.InvitationGetPayload<{ select: typeof invitationSelect }>[]> {
  return prisma.invitation.findMany({
    where: { organizationId, status: "pending", deletedAt: null },
    select: invitationSelect,
    orderBy: { createdAt: "desc" },
  })
}
```

**Server Actions** (mutations, called from forms or Client Components):
```ts
"use server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
})

export async function inviteMember(
  input: z.infer<typeof InviteMemberSchema>
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const parsed = InviteMemberSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: "Invalid input" }

  await prisma.invitation.create({
    data: {
      ...parsed.data,
      organizationId: session.session.activeOrganizationId!,
      invitedById: session.user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  })

  revalidatePath("/dashboard/settings/members")
  return { success: true }
}
```

Rules:
- `"use server"` at the top of every Server Action file
- All async functions have explicit `Promise<T>` return types
- `select` on every Prisma query — no full rows with sensitive fields
- `prisma.$transaction([...])` for multi-step writes
- Call `revalidatePath()` or `revalidateTag()` after mutations that affect cached data
- No `any` — Zod for all external input, `Prisma.XxxGetPayload<>` for return types
- Env vars from `@/env` only

---

### Step 4 — Auth & Billing Gates (Server Agent)

> Load `better-auth-best-practices` + `polar-billing` skills.

**Session check in every Server Action that touches user data:**
```ts
const session = await auth.api.getSession({ headers: await headers() })
if (!session) return { success: false, error: "Unauthorized" }
```

**Session check in page-level Server Components:**
```ts
import { redirect } from "next/navigation"
const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/login")
```

Note: `middleware.ts` already protects all `(dashboard)` routes. Don't add redirect
logic to routes that are already covered — only add it to pages that require further
role or plan checks beyond basic authentication.

**Billing gate (when spec requires a plan tier):**
```ts
const entitlement = await checkUserEntitlement(session.user.id, "pro")
if (!entitlement.allowed) {
  return { success: false, error: "PRO_REQUIRED" }
}
```

Call the shared function from `src/server/subscription.ts`. Never inline plan checks.
Never gate features on the client side only — always enforce server-side first.

---

### Step 5 — API Surface (Server Agent, conditional)

> **Skip this step entirely if the spec states no external API surface is needed.**
> Load `api-design` skill if this step runs.

Create route handlers in `src/app/api/` only when:
- A third-party service or webhook must call the endpoint
- A mobile app or external client needs to consume it
- The operation is not suitable for a Server Action (e.g. file streaming, OAuth callbacks)

**Never create an API route as a substitute for a Server Action for form mutations.**

When route handlers are required here, follow the same auth/validation/response
conventions as `/build-api` Step 6: Zod validation on all input, auth before any
DB access, standard `{ data }` / `{ error: { code, message } }` response shape.

---

### Step 6 — UI (UI Agent)

> Activate: UI Agent. Load `next-best-practices` + `react-best-practices` + `shadcn` skills.
> Server Agent must have handed off before this step begins.

Build UI in this exact sub-order. Do not skip ahead.

#### 6a. Pages and layouts

Create new route segments in `src/app/dashboard/` as described in the spec.
- Add `loading.tsx` and `error.tsx` for every dynamic segment — no exceptions.
- Add `generateMetadata()` to all pages that have a public or indexable URL.
- Server Components are the default — fetch data here via `src/server/` functions.
- Named exports for all components. Default export only for `page.tsx` and `layout.tsx`.

```tsx
// src/app/dashboard/settings/members/page.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getPendingInvitationsByOrg } from "@/server/invitations"
import { MemberList } from "@/components/settings/member-list"

export default async function MembersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const invitations = await getPendingInvitationsByOrg(
    session.session.activeOrganizationId!
  )
  return <MemberList invitations={invitations} />
}
```

#### 6b. Server Components

Build components that render data with no interactivity — no hooks, no event handlers.
Pass all data as props from the page. Named exports only.

#### 6c. Client Components

Add `"use client"` ONLY when the component needs:
- Event handlers that cannot be extracted to a Server Action
- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Stateful hooks (`useState`, `useEffect` with subscriptions)

Client Component rules:
- **Never import `@/lib/auth.ts`** (server config) — only `@/lib/auth-client.ts`
- **Never call Prisma** from a Client Component
- Use `useSession()` from `@/lib/auth-client` for session data in Client Components
- Use `useFormState` + `useFormStatus` (React 19) for Server Action–backed forms

```tsx
"use client"
import { useState, useActionState } from "react"
import { inviteMember } from "@/server/invitations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function InviteMemberForm() {
  const [state, action, pending] = useActionState(inviteMember, null)

  return (
    <form action={action} className="space-y-4">
      <Input name="email" type="email" placeholder="colleague@company.com" required />
      {/* role select, etc. */}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send Invite"}
      </Button>
      {state && !state.success && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  )
}
```

#### 6d. Zustand stores (if required by spec)

If the spec identified state for a Zustand store, create it now in `src/zustand/stores/`.
Decision matrix from AGENTS.md §9:
- ✅ Zustand: modal open/closed, sidebar state, wizard steps, toast queue, drawer payload
- ❌ Not Zustand: session, plan status, anything from the DB

Follow the Zustand skill conventions: `create<T>()()` pattern, explicit `State` and
`Actions` interfaces, `useShallow` from `zustand/react/shallow` for object selectors,
persist middleware only for stores whose name ends in `-persistent`.

#### 6e. Styling

- All class names via `cn()` from `@/lib/utils` — no string concatenation
- No inline `style={{}}`. No separate CSS files (only `globals.css` is permitted)
- Tailwind only
- `shadcn/ui` components from `@/components/ui/` — **never edit these files directly**
  Compose them in `src/components/` feature folders
- To add a new shadcn component: `npx shadcn@latest add <component>`
- Named exports for all components

---

### Step 7 — Types (Server Agent)

Update `src/types/index.ts` with new shared types introduced by this feature:
- Prisma model types — `Prisma.XxxGetPayload<{ select: ... }>`, not hand-written shapes
- Interfaces shared across server functions and Client Components
- Server Action return type unions if they're used across multiple files

Keep types local when they're only used in one file.

---

### Step 8 — Final Verification Checklist

Confirm every item. Do not mark done unless verified in actual code.

**Server Layer**
- [ ] `"use server"` at the top of every Server Action file
- [ ] All async functions have explicit return types
- [ ] `select` on every Prisma query — no sensitive full rows returned
- [ ] Multi-step writes use `prisma.$transaction([])`
- [ ] `revalidatePath()` or `revalidateTag()` called after every mutation
- [ ] All env vars imported from `@/env`

**Auth & Billing**
- [ ] Session check in every Server Action touching user data
- [ ] Session check in page Server Components not covered by middleware
- [ ] Billing gate enforced server-side, not client-side only
- [ ] Unauthenticated actions return `{ success: false, error: "Unauthorized" }`
- [ ] Plan gate returns `{ success: false, error: "PRO_REQUIRED" }` (or equivalent)

**API Routes (if Step 5 ran)**
- [ ] All external input validated with Zod
- [ ] Auth check before any DB access
- [ ] Standard `{ data }` / `{ error: { code, message } }` response shape

**UI**
- [ ] `"use client"` added only where genuinely required
- [ ] No Prisma imports in any Client Component
- [ ] `@/lib/auth.ts` (server) not imported in any Client Component
- [ ] `loading.tsx` and `error.tsx` present for every dynamic segment
- [ ] All class names through `cn()` — no string concatenation
- [ ] No files in `@/components/ui/` were edited directly
- [ ] Named exports used for all components (default export only for page/layout)
- [ ] Zustand stores are in `src/zustand/stores/` — not colocated with components

**TypeScript**
- [ ] No `any` anywhere in new code
- [ ] No `as X` casts without an inline explanatory comment
- [ ] `src/types/index.ts` updated for new shared types

**Database**
- [ ] `PrismaClient` never instantiated outside `@/lib/prisma`
- [ ] Migration committed (`prisma/migrations/` updated)
- [ ] Prisma client regenerated (`npm run db:generate` confirmed)