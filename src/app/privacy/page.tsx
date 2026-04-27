import { siteConfig } from "@/config/site";

export const metadata = {
    title: "Privacy Policy",
    description: "Privacy policy for " + siteConfig.name,
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="prose prose-lg mx-auto">
                <p>
                    At {siteConfig.name}, we are committed to protecting your privacy and ensuring
                    the security of your personal information. This Privacy Policy explains how we
                    collect, use, and safeguard your data.
                </p>

                <h2>Information We Collect</h2>
                <p>
                    We collect information you provide directly to us, such as when you create an
                    account, use our services, or contact us for support. This may include:
                </p>
                <ul>
                    <li>Name and contact information</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Usage data and analytics</li>
                </ul>

                <h2>How We Use Your Information</h2>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Provide and maintain our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Communicate with you about products, services, and promotions</li>
                    <li>Improve our services and develop new features</li>
                </ul>

                <h2>Information Sharing</h2>
                <p>
                    We do not sell, trade, or otherwise transfer your personal information to third
                    parties without your consent, except as described in this policy. We may share
                    your information in the following circumstances:
                </p>
                <ul>
                    <li>With service providers who assist us in operating our platform</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                </ul>

                <h2>Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your
                    personal information against unauthorized access, alteration, disclosure, or
                    destruction.
                </p>

                <h2>Your Rights</h2>
                <p>
                    You have the right to:
                </p>
                <ul>
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Data portability</li>
                </ul>

                <h2>Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at{" "}
                    <a href="mailto:privacy@routeswit.com" className="text-primary hover:underline">
                        privacy@routeswit.com
                    </a>
                </p>
            </div>
        </div>
    );
}