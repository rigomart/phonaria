import { useEffect, useState } from "react";

/**
 * Utility function to detect if the device is likely mobile/touch-based
 */
function isMobileDevice(): boolean {
	if (typeof window === "undefined") return false;

	return (
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0
	);
}

interface UseStartTypingAnywhereOptions {
	/** Callback function when typing is detected */
	onTyping: (character: string) => void;
	/** Ref to the input element to focus */
	inputRef: React.RefObject<HTMLInputElement | null>;
	/** Whether the feature is disabled */
	disabled?: boolean;
	/** Whether to prevent default behavior when typing is detected */
	preventDefault?: boolean;
}

/**
 * Hook that enables "start typing anywhere" functionality
 * Users can start typing and the input will automatically focus and capture the input
 */
export function useStartTypingAnywhere({
	onTyping,
	inputRef,
	disabled = false,
	preventDefault = true,
}: UseStartTypingAnywhereOptions) {
	const [isMobile, setIsMobile] = useState<boolean | null>(null);

	useEffect(() => {
		setIsMobile(isMobileDevice());
	}, []);

	useEffect(() => {
		// Skip on mobile devices to avoid keyboard popup issues
		if (isMobile !== false || disabled) return;

		const handleTyping = (e: KeyboardEvent) => {
			const inputElement = inputRef.current;
			if (
				!inputElement ||
				document.activeElement === inputElement ||
				["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "") ||
				e.key.length !== 1 ||
				e.ctrlKey ||
				e.metaKey ||
				e.altKey ||
				inputElement.hasAttribute("disabled")
			) {
				return;
			}

			inputElement.focus();
			onTyping(e.key);

			if (preventDefault) {
				e.preventDefault();
			}
		};

		document.addEventListener("keydown", handleTyping);
		return () => document.removeEventListener("keydown", handleTyping);
	}, [disabled, inputRef, isMobile, onTyping, preventDefault]);

	return { isMobileDevice: isMobile };
}
