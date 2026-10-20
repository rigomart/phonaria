"use client";

/**
 * What the page says about one spoken attempt. Every verdict and failure is a
 * sentence, so none of them depends on its color or icon. Nothing here is
 * worded as a mistake: a swap names the sound that came through, and weak
 * evidence says what to try next, never "wrong".
 */
import { buttonVariants } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import {
	ArrowLeftRight,
	Check,
	CircleHelp,
	Ear,
	Info,
	type LucideIcon,
	MicOff,
	Scale,
	Volume2,
} from "lucide-react";
import type { ReactNode } from "react";
import { WordAudioButton } from "@/components/word-audio-button";
import { cn } from "@/lib/utils";
import type { MinimalPairPrompt } from "../_lib/minimal-pair-prompt";
import type { SpeakingFailure, SpeakingOutcome, SpeakingView } from "../_lib/speaking-attempt";

export const FAILURE_MESSAGES: Record<SpeakingFailure, string> = {
	denied:
		"Phonaria can't use your microphone. Allow microphone access for this site, then try again.",
	unsupported:
		"Recording isn't available here. Check that a microphone is connected, or try another browser.",
	rate_limited: "That's a lot of recordings in a short time. Wait a minute, then try again.",
	unavailable: "Checking sounds isn't available right now. Try again later.",
	scoring_failed: "Your recording couldn't be checked. Try again.",
};

const TONES = {
	success: { panel: "border-success bg-background-strong", icon: "text-success-foreground" },
	info: { panel: "border-info bg-background-strong", icon: "text-info-foreground" },
	neutral: { panel: "border-border bg-muted", icon: "text-muted-foreground" },
} as const;

function Panel({
	icon: Icon,
	tone,
	children,
	action,
}: {
	icon: LucideIcon;
	tone: keyof typeof TONES;
	children: ReactNode;
	action?: ReactNode;
}) {
	return (
		<div
			className={cn(
				"mt-5 flex w-full items-start gap-3 rounded-lg border p-4 text-left enter-scale",
				TONES[tone].panel,
			)}
		>
			<Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", TONES[tone].icon)} />
			<div className="flex flex-col items-start gap-3">
				<p className="text-pretty text-foreground text-sm">{children}</p>
				{action}
			</div>
		</div>
	);
}

function Word({ children }: { children: ReactNode }) {
	return <em className="font-display font-semibold not-italic">{children}</em>;
}

function Sound({ ipa }: { ipa: string }) {
	return <span className="font-display">/{ipa}/</span>;
}

function OutcomePanel({
	prompt,
	outcome,
}: {
	prompt: MinimalPairPrompt;
	outcome: SpeakingOutcome;
}) {
	const target = <Sound ipa={prompt.target.ipa} />;

	switch (outcome.verdict) {
		case "match":
			return (
				<Panel icon={Check} tone="success">
					Your {target} sounded right. That's <Word>{prompt.word}</Word>.
				</Panel>
			);
		case "swapped": {
			const { heard, heardWord } = outcome;
			return (
				<Panel
					action={
						heardWord ? (
							<WordAudioButton
								className={buttonVariants({ size: "sm", variant: "outline" })}
								targetAccent="en-us"
								word={heardWord}
							>
								<Volume2 aria-hidden="true" />
								Hear {heardWord}
							</WordAudioButton>
						) : null
					}
					icon={ArrowLeftRight}
					tone="info"
				>
					Your {target} sounded like <Sound ipa={heard.ipa} />
					{heardWord ? (
						<>
							, which makes <Word>{heardWord}</Word>.
						</>
					) : (
						"."
					)}
				</Panel>
			);
		}
		case "not-heard":
			return (
				<Panel icon={Ear} tone="neutral">
					We didn't catch anything. Check your microphone and try again.
				</Panel>
			);
		case "different-word":
			return <DifferentWordPanel heard={outcome.heard} prompt={prompt} />;
		case "unclear":
			switch (outcome.reason) {
				case "no-evidence":
					return (
						<Panel icon={Ear} tone="neutral">
							Didn't catch the word. Try again a little closer to the mic.
						</Panel>
					);
				case "close-call":
					return (
						<Panel icon={Scale} tone="info">
							Somewhere between {target} and <Sound ipa={prompt.partner.ipa} />. Try again and make
							it a clear {target}.
						</Panel>
					);
				case "other-sound":
					return (
						<Panel icon={CircleHelp} tone="neutral">
							That didn't sound clearly like {target} or <Sound ipa={prompt.partner.ipa} />. Try
							again.
						</Panel>
					);
			}
	}
}

/** The recording wasn't the word, so no sound was judged: say what came through instead. */
function DifferentWordPanel({
	prompt,
	heard,
}: {
	prompt: MinimalPairPrompt;
	heard: readonly string[];
}) {
	const word = <Word>{prompt.word}</Word>;
	if (heard.length > 1) {
		return (
			<Panel icon={CircleHelp} tone="neutral">
				We heard "{heard.join(" ")}". Say just {word} on its own.
			</Panel>
		);
	}
	if (heard.length === 1) {
		return (
			<Panel icon={CircleHelp} tone="neutral">
				That sounded like <Word>{heard[0]}</Word>, not {word}. Try again with just the word.
			</Panel>
		);
	}
	return (
		<Panel icon={CircleHelp} tone="neutral">
			That didn't sound like {word} or <Word>{prompt.partnerWord}</Word>. Try again.
		</Panel>
	);
}

/**
 * Lives inside an always-mounted polite live region, so each new status and
 * result is read out without moving focus. Renders nothing before a recording,
 * so the region takes no room until there is something to say.
 */
export function SpeakingStatus({
	prompt,
	view,
}: {
	prompt: MinimalPairPrompt;
	view: SpeakingView;
}) {
	switch (view.phase) {
		case "ready":
			return null;
		case "requesting-permission":
			return (
				<p className="mt-5 text-center text-muted-foreground text-sm">
					Waiting for the microphone…
				</p>
			);
		case "recording":
			return (
				<p className="mt-5 text-center text-muted-foreground text-sm">
					Listening. Say <Word>{prompt.word}</Word>.
				</p>
			);
		case "scoring":
			return (
				<p className="mt-5 flex items-center justify-center gap-2 text-muted-foreground text-sm">
					<Spinner />
					<span>
						Checking your <Sound ipa={prompt.target.ipa} />…
					</span>
				</p>
			);
		case "outcome":
			return <OutcomePanel outcome={view.outcome} prompt={prompt} />;
		case "failure":
			return (
				<Panel
					icon={view.failure === "denied" || view.failure === "unsupported" ? MicOff : Info}
					tone="neutral"
				>
					{FAILURE_MESSAGES[view.failure]}
				</Panel>
			);
	}
}
