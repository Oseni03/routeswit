"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Send, Loader2, Key, Terminal, Code2 } from "lucide-react";
import { toast } from "sonner";

const ENDPOINTS = [
    {
        id: "route-lead",
        name: "Route a Lead",
        method: "POST",
        path: "/leads",
        description: "Test lead routing logic",
        defaultBody: {
            lead_id: "lead_123",
            ruleset_id: "default",
            attributes: {
                state: "CA",
                industry: "Technology",
                size: 500
            }
        }
    },
    {
        id: "list-reps",
        name: "List Representatives",
        method: "GET",
        path: "/reps",
        description: "Fetch all active reps",
        defaultBody: null
    },
    {
        id: "analytics-summary",
        name: "Analytics Summary",
        method: "GET",
        path: "/analytics/summary",
        description: "Get monthly performance metrics",
        defaultBody: null
    }
];

export function APIPlayground() {
    const [apiKey, setApiKey] = useState("");
    const [selectedId, setSelectedId] = useState(ENDPOINTS[0].id);
    const [requestBody, setRequestBody] = useState(JSON.stringify(ENDPOINTS[0].defaultBody, null, 2));
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectedEndpoint = ENDPOINTS.find(e => e.id === selectedId)!;

    const handleRun = async () => {
        if (!apiKey) {
            toast.error("Please enter an API key");
            return;
        }

        setIsLoading(true);
        setResponse(null);

        try {
            const options: RequestInit = {
                method: selectedEndpoint.method,
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            };

            if (selectedEndpoint.method === "POST" && requestBody) {
                options.body = requestBody;
            }

            const res = await fetch(`/api/v1${selectedEndpoint.path}`, options);
            const data = await res.json();
            setResponse({
                status: res.status,
                statusText: res.statusText,
                data
            });
        } catch (error: any) {
            setResponse({
                status: 500,
                error: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-2 border-primary/10 shadow-xl overflow-hidden bg-card/50 backdrop-blur">
            <CardHeader className="border-b bg-muted/30 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Terminal className="h-6 w-6 text-primary" />
                            API Playground
                        </CardTitle>
                        <CardDescription>
                            Interactive environment to test live API requests against your organization data.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background/50">HTTPS Required</Badge>
                        <Badge variant="outline" className="bg-background/50">CORS Enabled</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Input Panel */}
                    <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                    <Key className="h-3 w-3" />
                                    Secret API Key
                                </Label>
                                <Input
                                    type="password"
                                    placeholder="sk_test_..."
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="font-mono text-sm bg-background/50"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                    Your key is only used for this session and is never stored on our servers.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Endpoint</Label>
                                <Select value={selectedId} onValueChange={(val) => {
                                    setSelectedId(val);
                                    const endpoint = ENDPOINTS.find(e => e.id === val);
                                    if (endpoint) {
                                        setRequestBody(endpoint.defaultBody ? JSON.stringify(endpoint.defaultBody, null, 2) : "");
                                    }
                                }}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ENDPOINTS.map((e) => (
                                            <SelectItem key={e.id} value={e.id}>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={e.method === "POST" ? "default" : "outline"} className="text-[10px] h-4 px-1">
                                                        {e.method}
                                                    </Badge>
                                                    <span className="font-medium">{e.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedEndpoint.method === "POST" && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                        <Code2 className="h-3 w-3" />
                                        Request Body (JSON)
                                    </Label>
                                    <textarea
                                        value={requestBody}
                                        onChange={(e) => setRequestBody(e.target.value)}
                                        className="w-full min-h-[200px] p-4 rounded-md border bg-zinc-950 text-zinc-50 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            )}
                        </div>

                        <Button 
                            className="w-full h-12 gap-2 text-base font-semibold shadow-lg shadow-primary/20" 
                            onClick={handleRun}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Play className="h-5 w-5 fill-current" />
                            )}
                            Execute Request
                        </Button>
                    </div>

                    {/* Response Panel */}
                    <div className="bg-zinc-950/50 p-6 flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Response</Label>
                            {response && (
                                <Badge variant={response.status < 300 ? "outline" : "destructive"} className="font-mono">
                                    {response.status} {response.statusText}
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex-1 relative">
                            {response ? (
                                <pre className="absolute inset-0 p-4 rounded-md border border-zinc-800 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-auto">
                                    {JSON.stringify(response.data || response.error, null, 2)}
                                </pre>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground space-y-4 border border-zinc-800 border-dashed rounded-md">
                                    <Send className="h-12 w-12 opacity-20" />
                                    <p className="text-sm italic opacity-50">Run a request to see the response payload</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
