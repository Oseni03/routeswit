"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Fingerprint, Loader2 } from "lucide-react";
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
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginContent = () => {
    const { user } = authClient.useSession().data || {};
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    if (!!user) {
        router.push("/dashboard");
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            const returnUrl = searchParams.get("callbackUrl") || "/dashboard";

            const { data, error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: returnUrl,
            });

            if (error) {
                toast.error(error.message || "Invalid login credentials");
            } else {
                toast.success("Signed in successfully!");
                if (data?.redirect) router.push(data.url || returnUrl);
                else router.push(returnUrl);
            }
        } catch (error) {
            toast.error("Failed to sign in");
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
        <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-8 relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <main className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Logo Section */}
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
                    <h1 className="text-4xl font-medium tracking-tighter text-foreground decoration-primary/30">
                        Sign In
                    </h1>
                    <p className="text-[10px] font-medium text-muted-foreground mt-3 uppercase tracking-[0.3em] opacity-40">
                        Access your account
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-background border border-border/60 p-10 rounded-[32px] shadow-2xl shadow-black/5 relative overflow-hidden group/card">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    <h2 className="text-xl font-medium tracking-tight mb-10 text-foreground">
                        Welcome Back
                    </h2>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {/* Email Field */}
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
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 transition-colors group-focus-within/input:text-foreground opacity-40" />
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

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                                                Password
                                            </FormLabel>
                                            <Link
                                                href="#"
                                                className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider opacity-40 hover:opacity-100"
                                            >
                                                Forgot Password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative group/input">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5 transition-colors group-focus-within/input:text-foreground opacity-40" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••••••"
                                                    {...field}
                                                    className="pl-12 h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:opacity-30"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-medium text-destructive/80" />
                                    </FormItem>
                                )}
                            />

                            {/* CTA */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-primary text-foreground-foreground font-medium uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-primary/10"
                            >
                                {isLoading ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                </div>

                {/* Footer Link */}
                <p className="mt-10 text-center text-sm font-medium text-muted-foreground">
                    <span className="opacity-40 font-medium uppercase text-[10px] tracking-widest mr-2">
                        Don&apos;t have an account?
                    </span>
                    <Link
                        href="/signup"
                        className="text-foreground font-medium hover:opacity-80 transition-opacity decoration-2 underline-offset-8"
                    >
                        Sign Up &rarr;
                    </Link>
                </p>
            </main>
        </div>
    );
};

const Login = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="size-10 animate-spin text-foreground opacity-20" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
};

export default Login;

