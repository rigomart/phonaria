import { Tooltip, TooltipContent, TooltipTrigger } from "@phonaria/ui/components/tooltip";
import { useAudioManager } from "@/hooks/use-audio-manager";
import type { KeyboardPhoneme } from "@/lib/keyboard-layout";

type PhonemeKeyProps = {
	phoneme: KeyboardPhoneme;
	onSelect: (phoneme: KeyboardPhoneme) => void;
	audioEnabled?: boolean;
};

const baseUrl = import.meta.env.VITE_BUCKET_URL?.replace(/\/+$/, "");

export function PhonemeKey({ phoneme, onSelect, audioEnabled }: PhonemeKeyProps) {
	const audioSrc = audioEnabled && baseUrl ? `${baseUrl}/audio/phonemes/${phoneme.id}.ogg` : "";
	const { play } = useAudioManager(audioSrc);

	function handleClick() {
		onSelect(phoneme);
		if (audioEnabled && audioSrc) {
			play();
		}
	}

	return (
		<Tooltip>
			<TooltipTrigger
				type="button"
				onClick={handleClick}
				className="flex size-10 items-center justify-center rounded-md border bg-card text-sm font-medium transition-colors hover:bg-muted active:bg-muted-foreground/10"
			>
				{phoneme.ipa}
			</TooltipTrigger>
			<TooltipContent>{phoneme.arpabet}</TooltipContent>
		</Tooltip>
	);
}
