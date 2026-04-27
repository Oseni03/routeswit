"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
	ShieldCheck,
	Lock,
	Monitor,
	Smartphone,
	LogOut,
	CheckCircle2,
	History,
	Shield,
	Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	changePassword,
	getActiveSessions,
	revokeOtherSessions,
	getTwoFactorStatus,
} from "@/server/security";
import { toast } from "sonner";
import { Session } from "better-auth";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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

const SecurityCard = () => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(true);
	const [isRevokingSessions, setIsRevokingSessions] = useState(false);

	const [twoFactorStatus, setTwoFactorStatus] = useState({
		enabled: false,
		hasSetup: false,
	});
	const [isLoading2FA, setIsLoading2FA] = useState(true);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalPassword, setModalPassword] = useState("");
	const [isProcessing2FA, setIsProcessing2FA] = useState(false);
	const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

	useEffect(() => {
		loadSecurityData();
	}, []);

	const loadSecurityData = async () => {
		try {
			const [sessionsResult, twoFactorResult] = await Promise.all([
				getActiveSessions(),
				getTwoFactorStatus(),
			]);

			if (sessionsResult.success && sessionsResult.data) {
				setSessions(sessionsResult.data);
			}
			if (twoFactorResult.success && twoFactorResult.data) {
				setTwoFactorStatus(twoFactorResult.data);
			}
		} catch (error) {
			console.error("Failed to load security data:", error);
		} finally {
			setIsLoadingSessions(false);
			setIsLoading2FA(false);
		}
	};

	const handlePasswordChange = async () => {
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}

		setIsChangingPassword(true);
		try {
			const result = await changePassword(currentPassword, newPassword);
			if (result.success) {
				toast.success(result.message);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to change password");
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleRevokeOtherSessions = async () => {
		setIsRevokeDialogOpen(true);
	};

	const confirmRevokeSessions = async () => {
		setIsRevokingSessions(true);
		try {
			const result = await revokeOtherSessions();
			if (result.success) {
				toast.success(result.message);
				loadSecurityData(); // Reload sessions
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to revoke sessions");
		} finally {
			setIsRevokingSessions(false);
			setIsRevokeDialogOpen(false);
		}
	};

	const handleEnable2FA = async () => {
		if (!modalPassword.trim()) {
			toast.error("Password is required");
			return;
		}

		setIsProcessing2FA(true);
		try {
			const result = await authClient.twoFactor.enable({
				password: modalPassword,
			});
			if (result.data) {
				toast.success(
					"2FA setup initiated. Check your authenticator app.",
				);
				setIsModalOpen(false);
				setModalPassword("");
				loadSecurityData();
			}
		} catch (error) {
			toast.error("Failed to enable 2FA");
		} finally {
			setIsProcessing2FA(false);
		}
	};

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Left Column: Primary Actions */}
				<div className="lg:col-span-5 space-y-10">
					{/* Password Section */}
					<div className="bg-background border border-border/60 rounded-[32px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
						<div className="flex items-center gap-3 mb-10">
							<div className="size-10 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
								<Lock className="size-5 text-primary" />
							</div>
							<div>
								<h3 className="text-xl font-semibold tracking-tighter">
									Security
								</h3>
								<p className="text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
									Manage your password and keys
								</p>
							</div>
						</div>

						<div className="space-y-8">
							<div className="space-y-3">
								<Label className="text-[10px] font-medium  uppercase tracking-[0.2em] ml-1">
									Current Password
								</Label>
								<Input
									type="password"
									placeholder="••••••••••••"
									value={currentPassword}
									onChange={(e) =>
										setCurrentPassword(e.target.value)
									}
									className="bg-muted/20 border-border/40 h-14 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-mono"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
								<div className="space-y-3">
									<Label className="text-[10px] font-medium  uppercase tracking-[0.2em] ml-1">
										New Password
									</Label>
									<Input
										type="password"
										placeholder="••••••••••••"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
										className="bg-muted/20 border-border/40 h-14 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-mono"
									/>
								</div>
								<div className="space-y-3">
									<Label className="text-[10px] font-medium  uppercase tracking-[0.2em] ml-1">
										Confirm New Password
									</Label>
									<Input
										type="password"
										placeholder="••••••••••••"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
										className="bg-muted/20 border-border/40 h-14 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-mono"
									/>
								</div>
							</div>
						</div>

						<div className="mt-12 pt-8 border-t border-border/40 flex justify-end gap-4">
							<Button
								variant="ghost"
								onClick={() => {
									setCurrentPassword("");
									setNewPassword("");
									setConfirmPassword("");
								}}
								className="h-14 px-8 font-medium uppercase text-[10px] tracking-widest opacity-40 hover:opacity-100 transition-opacity"
							>
								Reset Fields
							</Button>
							<Button
								onClick={handlePasswordChange}
								disabled={isChangingPassword}
								className="bg-primary text-primary-foreground font-medium uppercase text-[11px] tracking-widest px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
							>
								{isChangingPassword ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Updating...
									</>
								) : (
									"Update Password"
								)}
							</Button>
						</div>
					</div>
				</div>

				{/* Right Column: Status & Sessions */}
				<div className="lg:col-span-7 space-y-10">
					{/* MFA Status */}
					<div className="bg-background border border-border/60 rounded-[32px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-3">
								<div className="size-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
									<ShieldCheck className="size-5 text-emerald-500" />
								</div>
								<div>
									<h3 className="text-xl font-medium tracking-tighter">
										Two-Factor Auth
									</h3>
									<p className="text-[10px] font-medium text-emerald-500 uppercase tracking-[0.2em] opacity-60">
										{isLoading2FA
											? "Loading..."
											: twoFactorStatus.enabled
												? "Enhanced Security"
												: "Not Enabled"}
									</p>
								</div>
							</div>
							<div className="relative inline-flex items-center cursor-pointer scale-90">
								<Dialog
									open={isModalOpen}
									onOpenChange={setIsModalOpen}
								>
									<DialogTrigger asChild>
										<div
											className={cn(
												"w-12 h-7 rounded-full flex items-center px-1 transition-colors",
												twoFactorStatus.enabled
													? "bg-emerald-500"
													: "bg-muted",
											)}
										>
											<div
												className={cn(
													"size-5 rounded-full shadow-lg transition-transform",
													twoFactorStatus.enabled
														? "translate-x-full bg-white"
														: "bg-white/50",
												)}
											/>
										</div>
									</DialogTrigger>
									<DialogContent className="sm:max-w-md">
										<DialogHeader>
											<DialogTitle>
												Enable Two-Factor Authentication
											</DialogTitle>
											<DialogDescription>
												Enter your password to enable
												2FA. You&apos;ll need to scan a
												QR code with your authenticator
												app.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="password">
													Password
												</Label>
												<Input
													id="password"
													type="password"
													placeholder="Enter your password"
													value={modalPassword}
													onChange={(e) =>
														setModalPassword(
															e.target.value,
														)
													}
													className="bg-muted/20 border-border/40 h-12 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
												/>
											</div>
										</div>
										<div className="flex justify-end gap-3">
											<Button
												variant="outline"
												onClick={() => {
													setIsModalOpen(false);
													setModalPassword("");
												}}
												disabled={isProcessing2FA}
												className="h-12 px-6"
											>
												Cancel
											</Button>
											<Button
												onClick={handleEnable2FA}
												disabled={
													isProcessing2FA ||
													!modalPassword.trim()
												}
												className="h-12 px-6"
											>
												{isProcessing2FA ? (
													<>
														<Loader2 className="size-4 animate-spin mr-2" />
														Enabling...
													</>
												) : (
													"Enable 2FA"
												)}
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
						<p className="text-xs  font-bold leading-relaxed mb-8 opacity-60">
							Secure your account with two-factor authentication.
						</p>
						{twoFactorStatus.enabled ? (
							<div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-4">
								<CheckCircle2 className="size-5 text-emerald-500 mt-0.5 shrink-0" />
								<p className="text-[11px] font-medium text-emerald-600/80 leading-tight uppercase tracking-wide">
									Authenticator app verification is currently
									active and verified.
								</p>
							</div>
						) : (
							<div className="p-6 bg-muted/10 border border-border/40 rounded-2xl">
								<p className="text-[11px] font-medium  leading-tight">
									Enable two-factor authentication to add an
									extra layer of security to your account.
								</p>
							</div>
						)}
					</div>

					{/* Sessions Section */}
					<div className="bg-background border border-border/60 rounded-[32px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
						<div className="flex items-center justify-between mb-10">
							<div className="flex items-center gap-3">
								<div className="size-10 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
									<History className="size-5 text-primary" />
								</div>
								<div>
									<h3 className="text-xl font-medium tracking-tighter">
										Live Sessions
									</h3>
									<p className="text-[10px] font-medium  uppercase tracking-[0.2em] opacity-40">
										Current active devices
									</p>
								</div>
							</div>
							<span className="bg-muted/20 border border-border/40 text-[9px] font-medium h-5 uppercase tracking-widest px-2.5 rounded-md flex items-center">
								{isLoadingSessions
									? "..."
									: `${sessions.length} ACTIVE`}
							</span>
						</div>

						<div className="space-y-8">
							{isLoadingSessions ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="size-6 animate-spin" />
								</div>
							) : sessions.length === 0 ? (
								<div className="text-center py-8 ">
									<Monitor className="size-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm">
										No active sessions
									</p>
								</div>
							) : (
								sessions.map((session, i) => (
									<div
										key={session.id}
										className={cn(
											"flex items-start gap-5 group/session transition-all duration-300",
											session.id !== sessions[0]?.id &&
												"opacity-40 hover:opacity-100",
										)}
									>
										<div className="size-12 rounded-2xl border border-border/40 bg-muted/10 flex items-center justify-center shrink-0 group-hover/session:border-primary/40 transition-colors">
											{session.userAgent?.includes(
												"Mobile",
											) ||
											session.userAgent?.includes(
												"iPhone",
											) ||
											session.userAgent?.includes(
												"Android",
											) ? (
												<Smartphone className="size-5 " />
											) : (
												<Monitor className="size-5 " />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3">
												<p className="text-sm font-medium truncate tracking-tight">
													{session.userAgent?.split(
														" ",
													)[0] || "Unknown Device"}
												</p>
												{session.id ===
													sessions[0]?.id && (
													<span className="text-[8px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium uppercase tracking-tighter">
														CURRENT
													</span>
												)}
											</div>
											<p className="text-[10px] font-bold  truncate opacity-60 mt-1">
												{session.ipAddress ||
													"Unknown Location"}{" "}
												•{" "}
												{session.userAgent
													?.split(" ")
													.slice(1)
													.join(" ") ||
													"Unknown Browser"}
											</p>
										</div>
									</div>
								))
							)}
						</div>

						<div className="mt-12 pt-8 border-t border-border/40">
							<button
								onClick={handleRevokeOtherSessions}
								disabled={isRevokingSessions}
								className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl hover:bg-destructive/5 text-[10px] font-medium uppercase tracking-[0.2em]  hover:text-destructive transition-all border border-transparent hover:border-destructive/20 disabled:opacity-50"
							>
								{isRevokingSessions ? (
									<Loader2 className="size-3 animate-spin" />
								) : (
									<LogOut className="size-3" />
								)}
								Sign out other devices
							</button>
						</div>
					</div>

					{/* Security Score Banner */}
					<div className="bg-primary text-primary-foreground rounded-[32px] p-10 relative overflow-hidden group shadow-2xl shadow-primary/20">
						<div className="relative z-10 space-y-6">
							<div className="space-y-1">
								<h3 className="text-5xl font-medium tracking-tighter">
									92
								</h3>
								<p className="text-[10px] font-medium uppercase tracking-[0.3em] opacity-60">
									Security Score
								</p>
							</div>
							<p className="text-xs font-bold leading-relaxed opacity-80 max-w-[240px]">
								Your account is currently rated as &quot;Highly
								Secure&quot;. Complete the remaining steps to
								reach 100%.
							</p>
							<Button className="bg-white text-primary rounded-2xl h-14 px-8 font-medium uppercase text-[11px] tracking-widest hover:bg-white/90 shadow-2xl active:scale-95 transition-all">
								Review Security
							</Button>
						</div>
						<Shield className="absolute -right-12 -bottom-12 size-64 text-white/5 -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-1000" />

						{/* Decorative scan line */}
						<div className="absolute top-0 left-0 w-full h-1 bg-white/10 blur-sm animate-pulse" />
					</div>
				</div>
			</div>

			{/* Revoke Sessions Confirmation Dialog */}
			<AlertDialog
				open={isRevokeDialogOpen}
				onOpenChange={setIsRevokeDialogOpen}
			>
				<AlertDialogContent className="rounded-[32px] border-border/60 shadow-2xl p-10">
					<AlertDialogHeader className="space-y-6">
						<AlertDialogTitle className="text-xl font-medium tracking-tighter">
							Revoke Other Sessions
						</AlertDialogTitle>
						<AlertDialogDescription className="text-xs font-bold  p-4 bg-destructive/5 rounded-2xl border border-destructive/10 leading-loose">
							This will sign out all other devices and browsers
							that are currently logged into your account. You
							will remain signed in on this device.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-10 gap-4">
						<AlertDialogCancel className="h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest border-border/40 hover:bg-muted/10">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRevokeSessions}
							disabled={isRevokingSessions}
							className="bg-destructive text-destructive-foreground h-12 rounded-xl font-medium uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-destructive/10 active:scale-95"
						>
							{isRevokingSessions ? (
								<>
									<Loader2 className="size-4 animate-spin mr-2" />
									Revoking...
								</>
							) : (
								<>
									<LogOut className="size-4" />
									Revoke Sessions
								</>
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default SecurityCard;
