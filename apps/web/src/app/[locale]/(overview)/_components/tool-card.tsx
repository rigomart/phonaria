import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ToolCardProps = {
	title: string;
	description: string;
	bullets: string[];
	cta: string;
	href: string;
	icon?: React.ReactNode;
	preview?: React.ReactNode;
};

export function ToolCard({ title, description, bullets, cta, href, icon, preview }: ToolCardProps) {
	return (
		<Link
			href={href}
			className="
				group relative block
				rounded-xl border border-border/40 bg-background
				shadow-sm hover:shadow-md
				transition-all duration-300 ease-out
				hover:-translate-y-1
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
			"
		>
			<div className="p-6 sm:p-8 space-y-4">
				{/* Icon */}
				{icon && (
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
						{icon}
					</div>
				)}

				{/* Title */}
				<h3 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h3>

				{/* Description */}
				<p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{description}</p>

				{/* Preview */}
				{preview && <div className="py-2">{preview}</div>}

				{/* Bullets */}
				<ul className="space-y-2">
					{bullets.map((bullet, index) => (
						<li key={index} className="flex gap-2.5 text-xs sm:text-sm text-foreground/80">
							<span className="text-primary mt-0.5" aria-hidden="true">
								•
							</span>
							<span>{bullet}</span>
						</li>
					))}
				</ul>

				{/* CTA */}
				<div className="flex items-center gap-2 text-sm font-medium text-primary pt-2">
					<span>{cta}</span>
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</div>
			</div>

			{/* Hover Glow Effect */}
			<div
				className="
					absolute inset-0 rounded-xl
					bg-gradient-to-br from-primary/5 to-transparent
					opacity-0 group-hover:opacity-100
					transition-opacity duration-300
					pointer-events-none
				"
			/>
		</Link>
	);
}
