"use client";

import * as React from "react";
import {
	Settings,
	User,
	LayoutDashboard,
	KeyRound,
	Users,
	Route,
	Contact,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { FeedbackModal } from "@/components/feedback-modal";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

// This is sample data.
const dashboardItems = [
	{
		id: "dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		url: "/dashboard",
	},
	{
		id: "reps",
		label: "Reps",
		icon: Users,
		url: "/dashboard/reps",
	},
	{
		id: "rulesets",
		label: "Rulesets",
		icon: Route,
		url: "/dashboard/rulesets",
	},
	{
		id: "contacts",
		label: "Contacts",
		icon: Contact,
		url: "/dashboard/contacts",
	},
	{
		id: "api-keys",
		label: "API Keys",
		icon: KeyRound,
		url: "/dashboard/api-keys",
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		url: "/dashboard/settings",
	},
];

const accountItems = [
	{
		id: "profile",
		label: "Profile",
		url: "/dashboard/account",
		icon: User,
	},
	{
		id: "settings",
		label: "Settings",
		url: "/dashboard/settings",
		icon: Settings,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const isAccountPage = pathname.includes("/dashboard/account");
	const items = isAccountPage ? accountItems : dashboardItems;

	return (
		<Sidebar
			collapsible="icon"
			className="border-r border-border bg-sidebar"
			{...props}
		>
			<SidebarHeader className="pt-4 px-3">
				<TeamSwitcher />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={items} isAccountPage={isAccountPage} />
			</SidebarContent>
			<SidebarFooter className="pb-6 px-3 gap-2">
				<FeedbackModal />
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
