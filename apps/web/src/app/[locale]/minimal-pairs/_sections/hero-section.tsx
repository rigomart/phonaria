export function MinimalPairsHeroSection() {
	return (
		<section className="border-b to-background">
			<div className="container mx-auto flex flex-col gap-8 px-4 py-12 lg:px-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
					<div className="flex max-w-2xl flex-col gap-5">
						<div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
							<span className="h-1.5 w-1.5 rounded-full bg-primary" />
							<span>Listening Discrimination</span>
						</div>
						<h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
							Tune your ear with practical minimal pair drills
						</h1>
						<p className="text-pretty text-base leading-relaxed text-muted-foreground">
							Work through focused sound contrasts, listen to native examples, and review the articulation
							reminders you need to practise independently.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
