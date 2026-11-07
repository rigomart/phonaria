import { describe, expect, it, vi } from "vitest";
import {
	listenForStaleDeploy,
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

	it("reloads instead of letting the import fail", () => {
		const target = new EventTarget();
		const reloadOnce = vi.fn(() => true);
		listenForStaleDeploy(target, reloadOnce);
		const event = preloadError();
		target.dispatchEvent(event);
		expect(reloadOnce).toHaveBeenCalledOnce();
		expect(event.defaultPrevented).toBe(true);
	});

	it("lets the import fail when the guard says no", () => {
		const target = new EventTarget();
		listenForStaleDeploy(target, () => false);
		const event = preloadError();
		target.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});

	it("stops listening on cleanup", () => {
		const target = new EventTarget();
		const reloadOnce = vi.fn(() => true);
		listenForStaleDeploy(target, reloadOnce)();
		target.dispatchEvent(preloadError());
		expect(reloadOnce).not.toHaveBeenCalled();
	});
});
