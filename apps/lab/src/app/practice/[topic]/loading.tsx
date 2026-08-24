/** Mirrors the start screen so the route does not jump when the topic resolves. */
export default function PracticeTopicLoading() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background p-4 sm:p-6">
			<output
				aria-label="Loading practice"
				className="w-full max-w-md flex flex-col items-center gap-4 motion-safe:animate-pulse"
			>
				<div className="h-4 w-24 rounded-md bg-muted" />
				<div className="h-8 w-64 rounded-md bg-muted" />
				<div className="w-full flex flex-col items-center gap-2">
					<div className="h-4 w-full rounded-md bg-muted" />
					<div className="h-4 w-3/4 rounded-md bg-muted" />
				</div>
				<div className="mt-2 h-10 w-40 rounded-lg bg-muted" />
			</output>
		</div>
	);
}
