import { describe, expect, it, vi } from "vitest";
import {
	listenForStaleDeploy,
	type PageChangeEvents,
	reloadOnceForStaleDeploy,
	STALE_DEPLOY_RELOAD_KEY,
	STALE_DEPLOY_RELOAD_WINDOW_MS,
} from "./stale-deploy-reload";

function memoryStorage(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
		values,
	};
}

describe("reloadOnceForStaleDeploy", () => {
	it("reloads and remembers when", () => {
		const storage = memoryStorage();
		const reload = vi.fn();
		expect(reloadOnceForStaleDeploy({ storage, reload, now: 1_000_000 })).toBe(true);
		expect(reload).toHaveBeenCalledOnce();
		expect(storage.values.get(STALE_DEPLOY_RELOAD_KEY)).toBe("1000000");
	});

	it("doesn't reload again soon after, so a missing chunk can't loop", () => {
		const storage = memoryStorage();
		const reload = vi.fn();
		reloadOnceForStaleDeploy({ storage, reload, now: 1_000_000 });
		expect(reloadOnceForStaleDeploy({ storage, reload, now: 1_005_000 })).toBe(false);
		expect(reload).toHaveBeenCalledOnce();
	});

	it("reloads for a later deploy once the window has passed", () => {
		const storage = memoryStorage({ [STALE_DEPLOY_RELOAD_KEY]: "1000000" });
		const reload = vi.fn();
		const now = 1_000_000 + STALE_DEPLOY_RELOAD_WINDOW_MS;
		expect(reloadOnceForStaleDeploy({ storage, reload, now })).toBe(true);
		expect(reload).toHaveBeenCalledOnce();
	});

	it("treats an unreadable stored value as no earlier reload", () => {
		const storage = memoryStorage({ [STALE_DEPLOY_RELOAD_KEY]: "not a time" });
		const reload = vi.fn();
		expect(reloadOnceForStaleDeploy({ storage, reload, now: 1_000_000 })).toBe(true);
	});

	it("never reloads without storage, since nothing could stop a loop", () => {
		const reload = vi.fn();
		expect(reloadOnceForStaleDeploy({ storage: null, reload })).toBe(false);
		expect(
			reloadOnceForStaleDeploy({
				storage: {
					getItem: () => null,
					setItem: () => {
						throw new DOMException("Quota exceeded", "QuotaExceededError");
					},
				},
				reload,
			}),
		).toBe(false);
		expect(
			reloadOnceForStaleDeploy({
				storage: {
					getItem: () => {
						throw new DOMException("Blocked", "SecurityError");
					},
					setItem: () => {},
				},
				reload,
			}),
		).toBe(false);
		expect(reload).not.toHaveBeenCalled();
	});
});

describe("listenForStaleDeploy", () => {
	const preloadError = () => new Event("vite:preloadError", { cancelable: true });

	function fakeRouter() {
		type Listener = Parameters<PageChangeEvents["subscribe"]>[1];
		const listeners = new Set<Listener>();
		const router: PageChangeEvents = {
			subscribe: (_eventType, listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
		};
		const navigate = (publicHref: string, pathChanged = true) => {
			for (const listener of listeners) listener({ pathChanged, toLocation: { publicHref } });
		};
		return { router, navigate };
	}

	it("lets the import fail and leaves the page as it is", () => {
		const target = new EventTarget();
		const loadOnce = vi.fn(() => true);
		listenForStaleDeploy(fakeRouter().router, target, loadOnce);
		const event = preloadError();
		target.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
		expect(loadOnce).not.toHaveBeenCalled();
	});

	it("loads the next page in full", () => {
		const target = new EventTarget();
		const { router, navigate } = fakeRouter();
		const loadOnce = vi.fn((_href: string) => true);
		listenForStaleDeploy(router, target, loadOnce);
		target.dispatchEvent(preloadError());
		navigate("/search?q=hello%20world", false);
		expect(loadOnce, "a query-only change keeps the page").not.toHaveBeenCalled();
		navigate("/credits");
		expect(loadOnce).toHaveBeenCalledExactlyOnceWith("/credits");
	});

	it("doesn't load in full when no chunk failed", () => {
		const { router, navigate } = fakeRouter();
		const loadOnce = vi.fn(() => true);
		listenForStaleDeploy(router, new EventTarget(), loadOnce);
		navigate("/credits");
		expect(loadOnce).not.toHaveBeenCalled();
	});

	it("stops listening on cleanup", () => {
		const target = new EventTarget();
		const { router, navigate } = fakeRouter();
		const loadOnce = vi.fn(() => true);
		listenForStaleDeploy(router, target, loadOnce)();
		target.dispatchEvent(preloadError());
		navigate("/credits");
		expect(loadOnce).not.toHaveBeenCalled();
	});
});
