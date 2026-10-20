import { create } from "zustand";

/** The localStorage key for the evidence log opt-in (#336). */
export const EVIDENCE_LOG_CONSENT_STORAGE_KEY = "evidence-log-consent";
const GRANT = /^on:[\w-]{1,64}$/;

/**
 * The stored opt-in, `on:<id>`, or null for off. Each opt-in stores a fresh grant,
 * so an attempt queued under one grant isn't sent under a later one after a
 * revocation.
 */
export function parseConsentGrant(raw: string | null): string | null {
	return raw !== null && GRANT.test(raw) ? raw : null;
}

/** The grant this tab turned off; it stays off here even if removing it from storage failed. */
let revokedGrant: string | null = null;

function storedGrant(): string | null {
	try {
		return parseConsentGrant(globalThis.localStorage.getItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY));
	} catch {
		return null;
	}
}

/**
 * The grant in force right now, read from storage so a choice made in another tab
 * counts at once. Blocked storage, and a grant this tab turned off, read as off.
 */
export function currentConsentGrant(): string | null {
	const grant = storedGrant();
	return grant === revokedGrant ? null : grant;
}

function newGrant(): string {
	const id =
		globalThis.crypto?.randomUUID?.() ??
		`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
	return `on:${id}`;
}

function grantConsent() {
	try {
		globalThis.localStorage.setItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY, newGrant());
	} catch (error) {
		console.warn("evidence log consent: could not save", error);
	}
}

/** Off in this tab at once, whether or not storage can forget the grant. */
function revokeConsent() {
	revokedGrant = storedGrant();
	try {
		globalThis.localStorage.removeItem(EVIDENCE_LOG_CONSENT_STORAGE_KEY);
	} catch (error) {
		console.warn("evidence log consent: could not save", error);
	}
	notifyRevoked();
}

const revocationListeners = new Set<() => void>();

function notifyRevoked() {
	for (const listener of revocationListeners) listener();
}

const isGranted = () => currentConsentGrant() !== null;

interface EvidenceLogConsentStore {
	enabled: boolean;
	/** Re-reads storage. Call from an effect so the server render never depends on it. */
	load: () => void;
	setEnabled: (enabled: boolean) => void;
}

export const useEvidenceLogConsent = create<EvidenceLogConsentStore>()((set, get) => ({
	enabled: false,
	load: () => {
		const enabled = isGranted();
		const wasEnabled = get().enabled;
		set({ enabled });
		if (wasEnabled && !enabled) notifyRevoked();
	},
	setEnabled: (enabled) => {
		if (enabled) grantConsent();
		else revokeConsent();
		// What is in force, so a failed write leaves the switch off rather than lying.
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

/**
 * Calls `listener` whenever sharing is turned off in this tab, or this tab sees it
 * go from on to off in another. Returns the unsubscribe.
 */
export function onEvidenceLogConsentRevoked(listener: () => void): () => void {
	revocationListeners.add(listener);
	return () => revocationListeners.delete(listener);
}
