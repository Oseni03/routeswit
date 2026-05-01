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
                                Get started with {siteConfig.name}
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

