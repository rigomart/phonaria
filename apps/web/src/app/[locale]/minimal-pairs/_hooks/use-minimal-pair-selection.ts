"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { minimalPairSets } from "shared-data";
import { usePathname, useRouter } from "@/i18n/navigation";

export function useMinimalPairSelection() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const contrastParam = searchParams?.get("contrast") ?? null;

	const activeSet = useMemo(() => {
		if (!contrastParam) return minimalPairSets[0];
		return (
			minimalPairSets.find((set) => set.slug === contrastParam || set.id === contrastParam) ??
			minimalPairSets[0]
		);
	}, [contrastParam]);

	const activeSetId = activeSet?.id ?? "";

	const selectContrast = useCallback(
		(id: string) => {
			const targetSet = minimalPairSets.find((set) => set.id === id);
			if (!targetSet || !pathname) return;

			const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
			nextParams.set("contrast", targetSet.slug);
			router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
		},
		[pathname, router, searchParams],
	);

	return {
		sets: minimalPairSets,
		activeSet,
		activeSetId,
		selectContrast,
	};
}
