"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaintBucket, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const ThemeCard = () => {
	const { theme, setTheme } = useTheme();
	const { data: session } = authClient.useSession();

	// Initialize theme from user's database preference
	useEffect(() => {
		if (session?.user?.theme && session.user.theme !== theme) {
			setTheme(session.user.theme);
		}
	}, [session?.user?.theme, setTheme, theme]);

	const handleThemeChange = async (newTheme: string) => {
		setTheme(newTheme);
		try {
			await authClient.updateUser({
				theme: newTheme,
			});
		} catch (error) {
			console.error("Failed to save theme preference:", error);
			toast.error("Failed to save theme preference");
		}
	};

	const themeOptions = [
		{
			value: "light",
			label: "Light Mode",
			description: "Clean interface for bright environments.",
			icon: Sun,
		},
		{
			value: "dark",
			label: "Dark Mode",
			description: "Easier on the eyes in low light.",
			icon: Moon,
		},
		{
			value: "system",
			label: "System",
			description: "Match your computer's theme settings.",
			icon: Monitor,
		},
	];

	return (
		<div className="bg-background border border-border/60 rounded-[32px] p-10 shadow-2xl shadow-black/5 relative overflow-hidden group transition-all duration-500 hover:shadow-black/10">
			<div className="flex items-center gap-3 mb-10">
				<div className="size-10 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
					<PaintBucket className="size-5 text-primary" />
				</div>
				<div>
					<h3 className="text-xl font-medium tracking-tighter">
						Theme & Appearance
					</h3>
					<p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-40">
						Customize how the application looks
					</p>
				</div>
			</div>

			<div className="space-y-8">
				{/* Theme Selection */}
				<div className="space-y-4">
					<RadioGroup
						value={theme}
						onValueChange={handleThemeChange}
						className="grid grid-cols-1 md:grid-cols-3 gap-6"
					>
						{themeOptions.map((option) => {
							const IconComponent = option.icon;
							const isActive = theme === option.value;
							return (
								<div key={option.value} className="relative">
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className="peer sr-only"
									/>
									<Label
										htmlFor={option.value}
										className={cn(
											"flex flex-col items-center justify-center rounded-[24px] border border-border/40 bg-muted/5 p-8 cursor-pointer transition-all duration-300 group/item hover:bg-muted/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
											isActive &&
												"border-primary bg-primary/5",
										)}
									>
										<div
											className={cn(
												"mb-4 size-12 rounded-2xl flex items-center justify-center transition-all duration-500",
												isActive
													? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
													: "bg-background text-muted-foreground group-hover/item:text-primary group-hover/item:scale-105",
											)}
										>
											<IconComponent className="size-6" />
										</div>
										<div className="text-center space-y-1">
											<div
												className={cn(
													"text-sm font-medium tracking-tight transition-colors",
													isActive
														? "text-foreground"
														: "text-muted-foreground group-hover/item:text-foreground",
												)}
											>
												{option.label}
											</div>
											<div className="text-[10px] font-bold text-muted-foreground/60 leading-tight max-w-[140px]">
												{option.description}
											</div>
										</div>

										{/* Active Indicator Dot */}
										{isActive && (
											<div className="absolute top-4 right-4 size-2 bg-primary rounded-full animate-pulse" />
										)}
									</Label>
								</div>
							);
						})}
					</RadioGroup>
				</div>

				<div className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-30 pt-4 flex items-center gap-2">
					<div className="h-px flex-1 bg-border/40" />
					<span>Changes are saved automatically</span>
					<div className="h-px flex-1 bg-border/40" />
				</div>
			</div>

			{/* Background Decoration */}
			<div className="absolute -right-20 -bottom-20 size-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
		</div>
	);
};
