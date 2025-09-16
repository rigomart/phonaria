import { Suspense } from "react";
import { MinimalPairsPageContent } from "./_components/minimal-pairs-content";

export default function MinimalPairsPage() {
	return (
		<main className="mx-auto max-w-6xl py-6 space-y-6 px-4">
			<Suspense>
				<MinimalPairsPageContent />
			</Suspense>
		</main>
	);
}

