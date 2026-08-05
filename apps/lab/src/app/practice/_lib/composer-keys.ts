/**
 * Keyboard grammar of the composer field, kept apart from React so the typing
 * path — the keyboard-only way through a session (#140) — is testable without
 * a DOM.
 */

export interface ComposerKeyState {
	query: string;
	matchCount: number;
	highlight: number;
}

export type ComposerKeyAction =
	/** Commit the match at this index as a chip. */
	| { type: "commit"; index: number }
	| { type: "highlight"; index: number }
	| { type: "remove-last" }
	| { type: "clear-query" }
	/** Leave the key to the input (or the page). */
	| { type: "none" };

const NONE: ComposerKeyAction = { type: "none" };

export function resolveComposerKey(key: string, state: ComposerKeyState): ComposerKeyAction {
	const { query, matchCount, highlight } = state;

	switch (key) {
		case "Enter":
			return highlight >= 0 && highlight < matchCount ? { type: "commit", index: highlight } : NONE;

		case "ArrowDown":
			return matchCount > 0
				? { type: "highlight", index: Math.min(highlight + 1, matchCount - 1) }
				: NONE;

		case "ArrowUp":
			return matchCount > 0 ? { type: "highlight", index: Math.max(highlight - 1, 0) } : NONE;

		case "Escape":
			// An empty field has nothing to clear, so the key belongs to the page.
			return query === "" ? NONE : { type: "clear-query" };

		case "Backspace":
			return query === "" ? { type: "remove-last" } : NONE;

		default:
			return NONE;
	}
}
