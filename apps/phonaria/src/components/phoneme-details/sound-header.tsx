"use client";

import {
	formatPhonemeLabel,
	getIpaForPhonemeId,
	getPhonemeType,
	type LanguagePhonemeId,
	type PhonemeType,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { SheetClose, SheetDescription, SheetTitle } from "@phonaria/ui/components/sheet";
import { XIcon } from "lucide-react";
import type { HTMLAttributes } from "react";
import { AudioControls } from "@/components/audio-controls";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<PhonemeType, string> = {
	consonant: "Consonant",
	monophthong: "Vowel",
	diphthong: "Diphthong",
};

/**
 * What the sound is and how it sounds. Sticky, so the symbol and audio stay in
 * reach while the sections below scroll.
 */
export function SoundHeader({
	targetAccent,
	phonemeId,
	dragHandleProps,
}: {
	targetAccent: TargetAccent;
	phonemeId: LanguagePhonemeId<TargetAccent>;
	/** On a bottom sheet, the header is what a finger pulls down to close it. */
	dragHandleProps?: HTMLAttributes<HTMLElement>;
}) {
	const ipa = getIpaForPhonemeId(phonemeId);
	const type = getPhonemeType(phonemeId);
	// Diphthong names run to a dozen words; where it glides says the same thing plainly.
	const name =
		type === "diphthong"
			? `Glides from ${ipa.charAt(0)} to ${ipa.slice(-1)}`
			: formatPhonemeLabel(targetAccent, phonemeId);
	// Diphthongs have no recordings yet.
	const hasAudio = type !== "diphthong";

	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex flex-col gap-3 bg-popover px-5 pt-3 pb-4",
				dragHandleProps && "touch-none",
			)}
			{...dragHandleProps}
		>
			{dragHandleProps ? (
				<span aria-hidden="true" className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-accent" />
			) : null}
			<div className="flex items-start gap-4">
				<span
					aria-hidden="true"
					className="grid size-14 shrink-0 place-items-center rounded-2xl bg-background font-display text-4xl leading-none text-foreground"
				>
					{ipa}
				</span>
				<div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
					<SheetDescription className="text-xs font-medium">{TYPE_LABELS[type]}</SheetDescription>
					<SheetTitle className="font-display text-lg leading-snug font-semibold tracking-tight text-balance">
						<span className="sr-only">/{ipa}/, </span>
						{name}
					</SheetTitle>
				</div>
				<SheetClose
					render={<Button variant="secondary" size="icon" className="size-11 shrink-0" />}
				>
					<XIcon aria-hidden />
					<span className="sr-only">Close</span>
				</SheetClose>
			</div>
			{hasAudio ? <AudioControls path={`/audio/phonemes/${phonemeId}.ogg`} label={ipa} /> : null}
		</header>
	);
}
