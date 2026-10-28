import {
	getWordAudioPath,
	type TargetAccent,
	type WordAudioManifest,
} from "@phonaria/phonetics-data";
import type { ReactNode } from "react";
import { useAudioManager } from "@/hooks/use-audio-manager";
import { useWordAudioManifest } from "@/hooks/use-word-audio-manifest";
import { buildPublicAssetUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type Props = {
	targetAccent: TargetAccent;
	word: string;
	/** What the button shows; the word itself by default. */
	children?: ReactNode;
	/** Rendered instead of the button when the word has no recording. Nothing by default. */
	fallback?: ReactNode;
	className?: string;
};

/** The public URL of a word's main recording, or null when it has none or no bucket is set. */
export function wordRecordingUrl(
	manifest: WordAudioManifest | null,
	targetAccent: TargetAccent,
	word: string,
): string | null {
	const path = manifest && getWordAudioPath(manifest, targetAccent, word);
	return path ? buildPublicAssetUrl(path) : null;
}

/**
 * Plays one recording, by its public URL, through the shared audio manager,
 * so one clip plays at a time. Unstyled apart from the playback state it
 * exposes as `data-status` (`idle | loading | playing | error`). With `src`
 * null, while the word-audio manifest loads, it renders the same button with
 * `data-status="pending"`, disabled, so nothing moves once it can play.
 */
export function RecordingButton({
	src,
	name,
	children,
	className,
}: {
	src: string | null;
	/** The accessible name, e.g. "Hear read, past tense". */
	name: string;
	children: ReactNode;
	className?: string;
}) {
	const { play, status } = useAudioManager(src ?? "");
	return (
		<button
			type="button"
			aria-label={name}
			aria-disabled={src ? undefined : true}
			data-status={src ? status : "pending"}
			onClick={src ? () => play() : undefined}
			className={cn("cursor-pointer aria-disabled:cursor-default", className)}
		>
			{children}
		</button>
	);
}

/**
 * Plays a word's main recording. The caller supplies the look through
 * `className`. Until the manifest has loaded it shows the button disabled;
 * without a recording it renders `fallback`, never speech synthesis.
 */
export function WordAudioButton({
	targetAccent,
	word,
	children = word,
	fallback = null,
	className,
}: Props) {
	const manifest = useWordAudioManifest(targetAccent);
	const name = `Hear ${word}`;
	if (manifest === undefined)
		return (
			<RecordingButton src={null} name={name} className={className}>
				{children}
			</RecordingButton>
		);
	const src = wordRecordingUrl(manifest, targetAccent, word);
	if (!src) return fallback;
	return (
		<RecordingButton src={src} name={name} className={className}>
			{children}
		</RecordingButton>
	);
}
