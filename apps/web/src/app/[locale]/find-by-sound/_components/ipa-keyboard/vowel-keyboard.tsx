"use client";

import { type KeyboardPhoneme, VOWEL_KEYBOARD } from "../../_lib/keyboard-layout";
import { PhonemeKey } from "./phoneme-key";

interface VowelKeyboardProps {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
}

export function VowelKeyboard({ onSelectPhoneme }: VowelKeyboardProps) {
	return (
		<div className="flex flex-wrap gap-1">
			{VOWEL_KEYBOARD.map((phoneme) => (
				<PhonemeKey key={phoneme.id} phoneme={phoneme} onSelect={onSelectPhoneme} />
			))}
		</div>
	);
}
