import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected copy comes from issues #332, #334 and #344; the IPA for ship (SH IX1 P) from the curated dictionary.

const statusIs = (expected: string) =>
	observation(
		() => ({
			status:
				document.querySelector('[aria-live="polite"][aria-atomic="true"] p')?.textContent?.trim() ??
				null,
		}),
		{ status: expected },
	);

const readAttempt = () => ({
	word: document.querySelector("h1")?.textContent?.trim() ?? null,
	status:
		document.querySelector('[aria-live="polite"][aria-atomic="true"] p')?.textContent?.trim() ??
		null,
	buttons: Array.from(document.querySelectorAll("main button"))
		.filter((button) => button.getClientRects().length > 0)
		.map((button) => button.getAttribute("aria-label") ?? button.textContent?.trim())
		.filter((label) => label && !label.startsWith("Details for")),
});

const readSounds = () => ({
	status:
		document.querySelector('[aria-live="polite"][aria-atomic="true"] p')?.textContent?.trim() ??
		null,
	heading: document.querySelector("main section h2")?.textContent?.trim() ?? null,
	sounds: Array.from(document.querySelectorAll("[data-sound-result]")).map((tile) => ({
		verdict: tile.getAttribute("data-sound-result"),
		buttons: Array.from(tile.querySelectorAll("button")).map((button) =>
			button.getAttribute("aria-label"),
		),
		sentence: tile.lastElementChild?.textContent?.trim() ?? null,
	})),
});

const notFound = observation(
	() => ({
		path: location.pathname,
		status: (
			performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
		)?.responseStatus,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
		recordButtons: Array.from(document.querySelectorAll("button")).filter(
			(button) => button.textContent?.trim() === "Record",
		).length,
	}),
	{
		path: "/practice/minimal-pairs",
		status: 404,
		heading: "This page doesn't exist",
		recordButtons: 0,
	},
);

const practiceIndex = (expectedLink: boolean) =>
	observation(
		() => ({
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			schwa: !!document.querySelector('a[href="/practice/schwa"]'),
			minimalPairs: !!document.querySelector('a[href="/practice/minimal-pairs"]'),
		}),
		{ path: "/practice", heading: "Practice", schwa: true, minimalPairs: expectedLink },
	);

