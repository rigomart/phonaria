/**
 * A tab opened before a deploy asks for chunks the new build no longer serves.
 * Once one fails, the tab reloads on its next move to another page, so nothing
 * on the page it's on is lost. The reload time is kept in sessionStorage so a
 * chunk missing for another reason can't loop the tab.
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

/** Loads `href` in full, once, under the same guard as `reloadOnceForStaleDeploy`. */
export function loadPageOnceForStaleDeploy(href: string): boolean {
	let storage: Storage | null = null;
	try {
		storage = globalThis.sessionStorage;
	} catch {
		// Blocked storage throws on access; without it the guard can't hold.
	}
	const { location } = globalThis;
	return reloadOnceForStaleDeploy({
		storage,
		reload: () => {
			// Back and Forward have already set the address; a link has not yet.
			if (location.pathname + location.search + location.hash === href) location.reload();
			else location.assign(href);
		},
	});
}

/** The router's page-change events, as `listenForStaleDeploy` uses them. */
export type PageChangeEvents = {
	subscribe(
		eventType: "onBeforeNavigate",
		listener: (event: { pathChanged: boolean; toLocation: { publicHref: string } }) => void,
	): () => void;
};

/**
 * Listens for Vite's `vite:preloadError`, fired in a build when a chunk fails
 * to load, whether a route's or a feature's (the 10k word list). The import
 * fails as usual. The next move to another path then loads that page in full
 * instead. Returns the cleanup.
 */
export function listenForStaleDeploy(
	router: PageChangeEvents,
	target: EventTarget = window,
	loadOnce: (href: string) => boolean = loadPageOnceForStaleDeploy,
): () => void {
	let stale = false;
	const onPreloadError = () => {
		stale = true;
	};
	target.addEventListener("vite:preloadError", onPreloadError);
	const stopPageChanges = router.subscribe("onBeforeNavigate", (event) => {
		if (stale && event.pathChanged) loadOnce(event.toLocation.publicHref);
	});
	return () => {
		target.removeEventListener("vite:preloadError", onPreloadError);
		stopPageChanges();
	};
}
