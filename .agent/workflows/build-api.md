---
description: >
    Scaffold a complete API-first feature: parse PRD → schema → server layer →
    auth/billing gates → API Key plugin setup → validated route handlers →
    API key management UI → types. Auth (BetterAuth) and billing (Polar plugin)
    are already configured — never touch their core setup.
    Trigger: /build-api <description> OR /build-api (then paste/attach PRD)
---

# /build-api — API-First Feature Workflow

Use this workflow when building a feature whose primary deliverable is a set of
API routes consumed by external clients, mobile apps, or third-party services.
External API access is authenticated via BetterAuth's `@better-auth/api-key` plugin.

For features that are primarily internal dashboard UI with no external API surface,
use `/build-feature` instead.

---

## Accepted Input Formats

This workflow accepts the feature description in any of these forms:

| Format             | How to invoke                                                             |
| ------------------ | ------------------------------------------------------------------------- |
| Inline description | `/build-api Create a REST API for managing projects with CRUD operations` |
| Attached PRD file  | `/build-api` then attach or `@` reference a `.md` / `.txt` PRD file       |
| Pasted PRD content | `/build-api` then paste the PRD body directly into the chat               |

When a PRD is provided, extract from it: objectives, user stories, endpoint requirements,
data model requirements, auth/billing requirements, and any explicitly excluded scope.
If the PRD is ambiguous on any of these points, flag them in the spec (Step 1) and ask
for clarification before continuing.

---

## Pre-Flight: Skill Loading

Before executing any step, load for this session:

- `api-design` — contracts, Zod validation, error shapes, versioning
- `prisma-expert` — schema changes, migrations, query patterns
- `typescript-expert` — strict types, Zod inference, return type annotations
- `better-auth-best-practices` — session retrieval, API key plugin patterns
- `better-auth-security-best-practices` — key exposure rules, header hygiene
- `polar-billing` — entitlement checks via BetterAuth Polar plugin
- `next-best-practices` — App Router, Server Components, Server Actions
- `react-best-practices` — Client Components, hooks, form handling
- `shadcn` — component composition, `cn()` usage

---

## Agent Ownership

| Step           | Agent        | Files it may touch                           |
| -------------- | ------------ | -------------------------------------------- |
| Schema         | DB Agent     | `prisma/schema.prisma`, `prisma/migrations/` |
| Server layer   | Server Agent | `src/server/*.ts`                            |
| API Key setup  | Server Agent | `src/lib/auth.ts`, `src/lib/auth-client.ts`  |
| Route handlers | Server Agent | `src/app/api/**/*.ts`                        |
| UI pages       | UI Agent     | `src/app/dashboard/**/*.tsx`                 |
| UI components  | UI Agent     | `src/components/**/*.tsx`                    |
| Types          | Server Agent | `src/types/index.ts`                         |

Only ONE agent may touch `schema.prisma` at a time.
`src/lib/auth.ts` is a SINGLE SOURCE OF TRUTH — only Server Agent may edit it,
and only to add the `apiKey` plugin. Never restructure the existing plugin array order.
DB Agent must hand off before Server Agent begins. Server Agent must hand off before UI Agent begins.

---

## Execution Sequence

### Step 1 — Spec

**STOP. Do not write any code yet.**

Parse the provided description or PRD and produce a written spec covering:

1. **Feature summary** — what this API does and its business purpose.

2. **Endpoints** — for each route:
    - HTTP method + path (e.g. `POST /api/v1/projects`)
    - Request body / query params (field names, types, required vs optional)
    - Success response shape
    - Expected error responses with HTTP status codes

3. **API key strategy** — answer each:
    - Will the API use a single default config or multiple named configs (e.g. `"public"` / `"secret"`)?
    - Are keys user-owned (`references: "user"`) or org-owned (`references: "organization"`)?
    - Do keys need permissions? If so, list the permission scopes (e.g. `projects: ["read", "write"]`).
    - Do keys need rate limiting? If so, what `maxRequests` and `timeWindow`?
    - Do keys need expiration? Custom prefix?
    - Storage mode: `"database"` (default) or `"secondary-storage"` (Redis, for high throughput)?

