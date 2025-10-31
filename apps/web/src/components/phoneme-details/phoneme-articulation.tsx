import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
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
	illustrationUrl: string;
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

export function PhonemeArticulation({ illustrationUrl, features, steps, pitfalls }: Props) {
	return (
		<div className="pb-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div className="flex items-start justify-center">
				<AspectRatio ratio={1}>
					<Image
						src={illustrationUrl}
						alt="Articulation Illustration"
						fill
						className="object-contain"
					/>
				</AspectRatio>
			</div>

			<div className="space-y-3">
				<section className="space-y-1.5">
					<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Articulation
					</h4>
					<div className="flex flex-wrap gap-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="default" className="font-medium cursor-help text-xs px-2 py-0.5">
									Manner: {features.manner}
								</Badge>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<div className="space-y-1">
									<p className="font-semibold text-xs">Manner</p>
									<p className="text-xs">{ARTICULATION_DEFINITIONS.manner.fricative}</p>
								</div>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="default" className="cursor-help text-xs px-2 py-0.5">
									Place: {features.place}
								</Badge>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<div className="space-y-1">
									<p className="font-semibold text-xs">Place</p>
									<p className="text-xs">{ARTICULATION_DEFINITIONS.place.dental}</p>
								</div>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge variant="default" className="cursor-help text-xs px-2 py-0.5">
									Voicing: {features.voicing}
								</Badge>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<div className="space-y-1">
									<p className="font-semibold text-xs">Voicing</p>
									<p className="text-xs">{ARTICULATION_DEFINITIONS.voicing.voiceless}</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</div>
				</section>

				<section className="space-y-1.5">
					<h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
				</section>

				<section className="space-y-1.5">
					<h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
						Common Mistakes
					</h4>
					<div className="space-y-1">
						{pitfalls.map((pitfall) => (
							<Collapsible key={pitfall.summary}>
								<CollapsibleTrigger asChild>
									<button
										type="button"
										className="w-full text-left flex items-start gap-1.5 px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-xs"
									>
										<span className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">⚠</span>
										<span className="text-amber-900 dark:text-amber-200 flex-1">
											{pitfall.summary}
										</span>
										<ChevronsUpDown className="size-3" />
									</button>
								</CollapsibleTrigger>
								<CollapsibleContent className="text-xs text-amber-800 dark:text-amber-100 pl-4 py-1 border-l border-amber-200 dark:border-amber-800 ml-1">
									<p>{pitfall.tip}</p>
								</CollapsibleContent>
							</Collapsible>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
