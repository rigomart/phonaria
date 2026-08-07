import { describe, expect, it } from "vitest";
import { announce, getAnnouncementSnapshot, subscribeToAnnouncements } from "./live-region";

describe("live region announcer", () => {
	it("publishes the message and notifies subscribers", () => {
		let notified = 0;
		const unsubscribe = subscribeToAnnouncements(() => {
			notified += 1;
		});

		announce("Added schwa, /ə/");

		expect(notified).toBe(1);
		expect(getAnnouncementSnapshot().message).toBe("Added schwa, /ə/");
		unsubscribe();
	});

	it("bumps the version even for an identical repeated message", () => {
		announce("Removed schwa, /ə/");
		const first = getAnnouncementSnapshot();

		announce("Removed schwa, /ə/");
		const second = getAnnouncementSnapshot();

		expect(second.message).toBe(first.message);
		expect(second.version).toBe(first.version + 1);
	});

	it("stops notifying after unsubscribe", () => {
		let notified = 0;
		const unsubscribe = subscribeToAnnouncements(() => {
			notified += 1;
		});
		unsubscribe();

		announce("Word 2 of 5: about");

		expect(notified).toBe(0);
	});
});
