"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Organization } from "@/types";
import { DialogFooter } from "../ui/dialog";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";

const formSchema = z.object({
	name: z.string().min(2).max(50),
	slug: z.string().min(2).max(50),
});

export function UpdateOrganizationForm({
	organization,
	onSuccess,
}: {
	organization: Organization;
	onSuccess?: () => void;
}) {
	const { updateOrganization } = useOrganizationStore((state) => state);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: organization.name,
			slug: organization.slug,
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			toast.loading("Updating Organization...");
			setIsLoading(true);

			const { success } = await updateOrganization(
				organization.id,
				values,
			);

			if (success) {
				toast.dismiss();
				toast.success("Organization updated successfully");
				onSuccess?.();
			} else {
				toast.dismiss();
				toast.error("Failed to update organization");
			}
		} catch (error) {
			console.error(error);
			toast.dismiss();
			toast.error("Process error in organization update");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Organization Name
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Acme Inc"
										{...field}
										className="h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
									/>
								</FormControl>
								<FormMessage className="text-[10px] font-bold" />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="slug"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Organization Slug
								</FormLabel>
								<FormControl>
									<Input
										placeholder="acme-inc"
										{...field}
										className="h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all"
									/>
								</FormControl>
								<FormMessage className="text-[10px] font-bold" />
							</FormItem>
						)}
					/>
				</div>

				<DialogFooter className="pt-6 border-t border-border/40">
					<Button
						disabled={isLoading}
						type="submit"
						className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-medium uppercase text-[11px] tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
					>
						{isLoading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Zap className="size-4 fill-current" />
						)}
						<span>Confirm Organization Update</span>
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
