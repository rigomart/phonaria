import { CONSONANT_KEYBOARD, type KeyboardPhoneme, VOWEL_KEYBOARD } from "@/lib/keyboard-layout";
import { PhonemeKey } from "./phoneme-key";

type IpaKeyboardProps = {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
	audioEnabled?: boolean;
};

export function IpaKeyboard({ onSelectPhoneme, audioEnabled }: IpaKeyboardProps) {
	return (
		<div className="flex flex-col gap-2.5">
			<div>
				<p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Consonants
				</p>
				<div className="flex flex-wrap gap-1">
					{CONSONANT_KEYBOARD.map((phoneme) => (
						<PhonemeKey
							key={phoneme.id}
							phoneme={phoneme}
							onSelect={onSelectPhoneme}
							audioEnabled={audioEnabled}
						/>
					))}
				</div>
			</div>
			<div className="h-px bg-border" />
			<div>
				<p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Vowels
				</p>
				<div className="flex flex-wrap gap-1">
					{VOWEL_KEYBOARD.map((phoneme) => (
						<PhonemeKey
							key={phoneme.id}
							phoneme={phoneme}
							onSelect={onSelectPhoneme}
							audioEnabled={audioEnabled}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
