import { siteConfig } from "@/config/site";
import Link from "next/link";

export const metadata = {
    title: "About",
    description: "Learn more about " + siteConfig.name,
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">About {siteConfig.name}</h1>
                <p className="text-xl text-muted-foreground">
                    {siteConfig.description}
                </p>
            </div>

            <div className="prose prose-lg mx-auto">
                <p>
                    {siteConfig.name} is an intelligent lead routing and activity capture system
                    designed to help businesses streamline their sales processes and improve
                    customer engagement.
                </p>

                <p>
                    Our platform combines advanced routing algorithms with comprehensive activity
                    tracking to ensure that every lead reaches the right person at the right time,
                    maximizing conversion rates and customer satisfaction.
                </p>

                <h2>Our Mission</h2>
                <p>
                    To empower businesses with intelligent automation that transforms how they
                    connect with their customers and manage their sales pipelines.
                </p>

                <h2>Key Features</h2>
                <ul>
                    <li>Intelligent lead routing based on custom rules and criteria</li>
                    <li>Real-time activity capture and tracking</li>
                    <li>Advanced analytics and reporting</li>
                    <li>Seamless integration with popular CRM systems</li>
                    <li>Multi-tenant architecture for enterprise scalability</li>
                </ul>

                <div className="text-center mt-12">
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Get in Touch
                    </Link>
                </div>
            </div>
        </div>
    );
}