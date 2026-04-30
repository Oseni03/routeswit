import { Prisma } from "@prisma/client";

export const repSelect = {
    id: true,
    repId: true,
    name: true,
    email: true,
    timezone: true,
    status: true,
    oooUntil: true,
    overflowTo: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.RepSelect;

export type RepRecord = Prisma.RepGetPayload<{ select: typeof repSelect }>;

export interface CreateRepInput {
    rep_id: string;
    name: string;
    email: string;
    timezone?: string;
}

export interface UpdateRepInput {
    status?: "active" | "ooo" | "inactive";
    ooo_until?: string | null;
    overflow_to?: string | null;
}