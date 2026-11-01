import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildCredits, CreditsContent, type CreditsFlags } from "./credits-content";

const allOff: CreditsFlags = {
	practice: false,
	speech: false,
	soundSearch: false,
	languageHistory: false,
};
const allOn: CreditsFlags = {
	practice: true,
	speech: true,
	soundSearch: true,
	languageHistory: true,
};

const SHIPPED_KEYS = [
	"cmu",
	"wiktionary",
	"jev",
	"phoneme-audio",
	"word-recordings",
	"wordfreq",
	"ipa-chart",
	"diagrams",
	"phonetic-data",
];

const FLAGGED_MENTIONS = [
	/practi[cs]e/i,
	/by their sounds/i,
	/speech scoring/i,
	/speech-scoring/,
	/recording goes to Azure/i,
	/Share results/i,
	/history/i,
	/Natural Earth/i,
];

function text(html: string): string {
	return html
		.replace(/<[^>]+>/g, " ")
		.replaceAll("&#x27;", "'")
		.replaceAll("&quot;", '"')
		.replaceAll("&amp;", "&");
}

describe("CreditsContent", () => {
	it("mentions no flagged feature or source with every flag off", () => {
		const html = renderToString(<CreditsContent flags={allOff} />);
		for (const mention of FLAGGED_MENTIONS) expect(html).not.toMatch(mention);
		expect(buildCredits(allOff).map((credit) => credit.key)).toEqual(SHIPPED_KEYS);
	});

	it("gives each source a section whose id is its key, with a jump link", () => {
		const html = renderToString(<CreditsContent flags={allOff} />);
		for (const key of SHIPPED_KEYS) {
			expect(html).toContain(`id="${key}"`);
			expect(html).toContain(`href="#${key}"`);
		}
	});

	it("adds the flagged sources and uses with every flag on", () => {
		const html = renderToString(<CreditsContent flags={allOn} />);
		expect(buildCredits(allOn).map((credit) => credit.key)).toEqual([
			"cmu",
			"wiktionary",
			"jev",
			"phoneme-audio",
			"word-recordings",
			"speech-scoring",
			"wordfreq",
			"ipa-chart",
			"diagrams",
			"phonetic-data",
			"history",
		]);
		const body = text(html);
		expect(body).toContain("the Practice words");
		expect(body).toContain("the words you can find by their sounds");
		expect(body).toContain("when you practise");
		expect(body).toContain("your recording goes to Azure AI Speech");
		expect(body).toContain("doesn't store it");
		expect(body).toContain("Natural Earth");
	});

	it("shows speech scoring whenever speaking practice is on, even without Practice", () => {
		const keys = buildCredits({ ...allOff, speech: true }).map((credit) => credit.key);
		expect(keys).toContain("speech-scoring");
		expect(keys).not.toContain("history");
	});

	it("ties each flagged source and use to its own flag, in every combination", () => {
		const names = ["practice", "speech", "soundSearch", "languageHistory"] as const;
		for (let mask = 0; mask < 1 << names.length; mask++) {
			const enabled = Object.fromEntries(
				names.map((name, bit) => [name, (mask & (1 << bit)) !== 0]),
			) as CreditsFlags;
			const keys = buildCredits(enabled).map((credit) => credit.key);
			const body = text(renderToString(<CreditsContent flags={enabled} />));
			const label = JSON.stringify(enabled);

			expect(keys.includes("speech-scoring"), label).toBe(enabled.speech);
			expect(keys.includes("history"), label).toBe(enabled.languageHistory);
			expect(body.includes("the Practice words"), label).toBe(enabled.practice);
			expect(body.includes("by their sounds"), label).toBe(enabled.soundSearch);
			expect(body.includes("when you practise"), label).toBe(enabled.practice || enabled.speech);
		}
	});

	it("lists each flagged use only under its own flag", () => {
		const practiceOnly = text(
			renderToString(<CreditsContent flags={{ ...allOff, practice: true }} />),
		);
		expect(practiceOnly).toContain("the Practice words");
		expect(practiceOnly).not.toMatch(/by their sounds|Speech scoring/);

		const searchOnly = text(
			renderToString(<CreditsContent flags={{ ...allOff, soundSearch: true }} />),
		);
		expect(searchOnly).toContain("the words you can find by their sounds");
		expect(searchOnly).not.toMatch(/practi[cs]e/i);
	});
});
