import { create } from "zustand";

/**
 * Whether the learner chose to share scoring evidence (#336), kept in this browser
 * only. Off until they turn it on, and off whenever storage can't say otherwise.
 */
export const EVIDENCE_LOG_CONSENT_STORAGE_KEY = "evidence-log-consent";
const GIVEN = "on";

export function parseStoredConsent(raw: string | null): boolean {
	return raw === GIVEN;
}

function readStoredConsent(): boolean {
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
		// Blocked storage: the choice still holds for this page view.
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
	load: () => set({ enabled: readStoredConsent() }),
	setEnabled: (enabled) => {
		writeStoredConsent(enabled);
		set({ enabled });
	},
}));
