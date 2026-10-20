import { create } from "zustand";

/** The localStorage key for the evidence log opt-in (#336). */
export const EVIDENCE_LOG_CONSENT_STORAGE_KEY = "evidence-log-consent";
const LEGACY_GRANT = "on";
const GRANT = /^on:[\w-]{1,64}$/;

/**
 * The stored opt-in, or null for off. Each opt-in stores a fresh grant, so an
 * attempt queued under one grant isn't sent under a later one after a revocation.
 * The bare `on` of the first release is a grant of its own.
 */
export function parseConsentGrant(raw: string | null): string | null {
	return raw === LEGACY_GRANT || (raw !== null && GRANT.test(raw)) ? raw : null;
}

/** The grant in storage right now, so a choice made in another tab counts at once. Blocked storage reads as off. */
export function currentConsentGrant(): string | null {
	try {
		return parseConsentGrant(globalThis.localStorage.getItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY));
	} catch {
		return null;
	}
}

function newGrant(): string {
	const id =
		globalThis.crypto?.randomUUID?.() ??
		`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	return `on:${id}`;
}

function writeStoredConsent(enabled: boolean) {
	try {
		if (enabled) globalThis.localStorage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, newGrant());
		else globalThis.localStorage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);
	} catch (error) {
		console.warn("evidence log consent: could not save", error);
	}
}

const isGranted = () => currentConsentGrant() !== null;

interface EvidenceLogConsentStore {
	enabled: boolean;
	/** Re-reads storage. Call from an effect so the server render never depends on it. */
	load: () => void;
	setEnabled: (enabled: boolean) => void;
}

export const useEvidenceLogConsent = create<EvidenceLogConsentStore>()((set) => ({
	enabled: false,
	load: () => set({ enabled: isGranted() }),
	setEnabled: (enabled) => {
		writeStoredConsent(enabled);
		// What was stored, so a blocked write leaves the switch off rather than lying.
		set({ enabled: isGranted() });
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

/** Calls `listener` whenever this tab sees sharing go from on to off. Returns the unsubscribe. */
export function onEvidenceLogConsentRevoked(listener: () => void): () => void {
	return useEvidenceLogConsent.subscribe((state, previous) => {
		if (previous.enabled && !state.enabled) listener();
	});
}
