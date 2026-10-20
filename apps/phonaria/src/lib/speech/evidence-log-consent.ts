import { create } from "zustand";

/** The localStorage key for the evidence log opt-in (#336). */
export const EVIDENCE_LOG_CONSENT_STORAGE_KEY = "evidence-log-consent";
const GIVEN = "on";

export function parseStoredConsent(raw: string | null): boolean {
	return raw === GIVEN;
}

/**
 * Whether sharing is on right now. Storage is the source of truth, so a choice made
 * in another tab counts at once; blocked storage reads as off.
 */
export function hasEvidenceLogConsent(): boolean {
	try {
		return parseStoredConsent(globalThis.localStorage.getItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY));
	} catch {
		return false;
	}
}

function writeStoredConsent(enabled: boolean) {
	try {
		if (enabled) globalThis.localStorage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, GIVEN);
		else globalThis.localStorage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);
	} catch (error) {
		console.warn("evidence log consent: could not save", error);
	}
}

interface EvidenceLogConsentStore {
	enabled: boolean;
	/** Re-reads storage. Call from an effect so the server render never depends on it. */
	load: () => void;
	setEnabled: (enabled: boolean) => void;
}

export const useEvidenceLogConsent = create<EvidenceLogConsentStore>()((set) => ({
	enabled: false,
	load: () => set({ enabled: hasEvidenceLogConsent() }),
	setEnabled: (enabled) => {
		writeStoredConsent(enabled);
		// What was stored, so a blocked write leaves the switch off rather than lying.
		set({ enabled: hasEvidenceLogConsent() });
	},
}));

type StorageEvents = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/**
 * Keeps the store in step with other tabs. `key` is null when another tab clears
 * storage. Returns the unsubscribe.
 */
export function watchEvidenceLogConsent(target: StorageEvents = window): () => void {
	const onStorage = (event: Event) => {
		const { key } = event as StorageEvent;
		if (key === null || key === EVIDENCE_LOG_CONSENT_STORAGE_KEY) {
			useEvidenceLogConsent.getState().load();
		}
	};
	target.addEventListener("storage", onStorage);
	return () => target.removeEventListener("storage", onStorage);
}
