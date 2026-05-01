import React from "react";

function TrustedBy() {
	return (
		<section className="py-20 bg-muted/30 border-y border-border/50 overflow-hidden">
			<div className="max-w-[1400px] mx-auto px-container-padding">
				<p className="text-sm font-bold uppercase tracking-[0.2em] text-center text-muted-foreground mb-12">
					Trusted by industry leaders
				</p>
				<div className="flex flex-wrap justify-center items-center gap-10 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
					<span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground selection:bg-primary/30">
						VERTEX
					</span>
					<span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground selection:bg-primary/30">
						NEXUS
					</span>
					<span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground selection:bg-primary/30">
						ORBIT
					</span>
					<span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground selection:bg-primary/30">
						KINETIC
					</span>
				</div>
			</div>
		</section>
	);
}

export default TrustedBy;
