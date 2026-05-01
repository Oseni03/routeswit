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
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                        Routing that <span className="text-primary">scales.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        Automate your lead assignment and capture activities without the operational overhead.
                        Experience seamless routing built for modern growth teams.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* <!-- Feature 1 --> */}
                    <div className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <Network className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            Dynamic Rulesets
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Build complex routing rules using equal distribution, round-robin, or territory mapping to ensure leads hit the right reps.
                        </p>
                    </div>
                    {/* <!-- Feature 2 --> */}
                    <div className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <LanguagesIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            Real-time SLA Alerts
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Set time-to-action limits and trigger instant webhooks or notifications when a lead is stale. Never miss a window again.
                        </p>
                    </div>
                    {/* <!-- Feature 3 --> */}
                    <div className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <WifiSyncIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            Automated Activity Capture
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Automatically log activities, meetings, and outcomes directly into your CRM or dashboard seamlessly.
                        </p>
                    </div>
                </div>
            </section>
            {/* <!-- Bento Layout Highlight Section --> */}
            <section className="max-w-[1400px] mx-auto px-container-padding pb-24">
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full md:h-[600px]">
                    <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-12 flex flex-col justify-end group">
                        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <img
                                alt="Abstract background"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB23OtyeFYNlTerFIOkee4Gc9MHDewTPkLws6cEErK3GNeyKS9k99WoMYq9fgSmscxAVRoRDGAnJQB3ItjYRRt3ZEx7L1TEhXWkAH84AeEVuxv95huUvXMSI1wfroNhPLsyeBn0y-MzzNgO2vlwulAAzwB6uxEgFUukKdUA1AR0CQ6xw2lN5HDWuhH5JbvGpNAxnqSMZgpL4IrzwGPtkEeVzcC4pt14BDW7mkdQjOx3zU3e_HFBEv_UByvqDIYkZ4yRhIm31Yg1LUB4"
                            />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-4">
                                No more lost leads
                            </h3>
                            <p className="text-lg text-primary-foreground/80 max-w-sm leading-relaxed">
                                Seamless API integration ensures your top prospects are routed in milliseconds. Built for high-volume performance.
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-muted/50 rounded-3xl p-10 flex items-center justify-between overflow-hidden border border-border/50 group">
                        <div>
                            <h4 className="text-2xl font-bold text-foreground mb-2">
                                Unlimited Scale
                            </h4>
                            <p className="text-muted-foreground max-w-xs leading-relaxed">
                                Process thousands of routing events instantly without breaking a sweat.
                            </p>
                        </div>
                        <div className="w-32 h-32 bg-card rounded-2xl shadow-2xl rotate-12 flex items-center justify-center border border-border group-hover:rotate-0 transition-all duration-500">
                            <TrendingUp className="text-primary w-12 h-12" />
                        </div>
                    </div>
                    <div className="bg-accent/50 rounded-3xl p-10 flex flex-col justify-between border border-border/50 hover:bg-accent transition-colors duration-300">
                        <Sparkles className="text-primary w-8 h-8" />
                        <div>
                            <h4 className="text-xl font-bold text-foreground">
                                Smart Analytics
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">Real-time performance tracking.</p>
                        </div>
                    </div>
                    <div className="bg-foreground text-background rounded-3xl p-10 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
                        <Terminal className="text-background w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div>
                            <h4 className="text-xl font-bold">
                                Developer First API
                            </h4>
                            <p className="text-sm opacity-70 mt-1">Built by devs, for devs.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Features;
