import { siteConfig } from '@/config/site';
import Link from 'next/link';
import React from 'react'

function Footer() {
    return (
        <footer className="w-full border-t border-border bg-card">
            <div className="max-w-[1400px] mx-auto px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                                <img
                                    src={siteConfig.logoUrl}
                                    alt={`${siteConfig.name} logo`}
                                    className="h-6 w-auto"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                {siteConfig.name}
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
                            The intelligent lead routing platform for high-performance growth teams.
                            Automate your sales operations and capture every opportunity.
                        </p>
                        <div className="flex gap-4">
                            <Link href={siteConfig.links.twitter} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </Link>
                            <Link href={siteConfig.links.linkedin} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Resources</h4>
                        <div className="flex flex-col gap-4">
                            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/docs">Documentation</Link>
                            {/* <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/blog">Blog</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/guides">Guides</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/api-reference">API Reference</Link> */}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <div className="flex flex-col gap-4">
                            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
                            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/contact">Contact</Link>
                            {/* <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/terms">Terms & Conditions</Link>
                            <Link className="text-sm text-muted-foreground hover:text-primary transition-colors" href="/security">Security</Link> */}
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {siteConfig.name} Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer