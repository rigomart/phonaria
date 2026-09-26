import { useLayoutEffect, useState } from "react";

/**
 * False for the server render and the hydration render, true once this
 * component's effects have run. Interactive controls stay disabled until then
 * so a fill, keypress, or click cannot land before React is listening.
 */
export function useHydrated(): boolean {
	const [hydrated, setHydrated] = useState(false);
	useLayoutEffect(() => {
		setHydrated(true);
	}, []);
	return hydrated;
}
