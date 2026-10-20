import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceLogNotice } from "@/lib/speech/evidence-log";
import type { EvidenceLogPayload } from "@/lib/speech/evidence-log";
import {
	EVIDENCE_LOG_CONSENT_STORAGE_KEY,
	currentConsentGrant,
	onEvidenceLogConsentRevoked,
	parseConsentGrant,
	useEvidenceLogConsent,
	watchEvidenceLogConsent,
} from "@/lib/speech/evidence-log-consent";
import { createAttemptLogger } from "../_lib/evidence-log-attempt";
import type { AttemptLog } from "../_lib/speaking-attempt";
import { EvidenceLogSetting, EvidenceLogSwitch } from "./evidence-log-setting";

function memoryStorage(initial: Record<string, string> = {}) {
	const values = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => void values.set(key, value),
		removeItem: (key: string) => void values.delete(key),
		values,
	};
}

describe("EvidenceLogSetting", () => {
	afterEach(() => {
		useEvidenceLogConsent.setState({ enabled: false });
	});

	it("is a real switch, off by default, named and described by its own copy", () => {
		const html = renderToString(<EvidenceLogSetting />);

		expect(html).toMatch(/role="switch"/);
		expect(html).toContain('aria-checked="false"');
		const labelId = html.match(/aria-labelledby="([^"]+)"/)?.[1];
		const descriptionId = html.match(/aria-describedby="([^"]+)"/)?.[1];
		expect(html).toContain(`id="${labelId}">${EvidenceLogNotice.label}<`);
		expect(html).toContain(`id="${descriptionId}">${EvidenceLogNotice.description}<`);
		const forId = html.match(/<label[^>]* for="([^"]+)"/)?.[1];
		expect(html).toMatch(new RegExp(`<input id="${forId}"[^>]*type="checkbox"`));
	});

	it("renders off on the server, before the stored choice is read", () => {
		useEvidenceLogConsent.setState({ enabled: true });
		expect(renderToString(<EvidenceLogSetting />)).toContain('aria-checked="false"');
	});

	it("shows the switch on once sharing is on", () => {
		const html = renderToString(<EvidenceLogSwitch enabled onChange={() => {}} />);
		expect(html).toContain('aria-checked="true"');
	});

	it("says what is kept and for how long, and that the recording never is", () => {
		expect(EvidenceLogNotice.description).toMatch(/90 days/);
		expect(EvidenceLogNotice.description).toMatch(/Never your recording/);
	});
});

describe("useEvidenceLogConsent", () => {
	let storage: ReturnType<typeof memoryStorage>;
	beforeEach(() => {
		storage = memoryStorage();
		vi.stubGlobal("localStorage", storage);
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		useEvidenceLogConsent.setState({ enabled: false });
	});

	it("starts off with nothing stored", () => {
		useEvidenceLogConsent.getState().load();
		expect(useEvidenceLogConsent.getState().enabled).toBe(false);
	});

	it("remembers the choice in this browser, and forgets it when turned off", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		expect(storage.values.get(EVIDENCE_LOG_CONSENT_STORAGE_KEY)).toMatch(/^on:[\w-]+$/);

		useEvidenceLogConsent.setState({ enabled: false });
		useEvidenceLogConsent.getState().load();
		expect(useEvidenceLogConsent.getState().enabled).toBe(true);

		useEvidenceLogConsent.getState().setEnabled(false);
		expect(storage.values.has(EVIDENCE_LOG_CONSENT_STORAGE_KEY)).toBe(false);
	});

	it("stores a fresh grant each time sharing is turned on", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		const first = currentConsentGrant();
		useEvidenceLogConsent.getState().setEnabled(false);
		useEvidenceLogConsent.getState().setEnabled(true);

		expect(first).not.toBeNull();
		expect(currentConsentGrant()).not.toBe(first);
	});

	it("reads a grant, or the first release's bare on, and anything else as off", () => {
		expect(parseConsentGrant("on")).toBe("on");
		expect(parseConsentGrant("on:3f2a-b1")).toBe("on:3f2a-b1");
		for (const raw of [
			null,
			"",
			"true",
			"1",
			"off",
			"on:",
			"onx",
			"on:a b",
			`on:${"a".repeat(65)}`,
		]) {
			expect(parseConsentGrant(raw)).toBeNull();
		}
	});

	it("takes the first release's bare on as sharing on", () => {
		storage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, "on");
		useEvidenceLogConsent.getState().load();
		expect(useEvidenceLogConsent.getState().enabled).toBe(true);
	});

	it("tells the round when this tab sees sharing turned off", () => {
		const revoked = vi.fn();
		const unsubscribe = onEvidenceLogConsentRevoked(revoked);

		useEvidenceLogConsent.getState().setEnabled(true);
		useEvidenceLogConsent.getState().setEnabled(false);
		useEvidenceLogConsent.getState().setEnabled(false);
		unsubscribe();

		expect(revoked).toHaveBeenCalledTimes(1);
	});

	it("stays off when storage is blocked", () => {
		vi.stubGlobal("localStorage", {
			getItem: () => {
				throw new Error("blocked");
			},
		});
		useEvidenceLogConsent.getState().load();
		expect(useEvidenceLogConsent.getState().enabled).toBe(false);
	});
});

