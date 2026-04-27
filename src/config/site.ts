export const siteConfig = {
    name: "Foundry",
    description: "A production-ready SaaS boilerplate using Next.js 14.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    links: {
        twitter: "https://twitter.com/your-brand",
        github: "https://github.com/your-username/saas",
    },
    logoUrl: "/logo.png"
};

export type SiteConfig = typeof siteConfig;
