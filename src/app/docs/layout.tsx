import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DocsSidebar } from "./_components/sidebar";

export default async function DocsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between px-4 sm:px-8">
					<div className="flex items-center gap-6">
						<Link href="/" className="flex items-center gap-2">
							<span className="text-lg font-bold tracking-tight">Routeswit</span>
						</Link>
						<nav className="hidden md:flex items-center gap-6">
							<Link
								href="/docs"
								className="text-sm font-medium transition-colors hover:text-primary"
							>
								Documentation
							</Link>
						</nav>
					</div>
					<div className="flex items-center gap-4">
						<Link href="/">
							<Button variant="ghost" size="sm" className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to Home
							</Button>
						</Link>
						{session ? (
							<Link href="/dashboard">
								<Button size="sm">Dashboard</Button>
							</Link>
						) : (
							<Link href="/login">
								<Button size="sm">Sign In</Button>
							</Link>
						)}
					</div>
				</div>
			</header>
			<div className="flex-1">
				<div className="container px-4 sm:px-8 py-8 md:py-12">
					<div className="flex flex-col md:flex-row gap-12">
						<DocsSidebar />
						<main className="flex-1 max-w-4xl min-w-0">
							{children}
						</main>
					</div>
				</div>
			</div>
			<footer className="border-t py-6 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8">
					<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
						Built by{" "}
						<a
							href="#"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Routeswit
						</a>
						. The source code is available on{" "}
						<a
							href="#"
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							GitHub
						</a>
						.
					</p>
				</div>
			</footer>
		</div>
	);
}