4. **Session auth** — are any endpoints accessible by cookie session
   (dashboard-internal) in addition to API key? If yes, which ones?

5. **Billing gate** — which Polar plan (free / pro / team) is required to use this API?
   Which plan tier can create API keys?

6. **Schema changes** — list every new model, field, or relation.
   If none are needed, say so explicitly.

7. **Server functions** — list query functions + mutations going into `src/server/`.

8. **API Key management UI** — confirm the dashboard will need:
    - A page to list the user's (or org's) API keys
    - A form/dialog to create a new key (with the one-time key reveal pattern)
    - A delete action per key
      State if any additional UI (key renaming, expiry display, usage stats) is needed.

9. **Out of scope** — explicitly list anything the PRD mentions that will NOT be
   built in this iteration.

Present as a structured Markdown document.
**Wait for explicit user approval before proceeding to Step 2.**
Revise on feedback and wait for approval again.

---

### Step 2 — Schema (DB Agent)

> Activate: DB Agent. Load `prisma-expert` skill.

Apply all schema changes from the approved spec.

**Note:** The BetterAuth API Key plugin manages its own `apiKey` table via
`npx auth migrate` (Step 4). Do NOT manually add an `api_keys` model to
`schema.prisma` — BetterAuth owns that table.

Only add models the spec explicitly requires beyond what BetterAuth provides
(e.g. a `usageLog` model, a `project` model the API keys will gate access to, etc.).

Rules (from AGENTS.md §5):

```prisma
model Example {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at") // required for user data
}
```

- Table names: `snake_case`, plural
- `@map` on every field where Prisma camelCase differs from DB snake_case
- Multi-step writes → `prisma.$transaction([])`

Run in sequence:

```bash
npm run db:format
npm run db:migrate    # name: e.g. "add_projects_table"
npm run db:generate
```

**Handoff summary before Step 3:**
"DB Agent complete. Models added: [list]. Migration: [name]. Prisma client regenerated."

---

### Step 3 — Server Layer (Server Agent)

> Activate: Server Agent. Load `prisma-expert` + `typescript-expert` skills.

Create or update files in `src/server/` for all query functions and Server Actions
identified in the spec.

```ts
// src/server/projects.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const projectSelect = {
	id: true,
	name: true,
	description: true,
	createdAt: true,
} satisfies Prisma.ProjectSelect;

export async function getProjectsByUser(
	userId: string,
): Promise<Prisma.ProjectGetPayload<{ select: typeof projectSelect }>[]> {
	return prisma.project.findMany({
		where: { userId, deletedAt: null },
		select: projectSelect,
		orderBy: { createdAt: "desc" },
	});
}
```

Rules:

- Prisma singleton from `@/lib/prisma` — never instantiate elsewhere
- Explicit return types on all async functions
- `select` on every query — never return full rows with sensitive fields
- `prisma.$transaction([...])` for multi-step writes
- No `any` — `unknown` + type guards where shape is uncertain
- Env vars from `@/env` only — never `process.env` directly
- JSDoc on every exported function (what it does, params, return, throws)

---

### Step 4 — API Key Plugin Setup (Server Agent)

> Load `better-auth-best-practices` + `better-auth-security-best-practices` skills.

#### 4a. Check if already configured

Before editing `auth.ts`, scan it for `@better-auth/api-key`. If the import and
`apiKey()` plugin call already exist, skip to Step 4d (migration check) and note
in the output: "API Key plugin already configured — skipping install."

#### 4b. Install the package

```bash
npm install @better-auth/api-key
```

#### 4c. Add plugin to `src/lib/auth.ts`

