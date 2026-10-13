"use client";

import {
	getIpaForPhonemeId,
	type LanguagePhonemeId,
	type TargetAccent,
} from "@phonaria/phonetics-data";
import { Button } from "@phonaria/ui/components/button";
import { Drawer, DrawerBody, DrawerContent } from "@phonaria/ui/components/drawer";
import { XIcon } from "lucide-react";
import { type ReactNode, createContext, useContext, useEffect, useId, useState } from "react";
import { PhonemeDetails } from "@/components/phoneme-details/phoneme-details";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChartNav } from "./chart-nav";

/** Below Tailwind's `lg`, details open in a bottom drawer instead of the sheet. */
const NARROW_QUERY = "(max-width: 63.98rem)";

/** How long the sheet takes to open, so the chart can reveal the sound after. */
export const SHEET_TRANSITION_MS = 300;

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
	/** Off on the Frequency page, which is where that link goes. */
	showFrequencyLink?: boolean;
	children: ReactNode;
};

/**
 * Chart pages: the chart tabs and page content, with the selected sound's
 * details in a sheet beside them. The sheet runs from the site header to the
 * footer and pushes the chart over as it opens. Narrow screens get a bottom
 * drawer instead.
 */
export function SoundDetailsLayout<TLanguage extends TargetAccent>({
	targetAccent,
	selectedId,
	onSelect,
	onClose,
	showFrequencyLink = true,
	children,
}: SoundDetailsLayoutProps<TLanguage>) {
	const narrow = useMediaQuery(NARROW_QUERY);
	const sheetOpen = !narrow && Boolean(selectedId);
	const sheetHeadingId = useId();
	const drawerHeadingId = useId();
	// Keep the last sound in the sheet and drawer while they animate closed.
	const [shownSound, setShownSound] = useState(selectedId);
	if (selectedId && selectedId !== shownSound) setShownSound(selectedId);
	// The sheet is hidden on narrow screens; skip its diagram and audio there.
	const sheetSound = narrow ? undefined : shownSound;

	useEffect(() => {
		if (!sheetOpen) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !event.defaultPrevented) onClose();
		};
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [sheetOpen, onClose]);

	const selection: SoundSelection = {
		selectedId,
		select: (phonemeId) => onSelect(phonemeId as LanguagePhonemeId<TLanguage>),
	};

	return (
		<SoundSelectionContext value={selection}>
			<div className="flex flex-1">
				<div className="flex min-w-0 flex-1 flex-col">
					<ChartNav />
					{children}
				</div>

				<aside
					aria-labelledby={sheetOpen ? sheetHeadingId : undefined}
					inert={!sheetOpen}
					data-open={sheetOpen ? "" : undefined}
					className="sticky top-12 hidden max-h-[calc(100dvh-3rem)] w-0 shrink-0 self-stretch overflow-hidden border-l border-transparent bg-popover text-popover-foreground transition-[width,border-color] duration-300 ease-out data-open:w-80 data-open:border-border motion-reduce:transition-none lg:block"
				>
					<div className="h-full w-80 overflow-y-auto p-4">
						{sheetSound && (
							<PhonemeDetails
								targetAccent={targetAccent}
								phonemeId={sheetSound}
								headingId={sheetHeadingId}
								showFrequencyLink={showFrequencyLink}
								action={
									<Button
										variant="ghost"
										size="icon-sm"
										className="shrink-0 text-muted-foreground hover:text-foreground"
										aria-label="Close sound details"
										onClick={onClose}
									>
										<XIcon aria-hidden />
									</Button>
								}
							/>
						)}
					</div>
				</aside>
			</div>

			<p className="sr-only" aria-live="polite">
				{sheetOpen && selectedId ? `Showing details for /${getIpaForPhonemeId(selectedId)}/` : ""}
			</p>

			<Drawer
				open={narrow && Boolean(selectedId)}
				onOpenChange={(open) => {
					if (!open) onClose();
				}}
			>
				<DrawerContent aria-labelledby={drawerHeadingId}>
					<DrawerBody>
						{shownSound && (
							<PhonemeDetails
								targetAccent={targetAccent}
								phonemeId={shownSound}
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
