"use client";

import type { TargetAccent } from "@phonaria/phonetics-data";
import {
	createSheetHandle,
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@phonaria/ui/components/sheet";
import { type ComponentProps, useEffect, useState } from "react";
import { usePathname } from "@/components/site-nav";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PhonemeDetails, type PhonemeDetailsProps } from "./phoneme-details";
import { SoundHeader } from "./sound-header";
import { useDragToClose } from "./use-drag-to-close";

type PhonemeDetailsPayload = PhonemeDetailsProps<TargetAccent>;

/** Every sound button opens the one details sheet through this handle. */
const phonemeDetailsHandle = createSheetHandle<PhonemeDetailsPayload>();

/** Wide enough to dock the details beside the page instead of over it. */
const DOCKED_QUERY = "(width >= 80rem)";

/**
 * Opens the details for one sound. Takes the same visibility props as
 * `PhonemeDetails`, so each host decides what its learners may see.
 */
export function PhonemeDetailsTrigger({
	details,
	...props
}: Omit<ComponentProps<typeof SheetTrigger>, "handle" | "payload"> & {
	details: PhonemeDetailsPayload;
}) {
	return <SheetTrigger handle={phonemeDetailsHandle} payload={details} {...props} />;
}

/**
 * The one container for sound details, mounted once by the app shell.
 *
 * Phones get a modal bottom sheet within thumb reach. Wide screens get a
 * non-modal panel docked at the right edge: the page stays usable beside it,
 * so clicking another sound swaps the panel's content for a side-by-side look.
 */
export function PhonemeDetailsSheet({
	onDockedChange,
}: {
	/** Lets the shell make room for the docked panel. */
	onDockedChange: (docked: boolean) => void;
}) {
	const docked = useMediaQuery(DOCKED_QUERY);
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const drag = useDragToClose(() => phonemeDetailsHandle.close());

	// Leaving the page leaves its sounds behind.
	useEffect(() => {
		phonemeDetailsHandle.close();
	}, [pathname]);

	useEffect(() => {
		onDockedChange(open && docked);
	}, [open, docked, onDockedChange]);

	return (
		<Sheet
			handle={phonemeDetailsHandle}
			modal={!docked}
			disablePointerDismissal={docked}
			onOpenChange={(next) => {
				setOpen(next);
				if (next) drag.reset();
			}}
		>
			{({ payload }) =>
				payload && (
					<SheetContent
						side={docked ? "right" : "bottom"}
						showCloseButton={false}
						showOverlay={!docked}
						className={docked ? "shadow-none" : "max-h-11/12 rounded-t-3xl sm:mx-auto sm:max-w-lg"}
						style={dragStyle(drag.offset, open)}
					>
						<div
							data-phoneme-details
							className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
						>
							<SoundHeader
								targetAccent={payload.targetAccent}
								phonemeId={payload.phonemeId}
								dragHandleProps={docked ? undefined : drag.handleProps}
							/>
							<PhonemeDetails {...payload} />
						</div>
					</SheetContent>
				)
			}
		</Sheet>
	);
}

/** Follows the finger while dragging, then slides the rest of the way out once let go to close. */
function dragStyle(offset: number, open: boolean) {
	if (offset === 0) return undefined;
	return open
		? { transform: `translateY(${offset}px)`, transition: "none" }
		: { transform: "translateY(100%)" };
}
