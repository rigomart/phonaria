import { useCallback, useEffect, useRef, useState } from "react";
import { activeStepIndex, STEP_ANCHOR, stepScrollTop } from "@/lib/language-spread/scroll-step";

/**
 * The story step in view, read from where each step's section sits as the page scrolls. `story` is
 * the list of sections; the hook sets `--story-exit` on it: how far it has scrolled past the
 * bottom of the screen.
 */
export function useActiveStep() {
	const sections = useRef<(HTMLElement | null)[]>([]);
	const story = useRef<HTMLOListElement>(null);
	const [active, setActive] = useState(0);

	useEffect(() => {
		let frame = 0;
		let storyExit = 0;
		const update = () => {
			frame = 0;
			const tops = sections.current.map(
				(section) => section?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
			);
			setActive(activeStepIndex(tops, window.innerHeight * STEP_ANCHOR));
			const bottom = story.current?.getBoundingClientRect().bottom;
			const next = bottom === undefined ? 0 : Math.max(0, Math.round(window.innerHeight - bottom));
			if (next !== storyExit) {
				storyExit = next;
				story.current?.style.setProperty("--story-exit", `${storyExit}px`);
			}
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

	/** Scrolls so step `index` becomes active; instant when `reducedMotion`, smooth otherwise. */
	const goToStep = useCallback((index: number, reducedMotion: boolean) => {
		const section = sections.current[index];
		if (!section) return;
		const top = section.getBoundingClientRect().top + window.scrollY;
		window.scrollTo({
			top: stepScrollTop(top, window.innerHeight),
			behavior: reducedMotion ? "instant" : "smooth",
		});
	}, []);

	return { active, story, registerSection, goToStep };
}
