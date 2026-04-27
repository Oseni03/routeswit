import React from "react";

function TrustedBy() {
	return (
		<section className="border-y border-border bg-surface-container-low py-12">
			<div className="max-w-[1400px] mx-auto px-container-padding">
				<p className="font-xs text-xs uppercase tracking-widest text-center text-foreground mb-8">
					Trusted by industry leaders
				</p>
				<div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale transition-all hover:grayscale-0">
					<span className="font-3xl text-3xl font-medium text-primary">
						VERTEX
					</span>
					<span className="font-3xl text-3xl font-medium text-primary">
						NEXUS
					</span>
					<span className="font-3xl text-3xl font-medium text-primary">
						ORBIT
					</span>
					<span className="font-3xl text-3xl font-medium text-primary">
						KINETIC
					</span>
				</div>
			</div>
		</section>
	);
}

export default TrustedBy;
