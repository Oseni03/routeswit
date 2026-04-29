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
				<div className="flex items-center gap-8">
					<Link href="/" className="inline-flex items-center gap-3">
						<img
							src={siteConfig.logoUrl}
							alt={`${siteConfig.name} logo`}
							className="h-8 w-auto rounded-lg"
						/>
						<span className="text-lg font-bold text-foreground">
							{siteConfig.name}
						</span>
					</Link>
					<div className="hidden md:flex gap-6 items-center">
						<Link
							className={cn(
								"text-sm font-medium transition-colors",
								pathname === "/" 
									? "text-foreground border-b-2 border-primary pb-1" 
									: "text-muted-foreground hover:text-foreground"
							)}
							href="/"
						>
							Platform
						</Link>
						<Link
							className={cn(
								"text-sm font-medium transition-colors",
								pathname.startsWith("/docs") 
									? "text-foreground border-b-2 border-primary pb-1" 
									: "text-muted-foreground hover:text-foreground"
							)}
							href="/docs"
						>
							Docs
						</Link>
						<Link
							className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
							href="/careers"
						>
							Careers
						</Link>
					</div>
				</div>
				<div className="flex items-center gap-4">
					{user ? (
						<>
							<Link
								className="text-muted-foreground hover:text-foreground transition-colors font-sm text-sm"
								href="/dashboard"
							>
								Dashboard
							</Link>
							<Button
								onClick={handleSignOut}
								className="flex items-center gap-2"
							>
								<LogOut className="w-4 h-4" />
								<span>Sign out</span>
							</Button>
						</>
					) : (
						<>
							<Link
								className="text-muted-foreground hover:text-foreground transition-colors font-sm text-sm"
								href="/login"
							>
								Log in
							</Link>
							<Link
								className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-sm text-sm font-semibold hover:opacity-90 transition-opacity"
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
