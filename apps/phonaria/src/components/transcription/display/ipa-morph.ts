import { flushSync } from "react-dom";
import type { VariantAlignment } from "@/lib/transcription/variant-alignment";

const DURATION_MS = 340;
const ENTER_DELAY_MS = 80;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";
/** Tokens leave toward, and arrive from, the alternatives below: this share of their height down. */
const DROP = 0.6;
const SHRINK = 0.6;

const TOKEN_KINDS = {
	phoneme: "phonemes",
	stress: "stressMarks",
	dot: "syllableDots",
} as const satisfies Record<string, keyof VariantAlignment>;

type TokenKind = keyof typeof TOKEN_KINDS;
type Snapshot = { node: HTMLElement; rect: DOMRect };

export function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Morphs the IPA rendered under `root` into another variant of the same word.
 * Tokens the alignment carries over slide to their new places; tokens only the
 * old variant has drop away and fade (as detached copies, since the update
 * removes them); new tokens rise into place. Tokens are found by their
 * `data-ipa-token` kind, in render order, which is the order the alignment uses.
 */
export function morphIpa(root: HTMLElement, alignment: VariantAlignment, update: () => void) {
	if (prefersReducedMotion()) {
		flushSync(update);
		return;
	}

	const before = new Map<TokenKind, Snapshot[]>();
	const leaving: Snapshot[] = [];
	for (const [kind, key] of entries(TOKEN_KINDS)) {
		const carried = new Set(alignment[key]);
		const snapshots = tokens(root, kind).map((node, index) => {
			const snapshot = { node, rect: node.getBoundingClientRect() };
			for (const animation of node.getAnimations()) animation.cancel();
			if (!carried.has(index)) leaving.push({ node: detachedCopy(node), rect: snapshot.rect });
			return snapshot;
		});
		before.set(kind, snapshots);
	}

	flushSync(update);

	for (const [kind, key] of entries(TOKEN_KINDS)) {
		const previous = before.get(kind) ?? [];
		tokens(root, kind).forEach((node, index) => {
			const from = alignment[key][index];
			const origin = from == null ? undefined : previous[from];
			if (origin) slide(node, origin.rect);
			else enter(node);
		});
	}
	for (const ghost of leaving) leave(ghost);
}

function tokens(root: HTMLElement, kind: TokenKind): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(`[data-ipa-token="${kind}"]`));
}

function entries<T extends object>(record: T) {
	return Object.entries(record) as { [K in keyof T]: [K, T[K]] }[keyof T][];
}

function slide(node: HTMLElement, from: DOMRect) {
	const to = node.getBoundingClientRect();
	const dx = from.left - to.left;
	const dy = from.top - to.top;
	if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
	node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
		duration: DURATION_MS,
		easing: EASING,
	});
}

function enter(node: HTMLElement) {
	const drop = node.getBoundingClientRect().height * DROP;
	node.animate(
		[
			{ opacity: 0, transform: `translateY(${drop}px) scale(${SHRINK})` },
			{ opacity: 1, transform: "none" },
		],
		{ duration: DURATION_MS, delay: ENTER_DELAY_MS, easing: EASING, fill: "backwards" },
	);
}

function leave({ node, rect }: Snapshot) {
	Object.assign(node.style, {
		position: "fixed",
		left: `${rect.left}px`,
		top: `${rect.top}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
		margin: "0",
		display: "flex",
		alignItems: "center",
		pointerEvents: "none",
		zIndex: "50",
	});
	document.body.append(node);
	const remove = () => node.remove();
	node
		.animate(
			[
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform: `translateY(${rect.height * DROP}px) scale(${SHRINK})` },
			],
			{ duration: DURATION_MS, easing: EASING },
		)
		.finished.then(remove, remove);
}

/** A non-interactive copy that can outlive the original for its exit animation. */
function detachedCopy(node: HTMLElement): HTMLElement {
	const copy = node.cloneNode(true) as HTMLElement;
	copy.removeAttribute("data-ipa-token");
	copy.setAttribute("aria-hidden", "true");
	copy.inert = true;
	for (const element of [copy, ...copy.querySelectorAll("[id]")]) element.removeAttribute("id");
	return copy;
}
