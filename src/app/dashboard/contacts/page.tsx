import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
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

export default async function ContactsPage() {
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
					Please select an organization to view your contacts.
				</p>
			</div>
		);
	}

	const [totalContacts, totalActivities, assignedContacts, contacts] =
		await Promise.all([
			prisma.contact.count({ where: { organizationId } }),
			prisma.activity.count({ where: { organizationId } }),
			prisma.contact.count({
				where: { organizationId, assignedRepId: { not: null } },
			}),
			prisma.contact.findMany({
				where: { organizationId },
				orderBy: { updatedAt: "desc" },
				take: 10,
				select: {
					contactId: true,
					email: true,
					name: true,
					leadId: true,
					assignedRepId: true,
					updatedAt: true,
					activities: {
						orderBy: { timestamp: "desc" },
						take: 1,
						select: { timestamp: true },
					},
				},
			}),
		]);

	return (
		<div className="p-container-padding max-w-[1200px] mx-auto space-y-8">
			<div className="space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">
							Contacts
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Review routed contacts, leads, and activity
							summaries for your organization.
						</p>
					</div>
					<Link
						href="/dashboard/contacts"
						className="text-sm font-medium text-primary hover:text-primary/80"
					>
						Refresh
					</Link>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Contacts
							</p>
							<p className="text-3xl font-semibold">
								{totalContacts}
							</p>
							<p className="text-sm text-muted-foreground">
								Total contacts created
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Activity
							</p>
							<p className="text-3xl font-semibold">
								{totalActivities}
							</p>
							<p className="text-sm text-muted-foreground">
								Logged activity events
							</p>
						</CardContent>
					</Card>
					<Card className="border-border bg-background">
						<CardContent className="space-y-2 p-5">
							<p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
								Assigned
							</p>
							<p className="text-3xl font-semibold">
								{assignedContacts}
							</p>
							<p className="text-sm text-muted-foreground">
								Contacts assigned to reps
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			<Card className="border-border bg-background">
				<CardHeader>
					<CardTitle>Recent contacts</CardTitle>
					<CardDescription>
						Latest contacts created or updated in your organization.
					</CardDescription>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Contact</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Rep</TableHead>
								<TableHead>Last activity</TableHead>
								<TableHead className="text-right">
									Updated
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contacts.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center text-sm text-muted-foreground py-10"
									>
										No contacts yet. Create one with the
										Route API to start tracking activity.
									</TableCell>
								</TableRow>
							) : (
								contacts.map((contact) => (
									<TableRow key={contact.contactId}>
										<TableCell>
											<div className="font-medium">
												{contact.name ??
													contact.contactId}
											</div>
											<div className="text-xs text-muted-foreground">
												{contact.leadId ??
													"No lead linked"}
											</div>
										</TableCell>
										<TableCell>{contact.email}</TableCell>
										<TableCell>
											{contact.assignedRepId ? (
												<Badge variant="outline">
													{contact.assignedRepId}
												</Badge>
											) : (
												<Badge variant="secondary">
													Unassigned
												</Badge>
											)}
										</TableCell>
										<TableCell>
											{contact.activities.length > 0
												? new Date(
														contact.activities[0].timestamp,
													).toLocaleString()
												: "—"}
										</TableCell>
										<TableCell className="text-right text-sm text-muted-foreground">
											{new Date(
												contact.updatedAt,
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