export const minimalPairs = {
	title: "Minimal-pair speaking practice",
	checkpoints: {
		"index-link": practiceIndex(true),
		picker: observation(
			() => ({
				path: location.pathname,
				heading: document.querySelector("h1")?.textContent?.trim() ?? null,
				groups: Array.from(document.querySelectorAll("main h2")).map((h) => h.textContent?.trim()),
				contrasts: document.querySelectorAll('main a[href*="contrast="]').length,
				first: document.querySelector('main a[href*="contrast="]')?.getAttribute("aria-label"),
				seatSit: !!document.querySelector('a[aria-label="seat and sit"]'),
			}),
			{
				path: "/practice/minimal-pairs",
				heading: "Minimal pairs",
				groups: ["Consonants", "Vowels"],
				contrasts: 27,
				first: "pat and bat",
				seatSit: true,
			},
		),
		word: observation(
			() => {
				const params = new URL(location.href).searchParams;
				return {
					path: location.pathname,
					contrast: params.get("contrast"),
					word: document.querySelector("h1")?.textContent?.trim() ?? null,
					ipa: Array.from(document.querySelectorAll("main [data-ipa-token]"))
						.map((token) => token.textContent)
						.join(""),
					marked:
						document
							.querySelector('[aria-label$="the marked sound"]')
							?.getAttribute("aria-label") ?? null,
					hear: !!document.querySelector('button[aria-label="Hear ship"]'),
					record: Array.from(document.querySelectorAll("button")).some(
						(button) => button.textContent?.trim() === "Record",
					),
					privacy: Array.from(document.querySelectorAll("main p")).some(
						(p) =>
							p.textContent?.trim() === "Recordings go to Microsoft for checking and aren't kept.",
					),
					status:
						document
							.querySelector('[aria-live="polite"][aria-atomic="true"] p')
							?.textContent?.trim() ?? null,
				};
			},
			{
				path: "/practice/minimal-pairs",
				contrast: "i-ix",
				word: "ship",
				ipa: "ˈʃɪp",
				marked: "Details for /ɪ/, the marked sound",
				hear: true,
				record: true,
				privacy: true,
				status: null,
			},
		),
		match: observation(readAttempt, {
			word: "ship",
			status: "Your /ɪ/ sounded right. That's ship.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		swapped: observation(readAttempt, {
			word: "ship",
			status: "Your /ɪ/ sounded like /i/, which makes sheep.",
			buttons: ["Hear ship", "Try again", "Hear sheep", "Next word"],
		}),
		"not-heard": observation(readAttempt, {
			word: "ship",
			status: "We didn't catch anything. Check your microphone and try again.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		"random-word": observation(readAttempt, {
			word: "ship",
			status: "That sounded like kid, not ship. Try again with just the word.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		"added-sounds": observation(readAttempt, {
			word: "ship",
			status: "That sounded like ships, not ship. Try again with just the word.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		phrase: observation(readAttempt, {
			word: "ship",
			status: 'We heard "a ship". Say just ship on its own.',
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		"close-call": observation(readAttempt, {
			word: "ship",
			status: "Somewhere between /ɪ/ and /i/. Try again and make it a clear /ɪ/.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		"other-sound": observation(readAttempt, {
			word: "ship",
			status: "That didn't sound clearly like /ɪ/ or /i/. Try again.",
			buttons: ["Hear ship", "Try again", "Next word"],
		}),
		"every-sound": observation(readSounds, {
			status: "Your /ɪ/ sounded like /i/, which makes sheep.",
			heading: "Sound by sound",
			sounds: [
				{ verdict: "match", buttons: ["Details for /ʃ/"], sentence: "/ʃ/ sounded right" },
				{
					verdict: "swapped",
					buttons: ["Details for /ɪ/, the marked sound", "Details for /i/"],
					sentence: "/ɪ/ sounded like /i/",
				},
				{ verdict: "unclear", buttons: ["Details for /p/"], sentence: "/p/ wasn't clear" },
			],
		}),
		"heard-card": observation(
			() => ({
				open:
					document
						.querySelector("[data-sound-result] button[data-details-open]")
						?.getAttribute("aria-label") ?? null,
				cardIpa:
					document
						.querySelector('[data-phoneme-details] button[aria-label^="More about"]')
						?.getAttribute("aria-label")
						?.split(":")[0] ?? null,
			}),
			{ open: "Details for /i/", cardIpa: "More about /i/" },
		),
		denied: statusIs(
			"Phonaria can't use your microphone. Allow microphone access for this site, then try again.",
		),
		unsupported: statusIs(
			"Recording isn't available here. Check that a microphone is connected, or try another browser.",
		),
		"rate-limited": statusIs(
			"That's a lot of recordings in a short time. Wait a minute, then try again.",
		),
		unavailable: statusIs("Checking sounds isn't available right now. Try again later."),
		"scoring-failed": statusIs("Your recording couldn't be checked. Try again."),
		"next-word": observation(
			() => {
				const params = new URL(location.href).searchParams;
				const word = document.querySelector("h1")?.textContent?.trim() ?? "";
				const words =
					"seat sit sheep ship beat bit feet fit heat hit seek sick peak pick cheap chip sleep slip deep dip bean bin cheek chick least list teen tin leak lick".split(
						" ",
					);
				return {
					contrast: params.get("contrast"),
					urlMatchesHeading: params.get("word") === word,
					moved: word !== "ship",
					inContrast: words.includes(word),
					status:
						document
							.querySelector('[aria-live="polite"][aria-atomic="true"] p')
							?.textContent?.trim() ?? null,
				};
			},
			{ contrast: "i-ix", urlMatchesHeading: true, moved: true, inContrast: true, status: null },
		),
	},
	coverageLimits: [
		"Chromium only, with the microphone replaced by a MediaStream that plays a catalog recording (Azure Jenny TTS), so real voices and real microphones are not exercised.",
		"Match, swapped, not-heard (silence), random-word, added-sounds and phrase go through the local route to live Azure, two calls each. The wrong-word recordings are Azure Jenny TTS of kid, ships and \"a ship\", so real learners saying them are not exercised. Close-call and other-sound answer the scoring route from the page with set evidence, and the rate-limited, unavailable and scoring-failed messages replace the page's fetch for it; denied and unsupported replace getUserMedia. Those paths check the page's handling and the browser judge, not the route or Azure.",
		"Only the i-ix contrast and the word ship are recorded. The no-evidence sentence, for evidence with the sound missing, is covered by unit tests only. The live region is read from the DOM, not through a screen reader.",
		"The sound-by-sound row (every-sound, heard-card) answers the scoring route from the page with set evidence for every sound of ship, so it checks the browser judge and the row, not Azure. The word named for a swapped sound outside the contrast is covered by unit tests only.",
	],
} satisfies Feature;

export const minimalPairsOff = {
	title: "Minimal-pair speaking practice, FLAG_SPEECH off",
	checkpoints: {
		"not-found": notFound,
		"index-hidden": practiceIndex(false),
	},
	coverageLimits: [
		"The journey sees only the flag's effects; it cannot tell how the server was started.",
	],
	expectedResponses: [{ path: "/practice/minimal-pairs", status: 404 }],
} satisfies Feature;

/** Replaces the microphone with a stream that plays `base64` audio after a short pause, or silence when null. */
export function fakeMic(base64: string | null) {
	navigator.mediaDevices.getUserMedia = async () => {
		const context = new AudioContext();
		await context.resume();
		const destination = context.createMediaStreamDestination();
		if (base64) {
			const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
			const buffer = await context.decodeAudioData(bytes.buffer);
			const source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(destination);
			source.start(context.currentTime + 0.8);
		}
		return destination.stream;
	};
	return "fake microphone installed";
}

/** Makes getUserMedia reject the way a browser does, e.g. NotAllowedError or NotFoundError. */
export function failMic(name: string) {
	navigator.mediaDevices.getUserMedia = async () => {
		throw new DOMException("Simulated", name);
	};
	return `getUserMedia rejects with ${name}`;
}

/**
 * Answers the scoring route for ship (SH IX P) from the page with evidence whose
 * vowel has `targetScore` and one rival, so the browser judge decides the verdict.
 */
export function stubVowel(scores: { targetScore: number; rival: string; rivalScore: number }) {
	const sound = (phonemeId: string, targetScore: number, rivals: unknown[]) => ({
		type: "scored",
		phonemeId,
		startSeconds: 0,
		endSeconds: 0.1,
		targetScore,
		rivals,
	});
	const evidence = {
		words: [
			{
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: [
							sound("SH", 0.9, []),
							sound("IX", scores.targetScore, [
								{ phonemeId: scores.rival, score: scores.rivalScore },
							]),
							sound("P", 0.9, []),
						],
					},
				],
			},
		],
	};
	const original = window.fetch.bind(window);
	window.fetch = async (input, init) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		if (url.includes("/api/speech/score")) return Response.json(evidence);
		return original(input, init);
	};
	return `scoring route answers IX ${scores.targetScore} against ${scores.rival} ${scores.rivalScore}`;
}