Add `apiKey` to the plugins array. **Do not reorder or remove existing plugins.**
`nextCookies()` must remain the last plugin.

```ts
// src/lib/auth.ts  (excerpt — add to existing plugins array)
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
	// ... existing config untouched ...
	plugins: [
		// ... existing plugins (polar, organization, etc.) ...

		apiKey([
			// Single default config — use this if spec calls for one key type
			{
				// configId omitted = default config
				defaultPrefix: "sk_", // adjust prefix per spec
				enableMetadata: true, // allows storing metadata on keys
				rateLimit: {
					enabled: true,
					maxRequests: 1000, // adjust per spec
					timeWindow: 1000 * 60 * 60, // 1 hour
				},
				// references: "user",          // default — keys are user-owned
				// references: "organization",  // use this for org-owned keys
			},
			// Add a second config here if spec requires multiple key types:
			// { configId: "public", defaultPrefix: "pk_", ... },
		]),

		nextCookies(), // MUST remain last
	],
});
```

**Multiple configs:** Only add multiple config objects if the spec explicitly requires
different key types (e.g. public/secret, read-only/read-write). Don't add configs
preemptively.

**`enableSessionForAPIKeys`:** Do NOT enable this option. It allows a leaked API key
to impersonate a user session — use explicit `auth.api.verifyApiKey()` calls in route
handlers instead.

#### 4d. Add client plugin to `src/lib/auth-client.ts`

```ts
// src/lib/auth-client.ts  (excerpt — add to existing plugins array)
import { apiKeyClient } from "@better-auth/api-key/client";

export const authClient = createAuthClient({
	// ... existing config untouched ...
	plugins: [
		// ... existing plugins ...
		apiKeyClient(),
		// Adds: authClient.apiKey.create(), .list(), .delete(), .update(), .verify()
	],
});
```

#### 4e. Run the BetterAuth migration

```bash
npx auth migrate
```

This creates the `apiKey` table (and any supporting columns) that the plugin manages.
After running, verify the migration succeeded and the table exists in Prisma Studio:

```bash
npm run db:studio
```

---

### Step 5 — Auth & Billing Gates (Server Agent)

> Load `better-auth-best-practices` + `polar-billing` skills.

#### API key verification in route handlers

Use `auth.api.verifyApiKey()` — not `enableSessionForAPIKeys`. This gives explicit
control and avoids session-impersonation risk.

```ts
// Standard API key verification block — use this in every route handler
const apiKeyHeader = req.headers.get("x-api-key");
if (!apiKeyHeader) {
	return NextResponse.json(
		{ error: { code: "UNAUTHORIZED", message: "API key required" } },
		{ status: 401 },
	);
}

const verification = await auth.api.verifyApiKey({
	body: {
		key: apiKeyHeader,
		// configId: "secret",                     // include if using named configs
		// permissions: { projects: ["write"] },   // include if spec defines permissions
	},
});

if (!verification.valid) {
	return NextResponse.json(
		{
			error: {
				code: "UNAUTHORIZED",
				message: verification.error?.message ?? "Invalid API key",
			},
		},
		{ status: 401 },
	);
}

// verification.key contains the full ApiKey record (id, referenceId, metadata, etc.)
// verification.key.referenceId = userId (user-owned) or organizationId (org-owned)
const ownerId = verification.key!.referenceId;
```

#### Mixed auth (API key OR cookie session)

For endpoints accessible by both external API consumers and the dashboard:

```ts
const apiKeyHeader = req.headers.get("x-api-key");

if (apiKeyHeader) {
	// External API consumer — verify the key
	const verification = await auth.api.verifyApiKey({
		body: { key: apiKeyHeader },
	});
	if (!verification.valid) {
		return NextResponse.json(
			{ error: { code: "UNAUTHORIZED", message: "Invalid API key" } },
			{ status: 401 },
		);
	}
	userId = verification.key!.referenceId;
} else {
	// Dashboard session consumer
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		return NextResponse.json(
			{
				error: {
					code: "UNAUTHORIZED",
					message: "Authentication required",
				},
			},
			{ status: 401 },
		);
	}
	userId = session.user.id;
}
```

