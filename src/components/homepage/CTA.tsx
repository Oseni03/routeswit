import Link from "next/link";
import React from "react";

function CTA() {
	return (
		<section className="max-w-[1400px] mx-auto px-container-padding py-24">
			<div className="bg-surface-container rounded-3xl p-12 md:p-24 text-center">
				<h2 className="text-3xl md:text-4xl font-semibold text-primary mb-8 tracking-tight">
					Ready to route leads intelligently?
				</h2>
				<div className="flex flex-col sm:flex-row justify-center gap-4">
					<Link
						href="/signup"
						className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-xl text-xl font-medium flex items-center justify-center"
					>
						Start Routing
					</Link>
					<Link
						href="/contact"
						className="bg-white text-primary border border-border px-8 py-4 rounded-lg font-xl text-xl font-medium flex items-center justify-center"
					>
						Talk to us
					</Link>
				</div>
			</div>
		</section>
	);
}

export default CTA;
