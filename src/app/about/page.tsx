import { siteConfig } from "@/config/site";
import Link from "next/link";
import Header from "@/components/homepage/header";
import Footer from "@/components/homepage/footer";

export const metadata = {
    title: "About",
    description: "Learn more about " + siteConfig.name,
};

export default function AboutPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
                    <div className="container mx-auto px-6 pt-24 pb-20 max-w-5xl text-center">
                        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
                            About {siteConfig.name}
                        </h1>
                        <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
                            {siteConfig.description}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-20 max-w-4xl">
                    <div className="prose prose-lg dark:prose-invert mx-auto">
                        <p className="text-xl leading-relaxed text-foreground/90">
                            {siteConfig.name} is an intelligent lead routing and activity capture system
                            designed to help businesses streamline sales processes and dramatically improve
                            customer engagement.
                        </p>

                        <p>
                            We combine powerful routing algorithms with real-time activity tracking to
                            ensure every lead reaches the right person at the right time.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-16 not-prose">
                            {[
                                { number: "95%", label: "Avg Lead Response Time Reduction" },
                                { number: "3.2x", label: "Increase in Conversion Rates" },
                                { number: "50+", label: "CRM Integrations" },
                                { number: "99.9%", label: "Uptime SLA" },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                                    <p className="text-sm text-muted-foreground leading-tight">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-4xl font-semibold tracking-tight mt-10">Our Mission</h2>
                        <p className="text-lg">
                            To empower businesses with intelligent automation that transforms how they
                            connect with customers and manage their sales pipelines.
                        </p>

                        <h2 className="text-4xl font-semibold tracking-tight mt-16 mb-8">Key Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                "Intelligent lead routing based on custom rules",
                                "Real-time activity capture & tracking",
                                "Advanced analytics and reporting dashboards",
                                "Seamless CRM integrations",
                                "Multi-tenant enterprise architecture",
                                "Role-based access control & security",
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 bg-card p-6 rounded-2xl border">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                                        ✓
                                    </div>
                                    <p className="text-[17px] leading-relaxed">{feature}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-16">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-lg font-semibold px-12 py-4 shadow-xl shadow-primary/25"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}