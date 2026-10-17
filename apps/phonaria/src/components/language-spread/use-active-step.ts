import { useCallback, useEffect, useRef, useState } from "react";
import { activeStepIndex } from "@/lib/language-spread/scroll-step";

/** How far down the viewport a step's section must reach to become the active step. */
const ANCHOR = 0.7;

/**
 * The story step in view, read from where each step's section sits as the page
 * scrolls. Reading positions on scroll, rather than observing intersections,
 * keeps fast scrolls and scrolling back exact.
 */
export function useActiveStep() {
	const sections = useRef<(HTMLElement | null)[]>([]);
	const [active, setActive] = useState(0);

	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const tops = sections.current.map(
				(section) => section?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
			);
			setActive(activeStepIndex(tops, window.innerHeight * ANCHOR));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		};
	}, []);

	const registerSection = useCallback(
		(index: number) => (section: HTMLElement | null) => {
			sections.current[index] = section;
		},
		[],
	);

	return { active, registerSection };
}
