"use client";

import { Button } from "@phonaria/ui/components/button";
import { Drawer, DrawerClose, DrawerContent } from "@phonaria/ui/components/drawer";
import { XIcon } from "lucide-react";
import {
	type KeyboardEvent,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { type DetailsPayload, drawerHandle } from "./context";
import { MoreButton } from "./more-button";
import { DetailSections, getDetailSections } from "./sections";
import { describeSound } from "./sound";
import { SoundHeader } from "./sound-header";

/** The full-height snap point: as tall as the content, capped by the drawer's max height. */
const FULL = 1;

/**
 * Phones and tablets: one bottom drawer with two levels. It opens at a compact
 * snap point that shows the sound header and "More about", leaving the top of
 * the page in view. Dragging it up, or tapping "More about", snaps it to full
 * height, where the sections scroll under the pinned header.
 *
 * Non-modal, so tapping another sound in view swaps the drawer's content;
 * tapping anywhere else closes it. The keyboard stays inside: Tab wraps around
 * the drawer's controls (the page stays readable to screen readers), and Esc
 * closes it, returning focus to the sound.
 */
export function DetailsDrawer({
	onTriggerChange,
}: {
	onTriggerChange: (triggerId: string | null) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [compactHeight, setCompactHeight] = useState(0);
	const snapPoints = useMemo(
		() => (compactHeight > 0 ? [`${compactHeight}px`, FULL] : undefined),
		[compactHeight],
	);

	return (
		<Drawer
			handle={drawerHandle}
			modal={false}
			snapPoints={snapPoints}
			// A quick flick down from full height stops at the compact level instead of closing.
			snapToSequentialPoints
			snapPoint={snapPoints ? (expanded ? FULL : snapPoints[0]) : null}
			onSnapPointChange={(point) => setExpanded(point === FULL)}
			onOpenChange={(open, { trigger }) => {
				if (open) setExpanded(false);
				onTriggerChange(open ? (trigger?.id ?? null) : null);
			}}
		>
			{({ payload }) =>
				payload ? (
					<DrawerSheet
						payload={payload}
						expanded={expanded}
						onExpand={() => setExpanded(true)}
						onCompactHeightChange={setCompactHeight}
					/>
				) : null
			}
		</Drawer>
	);
}

function DrawerSheet({
	payload,
	expanded,
	onExpand,
	onCompactHeightChange,
}: {
	payload: DetailsPayload;
	expanded: boolean;
	onExpand: () => void;
	onCompactHeightChange: (height: number) => void;
}) {
	const titleId = useId();
	const sound = describeSound(payload.options);
	const sections = getDetailSections(payload.options);
	const rootRef = useRef<HTMLDivElement>(null);
	const sectionsRef = useRef<HTMLDivElement>(null);
	// State rather than refs: the portal mounts the drawer's DOM after the first render.
	const [content, setContent] = useState<HTMLDivElement | null>(null);
	const [summary, setSummary] = useState<HTMLDivElement | null>(null);
	// The drawer's full height is its content's; a fixed height lets the snap
	// offset turn into bottom padding without the drawer growing with it.
	const [height, setHeight] = useState<number>();

	useLayoutEffect(() => {
		if (!content || !summary) return;
		const measure = () => {
			setHeight(content.offsetHeight);
			// Expanded, the summary drops its "More about" row; the compact snap keeps the height it had.
			if (!expanded) onCompactHeightChange(summary.offsetHeight);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(content);
		observer.observe(summary);
		return () => observer.disconnect();
	}, [content, summary, expanded, onCompactHeightChange]);

	const wasExpanded = useRef(expanded);
	useEffect(() => {
		const collapsed = wasExpanded.current && !expanded;
		wasExpanded.current = expanded;
		const root = rootRef.current;
		if (!root) return;
		if (!expanded) {
			root.scrollTop = 0;
			// Dragged down to compact: the sections went inert and took focus with them.
			const active = document.activeElement;
			if (collapsed && (active === document.body || sectionsRef.current?.contains(active))) {
				document.getElementById(titleId)?.focus({ preventScroll: true });
			}
			return;
		}
		// The expand control just left the screen; keep focus inside the drawer.
		if (!root.contains(document.activeElement)) root.focus({ preventScroll: true });
	}, [expanded, titleId]);

	return (
		<DrawerContent
			side="bottom"
			showOverlay={false}
			aria-labelledby={titleId}
			onKeyDown={wrapTab}
			style={{ height }}
			className="mx-auto max-w-lg touch-none overflow-clip motion-reduce:transition-none"
		>
			<div
				ref={rootRef}
				data-phoneme-details
				tabIndex={-1}
				className={cn(
					"min-h-0 flex-1 overscroll-contain outline-none",
					expanded ? "touch-auto overflow-y-auto" : "overflow-y-clip",
				)}
			>
				<div ref={setContent}>
					<div
						ref={setSummary}
						className={cn(
							"sticky top-0 z-10 flex flex-col gap-4 bg-popover px-5 pt-3",
							// Compact, the summary ends at the bottom of the screen.
							expanded ? "pb-4" : "pb-safe-4",
						)}
					>
						<span
							aria-hidden="true"
							className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-accent"
						/>
						<SoundHeader
							sound={sound}
							titleId={titleId}
							showExample={!expanded}
							action={
								<div className="flex shrink-0 gap-2">
									{expanded ? null : (
										<MoreButton ipa={sound.ipa} direction="up" onClick={onExpand} />
									)}
									<DrawerClose
										render={<Button variant="secondary" size="icon" className="size-11 shrink-0" />}
									>
										<XIcon aria-hidden="true" />
										<span className="sr-only">Close</span>
									</DrawerClose>
								</div>
							}
						/>
					</div>
					{/* Compact, the sections are clipped out of view, so they are out of reach too. */}
					<div ref={sectionsRef} inert={!expanded} className="px-5 pb-safe-6">
						<DetailSections sections={sections} />
					</div>
				</div>
			</div>
		</DrawerContent>
	);
}

const TABBABLE = "a[href], button:not(:disabled), [tabindex]:not([tabindex='-1'])";

/** Tab past the drawer's last control returns to its first, and Shift+Tab the other way. */
function wrapTab(event: KeyboardEvent<HTMLElement>) {
	if (event.key !== "Tab") return;
	const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE)].filter(
		(control) => !control.closest("[inert]"),
	);
	const first = controls[0];
	const last = controls.at(-1);
	if (!first || !last) return;
	const active = document.activeElement;
	const atStart = active === first || !controls.includes(active as HTMLElement);
	if (event.shiftKey ? atStart : active === last) {
		event.preventDefault();
		(event.shiftKey ? last : first).focus();
	}
}
