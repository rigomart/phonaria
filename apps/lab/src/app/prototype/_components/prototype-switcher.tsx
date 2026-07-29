"use client";

/**
 * PROTOTYPE ONLY — throwaway. Floating variant switcher for `?variant=` prototypes.
 * Never merge to main. See apps/lab/src/app/prototype/round-building/page.tsx.
 */

import { Button } from "@phonaria/ui/components/button";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export interface PrototypeVariant {
	key: string;
	name: string;
}

interface PrototypeSwitcherProps {
	variants: PrototypeVariant[];
	current: string;
}

export function PrototypeSwitcher({ variants, current }: PrototypeSwitcherProps) {
	const router = useRouter();
	const pathname = usePathname();

	const index = Math.max(
		0,
		variants.findIndex((variant) => variant.key === current),
	);

	const go = useCallback(
		(delta: number) => {
			const next = variants[(index + delta + variants.length) % variants.length];
			router.replace(`${pathname}?variant=${next.key}`, { scroll: false });
		},
		[index, pathname, router, variants],
	);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

			const target = event.target as HTMLElement | null;
			const tag = target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;

			event.preventDefault();
			go(event.key === "ArrowLeft" ? -1 : 1);
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [go]);

	if (process.env.NODE_ENV === "production") return null;

	const active = variants[index];

	return (
		<div className="fixed bottom-3 left-1/2 z-100 flex -translate-x-1/2 items-center gap-1 rounded-full border border-warning bg-warning px-1.5 py-1 text-warning-foreground shadow-lg">
			<Button
				aria-label="Previous variant"
				className="rounded-full hover:bg-warning-foreground hover:text-warning"
				onClick={() => go(-1)}
				size="icon-sm"
				variant="ghost"
			>
				<ChevronLeft />
			</Button>
			<span className="flex items-center gap-1.5 whitespace-nowrap px-1 font-medium text-xs">
				<FlaskConical className="size-3.5" />
				{active.key} — {active.name}
			</span>
			<Button
				aria-label="Next variant"
				className="rounded-full hover:bg-warning-foreground hover:text-warning"
				onClick={() => go(1)}
				size="icon-sm"
				variant="ghost"
			>
				<ChevronRight />
			</Button>
		</div>
	);
}
