import { AudioControls } from "../audio-controls";

type Props = {
	symbol: string;
	description: string;
	audioUrl: string;
};

export function PhonemeHeader({ symbol, description, audioUrl }: Props) {
	return (
		<div className="flex flex-col gap-1 bg-background-strong p-3 sm:p-4 rounded-xl">
			<div className="flex gap-6 items-center">
				<div className="flex items-center gap-2 font-bold">
					<span className="text-3xl text-muted-foreground/50">/</span>
					<span className="text-5xl leading-none tracking-tight">{symbol}</span>
					<span className="text-3xl text-muted-foreground/50">/</span>
				</div>
				<AudioControls size="xs" src={audioUrl} label={`Play ${symbol}`} />
			</div>
			<p className="text-xs text-muted-foreground/80">{description}</p>
		</div>
	);
}
