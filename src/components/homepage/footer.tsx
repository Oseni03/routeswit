import { siteConfig } from '@/config/site';
import Link from 'next/link';
import React from 'react'

function Footer() {
  return (
		<footer className="w-full border-t border-border bg-background">
			<div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 max-w-[1400px] mx-auto">
				<div className="mb-8 md:mb-0">
					<span className="text-sm font-medium text-foreground uppercase tracking-widest">
						{siteConfig.name}
					</span>
					<p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
						© 2024 {siteConfig.name} Inc. Built for builders.
					</p>
				</div>
				<div className="flex flex-wrap justify-center gap-8">
					<Link
						className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
						href="/privacy"
					>
						Privacy
					</Link>
					<Link
						className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
						href="/terms"
					>
						Terms
					</Link>
					<Link
						className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
						href="/security"
					>
						Security
					</Link>
					<Link
						className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
						href="/status"
					>
						Status
					</Link>
				</div>
			</div>
		</footer>
  );
}

export default Footer