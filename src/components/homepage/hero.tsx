import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { siteConfig } from "@/config/site";

function Hero() {
	return (
		<section className="relative max-w-[1400px] mx-auto px-container-padding py-18 md:py-32 flex flex-col items-center text-center overflow-hidden">
			{/* Subtle Background Glows */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-50 dark:opacity-20">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
				<div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
			</div>

			<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/50 border border-border/50 rounded-full mb-8 backdrop-blur-sm">
				<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
				<span className="text-xs font-bold tracking-wider uppercase text-foreground/80">
					Now in Public Beta
				</span>
			</div>
			<h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl leading-[1.1]">
				Intelligent Lead Routing <br className="hidden md:block" />
				<span className="text-primary">for Growth Teams.</span>
			</h1>
			<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
				Route leads to the right reps instantly, automate your activity capture, and 
				scale your sales operations without the technical overhead.
			</p>
			<div className="flex flex-col sm:flex-row gap-4 mb-20">
				<Link
					href="/signup"
					className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex items-center gap-2"
				>
					Start Routing Free
					<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
				</Link>
				<Link
					href="/docs"
					className="bg-card text-foreground px-8 py-4 rounded-xl font-bold border border-border hover:bg-accent transition-all duration-300 flex items-center justify-center shadow-sm"
				>
					API Reference
				</Link>
			</div>
			{/* <!-- Hero Illustration/Dashboard Preview --> */}
			<div className="relative w-full max-w-5xl group">
				<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-[2.1rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
				<div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
					<div className="h-8 bg-muted/50 border-b border-border flex items-center px-4 gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-border"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-border"></div>
						<div className="w-2.5 h-2.5 rounded-full bg-border"></div>
					</div>
					<img
						alt={`${siteConfig.name} Platform Preview`}
						className="w-full h-auto object-cover aspect-video"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGQqLludo_glX4AYzHiGG5yzrQYJXSxT-1-lPiiJbr9LPWAPY3qQQPqZSric9fWlhxOUxQnwOIKnMcGt63CB13V4PyQPLkxbDXEkcXLO_nJouJG1bPcoYPTcT0uQWbL-oJScxrJDrul0keQJd3wsx0lf9tMknq4PCv8z8Ji5XiT6JvYhKeTXR0lI8U94Y8Soai5imn3faC1zDEd26KOG93f9hRIryzf5hiRov39y8MG1rv04DSkauya8-6ockclJdRqS-wFUxVbCD4"
					/>
				</div>
			</div>
		</section>
	);
}

export default Hero;
