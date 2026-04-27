"use client";

import { ArrowLeft, type LucideIcon } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavMain({
	items,
	isAccountPage = false,
}: {
	items: {
		id: string;
		label: string;
		url: string;
		icon?: LucideIcon;
	}[];
	isAccountPage: boolean;
}) {
	const router = useRouter();
	const pathname = usePathname();
	return (
		<SidebarGroup className="px-2">
			<SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.25em] px-5 mb-4 opacity-30">
				Navigation
			</SidebarGroupLabel>
			<SidebarMenu className="gap-2">
				{isAccountPage && (
					<Link
						href="/dashboard"
						className={cn(
							"group px-5 py-3.5 flex items-center gap-4 transition-all duration-300 rounded-xl mx-2 text-muted-foreground hover:text-foreground hover:bg-accent font-medium",
						)}
					>
						<ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
						<span className="text-xs uppercase tracking-[0.1em]">
							Back to Dashboard
						</span>
					</Link>
				)}
				{items.map((item) => {
					const isActive = item.url === pathname;
					return (
						<SidebarMenuItem key={item.id}>
							<SidebarMenuButton
								asChild
								isActive={isActive}
								tooltip={item.label}
								className={cn(
									"group px-5 py-3.5 h-auto flex items-center gap-4 transition-all duration-300 rounded-xl relative",
									isActive
										? "bg-accent text-foreground font-medium shadow-sm"
										: "text-muted-foreground hover:text-foreground hover:bg-accent font-medium",
								)}
							>
								<Link href={item.url}>
									{item.icon && (
										<item.icon
											className={cn(
												"size-5",
												isActive
													? "text-primary transition-transform duration-500 scale-110"
													: "text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:scale-110",
											)}
										/>
									)}
									<span className="text-xs uppercase tracking-[0.1em]">
										{item.label}
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
