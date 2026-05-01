import { siteConfig } from "@/config/site";
import Link from "next/link";
import { X } from "lucide-react";
import Header from "@/components/homepage/header";
import Footer from "@/components/homepage/footer";

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with " + siteConfig.name,
};

export default function ContactPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-24 max-w-4xl">
                    <div className="text-center mb-16">
                        <h1 className="text-6xl font-bold tracking-tighter mb-6">Let&apos;s Connect</h1>
                        <p className="text-2xl text-muted-foreground max-w-xl mx-auto">
                            Have a question or want to explore a partnership?
                            We&apos;d love to hear from you.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                        <Link
                            href={siteConfig.links.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex-1 max-w-sm mx-auto sm:mx-0 flex items-center gap-5 p-8 rounded-3xl border border-border hover:border-primary/60 hover:bg-accent/50 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                                <X className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-xl">Follow us on X</p>
                                <p className="text-sm text-muted-foreground">Real-time updates &amp; discussions</p>
                            </div>
                        </Link>

                        <Link
                            href={siteConfig.links.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex-1 max-w-sm mx-auto sm:mx-0 flex items-center gap-5 p-8 rounded-3xl border border-border hover:border-primary/60 hover:bg-accent/50 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#0A66C2] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" viewBox="0 0 24 24">
                                    <path d="M21,21H17V14.25C17,13.19 15.81,12.31 14.75,12.31C13.69,12.31 13,13.19 13,14.25V21H9V9H13V11C13.66,9.93 15.36,9.24 16.5,9.24C19,9.24 21,11.28 21,13.75V21M7,21H3V9H7V21M5,3A2,2 0 0,1 7,5A2,2 0 0,1 5,7A2,2 0 0,1 3,5A2,2 0 0,1 5,3Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-xl">Connect on LinkedIn</p>
                                <p className="text-sm text-muted-foreground">Professional networking</p>
                            </div>
                        </Link>
                    </div>

                    <div className="max-w-2xl mx-auto text-center">
                        <div className="prose prose-lg dark:prose-invert">
                            <p className="text-lg">
                                For business inquiries, partnerships, demos, or support, feel free to reach out
                                through any of our channels. Our team typically responds within 24 hours.
                            </p>
                        </div>

                        <div className="mt-12 p-8 bg-muted/50 rounded-3xl border">
                            <p className="text-muted-foreground mb-4">Interested in technical collaboration?</p>
                            <Link
                                href={siteConfig.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 text-primary hover:text-primary/80 font-medium text-lg transition-colors"
                            >
                                Visit our GitHub Organization →
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}