import {
	LanguagesIcon,
	Network,
	Sparkles,
	Terminal,
	TrendingUp,
	WifiSyncIcon,
} from "lucide-react";
import React from "react";

function Features() {
	return (
		<>
			<section className="max-w-[1400px] mx-auto px-container-padding py-24">
				<div className="mb-16">
					<h2 className="text-3xl font-semibold text-primary mb-4">
						Built for speed.
					</h2>
					<p className="text-lg text-muted-foreground max-w-xl">
						Ship world-class software without the infrastructure
						overhead.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* <!-- Feature 1 --> */}
					<div className="p-8 bg-white border border-border rounded-xl hover:border-primary transition-colors group">
						<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-muted-foreground transition-colors">
							<Network />
						</div>
						<h3 className="text-xl font-semibold text-primary mb-2">
							API First
						</h3>
						<p className="font-base text-base text-foreground">
							Comprehensive REST and GraphQL APIs that put
							developers first. Integrate in minutes, not days.
						</p>
					</div>
					{/* <!-- Feature 2 --> */}
					<div className="p-8 bg-white border border-border rounded-xl hover:border-primary transition-colors group">
						<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-muted-foreground transition-colors">
							<LanguagesIcon />
						</div>
						<h3 className="text-xl font-semibold text-primary mb-2">
							Edge Ready
						</h3>
						<p className="font-base text-base text-foreground">
							Deploy your logic globally to 200+ edge locations
							for sub-50ms latency everywhere on earth.
						</p>
					</div>
					{/* <!-- Feature 3 --> */}
					<div className="p-8 bg-white border border-border rounded-xl hover:border-primary transition-colors group">
						<div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-muted-foreground transition-colors">
							<WifiSyncIcon />
						</div>
						<h3 className="text-xl font-semibold text-primary mb-2">
							Real-time Sync
						</h3>
						<p className="font-base text-base text-foreground">
							Automatic state synchronization with conflict
							resolution built-in. Your users are never out of
							sync.
						</p>
					</div>
				</div>
			</section>
			{/* <!-- Bento Layout Highlight Section --> */}
			<section className="max-w-[1400px] mx-auto px-container-padding py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full md:h-[600px]">
					<div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-12 flex flex-col justify-end">
						<div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
							<img
								alt="Abstract background"
								className="w-full h-full object-cover"
								src="https://lh3.googleusercontent.com/aida-public/AB6AXuB23OtyeFYNlTerFIOkee4Gc9MHDewTPkLws6cEErK3GNeyKS9k99WoMYq9fgSmscxAVRoRDGAnJQB3ItjYRRt3ZEx7L1TEhXWkAH84AeEVuxv95huUvXMSI1wfroNhPLsyeBn0y-MzzNgO2vlwulAAzwB6uxEgFUukKdUA1AR0CQ6xw2lN5HDWuhH5JbvGpNAxnqSMZgpL4IrzwGPtkEeVzcC4pt14BDW7mkdQjOx3zU3e_HFBEv_UByvqDIYkZ4yRhIm31Yg1LUB4"
							/>
						</div>
						<h3 className="text-2xl font-semibold mb-3 relative z-10">
							Advanced Security
						</h3>
						<p className="text-base text-primary-foreground/80 relative z-10 max-w-xs">
							Enterprise-grade encryption and compliance out of
							the box.
						</p>
					</div>
					<div className="md:col-span-2 bg-surface-container rounded-2xl p-8 flex items-center justify-between overflow-hidden">
						<div>
							<h4 className="font-xl text-xl font-medium text-primary mb-2">
								Infinite Scaling
							</h4>
							<p className="font-sm text-sm text-foreground">
								From 1 to 100M+ requests without breaking a
								sweat.
							</p>
						</div>
						<div className="w-32 h-32 bg-white rounded-xl shadow-sm rotate-12 flex items-center justify-center border border-border">
							<TrendingUp className="text-4xl text-primary w-12 h-12" />
						</div>
					</div>
					<div className="bg-accent rounded-2xl p-8 flex flex-col justify-between">
						<Sparkles className="text-primary text-3xl" />
						<h4 className="font-lg text-lg font-medium text-primary">
							AI Powered Metrics
						</h4>
					</div>
					<div className="bg-foreground text-primary-foreground rounded-2xl p-8 flex flex-col justify-between">
						<Terminal className="text-primary-foreground text-3xl" />
						<h4 className="font-lg text-lg font-medium">
							CLI Built for Speed
						</h4>
					</div>
				</div>
			</section>
		</>
	);
}

export default Features;
