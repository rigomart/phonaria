import { Button } from "@phonaria/ui/components/button";
import { Popover, PopoverContent } from "@phonaria/ui/components/popover";
import { ArrowRight } from "lucide-react";
import { useId, useRef } from "react";
import { formatOrdinal } from "@/lib/phoneme-frequency";
import { ArticulationThumbnail } from "./articulation-thumbnail";
import { CardWordList, getCardWords } from "./card-words";
import { cardHandle, type DetailsPayload, focusTrigger } from "./context";
import { SoundFrequency } from "./frequency";
import { describeSound } from "./sound";
import { SoundHeading, soundTitleTarget } from "./sound-header";
import { SoundTile } from "./sound-tile";

/**
 * Wide screens, level 1: a small card anchored to the sound, enough for a quick
 * lookup. Its "Full details" button hands the sound to the side panel.
 */
export function DetailsCard({
	onTriggerChange,
	onExpand,
}: {
	onTriggerChange: (triggerId: string | null) => void;
	onExpand: (payload: DetailsPayload) => void;
}) {
	// The panel takes focus when the card hands over, so the card must not send it back to the trigger.
	const handingOver = useRef(false);

	return (
		<Popover
			handle={cardHandle}
			onOpenChange={(open, { trigger }) => {
				if (open) handingOver.current = false;
				onTriggerChange(open ? (trigger?.id ?? null) : null);
			}}
		>
			{({ payload }) =>
				payload ? (
					<CardContent
						payload={payload}
						finalFocus={() => !handingOver.current && focusTrigger(payload.triggerId)}
						onExpand={() => {
							handingOver.current = true;
							onExpand(payload);
							cardHandle.close();
						}}
					/>
				) : null
			}
		</Popover>
	);
}

function CardContent({
	payload,
	finalFocus,
	onExpand,
}: {
	payload: DetailsPayload;
	finalFocus: () => HTMLElement | false;
	onExpand: () => void;
}) {
	const titleId = useId();
	const { targetAccent, phonemeId } = payload.options;
	const sound = describeSound(payload.options);
	const cardWords = getCardWords(payload.options);
	const frequencyBeside = !cardWords && sound.frequency;

	return (
		<PopoverContent
			sideOffset={8}
			aria-labelledby={titleId}
			initialFocus={() => soundTitleTarget(titleId)}
			finalFocus={finalFocus}
			className="w-88 gap-0 p-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none"
		>
			<div data-phoneme-details className="flex flex-col gap-4 p-4">
				<div className="flex items-start gap-4">
					<SoundTile ipa={sound.ipa} audioPath={sound.audioPath} />
					<div className="flex min-w-0 flex-col gap-1">
						<SoundHeading sound={sound} titleId={titleId} />
						<p className="text-sm text-muted-foreground">
							{sound.typeLabel}
							{sound.frequency && !frequencyBeside ? (
								<>
									{" · "}
									<span className="whitespace-nowrap tabular-nums">
										{formatOrdinal(sound.frequency.rank)} most common of {sound.frequency.count}
									</span>
								</>
							) : null}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-4">
					<div className="w-36 shrink-0">
						<ArticulationThumbnail targetAccent={targetAccent} phonemeId={phonemeId} />
					</div>
					{cardWords ? (
						<div className="min-w-0 flex-1">
							<CardWordList targetAccent={targetAccent} ipa={sound.ipa} cardWords={cardWords} />
						</div>
					) : frequencyBeside ? (
						<div className="min-w-0 flex-1 self-stretch">
							<SoundFrequency
								frequency={frequencyBeside}
								showLink={sound.showFrequencyLink}
								stacked
							/>
						</div>
					) : null}
				</div>
				<Button variant="secondary" onClick={onExpand} className="w-full justify-between">
					<span>
						Full details<span className="sr-only"> for /{sound.ipa}/</span>
					</span>
					<ArrowRight aria-hidden="true" />
				</Button>
			</div>
		</PopoverContent>
	);
}
