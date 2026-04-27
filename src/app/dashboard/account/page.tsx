import React, { Suspense } from "react";
import { auth, Session } from "@/lib/auth";
import { headers } from "next/headers";
import { AccountClient } from "@/components/dashboard/account-client";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback component
const AccountLoading = () => (
    <div className="p-container-padding max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-12">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="w-full md:w-2/3">
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default async function AccountPage() {
    const session = (await auth.api.getSession({
        headers: await headers(),
    })) as Session | null;

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen">
            <Suspense fallback={<AccountLoading />}>
                <AccountClient initialSession={session} />
            </Suspense>
        </div>
    );
}
