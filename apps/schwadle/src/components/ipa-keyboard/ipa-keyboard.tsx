import { Separator } from "@phonaria/ui/components/separator";
import { CONSONANT_KEYBOARD, type KeyboardPhoneme, VOWEL_KEYBOARD } from "@/lib/keyboard-layout";
import { PhonemeKey } from "./phoneme-key";

type IpaKeyboardProps = {
	onSelectPhoneme: (phoneme: KeyboardPhoneme) => void;
	audioEnabled?: boolean;
};

export function IpaKeyboard({ onSelectPhoneme, audioEnabled }: IpaKeyboardProps) {
	return (
		<div className="flex flex-col gap-2">
			<div>
				<p className="mb-1 text-xs font-medium text-muted-foreground">Consonants</p>
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
			<Separator />
			<div>
				<p className="mb-1 text-xs font-medium text-muted-foreground">Vowels</p>
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
