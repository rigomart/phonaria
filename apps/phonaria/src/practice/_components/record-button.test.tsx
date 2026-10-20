import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SpeakingView } from "../_lib/speaking-attempt";
import { RecordButton } from "./record-button";

const noop = () => {};
const silent = () => ({ elapsedSeconds: 0, level: 0 });

function render(view: SpeakingView) {
	return renderToString(
		<RecordButton getMeter={silent} onRecord={noop} onStop={noop} view={view} />,
	);
}

const text = (html: string) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "");

describe("RecordButton", () => {
	it("shows a record dot and the Record label before recording", () => {
		const html = render({ phase: "ready" });
		expect(text(html)).toBe("Record");
		expect(html).toContain("bg-record");
		expect(html).not.toContain("aria-label");
	});

	it("is named Stop recording while recording, with a stop square, a time ring and level bars", () => {
		const html = render({ phase: "recording" });
		expect(html).toContain('aria-label="Stop recording"');
		expect(text(html)).toBe("Stop");
		expect(html).toContain("data-recording");
		expect(html).toContain("<svg");
		expect(html).toContain('data-lit-bars="0"');
		expect(html).toContain("motion-reduce:animate-none");
	});

	it("checks calmly, without the record color", () => {
		const html = render({ phase: "scoring" });
		expect(text(html)).toBe("Checking…");
		expect(html).toContain("disabled");
		expect(html).not.toContain("bg-record");
	});

	it("offers another recording after a result", () => {
		const html = render({ phase: "outcome", outcome: { verdict: "match" } });
		expect(text(html)).toBe("Try again");
		expect(html).toContain("bg-record");
	});
});
