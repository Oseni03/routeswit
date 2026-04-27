"use client";

import { useState } from "react";
import { ApiKeyList } from "@/components/settings/api-key-list";
import { CreateApiKeyDialog } from "@/components/settings/create-api-key-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ApiKeysPageClient({ organizationId }: { organizationId: string }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-base">Active keys</CardTitle>
                    <CardDescription>
                        Keys are org-scoped. Revoke immediately if compromised.
                    </CardDescription>
                </div>
                <CreateApiKeyDialog
                    organizationId={organizationId}
                    onCreated={() => setRefreshTrigger((n) => n + 1)}
                />
            </CardHeader>
            <CardContent>
                <ApiKeyList
                    organizationId={organizationId}
                    refreshTrigger={refreshTrigger}
                />
            </CardContent>
        </Card>
    );
}
