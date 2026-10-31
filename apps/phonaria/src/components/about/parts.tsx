import { type EnglishPhonemeSymbolId, getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/components/link";
import { ArticulationThumbnail } from "@/components/phoneme-details/articulation-thumbnail";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { SoundTile } from "@/components/phoneme-details/sound-tile";
import { PhonemeDetailsButton } from "@/components/transcription/display/clickable-phoneme";
import { cn } from "@/lib/utils";

export const cardClass = "rounded-xl bg-card p-4 text-card-foreground ring-1 ring-border";

/** The two recordings: *pick* and *peak*. */
export function PickPeak({ className }: { className?: string }) {
	return (
		<div className={cn("flex gap-2", className)}>
			{["pick", "peak"].map((word) => (
				<PlayableWordCell
					key={word}
					targetAccent="en-us"
					word={word}
					className="rounded-lg bg-background px-3 py-2 text-base text-foreground"
				/>
			))}
		</div>
	);
}

/** /pɪk/, each sound opening its details. */
export function PickIpa({ size = "text-3xl" }: { size?: string }) {
	return (
		<span className={cn("inline-flex items-center font-display", size)}>
			<span className="text-muted-foreground">/</span>
			{(["P", "IX", "K"] as const).map((id) => (
				<PhonemeDetailsButton
					key={id}
					targetAccent="en-us"
					phonemeId={id}
					symbol={getIpaForPhonemeId(id)}
					className="px-0.5"
				/>
			))}
			<span className="text-muted-foreground">/</span>
		</span>
	);
}

/** [pʰɪk], the detail a native speaker adds. */
export function PickNarrow({ size = "text-3xl" }: { size?: string }) {
	return (
		<span className={cn("font-display", size)}>
			<span className="text-muted-foreground">[</span>pʰɪk
			<span className="text-muted-foreground">]</span>
		</span>
	);
}

/** One example learner. The groups are the three stages, in order. */
export const EXAMPLE_BOARD: readonly (readonly EnglishPhonemeSymbolId[])[] = [
	["IX", "TH", "DH", "V"],
	["P", "K", "I", "S", "T", "AE"],
	["M", "N"],
];

export function SoundChips({ sounds }: { sounds: readonly EnglishPhonemeSymbolId[] }) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{sounds.map((id) => (
				<PhonemeDetailsButton
					key={id}
					targetAccent="en-us"
					phonemeId={id}
					symbol={getIpaForPhonemeId(id)}
					className="min-w-10 bg-background text-center font-display text-xl ring-1 ring-border"
				/>
			))}
		</div>
	);
}

/** The /ɪ/ tile with its mouth diagram. */
export function IxSound() {
	return (
		<div className="flex items-center gap-3">
			<SoundTile ipa="ɪ" audioPath="/audio/phonemes/IX.ogg" />
			<div className="w-24">
				<ArticulationThumbnail targetAccent="en-us" phonemeId="IX" />
			</div>
		</div>
	);
}

export function ToolLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			{children}
			<ArrowRight aria-hidden="true" className="size-3.5" />
		</Link>
	);
}

export function StageBadge({ children }: { children: ReactNode }) {
	return (
		<span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
			{children}
		</span>
	);
}

export function Sources() {
	return (
		<p className="text-xs text-muted-foreground">
			Sources: Munro &amp; Derwing (1995), on accent and being understood; Levis (2005), on clear
			speech as a goal.
		</p>
	);
}
