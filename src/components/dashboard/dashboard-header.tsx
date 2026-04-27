"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, ChevronRight, Moon, Sun, Monitor } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { siteConfig } from "@/config/site";

export function DashboardHeader() {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const pathSegments = pathname.split("/").filter(Boolean);
	const currentPage = pathSegments[pathSegments.length - 1] || "Dashboard";
	const formattedPage =
		currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

	const currentTheme = mounted ? theme : "system";
	const ThemeIcon =
		currentTheme === "dark"
			? Moon
			: currentTheme === "light"
				? Sun
				: Monitor;

	const cycleTheme = () => {
		if (!mounted) return;
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	return (
		<header className="h-16 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border">
			{/* Breadcrumb */}
			<div className="flex items-center gap-2 text-muted-foreground">
				<img
					src={siteConfig.logoUrl}
					alt={`${siteConfig.name} logo`}
					className="h-5 w-5 rounded-lg object-contain"
				/>
				<span className="text-sm font-medium">{siteConfig.name}</span>
				<ChevronRight className="size-3" />
				<span className="text-sm font-semibold text-foreground">
					{formattedPage}
				</span>
			</div>

			{/* Search, Theme Toggle & Notifications */}
			<div className="flex items-center gap-2">
				<div className="relative group hidden sm:block">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within:text-primary transition-colors" />
					<input
						type="text"
						placeholder="Search resources..."
						className="pl-10 pr-4 py-1.5 text-sm bg-muted/50 border border-border rounded-lg w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
					/>
				</div>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Toggle theme"
					onClick={cycleTheme}
				>
					<ThemeIcon className="size-5 text-muted-foreground transition-colors hover:text-foreground" />
				</Button>
				<Button className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all relative">
					<Bell className="size-5" />
					<span className="absolute top-1 right-1 size-2 bg-primary rounded-full border-2 border-background"></span>
				</Button>
			</div>
		</header>
	);
}
