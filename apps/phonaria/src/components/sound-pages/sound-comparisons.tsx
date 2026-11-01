import { type EnglishPhonemeSymbolId, getIpaForPhonemeId } from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { ArrowRight, Check, RotateCcw, Volume2, X } from "lucide-react";
import { use, useEffect, useRef, useState } from "react";
import { Link } from "@/components/link";
import { DetailsCard } from "@/components/phoneme-details/details-section";
import { PlayableWordCell } from "@/components/phoneme-details/playable-word";
import { phonemeAudioPath } from "@/components/phoneme-details/sound";
import { SoundTile } from "@/components/phoneme-details/sound-tile";
import { SpelledWord } from "@/components/spelled-word";
import { wordRecordingUrl } from "@/components/word-audio-button";
import { AudioManagerContext } from "@/hooks/use-audio-manager";
import { useWordAudioManifest } from "@/hooks/use-word-audio-manifest";
import { flags } from "@/lib/flags";
import { markDifference } from "@/lib/mark-difference";
import { contrastPagePath } from "@/lib/minimal-pairs";
import type { PhonemeComparison } from "@/lib/phoneme-comparisons";
import { compareSounds, getAllComparisons } from "@/lib/sound-page-content";
import { getSoundKeyExample } from "@/lib/sound-pages";
import { cn } from "@/lib/utils";

const ACCENT = "en-us" as const;
const PAIR_LIMIT = 5;

/** The hearing check, then a face-off card for each sound this one is confused with. */
export function SoundComparisons({ phonemeId }: { phonemeId: EnglishPhonemeSymbolId }) {
	const comparisons = getAllComparisons(phonemeId);
	return (
		<div className="flex flex-col gap-3">
			<ListenAndPick phonemeId={phonemeId} comparisons={comparisons} />
			{comparisons.map((comparison) => (
				<FaceOff key={comparison.contrastId} phonemeId={phonemeId} comparison={comparison} />
			))}
		</div>
	);
}

/**
 * Two sounds face to face: each with its symbol and key word, the features
 * that set them apart in rows between them, what they share once below, and
 * their minimal pairs, this sound's word on the left.
 */