#### Billing gate (if required by spec)

Always enforce entitlement server-side via `src/server/subscription.ts`.
Do not inline plan checks — call the shared function.

```ts
const entitlement = await checkUserEntitlement(userId, "pro");
if (!entitlement.allowed) {
	return NextResponse.json(
		{
			error: {
				code: "PLAN_REQUIRED",
				message: "Pro plan required",
				requiredPlan: "pro",
			},
		},
		{ status: 403 },
	);
}
```

---

### Step 6 — Route Handlers (Server Agent)

> Load `api-design` + `typescript-expert` skills.

Create route handlers in `src/app/api/`. Every handler follows this structure:

```ts
// src/app/api/v1/projects/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProjectsByUser, createProject } from "@/server/projects";

const CreateProjectSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
});

export async function GET(req: Request): Promise<NextResponse> {
	// 1. Verify API key
	const apiKeyHeader = req.headers.get("x-api-key");
	if (!apiKeyHeader) {
		return NextResponse.json(
			{ error: { code: "UNAUTHORIZED", message: "API key required" } },
			{ status: 401 },
		);
	}
	const verification = await auth.api.verifyApiKey({
		body: { key: apiKeyHeader },
	});
	if (!verification.valid) {
		return NextResponse.json(
			{
				error: {
					code: "UNAUTHORIZED",
					message: verification.error?.message ?? "Invalid key",
				},
			},
			{ status: 401 },
		);
	}

	// 2. Billing gate (if applicable)
	// ...

	// 3. Delegate to server function — no Prisma directly here
	const projects = await getProjectsByUser(verification.key!.referenceId);
	return NextResponse.json({ data: projects });
}

export async function POST(req: Request): Promise<NextResponse> {
	// 1. Verify API key
	// ... (same pattern as GET)

	// 2. Validate input — never trust raw request data
	const body = await req.json();
	const parsed = CreateProjectSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: {
					code: "VALIDATION_ERROR",
					issues: parsed.error.issues,
				},
			},
			{ status: 422 },
		);
	}

	// 3. Call server function
	const result = await createProject({
		...parsed.data,
		userId: verification.key!.referenceId,
	});
	return NextResponse.json({ data: result }, { status: 201 });
}
```

**Response shape is standardised — always:**

```ts
{ data: T }                                         // success, single resource
{ data: T[], meta?: { total, limit, offset } }     // success, collection
{ error: { code: string, message: string, ... } }  // error
```

**HTTP status codes:**

- `200` GET success, `201` POST success
- `401` missing/invalid API key, `403` plan gate, `404` not found
- `422` validation failure, `429` rate limited, `500` handler error

All business logic in `src/server/` — never put Prisma calls directly in route handlers.

---

### Step 7 — API Key Management UI (UI Agent)

> Activate: UI Agent. Load `next-best-practices` + `react-best-practices` + `shadcn` skills.
> Server Agent must have handed off before this step begins.

Build the API key management dashboard. This is the standard companion UI for any
external API — users need a place to create, view, and revoke their keys.

#### 7a. Page

```
src/app/dashboard/settings/api-keys/page.tsx   ← or wherever settings live in your nav
src/app/dashboard/settings/api-keys/loading.tsx
src/app/dashboard/settings/api-keys/error.tsx
```

The page is a Server Component. Fetch the user's existing keys server-side:

```tsx
// src/app/dashboard/settings/api-keys/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiKeyList } from "@/components/settings/api-key-list";

export default async function ApiKeysPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	// Fetch via BetterAuth — no Prisma here
	const { apiKeys } = await auth.api.listApiKeys({
		query: { limit: 50, sortBy: "createdAt", sortDirection: "desc" },
		headers: await headers(),
	});

	return (
		<div>
			<h1>API Keys</h1>
			<p>
				Keys authenticate external requests to the API. Store them
				securely — they won&apos;t be shown again.
			</p>
			<ApiKeyList initialKeys={apiKeys} />
		</div>
	);
}
```

