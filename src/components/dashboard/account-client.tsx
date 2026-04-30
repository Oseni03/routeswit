"use client";

import React, { useState } from "react";
import {
	Lock,
	ShieldCheck,
	Camera,
	Zap,
	Mail,
	Monitor,
	Sparkles,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { Session } from "@/lib/auth";
import { toast } from "sonner";
import { SetPasswordForm } from "@/components/forms/set-password-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export function AccountClient({ initialSession }: { initialSession: Session }) {
	const user = initialSession.user;
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState(user.name || "");
	const [title, setTitle] = useState(user.title || "");
	const [bio, setBio] = useState(user.bio || "");

	const handleUpdateProfile = async () => {
		setIsLoading(true);
		try {
			toast.loading("Saving profile data...");
			const { error } = await authClient.updateUser({
				name,
				title,
				bio,
			});

			if (error) throw error;

			toast.dismiss();
			toast.success("Profile updated");
		} catch (error) {
			console.error(error);
			toast.dismiss();
			toast.error("Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full space-y-12 animate-in fade-in duration-500 pb-20">
			{/* Page Header */}
			<div className="space-y-2">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">
					Profile Settings
				</h1>
				<p className="text-lg text-muted-foreground">
					Manage your public profile and account details.
				</p>
			</div>

			{/* Profile Section */}
			<section className="flex flex-col md:flex-row gap-8">
				<div className="w-full md:w-1/3 space-y-2">
					<h3 className="text-xl font-semibold text-foreground">
						Profile
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						This information will be displayed publicly so be
						careful what you share with others.
					</p>
				</div>
				<div className="w-full md:w-2/3 bg-card border border-border rounded-xl p-6 shadow-sm">
					<div className="space-y-8">
						{/* Avatar Upload */}
						<div className="flex items-center gap-6">
							<div className="relative group">
								<Avatar className="size-24 rounded-full border-4 border-muted/30 shadow-xl transition-transform group-hover:scale-[1.02]">
									<AvatarImage
										src={user.image || ""}
										alt={user.name || "User"}
										className="object-cover"
									/>
									<AvatarFallback className="text-xl font-medium bg-primary/5 text-primary">
										{user.name?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
								<Button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
									<Camera className="size-4" />
								</Button>
							</div>
							<div className="space-y-2">
								<Button
									variant="outline"
									size="sm"
									className="h-9 px-4 rounded-lg font-medium text-xs uppercase tracking-wider"
								>
									Change Photo
								</Button>
								<p className="text-[10px] uppercase font-medium tracking-widest text-muted-foreground opacity-50">
									JPG, GIF or PNG. Max 2MB.
								</p>
							</div>
						</div>

						{/* Name Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-3">
								<Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Full Name
								</Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Your Name"
									className="h-12 bg-muted/20 border-border/40 rounded-xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
								/>
							</div>
							<div className="space-y-3">
								<Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Title / Role
								</Label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="e.g. Lead Designer"
									className="h-12 bg-muted/20 border-border/40 rounded-xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
								/>
							</div>
						</div>

						{/* Bio */}
						<div className="space-y-3">
							<Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
								About You
							</Label>
							<span className="sr-only">Profile Bio</span>
							<Textarea
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								className="min-h-[120px] bg-muted/20 border-border/40 rounded-xl font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all py-3 px-4 resize-none"
							/>
							<p className="text-[10px] font-medium text-muted-foreground opacity-50">
								Brief description for your profile. URLs are
								hyperlinked.
							</p>
						</div>
					</div>
				</div>
			</section>

			<Separator className="bg-border/40" />

			{/* Account Section */}
			<section className="flex flex-col md:flex-row gap-8">
				<div className="w-full md:w-1/3 space-y-2">
					<h3 className="text-xl font-semibold text-foreground">
						Account Details
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Update your email address and manage security settings.
					</p>
				</div>
				<div className="w-full md:w-2/3 bg-card border border-border rounded-xl p-6 shadow-sm">
					<div className="space-y-8">
						<div className="space-y-3">
							<Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
								Email Address
							</Label>
							<div className="flex gap-3">
								<Input
									defaultValue={user.email}
									readOnly
									className="flex-1 h-12 bg-muted/20 border-border/40 rounded-xl font-bold text-sm opacity-60 grayscale cursor-not-allowed"
								/>
								<Badge
									variant="secondary"
									className="h-12 px-4 rounded-xl font-medium uppercase text-[10px] tracking-widest flex items-center gap-2"
								>
									<ShieldCheck className="size-3" />
									Verified
								</Badge>
							</div>
						</div>

						<div className="pt-2">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										className="h-12 px-6 rounded-xl font-medium uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 hover:bg-muted transition-all"
									>
										<Lock className="size-4" />
										Change Password
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md rounded-2xl border-border/40 shadow-2xl">
									<DialogHeader>
										<DialogTitle className="text-2xl font-semibold tracking-tight text-center pt-4">
											Change Password
										</DialogTitle>
									</DialogHeader>
									<div className="p-4">
										<SetPasswordForm />
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</section>

			<Separator className="bg-border/40" />

			{/* Notifications Section */}
			<section className="flex flex-col md:flex-row gap-8">
				<div className="w-full md:w-1/3 space-y-2">
					<h3 className="text-xl font-semibold text-foreground">
						Notifications
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Choose which communications you receive from the
						platform.
					</p>
				</div>
				<div className="w-full md:w-2/3 bg-card border border-border rounded-xl p-6 shadow-sm">
					<div className="space-y-6">
						<div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all group">
							<div className="flex gap-4 items-center">
								<div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
									<Mail className="size-5" />
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-widest mb-1">
										Email Notifications
									</p>
									<p className="text-xs text-muted-foreground font-medium opacity-60">
										Weekly reports and app updates via
										email.
									</p>
								</div>
							</div>
							<Switch
								defaultChecked
								className="data-[state=checked]:bg-primary"
							/>
						</div>

						<div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all group">
							<div className="flex gap-4 items-center">
								<div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
									<Monitor className="size-5" />
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-widest mb-1">
										Push Notifications
									</p>
									<p className="text-xs text-muted-foreground font-medium opacity-60">
										Browser notifications for mentions and
										direct messages.
									</p>
								</div>
							</div>
							<Switch className="data-[state=checked]:bg-primary" />
						</div>

						<div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all group">
							<div className="flex gap-4 items-center">
								<div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
									<Sparkles className="size-5" />
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-widest mb-1">
										New Features
									</p>
									<p className="text-xs text-muted-foreground font-medium opacity-60">
										Release notes and feature rollouts.
									</p>
								</div>
							</div>
							<Switch
								defaultChecked
								className="data-[state=checked]:bg-primary"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Footer Actions */}
			<div className="flex items-center justify-end gap-4 pt-12">
				<Button
					variant="ghost"
					className="h-12 px-8 rounded-xl font-medium uppercase text-[10px] tracking-widest opacity-40 hover:opacity-100 transition-opacity"
				>
					Cancel
				</Button>
				<Button
					onClick={handleUpdateProfile}
					disabled={isLoading}
					className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-medium uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-[0.98] transition-all"
				>
					{isLoading ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Zap className="size-4 fill-current" />
					)}
					Save Changes
				</Button>
			</div>
		</div>
	);
}
