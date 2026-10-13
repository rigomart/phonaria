"use client";

import {
	getIpaForPhonemeId,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Drawer, DrawerBody, DrawerContent } from "@phonaria/ui/components/drawer";
import { type ReactNode, createContext, useContext, useId, useState } from "react";
import { PhonemeDetails } from "@/components/phoneme-details/phoneme-details";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/** Below Tailwind's `xl`, details open in a bottom drawer. */
const NARROW_QUERY = "(max-width: 79.98rem)";

/**
 * Where the side panel docks next to the chart. Between `xl` and a later dock
 * point, details slide in from the right over the chart instead.
 */
const DOCK = {
	xl: {
		undocked: NARROW_QUERY,
		grid: "xl:grid-cols-[minmax(0,1fr)_20rem]",
		panel: "xl:block",
	},
	"2xl": {
		undocked: "(max-width: 95.98rem)",
		grid: "2xl:grid-cols-[minmax(0,1fr)_20rem]",
		panel: "2xl:block",
	},
} as const;

type SoundSelection = {
	selectedId: string | undefined;
	select: (phonemeId: string) => void;
};

const SoundSelectionContext = createContext<SoundSelection>({
	selectedId: undefined,
	select: () => {},
});

/** Selection state for one sound button on a chart page. */
export function useSoundSelection(phonemeId: string) {
	const { selectedId, select } = useContext(SoundSelectionContext);
	return { selected: selectedId === phonemeId, select: () => select(phonemeId) };
}

/** Whether a sound is selected on this chart page, for state that follows it. */
export function useSelectedSound() {
	return useContext(SoundSelectionContext).selectedId;
}

type SoundDetailsLayoutProps<TLanguage extends TargetAccent> = {
	targetAccent: TLanguage;
	selectedId: LanguagePhonemeId<TLanguage> | undefined;
	onSelect: (phonemeId: LanguagePhonemeId<TLanguage>) => void;
	onClose: () => void;
	/** `2xl` for a chart too wide to share the row with the panel at `xl`. */
	dockFrom?: keyof typeof DOCK;
	/** Off on the Frequency page, which is where that link goes. */
	showFrequencyLink?: boolean;
	children: ReactNode;
};

/**
 * Chart pages put the selected sound's details in a side panel on wide
 * screens, so the chart stays in view, and in a bottom drawer on narrow ones.
 */
export function SoundDetailsLayout<TLanguage extends TargetAccent>({
	targetAccent,
	selectedId,
	onSelect,
	onClose,
	dockFrom = "xl",
	showFrequencyLink = true,
	children,
}: SoundDetailsLayoutProps<TLanguage>) {
	const dock = DOCK[dockFrom];
	const narrow = useMediaQuery(NARROW_QUERY);
	const undocked = useMediaQuery(dock.undocked);
	// The panel is hidden until it docks; skip its diagram and audio before then.
	const panelSound = undocked ? undefined : selectedId;
	const drawerSide = narrow ? "bottom" : "right";
	const panelHeadingId = useId();
	const drawerHeadingId = useId();
	// Keep the last sound in the drawer while it animates closed.
	const [drawerSound, setDrawerSound] = useState(selectedId);
	if (selectedId && selectedId !== drawerSound) setDrawerSound(selectedId);

	const selection: SoundSelection = {
		selectedId,
		select: (phonemeId) => onSelect(phonemeId as LanguagePhonemeId<TLanguage>),
	};

	return (
		<SoundSelectionContext value={selection}>
			<div className={cn("grid w-full items-start gap-6", dock.grid)}>
				<div className="min-w-0">{children}</div>

				<aside
					aria-labelledby={panelSound ? panelHeadingId : undefined}
					aria-label={panelSound ? undefined : "Sound details"}
					className={cn(
						"sticky top-28 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-3xl border bg-popover p-4 text-popover-foreground",
						dock.panel,
					)}
				>
					{panelSound ? (
						<PhonemeDetails
							targetAccent={targetAccent}
							phonemeId={panelSound}
							headingId={panelHeadingId}
							showFrequencyLink={showFrequencyLink}
						/>
					) : (
						<p className="py-10 text-center text-sm text-muted-foreground text-balance">
							Pick a sound to hear it, see how it's made and find words that use it.
						</p>
					)}
				</aside>
			</div>

			<p className="sr-only" aria-live="polite">
				{panelSound ? `Showing details for /${getIpaForPhonemeId(panelSound)}/` : ""}
			</p>

			{/*
			 * The side sheet is non-modal, so sounds left of it can still be picked;
			 * the bottom drawer covers most of a phone screen and stays modal.
			 */}
			<Drawer
				key={drawerSide}
				open={undocked && Boolean(selectedId)}
				onOpenChange={(open) => {
					if (!open) onClose();
				}}
				swipeDirection={narrow ? "down" : "right"}
				modal={narrow}
				disablePointerDismissal={!narrow}
			>
				<DrawerContent aria-labelledby={drawerHeadingId} side={drawerSide} showBackdrop={narrow}>
					<DrawerBody>
						{drawerSound && (
							<PhonemeDetails
								targetAccent={targetAccent}
								phonemeId={drawerSound}
								headingId={drawerHeadingId}
								showFrequencyLink={showFrequencyLink}
								className="mx-auto max-w-sm"
							/>
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</SoundSelectionContext>
	);
}
