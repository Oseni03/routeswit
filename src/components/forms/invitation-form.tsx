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
import { Loader2, Send } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { DialogFooter } from "../ui/dialog";
import { useOrganizationStore } from "@/zustand/providers/organization-store-provider";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	role: z.enum(["admin", "member"]),
});

export function InvitationForm({ onSuccess }: { onSuccess: () => void }) {
	const [isLoading, setIsLoading] = useState(false);
	const { inviteMember, activeOrganization: organization } =
		useOrganizationStore((state) => state);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			role: "member",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			toast.loading("Sending invitation...");
			setIsLoading(true);

			if (!organization) return;

			const { error, success } = await inviteMember(organization.id, {
				email: values.email,
				role: values.role,
			});

			if (!success) {
				console.error("Error creating invite: ", error);
				toast.dismiss();
				toast.error(error || "Failed to send invitation");
			} else {
				toast.dismiss();
				toast.success(`Invitation sent to ${values.email}`);
				onSuccess();
			}
		} catch (error) {
			console.error(error);
			toast.dismiss();
			toast.error("Failed to send invitation");
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
						name="email"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Email Address
								</FormLabel>
								<FormControl>
									<Input
										placeholder="user@example.com"
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
						name="role"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] ml-1">
									Role
								</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="h-14 bg-muted/20 border-border/40 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all">
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="rounded-2xl border-border/60 shadow-xl">
										<SelectItem
											value="member"
											className="rounded-xl font-bold text-xs py-3"
										>
											Member
										</SelectItem>
										<SelectItem
											value="admin"
											className="rounded-xl font-bold text-xs py-3"
										>
											Admin
										</SelectItem>
									</SelectContent>
								</Select>
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
							<Send className="size-4 fill-current" />
						)}
						<span>Send Invitation</span>
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
