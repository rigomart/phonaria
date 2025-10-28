"use client";

import { Info } from "lucide-react";
import { AudioControls } from "@/components/audio-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@/i18n/navigation";
import { usePhonemeDetailsContext } from "./index";

export function PhonemeDetailsHeader() {
	const { phoneme } = usePhonemeDetailsContext();

	return (
		<div className="flex items-start justify-between gap-4">
			<div className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 font-bold">
						<span className="text-3xl text-muted-foreground/50">/</span>
						<span className="text-5xl leading-none tracking-tight">{phoneme.symbol}</span>
						<span className="text-3xl text-muted-foreground/50">/</span>
					</div>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/credits"
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Audio credits"
							>
								<Info className="h-4 w-4" />
							</Link>
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-xs">Audio credits</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<p className="text-sm text-muted-foreground max-w-prose leading-relaxed">
					{phoneme.description}
				</p>
			</div>
			{phoneme.audioUrl ? (
				<div className="shrink-0">
					<AudioControls
						src={phoneme.audioUrl}
						label={`Play ${phoneme.symbol}`}
						variant="extended"
					/>
				</div>
			) : null}
		</div>
	);
}
