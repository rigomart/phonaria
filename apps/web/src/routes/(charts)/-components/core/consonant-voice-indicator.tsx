import type { ConsonantArticulation } from "shared-data";
import { cn } from "@/lib/utils";

type ConsonantVoiceIndicatorProps = {
	type: ConsonantArticulation["voicing"];
};

export function ConsonantVoiceIndicator({ type }: ConsonantVoiceIndicatorProps) {
	return (
		<div className="relative flex items-center justify-center gap-0.5">
			<div
				className={cn("w-0.5 h-3 bg-primary/30", {
					"animate-vocal-vibration": type === "voiced",
				})}
			/>
			<div
				className={cn("w-0.5 h-3 bg-primary/15", {
					"animate-vocal-vibration delay-200": type === "voiced",
				})}
			/>
			<div
				className={cn("w-0.5 h-3 bg-primary/30", {
					"animate-vocal-vibration delay-400": type === "voiced",
				})}
			/>
		</div>
	);
}
