"use client";

import { Button } from "@/components/ui/button";
import { useG2PStore } from "../_store/g2p-store";

export function ExamplesSection() {
	const { transcribe, isLoading } = useG2PStore();

	const examples = ["Judge the rhythm", "She chose well", "Through thick fog"];

	return (
		<div className="flex flex-wrap gap-2">
			<span className="text-xs text-muted-foreground self-center mr-2">Or try these examples:</span>
			{examples.map((example) => (
				<Button
					key={example}
					type="button"
					onClick={() => transcribe(example)}
					className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
					disabled={isLoading}
					size="sm"
				>
					"{example}"
				</Button>
			))}
		</div>
	);
}
