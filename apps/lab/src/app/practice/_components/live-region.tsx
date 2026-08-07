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

export function announce(message: string): void {
	snapshot = { version: snapshot.version + 1, message };
	for (const listener of listeners) listener();
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
