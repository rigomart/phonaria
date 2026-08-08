"use client";

/**
 * One polite live region for the whole practice experience. Components call
 * `announce()` from event handlers or effects; the single region is mounted
 * once by `PracticeExperience` so announcements survive phase switches.
 */
import { useSyncExternalStore } from "react";

export interface AnnouncementSnapshot {
	/** Bumped on every announce so identical messages still notify. */
	version: number;
	message: string;
}

let snapshot: AnnouncementSnapshot = { version: 0, message: "" };
const listeners = new Set<() => void>();

/**
 * VoiceOver drops polite live-region updates that land in the same
 * accessibility-tree batch as other state changes — committing a typed sound
 * collapses the search combobox, and VO speaks only "collapsed" (#158).
 * Deferring the DOM mutation past that batch makes each announcement a
 * discrete update VO reliably voices after the state-change speech.
 */
export const ANNOUNCE_DELAY_MS = 150;

let pendingAnnounce: ReturnType<typeof setTimeout> | null = null;

export function announce(message: string): void {
	// A newer announcement supersedes an undelivered one: flushing both within
	// one delay window would re-batch them, and the newer message is the one
	// describing the current state anyway.
	if (pendingAnnounce !== null) clearTimeout(pendingAnnounce);
	pendingAnnounce = setTimeout(() => {
		pendingAnnounce = null;
		snapshot = { version: snapshot.version + 1, message };
		for (const listener of listeners) listener();
	}, ANNOUNCE_DELAY_MS);
}

export function subscribeToAnnouncements(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getAnnouncementSnapshot(): AnnouncementSnapshot {
	return snapshot;
}

export function PracticeLiveRegion() {
	const { version, message } = useSyncExternalStore(
		subscribeToAnnouncements,
		getAnnouncementSnapshot,
		getAnnouncementSnapshot,
	);

	// Two regions, alternating: a repeated message lands in the empty node, so
	// the DOM always mutates and screen readers re-announce it.
	const useFirst = version % 2 === 1;

	return (
		<div className="sr-only">
			<div aria-live="polite">{useFirst ? message : ""}</div>
			<div aria-live="polite">{useFirst ? "" : message}</div>
		</div>
	);
}
