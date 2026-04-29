import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info, AlertTriangle, CheckCircle2, Terminal, Shield, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APIPlayground } from "./_components/playground";

export default function DocsPage() {
    return (
        <div className="space-y-32">
            {/* Overview Section */}
            <section id="overview" className="scroll-m-24 space-y-6">
                <div className="space-y-4">
                    <Badge variant="outline" className="px-3 py-1 text-xs font-medium border-primary/20 text-primary bg-primary/5">
                        API v1.0.0
                    </Badge>
                    <h1 className="text-5xl font-extrabold tracking-tight">API Reference</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                        Welcome to the Routeswit API. Our API is built on REST principles, providing a structured way to integrate lead routing, sales representative management, and activity tracking into your existing workflows.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardHeader className="pb-2">
                            <Zap className="h-5 w-5 text-primary mb-2" />
                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Base URL</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <code className="text-sm font-mono font-bold bg-background px-3 py-1.5 rounded border">
                                https://app.routeswit.com/api/v1
                            </code>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-none shadow-none">
                        <CardHeader className="pb-2">
                            <Activity className="h-5 w-5 text-primary mb-2" />
                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Format</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">All requests should use <code className="bg-background px-1 rounded border">application/json</code> and will return JSON responses.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Playground Section */}
            <section id="playground" className="scroll-m-24 space-y-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        <h2 className="text-3xl font-bold tracking-tight">API Playground</h2>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Test your integration in real-time. Use your secret API key to execute live requests against our production environment.
                    </p>
                </div>
                <APIPlayground />
            </section>

            <Separator className="opacity-50" />

            {/* Authentication Section */}
            <section id="authentication" className="scroll-m-24 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <h2 className="text-3xl font-bold tracking-tight">Authentication</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        The Routeswit API uses API keys for authentication. You can generate and revoke these keys within your 
                        <Link href="/dashboard/settings" className="text-primary hover:underline font-medium mx-1">
                            Organization Settings
                        </Link>.
                    </p>
                </div>
                
                <Card className="border-primary/10 bg-primary/5">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-primary/10 rounded-full">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold">Authorization Header</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Include your secret API key in the <code className="bg-background px-1 rounded border">Authorization</code> header for all requests. 
                                    Do not share your keys or commit them to version control.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-md border bg-zinc-950 p-4 font-mono text-xs text-zinc-50 overflow-x-auto">
                            Authorization: Bearer sk_live_your_secret_key
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    <div className="space-y-1 text-sm text-amber-900 dark:text-amber-400">
                        <p className="font-bold">Security Enforcement</p>
                        <p>All requests must be made via HTTPS. Insecure HTTP requests will be blocked. Additionally, use restricted keys for limited-scope integrations when possible.</p>
                    </div>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Errors Section */}
            <section id="errors" className="scroll-m-24 space-y-8">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">Response Codes</h2>
                    <p className="text-lg text-muted-foreground">
                        We use standard HTTP status codes to communicate the result of your API requests.
                    </p>
                </div>
                
                <div className="rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="w-[180px]">Code</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-bold text-emerald-600">200 OK</TableCell>
                                <TableCell className="font-mono text-xs">-</TableCell>
                                <TableCell className="text-muted-foreground">The request was successful.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-bold text-amber-600">401</TableCell>
                                <TableCell className="font-mono text-xs">UNAUTHORIZED</TableCell>
                                <TableCell className="text-muted-foreground">Invalid or missing API key.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-bold text-amber-600">402</TableCell>
                                <TableCell className="font-mono text-xs">PAYMENT_REQUIRED</TableCell>
                                <TableCell className="text-muted-foreground">You have reached your plan limits. Please upgrade via Polar.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-bold text-amber-600">404</TableCell>
                                <TableCell className="font-mono text-xs">NOT_FOUND</TableCell>
                                <TableCell className="text-muted-foreground">The requested resource does not exist.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-bold text-amber-600">422</TableCell>
                                <TableCell className="font-mono text-xs">VALIDATION_ERROR</TableCell>
                                <TableCell className="text-muted-foreground">The request body was invalid or contained errors.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-bold text-red-600">500</TableCell>
                                <TableCell className="font-mono text-xs">SERVER_ERROR</TableCell>
                                <TableCell className="text-muted-foreground">Internal server error. Our team has been notified.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Leads Section */}
            <section id="leads" className="scroll-m-24 space-y-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        The Leads resource is the core of Routeswit. Use this endpoint to ingest incoming leads and distribute them to the appropriate representative based on your defined rules.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">POST</Badge>
                        <code className="text-xl font-mono font-semibold">/leads</code>
                    </div>
                    
                    <Card className="border-none shadow-none bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Route a Lead</CardTitle>
                            <CardDescription>
                                Evaluates attributes against a ruleset to find the best match.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Parameters</h4>
                                <div className="rounded-lg border bg-background overflow-hidden">
                                    <Table>
                                        <TableBody>
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell className="w-1/3 py-4">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold">lead_id</span>
                                                        <Badge variant="outline" className="ml-2 text-[10px]">Required</Badge>
                                                        <p className="text-xs text-muted-foreground italic">string</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground align-top py-4">
                                                    The unique identifier for the lead in your external system (CRM, Website, etc).
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell className="w-1/3 py-4">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold">ruleset_id</span>
                                                        <Badge variant="outline" className="ml-2 text-[10px]">Required</Badge>
                                                        <p className="text-xs text-muted-foreground italic">string</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground align-top py-4">
                                                    The slug or ID of the ruleset to execute.
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableCell className="w-1/3 py-4">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold">attributes</span>
                                                        <Badge variant="outline" className="ml-2 text-[10px]">Required</Badge>
                                                        <p className="text-xs text-muted-foreground italic">object</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground align-top py-4">
                                                    Key-value pairs used for rule matching (e.g., <code className="text-xs">"region": "West"</code>).
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Request Example</h4>
                                <div className="rounded-xl bg-zinc-950 p-6 text-xs text-zinc-300 font-mono overflow-x-auto shadow-2xl">