#### 7b. API Key list component

```tsx
// src/components/settings/api-key-list.tsx
"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CreateApiKeyDialog } from "./create-api-key-dialog";
import { cn } from "@/lib/utils";
import type { ApiKey } from "@better-auth/api-key";

interface Props {
	initialKeys: Omit<ApiKey, "key">[];
}

export function ApiKeyList({ initialKeys }: Props) {
	const [keys, setKeys] = useState(initialKeys);

	const handleDelete = async (keyId: string) => {
		const { error } = await authClient.apiKey.delete({ keyId });
		if (!error) setKeys((prev) => prev.filter((k) => k.id !== keyId));
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<span>
					{keys.length} key{keys.length !== 1 ? "s" : ""}
				</span>
				<CreateApiKeyDialog
					onCreated={(newKey) => setKeys((prev) => [newKey, ...prev])}
				/>
			</div>
			{keys.length === 0 && (
				<p className="text-muted-foreground">No API keys yet.</p>
			)}
			<ul className="space-y-2">
				{keys.map((key) => (
					<li
						key={key.id}
						className={cn(
							"flex items-center justify-between rounded-md border p-4",
						)}
					>
						<div>
							<p className="font-mono text-sm font-medium">
								{key.name ?? "Unnamed key"}
							</p>
							<p className="text-xs text-muted-foreground">
								Created{" "}
								{new Date(key.createdAt).toLocaleDateString()}
								{key.expiresAt
									? ` · Expires ${new Date(key.expiresAt).toLocaleDateString()}`
									: " · No expiry"}
							</p>
						</div>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => handleDelete(key.id)}
						>
							Revoke
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
}
```

#### 7c. Create key dialog — one-time reveal pattern

The `key` value is returned **only at creation** — BetterAuth never returns it again.
The UI must prompt the user to copy it immediately and confirm before closing.

```tsx
// src/components/settings/create-api-key-dialog.tsx
"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiKey } from "@better-auth/api-key";

interface Props {
	onCreated: (key: Omit<ApiKey, "key">) => void;
}

type Step = "form" | "reveal";

export function CreateApiKeyDialog({ onCreated }: Props) {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>("form");
	const [name, setName] = useState("");
	const [revealedKey, setRevealedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleCreate = async () => {
		setLoading(true);
		setError(null);
		const { data, error } = await authClient.apiKey.create({
			name: name.trim() || undefined,
			// expiresIn: 60 * 60 * 24 * 365, // optional — 1 year
		});
		setLoading(false);
		if (error || !data) {
			setError(error?.message ?? "Failed to create key");
			return;
		}
		// `data.key` contains the raw key value — only available here
		setRevealedKey(data.key);
		onCreated(data); // pass the key record (without raw value) up to the list
		setStep("reveal");
	};

	const handleCopy = async () => {
		if (!revealedKey) return;
		await navigator.clipboard.writeText(revealedKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleClose = () => {
		// Only allow closing after the user has copied, or explicitly dismisses
		setOpen(false);
		setStep("form");
		setName("");
		setRevealedKey(null);
		setCopied(false);
		setError(null);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v && step === "reveal" && !copied) return;
				setOpen(v);
			}}
		>
			<DialogTrigger asChild>
				<Button onClick={() => setOpen(true)}>Create API Key</Button>
			</DialogTrigger>
			<DialogContent
				onPointerDownOutside={(e) => {
					if (step === "reveal" && !copied) e.preventDefault();
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{step === "form" ? "Create API Key" : "Save Your Key"}
					</DialogTitle>
				</DialogHeader>

				{step === "form" && (
					<div className="space-y-4">
						<div>
							<Label htmlFor="key-name">Name (optional)</Label>
							<Input
								id="key-name"
								placeholder="e.g. Production, CI/CD"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						{error && (
							<p className="text-sm text-destructive">{error}</p>
						)}
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={handleCreate} disabled={loading}>
								{loading ? "Creating…" : "Create"}
							</Button>
						</div>
					</div>
				)}

				{step === "reveal" && revealedKey && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							This is the <strong>only time</strong> your key will
							be shown. Copy it now — you won&apos;t be able to
							retrieve it again.
						</p>
						<div className="flex items-center gap-2">
							<code className="flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm">
								{revealedKey}
							</code>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopy}
							>
								{copied ? "Copied!" : "Copy"}
							</Button>
						</div>
						<Button
							className="w-full"
							onClick={handleClose}
							disabled={!copied}
						>
							{copied ? "Done" : "Copy the key to close"}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
```

