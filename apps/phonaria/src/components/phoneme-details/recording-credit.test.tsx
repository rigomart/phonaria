import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RecordingCredit } from "./recording-credit";

const render = (phonemeId: Parameters<typeof RecordingCredit>[0]["phonemeId"]) =>
	renderToString(<RecordingCredit phonemeId={phonemeId} />).replaceAll("<!-- -->", "");
const text = (html: string) => html.replace(/<[^>]+>/g, "");

describe("RecordingCredit", () => {
	it("names the author, linked to the Commons file, and the license, linked to its deed", () => {
		const html = render("TH");
		expect(text(html)).toBe("Recording: Peter Isotalo, CC BY-SA 3.0");
		expect(html).toContain(
			'href="https://commons.wikimedia.org/wiki/File:Voiceless_dental_fricative.ogg"',
		);
		expect(html).toContain('href="https://creativecommons.org/licenses/by-sa/3.0/"');
	});

	it("gives a public-domain recording without a license link", () => {
		const html = render("J");
		expect(text(html)).toBe("Recording: Octane, Public domain");
		expect(html.match(/<a /g)).toHaveLength(1);
	});

	it("shows nothing for a diphthong, which has no recording", () => {
		expect(render("OI")).toBe("");
	});
});
