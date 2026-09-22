import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ANNOUNCE_DELAY_MS,
	announce,
	getAnnouncementSnapshot,
	subscribeToAnnouncements,
} from "./live-region";

describe("live region announcer", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runAllTimers();
		vi.useRealTimers();
	});

	it("publishes the message and notifies subscribers after the announce delay", () => {
		let notified = 0;
		const unsubscribe = subscribeToAnnouncements(() => {
			notified += 1;
		});
		const before = getAnnouncementSnapshot();

		announce("Added schwa, ə");

		expect(notified).toBe(0);
		expect(getAnnouncementSnapshot()).toBe(before);

		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);

		expect(notified).toBe(1);
		expect(getAnnouncementSnapshot().message).toBe("Added schwa, ə");
		unsubscribe();
	});

	it("bumps the version even for an identical repeated message", () => {
		announce("Removed schwa, ə");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);
		const first = getAnnouncementSnapshot();

		announce("Removed schwa, ə");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);
		const second = getAnnouncementSnapshot();

		expect(second.message).toBe(first.message);
		expect(second.version).toBe(first.version + 1);
	});

	it("coalesces announcements inside one delay window to the latest message", () => {
		const before = getAnnouncementSnapshot().version;
		announce("Added schwa, ə");
		announce("Added as in let, l");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);

		expect(getAnnouncementSnapshot().message).toBe("Added as in let, l");
		expect(getAnnouncementSnapshot().version).toBe(before + 1);
	});

	it("restarts the delay when a newer announcement supersedes a pending one", () => {
		announce("Word 3 of 5: typical");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS - 1);
		announce("2 words have no answer");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS - 1);

		expect(getAnnouncementSnapshot().message).not.toBe("2 words have no answer");

		vi.advanceTimersByTime(1);

		expect(getAnnouncementSnapshot().message).toBe("2 words have no answer");
	});

	it("stops notifying after unsubscribe", () => {
		let notified = 0;
		const unsubscribe = subscribeToAnnouncements(() => {
			notified += 1;
		});
		unsubscribe();

		announce("Word 2 of 5: about");
		vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);

		expect(notified).toBe(0);
	});
});
