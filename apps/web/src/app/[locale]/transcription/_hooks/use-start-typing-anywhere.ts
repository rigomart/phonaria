import { useEffect, useRef } from "react";

interface UseStartTypingAnywhereOptions {
	/** Callback when a character is typed */
	onTyping: (character: string) => void;
	/** Whether the feature is disabled */
	disabled?: boolean;
}

/**
 * Hook that enables "start typing anywhere" functionality.
 * Users can start typing anywhere on the page and the input will
 * automatically focus and capture the keystroke.
 *
 * Returns a ref to attach to the input element.
 *
 * @example
 * const inputRef = useStartTypingAnywhere({
 *   onTyping: (char) => setText(prev => prev + char)
 * });
 * return <input ref={inputRef} />;
 */
export function useStartTypingAnywhere({
	onTyping,
	disabled = false,
}: UseStartTypingAnywhereOptions) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (disabled) return;

		// Skip on mobile/touch devices to avoid unexpected keyboard popup
		const isTouchDevice =
			"ontouchstart" in window ||
			navigator.maxTouchPoints > 0 ||
			/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

		if (isTouchDevice) return;

		function handleKeyDown(e: KeyboardEvent) {
			const input = inputRef.current;
			if (!input) return;

			// Skip if already focused on an input
			const activeTag = document.activeElement?.tagName;
			if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

			// Only capture single printable characters without modifiers
			if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

			// Skip if input is disabled
			if (input.disabled) return;

			input.focus();
			onTyping(e.key);
			e.preventDefault();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [disabled, onTyping]);

	return inputRef;
}
