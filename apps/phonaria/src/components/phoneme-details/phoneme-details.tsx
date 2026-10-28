import { DrawerTrigger } from "@phonaria/ui/components/drawer";
import { PopoverTrigger } from "@phonaria/ui/components/popover";
import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { usePathname } from "@/components/site-nav";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
	cardHandle,
	type DetailsPayload,
	drawerHandle,
	PhonemeDetailsContext,
	usePhonemeDetails,
} from "./context";
import { DetailsCard } from "./details-card";
import { DetailsDrawer } from "./details-drawer";
import { DetailsPanel } from "./details-panel";
import type { PhonemeDetailsOptions } from "./sound";

/** Tailwind's `lg`: wide enough for an anchored card and a side panel over the page. */
const WIDE_QUERY = "(width >= 64rem)";

/**
 * Mounts the containers for sound details once, for every host: a bottom
 * drawer on phones and tablets; a compact card and a side panel on wide screens.
 */
export function PhonemeDetailsProvider({ children }: { children: ReactNode }) {
	const wide = useMediaQuery(WIDE_QUERY);
	const pathname = usePathname();
	const [panel, setPanel] = useState<{ open: boolean; payload: DetailsPayload } | null>(null);
	// The trigger whose drawer or card is open.
	const [openTriggerId, setOpenTriggerId] = useState<string | null>(null);

	const closeAll = useCallback(() => {
		drawerHandle.close();
		cardHandle.close();
		setPanel((current) => current && { ...current, open: false });
	}, []);

	// Leaving the page, or switching containers, leaves the open sound behind.
	useEffect(closeAll, [pathname, wide, closeAll]);

	const activeTriggerId = panel?.open ? panel.payload.triggerId : openTriggerId;

	// Read when a trigger unmounts, which can't wait for the next render.
	const activeTriggerRef = useRef(activeTriggerId);
	useEffect(() => {
		activeTriggerRef.current = activeTriggerId;
	}, [activeTriggerId]);
	const releaseTrigger = useCallback(
		(triggerId: string) => {
			if (activeTriggerRef.current === triggerId) closeAll();
		},
		[closeAll],
	);

	const value = useMemo(
		() => ({
			wide,
			panelTriggerId: panel?.open ? panel.payload.triggerId : null,
			activeTriggerId,
			openPanel: (payload: DetailsPayload) => setPanel({ open: true, payload }),
			closePanel: () => setPanel((current) => current && { ...current, open: false }),
			releaseTrigger,
		}),
		[wide, panel, activeTriggerId, releaseTrigger],
	);

	return (
		<PhonemeDetailsContext value={value}>
			{children}
			<DetailsDrawer onTriggerChange={setOpenTriggerId} />
			<DetailsCard onTriggerChange={setOpenTriggerId} onExpand={value.openPanel} />
			<DetailsPanel panel={panel} onClose={value.closePanel} />
		</PhonemeDetailsContext>
	);
}

type TriggerProps = Omit<ComponentProps<typeof PopoverTrigger>, "handle" | "payload"> & {
	/** What this host lets learners see; Practice switches the answer-revealing parts off. */
	details: PhonemeDetailsOptions;
};

/**
 * Opens the details for one sound. On phones it opens the drawer; on wide
 * screens the anchored card or, while the side panel is open, it swaps the
 * panel to this sound (or closes it when this sound is already showing).
 * The trigger of the open sound carries `data-details-open` for hosts to style,
 * whichever container shows it.
 */
export function PhonemeDetailsTrigger({ details, id, onClick, ...props }: TriggerProps) {
	const { wide, panelTriggerId, activeTriggerId, openPanel, closePanel, releaseTrigger } =
		usePhonemeDetails();
	const generatedId = useId();
	const triggerId = id ?? generatedId;
	const payload = { options: details, triggerId };
	const selected = activeTriggerId === triggerId ? "" : undefined;

	// The containers live in the app shell and would outlive this trigger.
	useEffect(() => () => releaseTrigger(triggerId), [releaseTrigger, triggerId]);

	if (!wide) {
		return (
			<DrawerTrigger
				handle={drawerHandle}
				payload={payload}
				id={triggerId}
				data-details-open={selected}
				onClick={onClick}
				{...props}
			/>
		);
	}

	const showingInPanel = panelTriggerId === triggerId;

	return (
		<PopoverTrigger
			handle={cardHandle}
			payload={payload}
			id={triggerId}
			// Only when true: an undefined prop would override Base UI's own value.
			{...(showingInPanel ? { "aria-expanded": true } : {})}
			data-details-open={selected}
			onClick={(event) => {
				onClick?.(event);
				if (panelTriggerId === null) return;
				// The panel is open, so it takes this sound instead of the card.
				event.preventBaseUIHandler();
				if (showingInPanel) closePanel();
				else openPanel(payload);
			}}
			{...props}
		/>
	);
}
