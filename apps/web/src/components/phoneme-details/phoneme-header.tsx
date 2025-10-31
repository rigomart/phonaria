import { AudioControls } from "../audio-controls";

type Props = {
	symbol: string;
	description: string;
	audioUrl: string;
};

export function PhonemeHeader({ symbol, description, audioUrl }: Props) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2 font-bold">
					<span className="text-3xl text-muted-foreground/50">/</span>
					<span className="text-5xl leading-none tracking-tight">{symbol}</span>
					<span className="text-3xl text-muted-foreground/50">/</span>
				</div>
				<AudioControls src={audioUrl} label={`Play ${symbol}`} />
			</div>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}
