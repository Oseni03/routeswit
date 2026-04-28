"use client";

import React, { useState } from "react";
import {
    Building2,
    Users2,
    CreditCard,
    ShieldCheck,
    Puzzle,
} from "lucide-react";
import OrganizationCard from "@/components/settings/organizations";
import SubscriptionCard from "@/components/settings/subscription";
import { MembersCard } from "@/components/settings/members";
import SecurityCard from "../settings/security";
import { IntegrationsCard } from "@/components/settings/integrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const tabsItems = [
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "members", label: "Team Members", icon: Users2 },
    { id: "subscription", label: "Plans & Billing", icon: CreditCard },
    // { id: "integrations", label: "Integrations", icon: Puzzle },
    { id: "security", label: "Security & Access", icon: ShieldCheck },
];

export function SettingsClient() {
    const [tab, setTab] = useState("organization");

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="space-y-1">
                <h2 className="text-3xl font-semibold text-foreground">
                    Settings
                </h2>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                    Manage your organization and preferences
                </p>
            </div>

            <Tabs
                value={tab}
                onValueChange={setTab}
                className="w-full space-y-8"
            >
                {/* Custom Styled TabsList */}
                <div className="border-b border-border w-full">
                    <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
                        {tabsItems.map((item) => (
                            <TabsTrigger
                                key={item.id}
                                value={item.id}
                                className={cn(
                                    "relative px-0 py-3 rounded-none bg-transparent border-b-2 border-transparent",
                                    "data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:shadow-none",
                                    "text-muted-foreground data-[state=active]:text-foreground font-semibold text-sm transition-all flex items-center gap-2 group",
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "size-4 transition-colors",
                                        tab === item.id
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground",
                                    )}
                                />
                                <span>{item.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="min-h-[500px]">
                    <TabsContent value="organization">
                        <OrganizationCard />
                    </TabsContent>

                    <TabsContent value="members">
                        <MembersCard />
                    </TabsContent>

                    <TabsContent value="subscription">
                        <SubscriptionCard />
                    </TabsContent>

                    {/* <TabsContent value="integrations">
                        <IntegrationsCard />
                    </TabsContent> */}

                    <TabsContent value="security">
                        <SecurityCard />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