describe("evidence log consent across tabs", () => {
	const LOG: AttemptLog = {
		evidence: { words: [{ pronunciations: [] }], transcript: null },
		verdicts: { gate: { type: "not-heard" }, judgement: null },
	};
	let storage: ReturnType<typeof memoryStorage>;
	let otherTabs: EventTarget;
	let unwatch: () => void;

	/** Another tab changes storage, then this tab hears about it; Node has no StorageEvent. */
	function otherTab(change: () => void, key: string | null = EVIDENCE_LOG_CONSENT_STORAGE_KEY) {
		change();
		otherTabs.dispatchEvent(Object.assign(new Event("storage"), { key }));
	}

	function tabLogger() {
		const send = vi.fn<(payload: EvidenceLogPayload) => void>();
		const attempts = createAttemptLogger({
			word: "ship",
			currentGrant: currentConsentGrant,
			send,
		});
		return { attempts, send };
	}

	beforeEach(() => {
		storage = memoryStorage();
		vi.stubGlobal("localStorage", storage);
		otherTabs = new EventTarget();
		unwatch = watchEvidenceLogConsent(otherTabs);
	});
	afterEach(() => {
		unwatch();
		vi.unstubAllGlobals();
		useEvidenceLogConsent.setState({ enabled: false });
	});

	it("stops sending, the waiting attempt and later ones, once another tab turns sharing off", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		const { attempts, send } = tabLogger();
		attempts.scored(LOG);

		otherTab(() => storage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY));
		attempts.next("retried");
		attempts.scored(LOG);
		attempts.next("moved-on");

		expect(useEvidenceLogConsent.getState().enabled).toBe(false);
		expect(send).not.toHaveBeenCalled();
	});

	it("reads storage when sending, even before the other tab's event arrives", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		const { attempts, send } = tabLogger();
		attempts.scored(LOG);

		storage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("sends nothing when sharing is turned off and on again in this tab", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		const { attempts, send } = tabLogger();
		attempts.scored(LOG);

		useEvidenceLogConsent.getState().setEnabled(false);
		useEvidenceLogConsent.getState().setEnabled(true);
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("sends nothing when another tab turns sharing off and on again, with no event heard", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		const { attempts, send } = tabLogger();
		attempts.scored(LOG);

		storage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);
		storage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, "on:other-tab");
		attempts.next("moved-on");

		expect(send).not.toHaveBeenCalled();
	});

	it("turns off when another tab clears storage", () => {
		useEvidenceLogConsent.getState().setEnabled(true);

		otherTab(() => storage.values.clear(), null);

		expect(useEvidenceLogConsent.getState().enabled).toBe(false);
	});

	it("follows another tab turning sharing back on, and sends later attempts", () => {
		useEvidenceLogConsent.getState().load();
		const { attempts, send } = tabLogger();

		otherTab(() => storage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, "on"));
		attempts.scored(LOG);
		attempts.next("moved-on");

		expect(useEvidenceLogConsent.getState().enabled).toBe(true);
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("ignores other keys, and stops listening once unwatched", () => {
		useEvidenceLogConsent.getState().setEnabled(true);
		storage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);

		otherTab(() => {}, "theme");
		expect(useEvidenceLogConsent.getState().enabled).toBe(true);

		unwatch();
		otherTab(() => {});
		expect(useEvidenceLogConsent.getState().enabled).toBe(true);
	});

	it("leaves the switch off when the opt-in can't be stored", () => {
		vi.stubGlobal("localStorage", {
			getItem: () => null,
			setItem: () => {
				throw new Error("quota");
			},
			removeItem: () => {},
		});
		vi.spyOn(console, "warn").mockImplementation(() => {});

		useEvidenceLogConsent.getState().setEnabled(true);

		expect(useEvidenceLogConsent.getState().enabled).toBe(false);
	});
});
