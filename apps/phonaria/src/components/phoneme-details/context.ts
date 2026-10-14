import { createDrawerHandle } from "@phonaria/ui/components/drawer";
import { createPopoverHandle } from "@phonaria/ui/components/popover";
import { createContext, use } from "react";
import type { PhonemeDetailsOptions } from "./sound";

/** What a trigger hands the container: the host's options and which trigger it was. */
export interface DetailsPayload {
	options: PhonemeDetailsOptions;
	triggerId: string;
}

/** Phones: the bottom drawer, which opens at its compact level. */
export const drawerHandle = createDrawerHandle<DetailsPayload>();

/** Wide screens: the compact card anchored to the sound. */
export const cardHandle = createPopoverHandle<DetailsPayload>();

/**
 * Where focus goes when a container closes: back to the sound's trigger. When
 * the trigger is gone, focus stays where the page put it (the body at worst)
 * rather than jumping to whatever was focused before.
 */
export function focusTrigger(triggerId: string): HTMLElement | false {
	return document.getElementById(triggerId) ?? false;
}

interface PhonemeDetailsContextValue {
	/** Card and side panel when true; the bottom drawer otherwise. */
	wide: boolean;
	/** The trigger whose sound the side panel shows, if it is open. */
	panelTriggerId: string | null;
	/** The trigger whose sound is open in any container. */
	activeTriggerId: string | null;
	openPanel: (payload: DetailsPayload) => void;
	closePanel: () => void;
	/**
	 * A trigger calls this as it unmounts. When it belongs to the open sound,
	 * every container closes: the host swapped its sounds in place (a new
	 * Practice round, a new search, diphthongs off), so the details go too.
	 */
	releaseTrigger: (triggerId: string) => void;
}

export const PhonemeDetailsContext = createContext<PhonemeDetailsContextValue | null>(null);

export function usePhonemeDetails() {
	const context = use(PhonemeDetailsContext);
	if (!context)
		throw new Error("Sound triggers need the PhonemeDetailsProvider from the app shell.");
	return context;
}
