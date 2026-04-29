"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarSections = [
    {
        title: "Introduction",
        links: [
            { label: "Overview", href: "#overview" },
            { label: "Interactive Playground", href: "#playground" },
            { label: "Authentication", href: "#authentication" },
            { label: "Error Handling", href: "#errors" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Leads", href: "#leads" },
            { label: "Representatives", href: "#reps" },
            { label: "Rulesets", href: "#rulesets" },
            { label: "Contacts & Activities", href: "#contacts" },
            { label: "Analytics & Alerts", href: "#analytics" },
        ],
    },
];

export function DocsSidebar() {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: "-10% 0px -80% 0px",
            threshold: 0,
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(`#${entry.target.id}`);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Observe all sections in the documentation
        const sections = document.querySelectorAll("section[id]");
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
                {sidebarSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-2">
                            {section.title}
                        </h4>
                        <nav className="flex flex-col gap-1">
                            {section.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm px-3 py-2 rounded-md transition-all duration-200 border-l-2",
                                        activeSection === link.href
                                            ? "text-primary font-semibold border-primary bg-primary/5"
                                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                ))}
            </div>
        </aside>
    );
}
