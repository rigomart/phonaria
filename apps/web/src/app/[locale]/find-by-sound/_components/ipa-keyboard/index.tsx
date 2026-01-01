"use client";

import { Separator } from "@phonaria/ui/components/separator";
import type { KeyboardPhoneme } from "../../_lib/keyboard-layout";
import { ConsonantKeyboard } from "./consonant-keyboard";
import { VowelKeyboard } from "./vowel-keyboard";

interface IpaKeyboardProps {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
}

export function IpaKeyboard({ onSelectPhoneme }: IpaKeyboardProps) {
	return (
		<div className="flex flex-col gap-2">
			<ConsonantKeyboard onSelectPhoneme={onSelectPhoneme} />

			<Separator />

			<VowelKeyboard onSelectPhoneme={onSelectPhoneme} />
		</div>
	);
}
