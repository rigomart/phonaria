import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const ARTICULATION_DEFINITIONS = {
	manner: {
		fricative: "Air flows with friction through a narrow gap. Sound is continuous.",
	},
	voicing: {
		voiceless: "Vocal cords don't vibrate. Touch your throat—you won't feel vibration.",
		voiced: "Vocal cords vibrate. Touch your throat—you'll feel vibration.",
	},
	place: {
		dental: "The tongue is placed between the teeth.",
	},
};

type Props = {
	illustration: {
		url: string;
		alt: string;
	};
	features: {
		manner: string;
		place: string;
		voicing: string;
	};
	steps: string[];
	pitfalls: {
		summary: string;
		tip: string;
	}[];
};

export function PhonemeArticulation({ illustration, features, steps, pitfalls }: Props) {
	return (
		<section className="space-y-3 px-3 sm:px-4">
			<h3 className="text-sm font-semibold uppercase">How to pronounce</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="flex items-start justify-center">
					<AspectRatio ratio={1}>
						<Image src={illustration.url} alt={illustration.alt} fill className="object-contain" />
					</AspectRatio>
				</div>

				<div className="space-y-3">
					<div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							Articulation
						</h4>
						<div className="space-y-1.5">
							<Tooltip>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground/80 font-semibold w-16 shrink-0">
										Manner:
									</span>
									<TooltipTrigger asChild>
										<Badge
											variant="secondary"
											className="font-medium cursor-help text-xs px-2 py-0.5"
										>
											{features.manner}
										</Badge>
									</TooltipTrigger>
								</div>
								<TooltipContent className="max-w-xs">
									<p className="text-xs">{ARTICULATION_DEFINITIONS.manner.fricative}</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground/80 font-semibold w-16 shrink-0">
										Place:
									</span>
									<TooltipTrigger asChild>
										<Badge
											variant="secondary"
											className="font-medium cursor-help text-xs px-2 py-0.5"
										>
											{features.place}
										</Badge>
									</TooltipTrigger>
								</div>
								<TooltipContent className="max-w-xs">
									<p className="text-xs">{ARTICULATION_DEFINITIONS.place.dental}</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground/80 font-semibold w-16 shrink-0">
										Voicing:
									</span>
									<TooltipTrigger asChild>
										<Badge
											variant="secondary"
											className="font-medium cursor-help text-xs px-2 py-0.5"
										>
											{features.voicing}
										</Badge>
									</TooltipTrigger>
								</div>
								<TooltipContent className="max-w-xs">
									<p className="text-xs">{ARTICULATION_DEFINITIONS.voicing.voiceless}</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					<div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							Step-by-Step
						</h4>
						<ol className="space-y-1 text-xs">
							{steps.map((step, i) => (
								<li key={step} className="flex gap-1.5">
									<span className="text-primary font-semibold shrink-0">{i + 1}.</span>
									<span className="text-foreground">{step}</span>
								</li>
							))}
						</ol>
					</div>

					<div className="space-y-1.5">
						<h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">
							Common Mistakes
						</h4>
						<div className="space-y-1">
							{pitfalls.map((pitfall) => (
								<Popover key={pitfall.summary}>
									<PopoverTrigger asChild>
										<button
											type="button"
											className="w-full text-left px-2 py-1.5 rounded-md border hover:bg-muted/50 transition-colors text-xs"
										>
											<span className="text-foreground font-semibold">‣ {pitfall.summary}</span>
										</button>
									</PopoverTrigger>
									<PopoverContent className="w-80 text-xs" align="start">
										<p className="text-muted-foreground">{pitfall.tip}</p>
									</PopoverContent>
								</Popover>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
