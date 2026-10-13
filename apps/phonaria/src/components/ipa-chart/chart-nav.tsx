"use client";

import { Link } from "@/components/link";
import { chartSections, usePathname } from "@/components/site-nav";
import { cn } from "@/lib/utils";

/** Consonants, Vowels and Frequency tabs. Sticks under the site header. */
export function ChartNav() {
	const pathname = usePathname();

	return (
		<div className="sticky top-12 z-30 border-b bg-background">
			<nav
				aria-label="IPA Chart"
				className="mx-auto flex w-full max-w-6xl gap-1 px-4 py-2 text-sm sm:px-6"
			>
				{chartSections.map((section) => {
					const active = pathname === section.href;
					return (
						<Link
							key={section.href}
							href={section.href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"rounded-full px-3 py-1 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								active
									? "bg-secondary text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{section.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
