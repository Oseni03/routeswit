import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listRulesets } from "@/server/routing";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default async function RulesetsPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/login");

	const organizationId = session.activeOrganizationId;
	if (!organizationId) {
		return (
			<div className="p-container-padding flex flex-col items-center justify-center h-[50vh]">
				<h2 className="text-xl font-semibold">
					No organization selected
				</h2>
				<p className="text-muted-foreground mt-2">
					Please select an organization to manage your routing rules.
				</p>
			</div>
		);
	}

	const rulesets = await listRulesets(organizationId);
	const totalRulesets = rulesets.length;
	const totalRules = rulesets.reduce(
		(sum, ruleset) => sum + ruleset.rulesCount,
		0,
	);

	return (
		<div className="p-container-padding max-w-[1200px] mx-auto space-y-8">
			<div className="space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">
							Rulesets
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Browse active routing rulesets and review
							configuration summaries.
						</p>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Active rulesets
							</p>
							<p className="text-3xl font-semibold">
								{totalRulesets}
							</p>
							<p className="text-sm text-muted-foreground">
								Rulesets currently deployed
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Rules defined
							</p>
							<p className="text-3xl font-semibold">
								{totalRules}
							</p>
							<p className="text-sm text-muted-foreground">
								Total routing rules across all rulesets
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="border-border bg-background">
				<CardHeader>
					<CardTitle>Active rulesets</CardTitle>
					<CardDescription>
						Review your configured rulesets and the number of rules
						they contain.
					</CardDescription>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Rules</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rulesets.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-sm text-muted-foreground py-10"
									>
										No active rulesets found. Create a
										ruleset through the Route API to start
										routing leads.
									</TableCell>
								</TableRow>
							) : (
								rulesets.map((ruleset) => (
									<TableRow key={ruleset.rulesetId}>
										<TableCell>
											<div className="font-medium">
												{ruleset.name}
											</div>
											<div className="text-xs text-muted-foreground">
												{ruleset.rulesetId}
											</div>
										</TableCell>
										<TableCell>
											{ruleset.rulesCount}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{new Date(
												ruleset.createdAt,
											).toLocaleDateString()}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
