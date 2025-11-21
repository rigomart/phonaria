type FeatureHighlightProps = {
	title: string;
	description: string;
	badge?: string;
	preview: React.ReactNode;
};

export function FeatureHighlight({ title, description, badge, preview }: FeatureHighlightProps) {
	return (
		<section className="border-b border-border/60 last:border-b-0 bg-muted/20">
			<div className="container mx-auto px-4 py-10 lg:px-6 lg:py-12">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="text-center space-y-3">
						{badge && (
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
								{badge}
							</div>
						)}
						<h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
						<p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
							{description}
						</p>
					</div>
					<div className="flex justify-center">{preview}</div>
				</div>
			</div>
		</section>
	);
}
