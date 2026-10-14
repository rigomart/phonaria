"use client";

import { Popover, PopoverContent } from "@phonaria/ui/components/popover";
import { useId, useRef } from "react";
import { cardHandle, type DetailsPayload, focusTrigger } from "./context";
import { MoreButton } from "./more-button";
import { describeSound } from "./sound";
import { SoundHeader } from "./sound-header";

/**
 * Wide screens, level 1: a small card anchored to the sound, enough for a quick
 * lookup. "More about" hands the sound to the side panel.
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
	const sound = describeSound(payload.options);

	return (
		<PopoverContent
			sideOffset={8}
			aria-labelledby={titleId}
			// The sound's name, like the drawer and panel announce, rather than the first link.
			initialFocus={() => document.getElementById(titleId)}
			finalFocus={finalFocus}
			className="w-80 gap-0 p-0 motion-reduce:data-open:animate-none motion-reduce:data-closed:animate-none"
		>
			<div data-phoneme-details className="flex flex-col gap-4 p-4">
				<SoundHeader sound={sound} titleId={titleId} />
				<MoreButton ipa={sound.ipa} direction="right" onClick={onExpand} />
			</div>
		</PopoverContent>
	);
}
