/** Every judged sound of the word with its verdict in words and an icon, so none relies on color. */
import { isPhonemeInLanguage } from "@phonaria/phonetics-data";
import { ArrowLeftRight, ArrowRight, Check, CircleHelp } from "lucide-react";
import { useId } from "react";
import { PhonemeDetailsButton } from "@/components/transcription/display/clickable-phoneme";
import { cn } from "@/lib/utils";
import type { ContrastSound, MinimalPairPrompt } from "../_lib/minimal-pair-prompt";
import type { SoundResult, SpeakingView } from "../_lib/speaking-attempt";
import { Sound, TONES, Word } from "./speaking-result";

const LOOKS = {
	match: { icon: Check, tone: "success" },
	swapped: { icon: ArrowLeftRight, tone: "info" },
	unclear: { icon: CircleHelp, tone: "neutral" },
} as const;

function SoundGlyph({ sound, marked }: { sound: ContrastSound; marked?: boolean }) {
	if (!isPhonemeInLanguage("en-us", sound.id)) {
		return <span className="px-1.5 py-1 font-display text-2xl">{sound.ipa}</span>;
	}
	return (
		<PhonemeDetailsButton
			className="font-display text-2xl"
			marked={marked}
			phonemeId={sound.id}
			symbol={sound.ipa}
			targetAccent="en-us"
		/>
	);
}

function Verdict({ result: { sound, verdict } }: { result: SoundResult }) {
	const subject = (
		<span className="sr-only">
			<Sound ipa={sound.ipa} />{" "}
		</span>
	);
	switch (verdict.type) {
		case "match":
			return <>{subject}sounded right</>;
		case "swapped":
			return (
				<>
					{subject}sounded like <Sound ipa={verdict.heard.ipa} />
				</>
			);
		case "unclear":
			return <>{subject}wasn't clear</>;
	}
}

function SoundTile({ result, marked }: { result: SoundResult; marked: boolean }) {
	const { verdict } = result;
	const { icon: Icon, tone } = LOOKS[verdict.type];
	return (
		<li
			className={cn(
				"flex min-w-16 flex-col items-center gap-1 rounded-lg border px-1 pt-1 pb-2",
				TONES[tone].panel,
			)}
			data-sound-result={verdict.type}
		>
			<span className="flex items-center">
				<SoundGlyph marked={marked} sound={result.sound} />
				{verdict.type === "swapped" ? (
					<>
						<ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
						<SoundGlyph sound={verdict.heard} />
					</>
				) : null}
			</span>
			<Icon aria-hidden="true" className={cn("size-3.5 shrink-0", TONES[tone].icon)} />
			<span className="max-w-16 text-balance text-center text-foreground text-xs">
				<Verdict result={result} />
			</span>
		</li>
	);
}

/** Below the result, outside its live region, so a new result is read out as one sentence. */
export function SoundResults({ prompt, view }: { prompt: MinimalPairPrompt; view: SpeakingView }) {
	const headingId = useId();
	if (view.phase !== "outcome" || !("sounds" in view.outcome)) return null;
	const { sounds } = view.outcome;
	if (sounds.length === 0) return null;

	const isContrastSound = (result: SoundResult) =>
		result.position === prompt.position && result.sound.id === prompt.target.id;
	const otherWords = sounds.flatMap((result) =>
		result.verdict.type === "swapped" && result.verdict.heardWord && !isContrastSound(result)
			? [{ result, heard: result.verdict.heard, heardWord: result.verdict.heardWord }]
			: [],
	);

	return (
		<section
			aria-labelledby={headingId}
			className="mt-4 flex w-full flex-col items-center gap-2 enter-fade"
		>
			<h2 className="text-muted-foreground text-xs" id={headingId}>
				Sound by sound
			</h2>
			<ol className="flex flex-wrap justify-center gap-2">
				{sounds.map((result) => (
					<SoundTile key={result.position} marked={isContrastSound(result)} result={result} />
				))}
			</ol>
			{otherWords.map(({ result, heard, heardWord }) => (
				<p className="text-pretty text-center text-muted-foreground text-sm" key={result.position}>
					Your <Sound ipa={result.sound.ipa} /> sounded like <Sound ipa={heard.ipa} />, which makes{" "}
					<Word>{heardWord}</Word>.
				</p>
			))}
		</section>
	);
}
