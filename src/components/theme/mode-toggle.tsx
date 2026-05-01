"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return (
        <Button variant="ghost" size="icon" className="w-9 px-0">
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );

	const cycleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

	return (
		<Button variant="ghost" size="icon" onClick={cycleTheme} className="w-9 px-0">
			<Icon className="h-[1.2rem] w-[1.2rem] transition-all" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
