"use client";

import { Button } from "@phonaria/ui/components/button";
import { Drawer, DrawerClose, DrawerContent } from "@phonaria/ui/components/drawer";
import { XIcon } from "lucide-react";
import { useId } from "react";
import { type DetailsPayload, focusTrigger } from "./context";
import { DetailSections, getDetailSections } from "./sections";
import { describeSound } from "./sound";
import { SoundHeader } from "./sound-header";

/**
 * Wide screens, level 2: the full details in a panel laid over the right of
 * the page, which keeps its layout. It is non-modal and ignores outside
 * clicks, so clicking another sound swaps what it shows (the trigger handles
 * that); Esc, the close button or the active sound close it.
 */
export function DetailsPanel({
	panel,
	onClose,
}: {
	panel: { open: boolean; payload: DetailsPayload } | null;
	onClose: () => void;
}) {
	return (
		<Drawer
			open={panel?.open ?? false}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			modal={false}
			disablePointerDismissal
			swipeDirection="right"
		>
			{panel ? <PanelContent payload={panel.payload} /> : null}
		</Drawer>
	);
}

function PanelContent({ payload }: { payload: DetailsPayload }) {
	const titleId = useId();

	return (
		<DrawerContent
			side="right"
			showOverlay={false}
			aria-labelledby={titleId}
			finalFocus={() => focusTrigger(payload.triggerId)}
			className="inset-y-3 right-3 h-auto w-96 overflow-clip rounded-3xl border-0 motion-reduce:transition-none"
		>
			{/* Keyed by trigger so a swapped sound starts at the top. */}
			<div
				key={payload.triggerId}
				data-phoneme-details
				className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
			>
				<div className="sticky top-0 z-10 bg-popover p-5 pb-4">
					<SoundHeader
						sound={describeSound(payload.options)}
						titleId={titleId}
						showExample={false}
						action={
							<DrawerClose
								render={<Button variant="secondary" size="icon" className="size-11 shrink-0" />}
							>
								<XIcon aria-hidden="true" />
								<span className="sr-only">Close</span>
							</DrawerClose>
						}
					/>
				</div>
				<div className="px-5 pb-6">
					<DetailSections
						targetAccent={payload.options.targetAccent}
						sections={getDetailSections(payload.options)}
					/>
				</div>
			</div>
		</DrawerContent>
	);
}
