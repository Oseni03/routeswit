"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CreateApiKeyDialogProps {
	organizationId: string;
	onCreated: () => void;
}

export function CreateApiKeyDialog({
	organizationId,
	onCreated,
}: CreateApiKeyDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const handleCreate = async () => {
		if (!name.trim()) {
			toast.error("Please enter a name for the key.");
			return;
		}
		setLoading(true);
		try {
			const result = await authClient.apiKey.create({
				name: name.trim(),
				organizationId,
			});
			if ("error" in result && result.error) {
				toast.error(
					result.error.message ?? "Failed to create API key.",
				);
				return;
			}
			if ("data" in result && result.data?.key) {
				setCreatedKey(result.data.key);
				onCreated();
			}
		} catch {
			toast.error("Failed to create API key.");
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = async () => {
		if (!createdKey) return;
		await navigator.clipboard.writeText(createdKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleClose = () => {
		if (createdKey && !copied) {
			// Prevent accidental close before copying
			toast.warning(
				"Copy your API key first — it will not be shown again.",
			);
			return;
		}
		setOpen(false);
		setName("");
		setCreatedKey(null);
		setCopied(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				if (!val) {
					handleClose();
				} else {
					setOpen(true);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button size="sm">
					<Plus className="h-4 w-4 mr-2" />
					New API Key
				</Button>
			</DialogTrigger>

			<DialogContent
				className="sm:max-w-md"
				onPointerDownOutside={(e) => {
					if (createdKey && !copied) {
						e.preventDefault();
						toast.warning(
							"Copy your API key first — it will not be shown again.",
						);
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>Create API Key</DialogTitle>
					<DialogDescription>
						Give your key a descriptive name so you can identify it
						later.
					</DialogDescription>
				</DialogHeader>

				{!createdKey ? (
					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Label htmlFor="key-name">Key name</Label>
							<Input
								id="key-name"
								placeholder="e.g. Salesforce integration"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleCreate();
								}}
								disabled={loading}
							/>
						</div>
					</div>
				) : (
					<div className="space-y-4 py-2">
						<Alert>
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								<strong>Copy this key now.</strong> It will not
								be shown again.
							</AlertDescription>
						</Alert>
						<div className="space-y-2">
							<Label>Your API key</Label>
							<div className="flex items-center gap-2">
								<code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
									{createdKey}
								</code>
								<Button
									variant="outline"
									size="icon"
									onClick={handleCopy}
									className="shrink-0"
								>
									{copied ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					{!createdKey ? (
						<>
							<Button
								variant="outline"
								onClick={() => {
									setOpen(false);
									setName("");
								}}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								disabled={loading || !name.trim()}
							>
								{loading ? "Creating…" : "Create key"}
							</Button>
						</>
					) : (
						<Button
							onClick={handleClose}
							variant={copied ? "default" : "outline"}
							disabled={!copied}
						>
							{copied ? "Done" : "Copy key to close"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