<pre>{`curl -X POST https://app.routeswit.com/api/v1/leads \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "lead_id": "LD-8902",
    "ruleset_id": "enterprise-sales",
    "attributes": {
      "company_size": 500,
      "region": "EMEA",
      "source": "Webinar"
    }
  }'`}</pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Reps Section */}
            <section id="reps" className="scroll-m-24 space-y-12">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Representatives</h2>
                    <p className="text-lg text-muted-foreground">
                        Manage your sales team's availability and routing capacity.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* GET REPS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-primary border-primary font-bold px-3 py-1">GET</Badge>
                            <code className="text-xl font-mono font-semibold">/reps</code>
                        </div>
                        <p className="text-muted-foreground">List all representatives associated with your organization.</p>
                        <div className="rounded-xl bg-zinc-950 p-6 text-xs text-zinc-300 font-mono overflow-x-auto">
<pre>{`[
  {
    "id": "rep_123",
    "name": "Alex Rivera",
    "email": "alex@company.com",
    "status": "AVAILABLE"
  },
  ...
]`}</pre>
                        </div>
                    </div>

                    {/* POST REPS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">POST</Badge>
                            <code className="text-xl font-mono font-semibold">/reps</code>
                        </div>
                        <Card className="border-none shadow-none bg-muted/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Create Representative</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-mono font-bold">name</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Full name of the representative.</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-mono font-bold">email</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">Used for notifications and assignment alerts.</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Rulesets Section */}
            <section id="rulesets" className="scroll-m-24 space-y-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Rulesets</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Define your business logic. Rulesets consist of conditions and actions that determine which representative receives a lead.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">POST</Badge>
                        <code className="text-xl font-mono font-semibold">/rules</code>
                    </div>
                    <Card className="border-none shadow-none bg-muted/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Update Ruleset</CardTitle>
                            <CardDescription>
                                Synchronize your routing logic via JSON.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl bg-zinc-950 p-6 text-xs text-zinc-300 font-mono overflow-x-auto shadow-xl">
<pre>{`{
  "name": "EMEA Inbound",
  "slug": "emea-inbound",
  "rules": [
    {
      "condition": "attributes.country == 'UK'",
      "target_id": "rep_london_office"
    }
  ]
}`}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Contacts Section */}
            <section id="contacts" className="scroll-m-24 space-y-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Contacts & Activities</h2>
                    <p className="text-lg text-muted-foreground">
                        Maintain a persistent history of every lead and their engagement over time.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">POST</Badge>
                            <code className="text-xl font-mono font-semibold">/contacts</code>
                        </div>
                        <p className="text-sm text-muted-foreground">Upsert contact details to keep records synchronized.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-emerald-500 text-white border-none font-bold px-3 py-1">POST</Badge>
                            <code className="text-xl font-mono font-semibold">/contacts/[id]/activities</code>
                        </div>
                        <div className="rounded-xl border p-6 bg-muted/10 space-y-4">
                            <p className="text-sm font-semibold">Log a Call or Meeting</p>
                            <div className="rounded bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
<pre>{`{
  "type": "CALL",
  "notes": "Discussed expansion to 50 seats.",
  "outcome": "POSITIVE"
}`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Separator className="opacity-50" />

            {/* Analytics Section */}
            <section id="analytics" className="scroll-m-24 space-y-10 pb-32">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight">Intelligence</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Gain insights into your routing performance and set up automated SLA monitors.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <Badge variant="outline" className="w-fit mb-2">GET</Badge>
                            <CardTitle className="text-base font-mono">/analytics/summary</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Retrieve conversion rates, average response times, and routing efficiency metrics.
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <Badge variant="outline" className="w-fit mb-2">POST</Badge>
                            <CardTitle className="text-base font-mono">/slas</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Define thresholds for response times and configure webhook notifications for breaches.
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-20 text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">Start Building Today</h2>
                    <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Join hundreds of organizations optimizing their sales flow with Routeswit. 
                        Need a custom integration or have questions? Our engineering team is standing by.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-semibold">
                                Get Technical Support
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-semibold">
                                Create Free Developer Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

