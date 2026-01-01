"use client";

import { CONSONANT_KEYBOARD, type KeyboardPhoneme } from "../../_lib/keyboard-layout";
import { PhonemeKey } from "./phoneme-key";

interface ConsonantKeyboardProps {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
}

export function ConsonantKeyboard({ onSelectPhoneme }: ConsonantKeyboardProps) {
	return (
		<div className="flex flex-wrap gap-1">
			{CONSONANT_KEYBOARD.map((phoneme) => (
				<PhonemeKey key={phoneme.id} phoneme={phoneme} onSelect={onSelectPhoneme} />
			))}
		</div>
	);
}
