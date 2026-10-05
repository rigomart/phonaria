import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
const empty = observation(
	() => {
		const input = document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]');
		return {
			input: input?.value ?? null,
			query: new URL(location.href).searchParams.get("q"),
			tokens: document.querySelectorAll("[data-ipa-token]").length,
			example: Array.from(document.querySelectorAll("button")).some(
				(button) =>
					button.textContent?.trim() === "Hello world" && button.getClientRects().length > 0,
			),
		};
	},
	{ input: "", query: null, tokens: 0, example: true },
);

const result = observation(
	() => {
		const input = document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]');
		const copy = document.querySelector<HTMLButtonElement>('[aria-label="Copy IPA transcription"]');
		return {
			input: input?.value ?? null,
			query: new URL(location.href).searchParams.get("q"),
			words: ["hello", "world"].map((word) => {
				const button = document.querySelector(`[aria-label="Definition of ${word}"]`);
				return {
					word: button?.textContent?.trim() ?? null,
					visible: !!button?.getClientRects().length,
					ipa: button?.parentElement
						? Array.from(button.parentElement.querySelectorAll("[data-ipa-token]"))
								.map((token) => token.textContent)
								.join("")
						: null,
				};
			}),
			copyEnabled: !!copy && !copy.disabled && copy.getClientRects().length > 0,
			alerts: Array.from(document.querySelectorAll('[role="alert"]')).map(
				(alert) => alert.textContent,
			),
		};
	},
	{
		input: "hello world",
		query: "hello world",
		words: [
			{ word: "hello", visible: true, ipa: "hə·ˈloʊ" },
			{ word: "world", visible: true, ipa: "ˈwɝld" },
		],
		copyEnabled: true,
		alerts: [],
	},
);

const details = observation(
	() => {
		const visible = (selector: string) =>
			!!document.querySelector(selector)?.getClientRects().length;
		return {
			open:
				document.querySelector('[aria-label="Details for /h/"]')?.getAttribute("aria-expanded") ===
				"true",
			label: document.body.innerText.includes("Voiceless glottal fricative"),
			play: visible('[aria-label="Play h"]'),
			slow: visible('[aria-label="Play slow h"]'),
			diagram: visible('img[alt="Voiceless glottal fricative articulation"]'),
		};
	},
	{ open: true, label: true, play: true, slow: true, diagram: true },
);

const cleared = observation(
	() => {
		const input = document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]');
		return {
			input: input?.value ?? null,
			query: new URL(location.href).searchParams.get("q"),
			focused: !!input && document.activeElement === input,
			tokens: document.querySelectorAll("[data-ipa-token]").length,
			copyAbsent: !document.querySelector('[aria-label="Copy IPA transcription"]'),
			clearAbsent: !document.querySelector('[aria-label="Clear text"]'),
			example: Array.from(document.querySelectorAll("button")).some(
				(button) =>
					button.textContent?.trim() === "Hello world" && button.getClientRects().length > 0,
			),
		};
	},
	{
		input: "",
		query: null,
		focused: true,
		tokens: 0,
		copyAbsent: true,
		clearAbsent: true,
		example: true,
	},
);

const draft = observation(
	() => {
		const input = document.querySelector<HTMLInputElement>('[aria-label="Text to transcribe"]');
		return {
			input: input?.value ?? null,
			query: new URL(location.href).searchParams.get("q"),
			focused: !!input && document.activeElement === input,
		};
	},
	{ input: "hello", query: null, focused: true },
);

export const transcription = {
	title: "Transcription",
	checkpoints: {
		empty,
		submitted: result,
		details,
		restored: result,
		cleared,
		draft,
		escape: cleared,
	},
	coverageLimits: [
		"common-word client lookup only; no Turso or spelling service",
		"audio controls and diagram presence checked; playback and media fidelity unverified",
		"copy control enabled; clipboard contents unverified",
		"desktop Chromium; no mobile or other browser coverage",
	],
} satisfies Feature;
