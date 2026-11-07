/**
 * A tab opened before a deploy still asks for the old build's chunks, which
 * the new deploy no longer serves, so the next page or feature it opens fails
 * to load. Reloading once picks up the new build. The time of that reload is
 * kept in sessionStorage so a chunk that is missing for any other reason can't
 * send the tab into a reload loop: a second failure soon after goes on to the
 * error page, or to the feature's own "didn't load" message.
 *
 * TanStack Router's lazy route components also reload once by themselves when
 * their chunk is missing at render time, with their own sessionStorage key,
 * so the error page doesn't reload again: by the time a route's chunk error
 * reaches it, one reload has already happened. A chunk that keeps failing can
 * therefore cost a route two reloads, one from each guard, before the error
 * page shows; a stale tab is fixed by the first.
 */

/** The sessionStorage key holding when this tab last reloaded for a missing chunk. */
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

/** `reloadOnceForStaleDeploy` with this tab's sessionStorage and location. */
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
