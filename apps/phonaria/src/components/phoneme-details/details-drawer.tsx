import { Button } from "@phonaria/ui/components/button";
import { Drawer, DrawerClose, DrawerContent } from "@phonaria/ui/components/drawer";
import { XIcon } from "lucide-react";
import {
	type FocusEvent,
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
import { DetailSections, getDetailSections } from "./sections";
import { describeSound } from "./sound";
import { SoundHeader, soundTitleTarget } from "./sound-header";

/** The full-height snap point: as tall as the content, capped by the drawer's max height. */
const FULL = 1;

/** The compact level stops at this share of the screen, so the top of the page stays in view. */
const PEEK_MAX_SHARE = 0.55;

/**
 * Phones and tablets: one bottom drawer with two levels. Both levels lay out
 * the same sheet; the compact one is a peek at its top: the sound header and
 * as much of "How it's made" as fits, leaving the top of the page in view.
 * Dragging it up, or tapping the sound's name, uncovers the rest at full
 * height, where the sections scroll under the pinned header. Nothing in the
 * sheet changes size between the levels, so it follows the finger without
 * shifting when it snaps.
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
	const [peekHeight, setPeekHeight] = useState(0);
	const snapPoints = useMemo(
		() => (peekHeight > 0 ? [`${peekHeight}px`, FULL] : undefined),
		[peekHeight],
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
						onPeekHeightChange={setPeekHeight}
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
	onPeekHeightChange,
}: {
	payload: DetailsPayload;
	expanded: boolean;
	onExpand: () => void;
	onPeekHeightChange: (height: number) => void;
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

	// The sheet lays out the same at both levels, so these hold across a snap
	// and change only with the content (a new sound, a diagram loading).
	useLayoutEffect(() => {
		if (!content || !summary) return;
		const measure = () => {
			setHeight(content.offsetHeight);
			// The peek ends with the first section, "How it's made", or at its cap.
			const first = sectionsRef.current?.querySelector("section");
			const firstEnd = first
				? first.getBoundingClientRect().bottom - content.getBoundingClientRect().top
				: summary.offsetHeight;
			const cap = window.innerHeight * PEEK_MAX_SHARE;
			onPeekHeightChange(Math.round(Math.max(summary.offsetHeight, Math.min(firstEnd, cap))));
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(content);
		observer.observe(summary);
		window.addEventListener("resize", measure);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	}, [content, summary, onPeekHeightChange]);

	// Tabbing into the part below the peek opens the full view, so the
	// focused control is never cut off. Taps on what's in view stay put.
	const expandOnKeyboardFocus = (event: FocusEvent<HTMLElement>) => {
		if (!expanded && event.target.matches(":focus-visible")) onExpand();
	};

	const wasExpanded = useRef(expanded);
	useEffect(() => {
		const collapsed = wasExpanded.current && !expanded;
		wasExpanded.current = expanded;
		const root = rootRef.current;
		if (!root) return;
		if (!expanded) {
			root.scrollTop = 0;
			// Dragged down to compact: the sheet went back to its top, so focus below the peek goes to the name.
			const active = document.activeElement;
			if (collapsed && (active === document.body || sectionsRef.current?.contains(active))) {
				soundTitleTarget(titleId)?.focus({ preventScroll: true });
			}
			return;
		}
		// The expand button just became a heading; keep focus inside the drawer.
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
						className="sticky top-0 z-10 flex flex-col gap-4 bg-popover px-5 pt-3 pb-4"
					>
						<span
							aria-hidden="true"
							className="mx-auto h-1.5 w-10 shrink-0 rounded-full bg-accent"
						/>
						<SoundHeader
							sound={sound}
							titleId={titleId}
							// The sections close with one note that covers the example word too.
							voiceNote={false}
							onExpand={expanded ? undefined : onExpand}
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
					<div ref={sectionsRef} onFocus={expandOnKeyboardFocus} className="px-5 pb-safe-6">
						<DetailSections
							targetAccent={payload.options.targetAccent}
							sections={sections}
							extraWords={sound.example ? [sound.example.word] : []}
						/>
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
