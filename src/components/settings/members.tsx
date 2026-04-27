"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, MoreHorizontal, Clock } from "lucide-react";
import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { InvitationForm } from "@/components/forms/invitation-form";
import { UpdateMemberRoleForm } from "@/components/forms/update-member-role-form";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Member } from "@/types";

export const MembersCard = () => {
	const {
		activeOrganization,
		members,
		invitations,
		isAdmin,
		removeMember,
		cancelInvitation,
	} = useOrganizationStore((state) => state);
	const { user } = authClient.useSession().data || {};

	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [isUpdateRoleOpen, setIsUpdateRoleOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

	const filteredMembers = members?.filter(
		(m) =>
			m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			m.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const pendingInvites = invitations?.filter(
		(inv) => inv.status === "pending",
	);

	async function handleRemoveMember(memberId: string) {
		const member = members?.find((m) => m.id === memberId);
		if (member) {
			setMemberToRemove(member);
			setIsRemoveDialogOpen(true);
		}
	}

	async function confirmRemoveMember() {
		if (!memberToRemove || !activeOrganization) return;

		try {
			toast.loading("Removing member...");
			const { success, error } = await removeMember(
				memberToRemove.id,
				activeOrganization.id,
			);
			if (error || !success) {
				toast.dismiss();
				toast.error("Unable to remove member");
			} else {
				toast.dismiss();
				toast.success("Member removed successfully");
			}
		} catch (error) {
			toast.dismiss();
			toast.error("Failed to remove member");
		} finally {
			setIsRemoveDialogOpen(false);
			setMemberToRemove(null);
		}
	}

	async function handleCancelInvite(invitationId: string) {
		try {
			toast.loading("Canceling invite...");
			const { success } = await cancelInvitation(invitationId);
			if (!success) {
				toast.dismiss();
				toast.error("Failed to cancel invite");
			} else {
				toast.dismiss();
				toast.success("Invite canceled successfully");
			}
		} catch (error) {
			toast.dismiss();
			toast.error("Failed to cancel invite");
		}
	}
	return (
		<div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
			{/* Header / Controls Section */}
			<div className="bg-background border border-border/60 rounded-[32px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div className="space-y-1">
						<h2 className="text-xl font-semibold tracking-tighter">
							Team Members
						</h2>
						<p className="text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
							Manage your team and permissions
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
						<div className="relative w-full sm:w-80 group/search">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5  transition-colors group-focus-within/search:text-primary opacity-40" />
							<input
								className="w-full pl-12 pr-4 h-12 bg-muted/20 border-border/40 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:outline-none transition-all placeholder:opacity-30"
								placeholder="Search for members..."
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<Dialog
							open={isInviteOpen}
							onOpenChange={setIsInviteOpen}
						>
							<DialogTrigger asChild>
								<Button
									className="w-full sm:w-auto bg-primary text-primary-foreground px-8 h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/10"
									disabled={!isAdmin}
								>
									<UserPlus className="size-4" />
									<span>Invite Member</span>
								</Button>
							</DialogTrigger>
							<DialogContent className="rounded-[32px] border-border/60 shadow-2xl">
								<DialogHeader>
									<DialogTitle className="text-xl font-semibold tracking-tighter">
										Invite Team Member
									</DialogTitle>
									<DialogDescription className="text-xs font-medium ">
										Send an invitation to join your
										organization.
									</DialogDescription>
								</DialogHeader>
								<InvitationForm
									onSuccess={() => setIsInviteOpen(false)}
								/>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</div>

			{/* Update Member Role Dialog */}
			<Dialog open={isUpdateRoleOpen} onOpenChange={setIsUpdateRoleOpen}>
				<DialogContent className="rounded-[32px] border-border/60 shadow-2xl">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold tracking-tighter">
							Update Member Role
						</DialogTitle>
						<DialogDescription className="text-xs font-medium ">
							Change the role for this team member.
						</DialogDescription>
					</DialogHeader>
					{selectedMember && (
						<UpdateMemberRoleForm
							defaultValues={{
								email: selectedMember.user.email,
								role:
									selectedMember.role === "owner"
										? "admin"
										: (selectedMember.role as
												| "admin"
												| "member"),
							}}
							memberId={selectedMember.id}
							onSuccess={() => setIsUpdateRoleOpen(false)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Members Table */}
			<div className="bg-background rounded-[32px] border border-border/60 overflow-hidden shadow-2xl shadow-black/5">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="bg-muted/10 border-b border-border/40">
								<th className="px-10 py-5 text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
									Member
								</th>
								<th className="px-10 py-5 text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
									Email
								</th>
								<th className="px-10 py-5 text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
									Role
								</th>
								<th className="px-10 py-5 text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
									Status
								</th>
								<th className="px-10 py-5 text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40"></th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/30">
							{/* Active Members */}
							{filteredMembers?.map((member) => (
								<tr
									key={member.id}
									className="hover:bg-muted/5 transition-colors group"
								>
									<td className="px-10 py-6">
										<div className="flex items-center gap-4">
											<Avatar className="size-9 border border-border/40 shadow-sm rounded-xl">
												<AvatarImage
													src={member.user.image}
												/>
												<AvatarFallback className="bg-primary/5 text-primary text-[10px] font-medium">
													{member.user.name
														.charAt(0)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="text-sm font-medium text-foreground tracking-tight">
													{member.user.name}
												</span>
												{member.userId === user?.id && (
													<span className="text-[9px] font-medium text-primary uppercase tracking-widest opacity-60">
														You
													</span>
												)}
											</div>
										</div>
									</td>
									<td className="px-10 py-6">
										<span className="text-xs font-medium  opacity-60">
											{member.user.email}
										</span>
									</td>
									<td className="px-10 py-6">
										<Badge
											variant={
												member.role === "admin"
													? "default"
													: "outline"
											}
											className={cn(
												"rounded-lg text-[9px] font-medium uppercase px-2.5 py-1 tracking-widest shadow-none transition-all",
												member.role === "admin"
													? "bg-primary text-primary-foreground"
													: " border-border/40 bg-muted/5",
											)}
										>
											{member.role === "owner"
												? "admin"
												: member.role}
										</Badge>
									</td>
									<td className="px-10 py-6">
										<div className="flex items-center gap-2.5">
											<div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
											<span className="text-[10px] font-medium text-foreground uppercase tracking-widest opacity-60">
												Active
											</span>
										</div>
									</td>
									<td className="px-10 py-6 text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="size-9 rounded-xl hover:bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity"
												>
													<MoreHorizontal className="size-4.5 " />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-48 rounded-2xl border-border/60 shadow-xl p-2"
											>
												<DropdownMenuItem
													disabled={
														!isAdmin ||
														member.userId ===
															user?.id
													}
													className="rounded-xl font-bold text-xs py-2.5 px-3"
													onClick={() => {
														setSelectedMember(
															member,
														);
														setIsUpdateRoleOpen(
															true,
														);
													}}
												>
													Change Role
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive rounded-xl font-bold text-xs py-2.5 px-3 mt-1"
													disabled={
														!isAdmin ||
														member.userId ===
															user?.id
													}
													onClick={() =>
														handleRemoveMember(
															member.id,
														)
													}
												>
													Remove Member
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</td>
								</tr>
							))}

							{/* Pending Invites */}
							{pendingInvites?.map((invite) => (
								<tr
									key={invite.id}
									className="bg-muted/5 hover:bg-muted/10 transition-colors group"
								>
									<td className="px-10 py-6">
										<div className="flex items-center gap-4 opacity-50">
											<Avatar className="size-9 border border-border/40 border-dashed rounded-xl">
												<AvatarFallback className="bg-transparent  text-[10px] font-medium">
													?
												</AvatarFallback>
											</Avatar>
											<span className="text-xs font-medium  uppercase tracking-wider">
												Pending
											</span>
										</div>
									</td>
									<td className="px-10 py-6">
										<span className="text-xs font-bold  opacity-30">
											{invite.email}
										</span>
									</td>
									<td className="px-10 py-6">
										<Badge
											variant="outline"
											className="rounded-lg text-[9px] font-medium uppercase px-2.5 py-1 tracking-widest /30 border-dashed border-border/40 bg-transparent"
										>
											{invite.role}
										</Badge>
									</td>
									<td className="px-10 py-6">
										<div className="flex items-center gap-2.5 /30">
											<Clock className="size-3.5 animate-pulse" />
											<span className="text-[10px] font-medium uppercase tracking-widest">
												Invitation Sent
											</span>
										</div>
									</td>
									<td className="px-10 py-6 text-right">
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive font-medium uppercase text-[10px] tracking-widest hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={() =>
												handleCancelInvite(invite.id)
											}
											disabled={!isAdmin}
										>
											Cancel
										</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="px-10 py-5 bg-muted/5 border-t border-border/30 flex justify-between items-center">
					<p className="text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
						TOTAL MEMBERS:{" "}
						{(filteredMembers?.length || 0) +
							(pendingInvites?.length || 0)}
					</p>
					<div className="flex gap-3">
						<Button
							variant="outline"
							size="sm"
							className="h-10 px-4 rounded-xl font-medium uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10 opacity-40"
							disabled
						>
							PREVIOUS
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-10 px-4 rounded-xl font-medium uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10 opacity-40"
							disabled
						>
							NEXT PAGE
						</Button>
					</div>
				</div>
			</div>

			{/* Remove Member Confirmation Dialog */}
			<AlertDialog
				open={isRemoveDialogOpen}
				onOpenChange={setIsRemoveDialogOpen}
			>
				<AlertDialogContent className="rounded-[32px] border-border/60 shadow-2xl p-10">
					<AlertDialogHeader className="space-y-6">
						<AlertDialogTitle className="text-xl font-medium tracking-tighter">
							Remove Member
						</AlertDialogTitle>
						<AlertDialogDescription className="text-xs font-bold  p-4 bg-destructive/5 rounded-2xl border border-destructive/10 leading-loose">
							Are you sure you want to remove{" "}
							<span className="text-foreground font-medium uppercase tracking-widest">
								{memberToRemove?.user.name}
							</span>{" "}
							from the organization? They will lose access to all
							projects and data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-10 gap-4">
						<AlertDialogCancel
							className="h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10"
							onClick={() => {
								setIsRemoveDialogOpen(false);
								setMemberToRemove(null);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveMember}
							className="bg-destructive text-destructive-foreground h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-destructive/10 active:scale-95"
						>
							Remove Member
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
