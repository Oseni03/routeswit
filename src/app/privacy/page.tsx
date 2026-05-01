import { siteConfig } from "@/config/site";
import Header from "@/components/homepage/header";
import Footer from "@/components/homepage/footer";

export const metadata = {
    title: "Privacy Policy",
    description: "Privacy policy for " + siteConfig.name,
};

export default function PrivacyPage() {
    return (
        <>
            <Header />

            <main className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-20 max-w-4xl">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold tracking-tighter mb-6">Privacy Policy</h1>
                        <p className="text-muted-foreground text-lg">
                            Last updated: {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div className="bg-card border rounded-3xl p-10 md:p-14">
                            <p className="text-lg leading-relaxed">
                                At <span className="font-semibold">{siteConfig.name}</span>, we take your privacy seriously.
                                This Privacy Policy explains how we collect, use, and protect your information.
                            </p>

                            <h2>Information We Collect</h2>
                            <ul>
                                <li>Name and contact details</li>
                                <li>Account credentials and profile information</li>
                                <li>Payment information (processed securely via third-party providers)</li>
                                <li>Usage data, analytics, and interaction logs</li>
                            </ul>

                            <h2>How We Use Your Information</h2>
                            <ul>
                                <li>To provide, maintain, and improve our services</li>
                                <li>To process transactions and communications</li>
                                <li>To send important updates and support messages</li>
                                <li>To personalize your experience</li>
                                <li>For internal analytics and product development</li>
                            </ul>

                            <h2>Information Sharing</h2>
                            <p>
                                We do not sell your personal data. We may share information only in these cases:
                            </p>
                            <ul>
                                <li>With trusted service providers under strict confidentiality agreements</li>
                                <li>When required by law or to protect our legal rights</li>
                                <li>To prevent fraud or ensure platform security</li>
                            </ul>

                            <h2>Data Security</h2>
                            <p>
                                We use industry-standard security measures including encryption, access controls,
                                and regular security audits to protect your information.
                            </p>

                            <h2>Your Rights</h2>
                            <ul>
                                <li>Access, correct, or delete your personal data</li>
                                <li>Opt out of marketing communications at any time</li>
                                <li>Request data portability</li>
                                <li>Withdraw consent where applicable</li>
                            </ul>

                            <div className="mt-12 pt-8 border-t">
                                <h2 className="text-2xl mb-4">Questions?</h2>
                                <p>
                                    If you have any questions about this Privacy Policy or how we handle your data,
                                    please contact us at{" "}
                                    <a
                                        href="mailto:privacy@routeswit.com"
                                        className="text-primary font-medium hover:underline"
                                    >
                                        privacy@routeswit.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}