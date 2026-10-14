import { type PointerEvent, useRef, useState } from "react";

/** How far down a finger must drag the sheet's header before letting go closes it. */
const CLOSE_DISTANCE = 96;

/**
 * Pull-down-to-close for a bottom sheet. Spread `handleProps` on the part a
 * finger grabs (the header) and apply `offset` to the sheet as a downward
 * translation. Touch and pen only; a mouse uses the close button.
 */
export function useDragToClose(onClose: () => void) {
	const startY = useRef<number | null>(null);
	const [offset, setOffset] = useState(0);

	const end = (close: boolean) => {
		startY.current = null;
		if (close) onClose();
		else setOffset(0);
	};

	const handleProps = {
		onPointerDown(event: PointerEvent<HTMLElement>) {
			// Buttons in the header keep their taps.
			if (event.pointerType === "mouse" || (event.target as Element).closest("button")) return;
			startY.current = event.clientY;
		},
		onPointerMove(event: PointerEvent<HTMLElement>) {
			if (startY.current === null) return;
			setOffset(Math.max(0, event.clientY - startY.current));
		},
		onPointerUp() {
			if (startY.current !== null) end(offset >= CLOSE_DISTANCE);
		},
		onPointerCancel() {
			if (startY.current !== null) end(false);
		},
	};

	return { offset, reset: () => setOffset(0), handleProps };
}
