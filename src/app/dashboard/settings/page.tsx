import React, { Suspense } from "react";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Loading fallback component
const SettingsLoading = () => (
    <div className="w-full space-y-6">
        {/* Header Skeleton */}
        <div className="p-0 space-y-2">
            <Skeleton className="h-8 w-32 sm:w-40" />
            <Skeleton className="h-4 w-64 sm:w-96" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
            {/* TabsList Skeleton */}
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                        key={i}
                        className="h-10 w-32 sm:w-40 rounded-md flex-shrink-0"
                    />
                ))}
            </div>

            {/* Card Content Skeleton */}
            <div className="space-y-4 -mx-4 sm:mx-0 px-4 sm:px-0">
                <Card>
                    <CardHeader>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Field 1 */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        {/* Field 2 */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        {/* Field 3 */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-20 w-full" />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Card Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);

export default function SettingsPage() {
    return (
        <div className="animate-in fade-in duration-500">
            <Suspense fallback={<SettingsLoading />}>
                <SettingsClient />
            </Suspense>
        </div>
    );
}
