import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Placement = { left: number; top: number; width: number; height: number };

/**
 * One indicator that slides to a nav's active link (`aria-current="page"`), so
 * switching sections reads as one motion instead of a jump.
 *
 * Until it has measured, `measured` is false and the active link should draw its
 * own indicator: the server render and pre-hydration paint stay correct without
 * JavaScript. The first placement is instant; only later moves slide.
 *
 * The indicator positions itself from `--nav-x`, `--nav-y`, `--nav-w` and
 * `--nav-h`, relative to the nav, which must be its containing block.
 */
export function useNavIndicator<T extends HTMLElement>(activeKey: string | null) {
	const navRef = useRef<T>(null);
	const [placement, setPlacement] = useState<Placement | null>(null);
	const [sliding, setSliding] = useState(false);

	useLayoutEffect(() => {
		const nav = navRef.current;
		if (!nav || activeKey === null) return;
		const measure = () => {
			const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
			if (!active) return;
			const next = {
				left: active.offsetLeft,
				top: active.offsetTop,
				width: active.offsetWidth,
				height: active.offsetHeight,
			};
			setPlacement((current) => (current && samePlacement(current, next) ? current : next));
		};
		measure();
		// Links change width as fonts load and the nav reflows at breakpoints.
		const observer = new ResizeObserver(measure);
		observer.observe(nav);
		for (const link of nav.children) observer.observe(link);
		return () => observer.disconnect();
	}, [activeKey]);

	useEffect(() => {
		if (!placement || sliding) return;
		const frame = requestAnimationFrame(() => setSliding(true));
		return () => cancelAnimationFrame(frame);
	}, [placement, sliding]);

	const visible = activeKey !== null;

	return {
		navRef,
		measured: placement !== null,
		indicator: {
			"aria-hidden": true,
			className: cn(
				"pointer-events-none absolute top-0 left-0",
				sliding &&
					"transition-[translate,width,height,opacity] duration-250 ease-emphasized motion-reduce:transition-none",
				placement && visible ? "opacity-100" : "opacity-0",
			),
			style: placement
				? ({
						"--nav-x": `${placement.left}px`,
						"--nav-y": `${placement.top}px`,
						"--nav-w": `${placement.width}px`,
						"--nav-h": `${placement.height}px`,
					} as CSSProperties)
				: undefined,
		},
	} as const;
}

function samePlacement(a: Placement, b: Placement) {
	return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
}
