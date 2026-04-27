import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default async function RepsPage() {
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
					Please select an organization to manage your reps.
				</p>
			</div>
		);
	}

	const reps = await prisma.rep.findMany({
		where: { organizationId },
		orderBy: { createdAt: "desc" },
	});

	const totalReps = reps.length;
	const activeReps = reps.filter((rep) => rep.status === "active").length;
	const oooReps = reps.filter((rep) => rep.status === "ooo").length;
	const inactiveReps = reps.filter((rep) => rep.status === "inactive").length;

	return (
		<div className="p-container-padding max-w-[1200px] mx-auto space-y-8">
			<div className="space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">
							Reps
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Track your sales reps, availability status, and
							overflow configuration.
						</p>
					</div>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Total reps
							</p>
							<p className="text-3xl font-semibold">
								{totalReps}
							</p>
							<p className="text-sm text-muted-foreground">
								Sales representatives in this organization
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Active
							</p>
							<p className="text-3xl font-semibold">
								{activeReps}
							</p>
							<p className="text-sm text-muted-foreground">
								Reps currently available for assignment
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								OOO / Inactive
							</p>
							<p className="text-3xl font-semibold">
								{oooReps + inactiveReps}
							</p>
							<p className="text-sm text-muted-foreground">
								Reps unavailable for lead routing
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="border-border bg-background">
				<CardHeader>
					<CardTitle>Sales representatives</CardTitle>
					<CardDescription>
						Manage the reps defined for your organization&apos;s
						routing rules.
					</CardDescription>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Rep</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Overflow</TableHead>
								<TableHead className="text-right">
									Added
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{reps.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center text-sm text-muted-foreground py-10"
									>
										No reps have been added yet. Create reps
										through the Route API or your
										integration.
									</TableCell>
								</TableRow>
							) : (
								reps.map((rep) => (
									<TableRow key={rep.id}>
										<TableCell>
											<div className="font-medium">
												{rep.name}
											</div>
											<div className="text-xs text-muted-foreground">
												{rep.repId}
											</div>
										</TableCell>
										<TableCell>{rep.email}</TableCell>
										<TableCell>
											<Badge variant="outline">
												{rep.status}
											</Badge>
										</TableCell>
										<TableCell>
											{rep.overflowTo ?? "—"}
										</TableCell>
										<TableCell className="text-right text-sm text-muted-foreground">
											{new Date(
												rep.createdAt,
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
