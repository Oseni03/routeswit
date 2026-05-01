"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../theme/mode-toggle";

function Header() {
	const { user } = authClient.useSession().data || {};
	const router = useRouter();
	const pathname = usePathname();

	const handleSignOut = async () => {
		try {
			toast.loading("Signing out");
			authClient.signOut();
			toast.dismiss();
			toast.success("Signed out");
			router.push("/");
		} catch (error) {
			console.log("Error signing out: ", error);
			toast.dismiss();
			toast.error("Error signing out");
		}
	};
	return (
		<motion.header
			initial={{ y: -18, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.55, ease: [0, 0, 0.58, 1] }}
			className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
		>
			<nav className="flex justify-between items-center w-full px-6 py-3 max-w-[1400px] mx-auto">
				<div className="flex items-center gap-10">
					<Link href="/" className="inline-flex items-center gap-3 group transition-all">
						<div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
							<img
								src={siteConfig.logoUrl}
								alt={`${siteConfig.name} logo`}
								className="h-6 w-auto"
							/>
						</div>
						<span className="text-xl font-bold tracking-tight text-foreground">
							{siteConfig.name}
						</span>
					</Link>
					<div className="hidden md:flex gap-8 items-center">
						<Link
							className={cn(
								"text-sm font-semibold transition-all hover:text-primary",
								pathname === "/" 
									? "text-primary" 
									: "text-muted-foreground"
							)}
							href="/"
						>
							Platform
						</Link>
						<Link
							className={cn(
								"text-sm font-semibold transition-all hover:text-primary",
								pathname.startsWith("/docs") 
									? "text-primary" 
									: "text-muted-foreground"
							)}
							href="/docs"
						>
							Docs
						</Link>
						<Link
							className="text-muted-foreground hover:text-primary transition-all text-sm font-semibold"
							href="/about"
						>
							About
						</Link>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<ModeToggle />
					<div className="h-4 w-[1px] bg-border mx-2 hidden sm:block"></div>
					{user ? (
						<>
							<Link
								className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm mr-2"
								href="/dashboard"
							>
								Dashboard
							</Link>
							<Button
								onClick={handleSignOut}
								className="flex items-center gap-2 rounded-xl font-bold"
								variant="secondary"
							>
								<LogOut className="w-4 h-4" />
								<span className="hidden sm:inline">Sign out</span>
							</Button>
						</>
					) : (
						<>
							<Link
								className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm px-4"
								href="/login"
							>
								Log in
							</Link>
							<Link
								className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
								href="/signup"
							>
								Sign up
							</Link>
						</>
					)}
				</div>
			</nav>
		</motion.header>
	);
}

export default Header;
