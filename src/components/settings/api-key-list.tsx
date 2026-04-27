"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Key } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ApiKey {
	id: string;
	name: string | null;
	start: string | null; // prefix visible portion
	createdAt: string | Date;
	expiresAt?: string | Date | null;
}

interface ApiKeyListProps {
	organizationId: string;
	refreshTrigger: number;
}

export function ApiKeyList({
	organizationId,
	refreshTrigger,
}: ApiKeyListProps) {
	const [keys, setKeys] = useState<ApiKey[]>([]);
	const [loading, setLoading] = useState(true);
	const [revoking, setRevoking] = useState<string | null>(null);

	const loadKeys = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await authClient.apiKey.list({
				query: { organizationId },
			});
			if (data && "apiKeys" in data && Array.isArray(data.apiKeys)) {
				setKeys(data.apiKeys as ApiKey[]);
			}
		} catch {
			toast.error("Failed to load API keys.");
		} finally {
			setLoading(false);
		}
	}, [organizationId]);

	useEffect(() => {
		void loadKeys();
	}, [loadKeys, refreshTrigger]);

	const handleRevoke = async (keyId: string) => {
		setRevoking(keyId);
		try {
			await authClient.apiKey.delete({ keyId });
			toast.success("API key revoked.");
			await loadKeys();
		} catch {
			toast.error("Failed to revoke key.");
		} finally {
			setRevoking(null);
		}
	};

	if (loading) {
		return (
			<div className="space-y-3">
				{[1, 2].map((i) => (
					<Skeleton key={i} className="h-12 w-full rounded-md" />
				))}
			</div>
		);
	}

	if (keys.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-border py-12 text-center">
				<Key className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
				<p className="text-sm text-muted-foreground">
					No API keys yet.
				</p>
				<p className="text-xs text-muted-foreground mt-1">
					Create your first key to start routing leads.
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Key</TableHead>
					<TableHead>Created</TableHead>
					<TableHead>Expires</TableHead>
					<TableHead className="w-[64px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{keys.map((key) => (
					<TableRow key={key.id}>
						<TableCell className="font-medium">
							{key.name ?? (
								<span className="text-muted-foreground italic">
									Unnamed
								</span>
							)}
						</TableCell>
						<TableCell>
							<code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
								{key.start
									? `${key.start}••••••••`
									: "sk_••••••••"}
							</code>
						</TableCell>
						<TableCell className="text-muted-foreground text-sm">
							{formatDistanceToNow(new Date(key.createdAt), {
								addSuffix: true,
							})}
						</TableCell>
						<TableCell>
							{key.expiresAt ? (
								<Badge variant="outline">
									{formatDistanceToNow(
										new Date(key.expiresAt),
										{ addSuffix: true },
									)}
								</Badge>
							) : (
								<Badge variant="secondary">Never</Badge>
							)}
						</TableCell>
						<TableCell>
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="text-muted-foreground hover:text-destructive"
										disabled={revoking === key.id}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Revoke API key?
										</AlertDialogTitle>
										<AlertDialogDescription>
											Any requests using this key will
											immediately stop working. This
											action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											onClick={() => handleRevoke(key.id)}
										>
											Revoke
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
