import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { siteConfig } from "@/config/site";

function Hero() {
	return (
		<section className="max-w-[1400px] mx-auto px-container-padding py-18 md:py-32 flex flex-col items-center text-center">
			<div className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full mb-8">
				<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
				<span className="font-xs text-xs font-semibold tracking-wider uppercase">
					Now in Public Beta
				</span>
			</div>
			<h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-primary mb-6 max-w-3xl">
				Intelligent Lead Routing.
			</h1>
			<p className="text-lg text-muted-foreground max-w-xl mb-10">
				Route leads to the right reps instantly. Capture all activities automatically.
			</p>
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex flex-col sm:flex-row gap-4">
					<Link
						href="/signup"
						className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
					>
						Get Started
						<ArrowRight className="w-4 h-4" />
					</Link>
					<Link
						href="/docs"
						className="bg-background text-foreground px-6 py-3 rounded-lg font-medium border border-border hover:bg-accent transition-colors flex items-center justify-center"
					>
						API Reference
					</Link>
				</div>
			</div>
			{/* <!-- Hero Illustration/Dashboard Preview --> */}
			<div className="mt-20 w-full rounded-2xl overflow-hidden border border-border bg-white shadow-lg">
				<img
					alt={`${siteConfig.name} Platform Preview`}
					className="w-full h-auto object-cover aspect-video"
					data-alt="Modern dark-themed software dashboard UI with complex data visualizations, code snippets, and sleek layout on a white minimalist background"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGQqLludo_glX4AYzHiGG5yzrQYJXSxT-1-lPiiJbr9LPWAPY3qQQPqZSric9fWlhxOUxQnwOIKnMcGt63CB13V4PyQPLkxbDXEkcXLO_nJouJG1bPcoYPTcT0uQWbL-oJScxrJDrul0keQJd3wsx0lf9tMknq4PCv8z8Ji5XiT6JvYhKeTXR0lI8U94Y8Soai5imn3faC1zDEd26KOG93f9hRIryzf5hiRov39y8MG1rv04DSkauya8-6ockclJdRqS-wFUxVbCD4"
				/>
			</div>
		</section>
	);
}

export default Hero;
