"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
});

interface ProfileFormProps {
    initialData: {
        name: string;
        email: string;
    };
    onCancel: () => void;
    onSuccess?: () => void;
}

export function ProfileForm({
    initialData,
    onCancel,
    onSuccess,
}: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            email: initialData.email,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            toast.loading("Updating profile...");
            const data = await authClient.updateUser({
                name: values.name,
            });

            if (!data.error && data.data) {
                toast.dismiss();
                toast.success("Profile updated");
                onSuccess?.();
            } else {
                throw new Error(
                    data.error?.message || "Failed to update profile"
                );
            }
        } catch (error) {
            console.log("Error updating profile: ", error);
            toast.dismiss();
            toast.error("Process error in profile update");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        className="h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-sans"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="user@example.com"
                                        type="email"
                                        disabled
                                        className="h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-bold opacity-60 grayscale cursor-not-allowed"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/40">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-primary text-primary-foreground h-14 rounded-2xl font-medium uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Zap className="size-4 fill-current" />
                        )}
                        <span>Save Changes</span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="h-14 px-8 rounded-2xl font-medium uppercase text-[11px] tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
