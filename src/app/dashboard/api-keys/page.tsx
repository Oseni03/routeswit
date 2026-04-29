import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeysPageClient } from "./client";

export const metadata = {
	title: "API Keys",
	description: "Manage API keys for the RouteSwit Route API.",
};

export default async function ApiKeysPage(): Promise<React.ReactElement> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const activeOrg = session.activeOrganizationId;

	return (
		<div className="w-full space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Authenticate requests to the RouteSwit Route API.
				</p>
			</div>

			{activeOrg ? (
				<>
					<ApiKeysPageClient organizationId={activeOrg} />

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Usage</CardTitle>
							<CardDescription>
								Pass your key in the{" "}
								<code className="text-xs font-mono">Authorization</code> header of
								every request.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<pre className="rounded-lg bg-muted px-4 py-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
								{`POST /api/v1/leads\nAuthorization: Bearer sk_••••••••`}
							</pre>
							<p className="text-xs text-muted-foreground">
								Rate limit:{" "}
								<strong>1,000 requests / hour</strong> per key.
							</p>
						</CardContent>
					</Card>
				</>
			) : (
				<p className="text-sm text-muted-foreground">
					Select an organisation to manage API keys.
				</p>
			)}
		</div>
	);
}
