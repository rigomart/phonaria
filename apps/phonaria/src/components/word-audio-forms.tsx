import {
	findWordAudioRecording,
	getWordAudioForms,
	type TargetAccent,
	type WordAudioRecording,
} from "@phonaria/phonetics-data";
import { buttonVariants } from "@phonaria/ui/components/button";
import { Volume2 } from "lucide-react";
import { RecordingButton } from "@/components/word-audio-button";
import { useWordAudioManifest } from "@/hooks/use-word-audio-manifest";
import { buildPublicAssetUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const formButton = cn(
	buttonVariants({ size: "xs", variant: "outline" }),
	"data-[status=playing]:bg-muted data-[status=playing]:text-foreground data-[status=loading]:animate-pulse motion-reduce:data-[status=loading]:animate-none",
);

/**
 * One play button per recording of a word, for places where a word is looked
 * up: a heteronym's meanings each under their label ("present tense", "past
 * tense"), an "also said" form beside the main one. A form without a label
 * shows the word. The main form comes first, unless `pronunciation` finds
 * another form (`findWordAudioRecording`): then that form leads. While the manifest loads it shows one
 * disabled button; without a recording, nothing.
 */
export function WordAudioForms({
	targetAccent,
	word,
	pronunciation,
	className,
}: {
	targetAccent: TargetAccent;
	word: string;
	/** A pronunciation in dictionary notation ("R I1 D") whose recording should come first. */
	pronunciation?: string;
	className?: string;
}) {
	const manifest = useWordAudioManifest(targetAccent);
	const recordings =
		manifest === undefined
			? [{ src: null, label: undefined }]
			: leading(
					manifest ? getWordAudioForms(manifest, targetAccent, word) : [],
					pronunciation,
				).flatMap(({ path, label }) => {
					const src = buildPublicAssetUrl(path);
					return src ? [{ src, label }] : [];
				});
	if (!recordings.length) return null;
	return (
		<div className={cn("flex flex-wrap gap-1.5", className)}>
			{recordings.map(({ src, label }) => (
				<RecordingButton
					key={src ?? "pending"}
					src={src}
					name={label ? `Hear ${word}, ${label}` : `Hear ${word}`}
					className={formButton}
				>
					<Volume2 aria-hidden="true" />
					{label ?? word}
				</RecordingButton>
			))}
		</div>
	);
}

/** The recording generated from `pronunciation` first, the rest in manifest order. */
function leading(recordings: readonly WordAudioRecording[], pronunciation: string | undefined) {
	const first = pronunciation ? findWordAudioRecording(recordings, pronunciation) : undefined;
	return first ? [first, ...recordings.filter((recording) => recording !== first)] : recordings;
}
