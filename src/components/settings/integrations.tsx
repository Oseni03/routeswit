"use client";

import React, { useState, useEffect } from "react";
import { Search, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Integration } from "@prisma/client";

const categories = [
	"Featured",
	"Productivity",
	"Communication",
	"Marketing",
	"Developer Tools",
];

const integrations = [
	{
		id: "github",
		name: "GitHub",
		description:
			"Sync pull requests, issues, and deployments with your workspace tasks.",
		icon: Github,
		iconColor: "#000000",
		category: "Developer Tools",
	},
];

interface IntegrationStatus {
	[id: string]: boolean;
}

export function IntegrationsCard() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("Featured");
	const [connectedIntegrations, setConnectedIntegrations] =
		useState<IntegrationStatus>({});
	const [loading, setLoading] = useState(true);
	const [connecting, setConnecting] = useState<string | null>(null);
	const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
	const [integrationToDisconnect, setIntegrationToDisconnect] = useState<
		string | null
	>(null);

	useEffect(() => {
		fetchIntegrations();
	}, []);

	const fetchIntegrations = async () => {
		try {
			const response = await fetch("/api/integrations");
			if (response.ok) {
				const data = await response.json();
				const status: IntegrationStatus = {};
				data.integrations.forEach((integration: Integration) => {
					status[integration.provider] = true;
				});
				setConnectedIntegrations(status);
			}
		} catch (error) {
			console.error("Failed to fetch integrations:", error);
			toast.error("Failed to load integrations");
		} finally {
			setLoading(false);
		}
	};

	const handleConnect = async (providerId: string) => {
		setConnecting(providerId);
		try {
			const response = await fetch("/api/integrations/oauth/initiate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ provider: providerId }),
			});

			if (response.ok) {
				const data = await response.json();
				// Open OAuth URL in new window
				window.open(data.url, "_blank", "width=600,height=700");
			} else {
				throw new Error("Failed to initiate OAuth");
			}
		} catch (error) {
			console.error("Failed to connect integration:", error);
			toast.error("Failed to connect integration");
		} finally {
			setConnecting(null);
		}
	};

	const handleDisconnect = async (providerId: string) => {
		setIntegrationToDisconnect(providerId);
		setIsDisconnectDialogOpen(true);
	};

	const confirmDisconnect = async () => {
		if (!integrationToDisconnect) return;

		try {
			const response = await fetch(
				`/api/integrations/${integrationToDisconnect}`,
				{
					method: "DELETE",
				},
			);

			if (response.ok) {
				setConnectedIntegrations((prev) => ({
					...prev,
					[integrationToDisconnect]: false,
				}));
				toast.success("Integration disconnected successfully");
			} else {
				throw new Error("Failed to disconnect");
			}
		} catch (error) {
			console.error("Failed to disconnect integration:", error);
			toast.error("Failed to disconnect integration");
		} finally {
			setIsDisconnectDialogOpen(false);
			setIntegrationToDisconnect(null);
		}
	};

	// Check for OAuth callback success/error on mount and URL changes
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const success = urlParams.get("success");
		const error = urlParams.get("error");

		if (success === "connected") {
			toast.success("Integration connected successfully");
			fetchIntegrations();
			// Clean up URL
			window.history.replaceState({}, "", window.location.pathname);
		} else if (error) {
			let errorMessage = "Failed to connect integration";
			switch (error) {
				case "oauth_failed":
					errorMessage = "OAuth authorization failed";
					break;
				case "missing_params":
					errorMessage = "Missing authorization parameters";
					break;
				case "invalid_state":
					errorMessage = "Invalid authorization state";
					break;
				case "connection_failed":
					errorMessage = "Failed to save integration";
					break;
				case "server_error":
					errorMessage = "Server error occurred";
					break;
			}
			toast.error(errorMessage);
			// Clean up URL
			window.history.replaceState({}, "", window.location.pathname);
		}
	}, []);

	const filteredIntegrations = integrations.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			activeCategory === "Featured" || item.category === activeCategory;
		return matchesSearch && matchesCategory;
	});

	if (loading) {
		return (
			<div className="space-y-12">
				<div className="text-center py-12">
					<p className="">Loading integrations...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-12">
				{/* Header & Search */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="space-y-1">
						<h2 className="text-xl font-semibold tracking-tighter">
							App Directory
						</h2>
						<p className="text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
							Standard SaaS Integrations
						</p>
					</div>
					<div className="relative w-full md:w-80">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2  size-4" />
						<Input
							className="w-full pl-10 h-11 bg-card border-border rounded-lg shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all text-sm"
							placeholder="Search integrations..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Categories */}
				<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => setActiveCategory(category)}
							className={cn(
								"px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
								activeCategory === category
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-secondary text-secondary-foreground hover:bg-accent",
							)}
						>
							{category}
						</button>
					))}
				</div>

				{/* Integration Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredIntegrations.map((item) => {
						const isConnected = connectedIntegrations[item.id];
						const isConnecting = connecting === item.id;

						return (
							<div
								key={item.id}
								className="bg-card border border-border/60 p-10 rounded-[32px] shadow-2xl shadow-black/5 hover:shadow-black/10 transition-all flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300"
							>
								<div className="space-y-4">
									<div className="flex justify-between items-start">
										<div
											className="w-12 h-12 rounded-lg flex items-center justify-center p-2"
											style={{
												backgroundColor: `${item.iconColor}10`,
											}}
										>
											<item.icon
												className="size-full"
												style={{
													color: item.iconColor,
												}}
											/>
										</div>
										{isConnected ? (
											<Badge
												variant="secondary"
												className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
											>
												Connected
											</Badge>
										) : (
											<Badge
												variant="outline"
												className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider "
											>
												Inactive
											</Badge>
										)}
									</div>
									<div>
										<h3 className="text-xl font-semibold text-foreground mb-1">
											{item.name}
										</h3>
										<p className="text-sm  leading-relaxed">
											{item.description}
										</p>
									</div>
								</div>
								<Button
									variant={
										isConnected ? "secondary" : "default"
									}
									className={cn(
										"mt-6 w-full h-10 rounded-md font-semibold text-sm transition-all",
										!isConnected &&
											"shadow-sm shadow-black/5",
									)}
									onClick={() => {
										if (isConnected) {
											handleDisconnect(item.id);
										} else {
											handleConnect(item.id);
										}
									}}
									disabled={isConnecting}
								>
									{isConnecting
										? "Connecting..."
										: isConnected
											? "Manage"
											: "Connect"}
								</Button>
							</div>
						);
					})}
				</div>
			</div>

			{/* Disconnect Integration Confirmation Dialog */}
			<AlertDialog
				open={isDisconnectDialogOpen}
				onOpenChange={setIsDisconnectDialogOpen}
			>
				<AlertDialogContent className="rounded-[32px] border-border/60 shadow-2xl p-10">
					<AlertDialogHeader className="space-y-6">
						<AlertDialogTitle className="text-xl font-medium tracking-tighter">
							Disconnect Integration
						</AlertDialogTitle>
						<AlertDialogDescription className="text-xs font-bold  p-4 bg-destructive/5 rounded-2xl border border-destructive/10 leading-loose">
							Are you sure you want to disconnect this
							integration? This will revoke access and stop all
							automated syncs.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-10 gap-4">
						<AlertDialogCancel
							className="h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10"
							onClick={() => {
								setIsDisconnectDialogOpen(false);
								setIntegrationToDisconnect(null);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDisconnect}
							className="bg-destructive text-destructive-foreground h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-destructive/10 active:scale-95"
						>
							Disconnect
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