function FaceOff({
	phonemeId,
	comparison,
}: {
	phonemeId: EnglishPhonemeSymbolId;
	comparison: PhonemeComparison;
}) {
	const partner = comparison.partnerId as EnglishPhonemeSymbolId;
	const ipa = getIpaForPhonemeId(phonemeId);
	const { differences, shared } = compareSounds(phonemeId, partner);
	const [all, setAll] = useState(false);
	const pairs = all ? comparison.pairs : comparison.pairs.slice(0, PAIR_LIMIT);
	const practise = flags.isEnabled("speech");

	return (
		<DetailsCard className="flex flex-col gap-4">
			<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
				<Side phonemeId={phonemeId} />
				<span className="text-sm text-muted-foreground">vs</span>
				<Side phonemeId={partner} end />
			</div>
			{differences.length > 0 || shared.length > 0 ? (
				<div className="flex flex-col gap-1">
					{differences.length > 0 ? (
						<dl
							aria-label={`How /${ipa}/ and /${comparison.partnerIpa}/ differ`}
							className="flex flex-col gap-1"
						>
							{differences.map(({ label, own, other }) => (
								<div
									key={label}
									className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-background-strong px-3 py-2"
								>
									{/* The term comes first for screen readers; the grid puts it in the middle. */}
									<dt className="col-start-2 row-start-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
										{label}
									</dt>
									<dd className="col-start-1 row-start-1 font-display text-lg font-semibold text-foreground">
										<span className="sr-only">{`/${ipa}/: `}</span>
										{own}
									</dd>
									<dd className="col-start-3 row-start-1 text-right font-display text-lg font-semibold text-foreground">
										<span className="sr-only">{`/${comparison.partnerIpa}/: `}</span>
										{other}
									</dd>
								</div>
							))}
						</dl>
					) : null}
					{shared.length > 0 ? (
						<p className="text-center text-xs text-muted-foreground">
							{`Both ${shared.join(", ")}`}
						</p>
					) : null}
				</div>
			) : null}
			<ul
				aria-label={`/${ipa}/ versus /${comparison.partnerIpa}/`}
				className="flex flex-col divide-y divide-border overflow-hidden rounded-xl bg-background-strong shadow-xs"
			>
				{pairs.map(({ words: [own, other] }) => (
					<li key={`${own}-${other}`} className="grid grid-cols-2">
						<PlayableWordCell
							targetAccent={ACCENT}
							word={own}
							className="px-3 py-1.5 text-foreground"
						>
							<SpelledWord spelled={markDifference(own, other)} />
						</PlayableWordCell>
						<PlayableWordCell
							targetAccent={ACCENT}
							word={other}
							className="justify-end px-3 py-1.5 text-foreground"
						>
							<SpelledWord spelled={markDifference(other, own)} />
						</PlayableWordCell>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-between gap-2">
				{comparison.pairs.length > PAIR_LIMIT ? (
					<button
						type="button"
						aria-expanded={all}
						onClick={() => setAll((value) => !value)}
						className="rounded-sm text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
					>
						{all ? "Show fewer" : `Show all ${comparison.pairs.length}`}
					</button>
				) : (
					<span />
				)}
				<Link
					href={contrastPagePath(comparison.contrastId)}
					className="group flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
				>
					{`${practise ? "Practise saying" : "All pairs for"} /${ipa}/ and /${comparison.partnerIpa}/`}
					<ArrowRight
						aria-hidden="true"
						className="size-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
					/>
				</Link>
			</div>
		</DetailsCard>
	);
}

/** One side of the face-off: the sound's symbol, which plays it, and its key word. */
function Side({ phonemeId, end = false }: { phonemeId: EnglishPhonemeSymbolId; end?: boolean }) {
	return (
		<div className={cn("flex items-center gap-3", end && "flex-row-reverse text-right")}>
			<SoundTile ipa={getIpaForPhonemeId(phonemeId)} audioPath={phonemeAudioPath(phonemeId)} />
			<span className="text-sm text-muted-foreground">
				as in{" "}
				<span className="font-medium text-foreground">{getSoundKeyExample(phonemeId).word}</span>
			</span>
		</div>
	);
}

interface Round {
	words: readonly [string, string];
	ipas: readonly [string, string];
	answer: 0 | 1;
}

/**
 * Plays one word of a random minimal pair and asks which it was. It runs on
 * the word recordings alone, no microphone, so it works in every build.
 */
function ListenAndPick({
	phonemeId,
	comparisons,
}: {
	phonemeId: EnglishPhonemeSymbolId;
	comparisons: readonly PhonemeComparison[];
}) {
	const manifest = useWordAudioManifest(ACCENT);
	const audio = use(AudioManagerContext);
	const [round, setRound] = useState<Round | null>(null);
	const [picked, setPicked] = useState<0 | 1 | null>(null);
	const [score, setScore] = useState({ right: 0, total: 0 });
	const firstChoice = useRef<HTMLButtonElement>(null);

	// Start and Next word leave the page once pressed, so focus moves to the new choices.
	useEffect(() => {
		if (round) firstChoice.current?.focus();
	}, [round]);

	const ipa = getIpaForPhonemeId(phonemeId);
	const playable = manifest
		? comparisons.flatMap(({ partnerIpa, pairs }) =>
				pairs
					.filter(({ words }) => words.every((word) => wordRecordingUrl(manifest, ACCENT, word)))
					.map(({ words }) => ({ words, ipas: [ipa, partnerIpa] as const })),
			)
		: [];
	// Without recordings (none for the accent, or loading failed) there is nothing to hear.
	if (comparisons.length === 0 || (manifest !== undefined && playable.length === 0)) return null;

	const play = (r: Round) => {
		const src = wordRecordingUrl(manifest ?? null, ACCENT, r.words[r.answer]);
		if (src) audio?.play(src);
	};
	const next = () => {
		const item = playable[Math.floor(Math.random() * playable.length)];
		if (!item) return;
		const r: Round = { ...item, answer: Math.random() < 0.5 ? 0 : 1 };
		setRound(r);
		setPicked(null);
		play(r);
	};
	const pick = (choice: 0 | 1) => {
		if (!round || picked !== null) return;
		setPicked(choice);
		setScore((s) => ({ right: s.right + (choice === round.answer ? 1 : 0), total: s.total + 1 }));
	};

	return (
		<DetailsCard className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-sm font-semibold text-foreground">Can you hear it?</h3>
				{score.total > 0 ? (
					<p className="text-xs text-muted-foreground">{`${score.right} of ${score.total} right`}</p>
				) : null}
			</div>
			{round ? (
				<>
					<div className="grid grid-cols-2 gap-2">
						{round.words.map((word, index) => {
							const state =
								picked === null
									? "idle"
									: index === round.answer
										? "right"
										: index === picked
											? "wrong"
											: "idle";
							return (
								<button
									key={word}
									ref={index === 0 ? firstChoice : undefined}
									type="button"
									aria-disabled={picked !== null || undefined}
									onClick={() => pick(index as 0 | 1)}
									className={cn(
										"flex flex-col items-center gap-0.5 rounded-xl border border-border bg-background-strong px-3 py-3 text-lg text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:cursor-default motion-reduce:transition-none",
										state === "right" && "border-primary",
										state === "wrong" && "text-muted-foreground line-through",
									)}
								>
									<span className="flex items-center gap-1">
										{word}
										{state === "right" ? <Check aria-hidden="true" className="size-4" /> : null}
										{state === "wrong" ? <X aria-hidden="true" className="size-4" /> : null}
									</span>
									<span className="font-display text-xs text-muted-foreground">
										/{round.ipas[index]}/
									</span>
								</button>
							);
						})}
					</div>
					<p aria-live="polite" className="sr-only">
						{picked === null
							? ""
							: picked === round.answer
								? `Right, it was ${round.words[round.answer]}.`
								: `Not quite, it was ${round.words[round.answer]}.`}
					</p>
					<div className="flex gap-2">
						<Button variant="secondary" size="sm" onClick={() => play(round)}>
							<RotateCcw aria-hidden="true" />
							Play again
						</Button>
						{picked !== null ? (
							<Button size="sm" onClick={next}>
								Next word
								<ArrowRight aria-hidden="true" />
							</Button>
						) : null}
					</div>
				</>
			) : (
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						One word from a pair plays. Pick the one you heard.
					</p>
					<Button size="sm" onClick={next} disabled={playable.length === 0}>
						<Volume2 aria-hidden="true" />
						Start
					</Button>
				</div>
			)}
		</DetailsCard>
	);
}
