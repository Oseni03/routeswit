import { siteConfig } from "@/config/site";
import Link from "next/link";
import { X } from "lucide-react";

export const metadata = {
	title: "Contact Us",
	description: "Get in touch with " + siteConfig.name,
};

export default function ContactPage() {
	return (
		<div className="container mx-auto px-4 py-16 max-w-4xl">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">Contact Us</h1>
				<p className="text-xl text-muted-foreground">
					We&apos;d love to hear from you. Reach out to us through our
					social channels.
				</p>
			</div>

			<div className="text-center">
				<div className="flex justify-center gap-6 mb-8">
					<Link
						href={siteConfig.links.twitter}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
					>
						<X className="h-5 w-5" />
						<span>Follow us on X</span>
					</Link>
					<Link
						href={siteConfig.links.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							xmlnsXlink="http://www.w3.org/1999/xlink"
							version="1.1"
							width="24" // w-5
							height="24" // h-5
							viewBox="0 0 24 24"
						>
							<path
								fill="#FFFFFF"
								d="M21,21H17V14.25C17,13.19 15.81,12.31 14.75,12.31C13.69,12.31 13,13.19 13,14.25V21H9V9H13V11C13.66,9.93 15.36,9.24 16.5,9.24C19,9.24 21,11.28 21,13.75V21M7,21H3V9H7V21M5,3A2,2 0 0,1 7,5A2,2 0 0,1 5,7A2,2 0 0,1 3,5A2,2 0 0,1 5,3Z"
							/>
						</svg>
						<span>Connect on LinkedIn</span>
					</Link>
				</div>

				<div className="prose prose-lg mx-auto">
					<p>
						For business inquiries, partnerships, or support, please
						reach out to us through our social media channels.
						We&apos;re active on X (formerly Twitter) and LinkedIn,
						and we respond to messages promptly.
					</p>

					<p>
						You can also find us on GitHub for technical discussions
						and contributions to our open-source projects.
					</p>

					<div className="mt-8">
						<Link
							href={siteConfig.links.github}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							Visit our GitHub →
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
