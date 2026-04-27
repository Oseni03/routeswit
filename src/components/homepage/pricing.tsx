import { SUBSCRIPTION_PLANS } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

function Pricing() {
	return (
		<section
			id="pricing"
			className="max-w-[1400px] mx-auto px-container-padding py-24"
		>
			<div className="text-center mb-16">
				<h2 className="text-3xl font-semibold text-primary mb-4">
					Simple pricing.
				</h2>
				<p className="text-lg text-muted-foreground">
					Plans that scale with your growth.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* <!-- Free Tier --> */}
				<div className="flex flex-col p-8 bg-white border border-border rounded-xl">
					<div className="mb-8">
						<span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold uppercase tracking-wider text-foreground">
							Free
						</span>
						<div className="mt-4 flex items-baseline gap-1">
							<span className="font-4xl text-4xl font-semibold text-primary">
								{SUBSCRIPTION_PLANS[0].price}
							</span>
							<span className="text-foreground font-sm text-sm">
								{SUBSCRIPTION_PLANS[0].period}
							</span>
						</div>
						<p className="mt-4 font-sm text-sm text-foreground">
							{SUBSCRIPTION_PLANS[0].description}
						</p>
					</div>
					<ul className="space-y-4 mb-8 flex-grow">
						{SUBSCRIPTION_PLANS[0].features.map((feature, i) => (
							<li
								key={i}
								className="flex items-center gap-3 font-sm text-sm text-on-surface"
							>
								<CheckCircle className="text-success-text text-lg w-5 h-5" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
					<Link
						href="/signup"
						className="w-full py-3 border border-border rounded-lg font-sm text-sm font-bold hover:bg-accent transition-colors text-center"
					>
						Get Started
					</Link>
				</div>
				{/* <!-- Growth/Pro Tier --> */}
				<div className="flex flex-col p-8 bg-white border-2 border-primary rounded-xl relative scale-105 shadow-xl">
					<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-widest">
						Most Popular
					</div>
					<div className="mb-8">
						<span className="px-3 py-1 bg-primary-container rounded-full text-xs font-bold uppercase tracking-wider text-primary-foreground-container">
							{SUBSCRIPTION_PLANS[1].name}
						</span>
						<div className="mt-4 flex items-baseline gap-1">
							<span className="font-4xl text-4xl font-semibold text-primary">
								{SUBSCRIPTION_PLANS[1].price}
							</span>
							<span className="text-foreground font-sm text-sm">
								{SUBSCRIPTION_PLANS[1].period}
							</span>
						</div>
						<p className="mt-4 font-sm text-sm text-foreground">
							{SUBSCRIPTION_PLANS[1].description}
						</p>
					</div>
					<ul className="space-y-4 mb-8 flex-grow">
						{SUBSCRIPTION_PLANS[1].features.map((feature, i) => (
							<li
								key={i}
								className="flex items-center gap-3 font-sm text-sm text-on-surface"
							>
								<CheckCircle className="text-success-text text-lg w-5 h-5" />
								<span>{feature}</span>
							</li>
						))}
					</ul>
					<Link
						href="/signup"
						className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-sm text-sm font-bold hover:opacity-90 transition-opacity text-center"
					>
						Upgrade to {SUBSCRIPTION_PLANS[1].name}
					</Link>
				</div>
				{/* <!-- Enterprise Tier --> */}
				<div className="flex flex-col p-8 bg-white border border-border rounded-xl">
					<div className="mb-8">
						<span className="px-3 py-1 bg-surface-container rounded-full text-xs font-bold uppercase tracking-wider text-foreground">
							Enterprise
						</span>
						<div className="mt-4 flex items-baseline gap-1">
							<span className="font-4xl text-4xl font-semibold text-primary">
								Custom
							</span>
						</div>
						<p className="mt-4 font-sm text-sm text-foreground">
							Maximum power for global-scale organizations.
						</p>
					</div>
					<ul className="space-y-4 mb-8 flex-grow">
						<li className="flex items-center gap-3 font-sm text-sm text-on-surface">
							<CheckCircle className="text-success-text text-lg w-5 h-5" />
							Custom SLA routing limits
						</li>
						<li className="flex items-center gap-3 font-sm text-sm text-on-surface">
							<CheckCircle className="text-success-text text-lg w-5 h-5" />
							Dedicated TAM
						</li>
						<li className="flex items-center gap-3 font-sm text-sm text-on-surface">
							<CheckCircle className="text-success-text text-lg w-5 h-5" />
							Custom integrations
						</li>
						<li className="flex items-center gap-3 font-sm text-sm text-on-surface">
							<CheckCircle className="text-success-text text-lg w-5 h-5" />
							Advanced Compliance
						</li>
					</ul>
					<Button className="w-full py-3 border border-border rounded-lg font-sm text-sm font-bold hover:bg-accent transition-colors">
						Contact Sales
					</Button>
				</div>
			</div>
		</section>
	);
}

export default Pricing;
