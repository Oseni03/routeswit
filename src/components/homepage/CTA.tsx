import Link from "next/link";
import React from "react";

function CTA() {
    return (
        <section className="max-w-[1400px] mx-auto px-container-padding py-24">
            <div className="relative bg-primary rounded-[2.5rem] p-12 md:p-24 text-center overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary-foreground)_1px,_transparent_1px)] [background-size:24px_24px]"></div>
                </div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-foreground/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-foreground/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8 tracking-tight max-w-3xl mx-auto leading-tight">
                        Ready to route leads <br className="hidden md:block" />
                        like the world&apos;s best teams?
                    </h2>
                    <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 max-w-xl mx-auto">
                        Join 500+ growth teams using Routeswit to automate their sales operations.
                        Start your 14-day free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/signup"
                            className="bg-primary-foreground text-primary px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300"
                        >
                            Start Routing Free
                        </Link>
                        <Link
                            href="/docs"
                            className="bg-primary/20 text-primary-foreground backdrop-blur-md border border-primary-foreground/20 px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/30 transition-all duration-300"
                        >
                            Read Documentation
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CTA;
