"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
	User,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Loader2,
	LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignupContent = () => {
	const { user } = authClient.useSession().data || {};
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	if (!!user) {
		router.push("/dashboard");
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true);
			const returnUrl = searchParams.get("callbackUrl") || "/dashboard";

			const { data, error } = await authClient.signUp.email({
				email: values.email,
				password: values.password,
				name: values.name,
				callbackURL: returnUrl,
			});

			if (error) {
				toast.error(error.message || "Invalid sign up credentials");
			} else {
				toast.success("Account created successfully!");
				if (data?.user) router.push(returnUrl);
			}
		} catch (error) {
			toast.error("Failed to sign up");
			console.error("Auth error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	const signInWithGoogle = async () => {
		try {
			setGoogleLoading(true);
			const returnUrl = searchParams.get("callbackUrl") || "/dashboard";

			const { data, error } = await authClient.signIn.social({
				provider: "google",
				callbackURL: returnUrl,
			});

			if (error) {
				toast.error(error.message || "Error during Google sign-in");
			} else if (data?.url) {
				toast.success("Redirecting to Google...");
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error during Google sign-in:", error);
			toast.error("Failed to sign in with Google");
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<div className="bg-background text-foreground min-h-screen selection:bg-primary/10 relative overflow-hidden font-sans">
			{/* Background Decor */}
			<div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-50">
				<div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"></div>
				<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
			</div>

			<main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 relative z-10">
				<div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
					{/* Header */}
					<div className="flex flex-col items-center mb-12 text-center">
						<Link
							href="/"
							className="group transition-all duration-500 hover:scale-110 active:scale-95 mb-8"
						>
							<img
								src={siteConfig.logoUrl}
								alt={`${siteConfig.name} logo`}
								className="h-14 w-14 rounded-2xl shadow-2xl shadow-primary/20 object-contain"
							/>
						</Link>
						<div className="text-center">
							<h1 className="text-4xl font-medium tracking-tighter text-foreground">
								Create Account
							</h1>
							<p className="text-[10px] font-medium text-muted-foreground mt-3 uppercase tracking-[0.3em] opacity-40">
								Get started with Foundry
							</p>
						</div>
					</div>

					{/* Card */}
					<div className="bg-background border border-border/60 p-10 rounded-[32px] shadow-2xl shadow-black/5 relative overflow-hidden">
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								{/* Name */}
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
												Full Name
											</FormLabel>
											<FormControl>
												<div className="relative group/input">
													<User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 transition-colors group-focus-within/input:text-primary opacity-40" />
													<Input
														placeholder="John Doe"
														{...field}
														className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:opacity-30"
													/>
												</div>
											</FormControl>
											<FormMessage className="text-[10px] font-medium text-destructive/80" />
										</FormItem>
									)}
								/>

								{/* Email */}
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
												Email Address
											</FormLabel>
											<FormControl>
												<div className="relative group/input">
													<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 transition-colors group-focus-within/input:text-primary opacity-40" />
													<Input
														placeholder="you@example.com"
														{...field}
														className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:opacity-30"
													/>
												</div>
											</FormControl>
											<FormMessage className="text-[10px] font-medium text-destructive/80" />
										</FormItem>
									)}
								/>

								{/* Password */}
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
												Password
											</FormLabel>
											<FormControl>
												<div className="relative group/input">
													<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 transition-colors group-focus-within/input:text-primary opacity-40" />
													<Input
														type={
															showPassword
																? "text"
																: "password"
														}
														placeholder="••••••••••••"
														{...field}
														className="pl-12 pr-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:opacity-30"
													/>
													<button
														type="button"
														onClick={() =>
															setShowPassword(
																!showPassword,
															)
														}
														className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none opacity-40 hover:opacity-100"
													>
														{showPassword ? (
															<EyeOff className="size-4" />
														) : (
															<Eye className="size-4" />
														)}
													</button>
												</div>
											</FormControl>
											<p className="text-[10px] text-muted-foreground font-medium opacity-40 ml-1">
												Must be at least 8 characters
												long.
											</p>
											<FormMessage className="text-[10px] font-medium text-destructive/80" />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									disabled={isLoading}
									className="w-full h-14 bg-primary text-primary-foreground font-medium uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-primary/10"
								>
									{isLoading ? (
										<Loader2 className="size-5 animate-spin" />
									) : (
										"Create Account"
									)}
								</Button>
							</form>
						</Form>

						{/* Social Divider */}
						<div className="relative my-10">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border/40"></div>
							</div>
							<div className="relative flex justify-center text-[10px] uppercase">
								<span className="bg-background px-4 text-muted-foreground font-medium tracking-[0.3em] opacity-30">
									Or continue with
								</span>
							</div>
						</div>

						{/* Socials */}
						<div className="grid grid-cols-2 gap-4">
							<Button
								variant="outline"
								onClick={signInWithGoogle}
								disabled={googleLoading}
								className="h-13 flex items-center justify-center gap-3 bg-muted/10 border-border/40 rounded-2xl text-[10px] font-medium uppercase tracking-widest hover:bg-muted/30 active:scale-[0.98] transition-all group/google"
							>
								{googleLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<>
										<svg
											className="size-4 transition-transform group-hover/google:scale-110"
											viewBox="0 0 24 24"
										>
											<path
												d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												fill="currentColor"
												className="text-[#4285F4]"
											/>
											<path
												d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												fill="currentColor"
												className="text-[#34A853]"
											/>
											<path
												d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
												fill="currentColor"
												className="text-[#FBBC05]"
											/>
											<path
												d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
												fill="currentColor"
												className="text-[#EA4335]"
											/>
										</svg>
										Google
									</>
								)}
							</Button>
							<Button
								variant="outline"
								className="h-13 flex items-center justify-center gap-3 bg-muted/10 border-border/40 rounded-2xl text-[10px] font-medium uppercase tracking-widest hover:bg-muted/30 active:scale-[0.98] transition-all group/github"
							>
								<LayoutGrid className="size-4 transition-transform group-hover/github:scale-110" />
								GitHub
							</Button>
						</div>
					</div>

					{/* Footer */}
					<div className="text-center mt-10 space-y-8">
						<p className="text-sm font-medium text-muted-foreground">
							<span className="opacity-40 font-medium uppercase text-[10px] tracking-widest mr-2">
								Already have an account?
							</span>
							<Link
								href="/login"
								className="text-primary font-medium hover:opacity-80 transition-opacity decoration-2 underline-offset-8"
							>
								Sign In &rarr;
							</Link>
						</p>
						<div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-30">
							<Link
								href="#"
								className="text-[9px] font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
							>
								Terms of Service
							</Link>
							<Link
								href="#"
								className="text-[9px] font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
							>
								Privacy Policy
							</Link>
							<Link
								href="#"
								className="text-[9px] font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
							>
								Support
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

const Signup = () => {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center bg-background">
				<Loader2 className="size-10 animate-spin text-primary opacity-20" />
			</div>
		}>
			<SignupContent />
		</Suspense>
	);
};

export default Signup;

