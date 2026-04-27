export const siteConfig = {
	name: "Routeswit",
	description: "Intelligent lead routing and activity capture system.",
	url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	links: {
		twitter: "https://x.com/Oseni03",
		linkedin: "https://linkedin.com/in/Oseni03",
		github: "https://github.com/Oseni03/routeswit",
	},
	logoUrl: "/logo.png",
};

export type SiteConfig = typeof siteConfig;
