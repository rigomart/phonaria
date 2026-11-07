/**
 * A tab opened before a deploy asks for chunks the new build no longer serves.
 * Reloading once picks up the new build. The reload time is kept in
 * sessionStorage so a chunk missing for another reason can't loop the tab.
 *
 * TanStack Router's lazy route components make their own one reload, under
 * their own sessionStorage key, so a route whose chunk keeps failing can
 * reload twice before the error page shows.
 */

export const STALE_DEPLOY_RELOAD_KEY = "stale-deploy-reload";

/** How long after one reload another failure counts as the same one. */
export const STALE_DEPLOY_RELOAD_WINDOW_MS = 30_000;

type ReloadStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * Reloads unless this tab already did so within the window, and says whether
 * it did. Without working storage it never reloads, since nothing could stop
 * a loop.
 */
export function reloadOnceForStaleDeploy({
	storage,
	reload,
	now = Date.now(),
}: {
	storage: ReloadStorage | null | undefined;
	reload: () => void;
	now?: number;
}): boolean {
	try {
		if (!storage) return false;
		const last = Number(storage.getItem(STALE_DEPLOY_RELOAD_KEY));
		if (Number.isFinite(last) && last > 0 && now - last < STALE_DEPLOY_RELOAD_WINDOW_MS) {
			return false;
		}
		storage.setItem(STALE_DEPLOY_RELOAD_KEY, String(now));
	} catch {
		return false;
	}
	reload();
	return true;
}

export function reloadPageOnceForStaleDeploy(): boolean {
	let storage: Storage | null = null;
	try {
		storage = globalThis.sessionStorage;
	} catch {
		// Blocked storage throws on access; without it the guard can't hold.
	}
	return reloadOnceForStaleDeploy({ storage, reload: () => globalThis.location.reload() });
}

/**
 * Listens for Vite's `vite:preloadError`, fired in a build when a chunk fails
 * to load, whether a route's or a feature's (the 10k word list), and reloads
 * instead of letting the import fail. When the guard says no, the import fails
 * as usual. Returns the cleanup.
 */
export function listenForStaleDeploy(
	target: EventTarget = window,
	reloadOnce: () => boolean = reloadPageOnceForStaleDeploy,
): () => void {
	const onPreloadError = (event: Event) => {
		if (reloadOnce()) event.preventDefault();
	};
	target.addEventListener("vite:preloadError", onPreloadError);
	return () => target.removeEventListener("vite:preloadError", onPreloadError);
}
