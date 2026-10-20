import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceLogNotice } from "@/lib/speech/evidence-log";
import {
	EVIDENCE_LOG_CONSENT_STORAGE_KEY,
	parseStoredConsent,
	useEvidenceLogConsent,
} from "@/lib/speech/evidence-log-consent";
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
		expect(storage.values.get(EVIDENCE_LOG_CONSENT_STORAGE_KEY)).toBe("on");

		useEvidenceLogConsent.setState({ enabled: false });
		useEvidenceLogConsent.getState().load();
		expect(useEvidenceLogConsent.getState().enabled).toBe(true);

		useEvidenceLogConsent.getState().setEnabled(false);
		expect(storage.values.has(EVIDENCE_LOG_CONSENT_STORAGE_KEY)).toBe(false);
	});

	it("reads anything but the stored opt-in as off", () => {
		expect(parseStoredConsent("on")).toBe(true);
		for (const raw of [null, "", "true", "1", "off"]) expect(parseStoredConsent(raw)).toBe(false);
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