/**
 * Answers the scoring route from the page with evidence for every sound of ship
 * (SH IX P), each with `targetScore` and at most one rival, so the browser judge
 * decides every verdict.
 */
export function stubSounds(
	sounds: { phonemeId: string; targetScore: number; rival?: string; rivalScore?: number }[],
) {
	const evidence = {
		words: [
			{
				pronunciations: [
					{
						pronunciationIndex: 0,
						sounds: sounds.map(({ phonemeId, targetScore, rival, rivalScore }) => ({
							type: "scored",
							phonemeId,
							startSeconds: 0,
							endSeconds: 0.1,
							targetScore,
							rivals: rival ? [{ phonemeId: rival, score: rivalScore ?? 0 }] : [],
						})),
					},
				],
			},
		],
	};
	const original = window.fetch.bind(window);
	window.fetch = async (input, init) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		if (url.includes("/api/speech/score")) return Response.json(evidence);
		return original(input, init);
	};
	return `scoring route answers ${sounds.map((sound) => `${sound.phonemeId} ${sound.targetScore}`).join(", ")}`;
}

/** Answers the scoring route with `status` from the page, without calling the Worker. */
export function failRoute(status: number) {
	const original = window.fetch.bind(window);
	window.fetch = async (input, init) => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		if (url.includes("/api/speech/score")) {
			return Response.json({ error: { code: "simulated", message: "Simulated" } }, { status });
		}
		return original(input, init);
	};
	return `scoring route answers ${status}`;
}
