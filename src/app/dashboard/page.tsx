import React from "react";
import {
    Filter,
    Plus,
    CheckCircle2,
    Users,
    Zap,
    Route as RouteIcon,
    Contact as ContactIcon,
    AlertTriangle,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTier, PLAN_LIMITS } from "@/lib/route-api-auth";

export default async function DashboardPage() {
    const sessionResponse = await auth.api.getSession({
        headers: await headers(),
    });

    if (!sessionResponse) {
        redirect("/login");
    }

    const orgId = sessionResponse.activeOrganizationId;
    if (!orgId) {
        return (
            <div className="p-container-padding flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-xl font-semibold">No Organization Selected</h2>
                <p className="text-muted-foreground mt-2">Please select or create an organization to view your dashboard.</p>
            </div>
        );
    }

    const tier = getTier(sessionResponse.subscription?.productId);
    const limits = PLAN_LIMITS[tier];

    // Fetch metrics
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalLeadsRouted, monthlyLeads, repsCount, rulesetsCount, recentLogs] = await Promise.all([
        prisma.routingLog.count({ where: { organizationId: orgId } }),
        prisma.routingLog.count({ where: { organizationId: orgId, assignedAt: { gte: monthStart } } }),
        prisma.rep.count({ where: { organizationId: orgId } }),
        prisma.ruleset.count({ where: { organizationId: orgId, deletedAt: null } }),
        prisma.routingLog.findMany({
            where: { organizationId: orgId },
            orderBy: { assignedAt: "desc" },
            take: 5,
            include: { rep: true }
        })
    ]);

    const firstName = sessionResponse.user?.name?.split(" ")[0] || "there";

    const leadUsagePercent = limits.monthly_leads === Infinity ? 0 : (monthlyLeads / limits.monthly_leads) * 100;
    const repUsagePercent = limits.reps === Infinity ? 0 : (repsCount / limits.reps) * 100;
    const rulesetUsagePercent = limits.rulesets === Infinity ? 0 : (rulesetsCount / limits.rulesets) * 100;

    const stats = [
        {
            label: "Monthly Leads Routed",
            value: limits.monthly_leads === Infinity ? monthlyLeads.toString() : `${monthlyLeads} / ${limits.monthly_leads}`,
            percent: Math.min(leadUsagePercent, 100),
            icon: ContactIcon,
            color: leadUsagePercent >= 100 ? "text-destructive" : "text-primary",
        },
        {
            label: "Active Reps",
            value: limits.reps === Infinity ? repsCount.toString() : `${repsCount} / ${limits.reps}`,
            percent: Math.min(repUsagePercent, 100),
            icon: Users,
            color: repUsagePercent >= 100 ? "text-destructive" : "text-primary",
        },
        {
            label: "Active Rulesets",
            value: limits.rulesets === Infinity ? rulesetsCount.toString() : `${rulesetsCount} / ${limits.rulesets}`,
            percent: Math.min(rulesetUsagePercent, 100),
            icon: RouteIcon,
            color: rulesetUsagePercent >= 100 ? "text-destructive" : "text-primary",
        },
        {
            label: "Total All Time",
            value: totalLeadsRouted.toLocaleString(),
            percent: 100,
            icon: Zap,
            color: "text-primary",
        },
    ];

    return (
        <div className="p-container-padding max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-semibold text-foreground">
                        Overview
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                        Good morning, {firstName} •{" "}
                        {new Date().toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-10 px-5 border-border rounded-lg font-medium text-xs hover:bg-muted/50 transition-all active:scale-95 shadow-none"
                    >
                        <Filter className="size-3.5" />
                        Filter
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium text-xs hover:opacity-90 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus className="size-3.5" />
                        New Routing Rule
                    </Button>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        className="border-border rounded-2xl shadow-sm hover:border-primary/20 transition-all group overflow-hidden bg-background"
                    >
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                                    {stat.label}
                                </span>
                                <div className="size-9 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <stat.icon
                                        className={cn(
                                            "size-4.5",
                                            stat.color === "text-primary"
                                                ? "group-hover:text-primary-foreground"
                                                : stat.color,
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-semibold tracking-tight text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                            <div className="mt-6 h-1 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 delay-300",
                                        stat.color === "text-destructive"
                                            ? "bg-destructive"
                                            : "bg-primary",
                                    )}
                                    style={{
                                        width: stat.percent > 0 ? `${stat.percent}%` : "100%",
                                        opacity: stat.percent === 0 ? 0 : 1
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Routing Logs */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            Recent Routing Activity
                        </h3>
                        <Link
                            href="/dashboard/contacts"
                            className="text-[10px] font-medium text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-colors"
                        >
                            View All &rarr;
                        </Link>
                    </div>
                    <div className="border border-border/60 bg-muted/5 rounded-3xl min-h-[440px] flex flex-col p-6">
                        {recentLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full flex-grow opacity-70">
                                <RouteIcon className="size-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-sm font-medium">No routing logs yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentLogs.map((log) => {
                                    let email = log.leadId;
                                    try {
                                        const attrs = JSON.parse(log.attributesJson);
                                        if (attrs.email) email = attrs.email;
                                    } catch (e) { }

                                    return (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                                    {email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{email}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Routed to <span className="font-semibold text-foreground">{log.rep?.name || "Fallback Queue"}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">Assigned</p>
                                                <p className="text-[10px] text-muted-foreground mt-2">{log.assignedAt.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Setup / Alerts */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            System Status
                        </h3>
                    </div>
                    <Card className="border-border rounded-3xl shadow-sm h-full overflow-hidden bg-background">
                        <CardContent className="p-8">
                            <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/50">
                                <div className="flex gap-5 relative z-10 group/item">
                                    <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border transition-all duration-300 bg-background group-hover/item:scale-110">
                                        <CheckCircle2 className="size-4 text-green-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">
                                            API Operational
                                        </p>
                                        <p className="text-[11px] font-medium text-muted-foreground/70 leading-tight">
                                            All routing endpoints are responding quickly.
                                        </p>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                                                Now
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {(repUsagePercent >= 90 || leadUsagePercent >= 90 || rulesetUsagePercent >= 90) && (
                                    <div className="flex gap-5 relative z-10 group/item">
                                        <div className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border transition-all duration-300 bg-destructive/10 group-hover/item:scale-110">
                                            <AlertTriangle className="size-4 text-destructive" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">
                                                Approaching Plan Limits
                                            </p>
                                            <p className="text-[11px] font-medium text-muted-foreground/70 leading-tight">
                                                You are nearing your usage limits. Consider upgrading to Pro.
                                            </p>
                                            <div className="flex items-center gap-2 pt-1">
                                                <Link href="/dashboard/settings?tab=subscription" className="text-[10px] font-semibold text-primary hover:underline">
                                                    Upgrade Plan
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}