#### 7d. Nav link

Add a link to the new API keys page in the settings navigation.
Locate the existing settings nav component and add:

```tsx
{ label: "API Keys", href: "/dashboard/settings/api-keys" }
```

---

### Step 8 — Types (Server Agent)

Update `src/types/index.ts` with any new shared types:

- Request/response shapes for the new routes
- Prisma model types — use `Prisma.XxxGetPayload<{ select: ... }>`, never hand-write
- Discriminated union for route handler auth result if used in multiple places

Keep types local to a single file when they're only used there.

---

### Step 9 — Verification Checklist

Confirm every item before declaring the feature complete.
Do not mark an item done unless verified in the actual code.

**API Key Plugin**

- [ ] `@better-auth/api-key` installed in `package.json`
- [ ] `apiKey([...])` added to `plugins` array in `src/lib/auth.ts` — before `nextCookies()`
- [ ] `apiKeyClient()` added to `plugins` array in `src/lib/auth-client.ts`
- [ ] `npx auth migrate` has been run and the `apiKey` table exists
- [ ] `enableSessionForAPIKeys` is NOT set (security requirement)
- [ ] No manual `api_keys` model added to `schema.prisma` (BetterAuth owns this table)
- [ ] Prefix, rate limits, and config IDs match what the spec requires

**Route Handlers**

- [ ] Every route handler verifies the `x-api-key` header via `auth.api.verifyApiKey()`
- [ ] Verification happens before any DB query or business logic
- [ ] `verification.valid === false` returns `401` with standard error shape
- [ ] All external input validated with Zod — no raw `req.json()` used directly
- [ ] Response shape follows `{ data }` / `{ error: { code, message } }` standard
- [ ] HTTP status codes are correct (200/201/401/403/422/429/500)
- [ ] No Prisma calls directly in route handlers — delegated to `src/server/`

**Auth & Billing**

- [ ] Billing gate enforced server-side before gated operations
- [ ] Plan gate returns `403` with `code: "PLAN_REQUIRED"` and `requiredPlan`

**API Key UI**

- [ ] API key list page exists under dashboard settings
- [ ] `loading.tsx` and `error.tsx` present for the page segment
- [ ] Create dialog reveals the key exactly once and blocks closing until copied
- [ ] Delete/revoke action removes the key via `authClient.apiKey.delete()`
- [ ] `@/lib/auth.ts` (server) is NOT imported in any Client Component — `auth-client.ts` only
- [ ] All class names use `cn()` — no string concatenation

**TypeScript**

- [ ] No `any` — `unknown` + type guards used where needed
- [ ] All async functions have explicit return types
- [ ] All env vars imported from `@/env`
- [ ] `src/types/index.ts` updated for shared types

**Database**

- [ ] `PrismaClient` never instantiated outside `@/lib/prisma`
- [ ] `select` used on all queries — no full rows with sensitive fields
- [ ] Multi-step writes use `prisma.$transaction([])`
- [ ] App schema migration committed (`prisma/migrations/` updated)
