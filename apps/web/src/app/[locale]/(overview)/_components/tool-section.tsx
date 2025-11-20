import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ToolSectionProps = {
	title: string;
	description: string;
	whatYouGet: string;
	features: string[];
	linkHref: string;
	linkText: string;
	preview: React.ReactNode;
	isReversed?: boolean;
	hideLink?: boolean;
};

export function ToolSection({
	title,
	description,
	whatYouGet,
	features,
	linkHref,
	linkText,
	preview,
	isReversed = false,
	hideLink = false,
}: ToolSectionProps) {
	return (
		<section className="border-b border-border/60 last:border-b-0">
			<div className="container mx-auto px-4 py-10 lg:px-6 lg:py-12">
				<div
					className={`grid gap-6 lg:grid-cols-2 lg:gap-10 lg:items-start ${isReversed ? "lg:grid-flow-dense" : ""}`}
				>
					<div className={`space-y-4 ${isReversed ? "lg:col-start-2" : ""}`}>
						<div className="space-y-2">
							<h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
							<p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
						</div>

						<div className="space-y-2">
							<h3 className="text-xs md:text-sm font-semibold text-foreground">{whatYouGet}</h3>
							<ul className="space-y-1.5">
								{features.map((feature) => (
									<li key={feature} className="flex gap-2.5 text-xs md:text-sm text-muted-foreground">
										<span className="text-primary" aria-hidden="true">
											•
										</span>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						{!hideLink && (
							<Link
								href={linkHref}
								className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-primary hover:underline group"
							>
								{linkText}
								<ArrowRight
									className="size-4 transition-transform group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</Link>
						)}
					</div>

					<div className={isReversed ? "lg:col-start-1 lg:row-start-1" : ""}>{preview}</div>
				</div>
			</div>
		</section>
	);
}
