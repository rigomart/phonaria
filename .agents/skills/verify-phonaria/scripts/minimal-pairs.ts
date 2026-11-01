import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
// Expected copy comes from issues #332, #334 and #344; the IPA for ship (SH IX1 P) and sheep (SH I1 P)
// from the curated dictionary.

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
	word: document.querySelector('[data-side="target"] p')?.textContent?.trim() ?? null,
	heard: document.querySelector("[data-heard]")?.getAttribute("data-side") ?? null,
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

const contrastPage = observation(
	() => ({
		path: location.pathname,
		status: (
			performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
		)?.responseStatus,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
		difference: document.querySelector("header p")?.textContent?.trim() ?? null,
		columns: Array.from(document.querySelectorAll("main table th")).map((th) =>
			th.textContent?.trim(),
		),
		pairs: Array.from(document.querySelectorAll("main table tbody tr")).map((row) =>
			Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent?.trim()),
		),
		hear: ["Hear think", "Hear sink"].map(
			(label) =>
				!!document.querySelector(
					`main table button[aria-label="${label}"]:not([data-status="pending"])`,
				),
		),
		recordButtons: Array.from(document.querySelectorAll("button")).filter(
			(button) => button.textContent?.trim() === "Record",
		).length,
		allPairs: document.querySelector('main a[href="/minimal-pairs"]')?.textContent?.trim() ?? null,
		soundLinks: Array.from(document.querySelectorAll("main table th a")).map((link) =>
			link.getAttribute("href"),
		),
		moreContrasts: Array.from(document.querySelectorAll("main section h2"))
			.filter((heading) => heading.textContent?.startsWith("More contrasts"))
			.map((heading) => ({
				heading: heading.textContent?.trim(),
				links: Array.from(heading.closest("section")?.querySelectorAll("a") ?? []).map((link) => [
					link.textContent?.trim(),
					link.getAttribute("href"),
				]),
			})),
	}),
	{
		path: "/minimal-pairs/th-s",
		status: 200,
		heading: "/θ/ vs /s/: think vs sink",
		difference:
			"/θ/ is made with the tongue between the teeth. /s/ is made with the tongue tip on the gum ridge behind the top teeth. Everything else is the same.",
		columns: ["/θ/Voiceless dental fricative", "/s/Voiceless alveolar fricative"],
		pairs: [
			["thin", "sin"],
			["thing", "sing"],
			["think", "sink"],
			["thick", "sick"],
			["theme", "seem"],
			["faith", "face"],
			["path", "pass"],
			["mouth", "mouse"],
			["math", "mass"],
			["myth", "miss"],
			["tenth", "tense"],
		],
		hear: [true, true],
		recordButtons: 0,
		allPairs: "All pairs",
		soundLinks: ["/sounds/th-thin", "/sounds/s-sun"],
		moreContrasts: [
			{
				heading: "More contrasts with /θ/",
				links: [["/θ/ vs /t/three, tree", "/minimal-pairs/th-t"]],
			},
			{
				heading: "More contrasts with /s/",
				links: [
					["/s/ vs /z/price, prize", "/minimal-pairs/s-z"],
					["/s/ vs /ʃ/see, she", "/minimal-pairs/s-sh"],
				],
			},
		],
	},
);

const soundPageContrastLinks = observation(
	() =>
		Array.from(document.querySelectorAll("[data-phoneme-details] a"))
			.filter((link) => link.getAttribute("href")?.startsWith("/minimal-pairs"))
			.map((link) => [link.textContent?.trim(), link.getAttribute("href")]),
	[
		["All pairs for /θ/ and /t/", "/minimal-pairs/th-t"],
		["All pairs for /θ/ and /s/", "/minimal-pairs/th-s"],
	],
);

const unknownContrast = observation(
	() => ({
		path: location.pathname,
		status: (
			performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
		)?.responseStatus,
		heading: document.querySelector("h1")?.textContent?.trim() ?? null,
	}),
	{ path: "/minimal-pairs/th-zz", status: 404, heading: "This page doesn't exist" },
);

const practiceIndex = () =>
	observation(
		() => ({
			path: location.pathname,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			schwa: !!document.querySelector('a[href="/practice/schwa"]'),
			card: !!document.querySelector('main a[href^="/minimal-pairs"]'),
			nav: Array.from(
				document.querySelectorAll('nav[aria-label="Main"] > ul > li > :is(a, button)'),
			).map((link) => link.textContent?.trim()),
			navHref:
				document
					.querySelector('nav[aria-label="Main"] a[href="/minimal-pairs"]')
					?.textContent?.trim() ?? null,
		}),
		{
			path: "/practice",
			heading: "Practice",
			schwa: true,
			card: false,
			nav: ["Transcription", "Sounds", "Minimal pairs", "Practice", "History"],
			navHref: "Minimal pairs",
		},
	);

export const minimalPairs = {
	title: "Minimal-pair speaking practice",
	checkpoints: {
		nav: practiceIndex(),
		redirect: observation(() => ({ path: location.pathname, search: location.search }), {
			path: "/minimal-pairs/i-ix",
			search: "?word=ship",
		}),
		picker: observation(
			() => ({
				path: location.pathname,
				heading: document.querySelector("h1")?.textContent?.trim() ?? null,
				groups: Array.from(document.querySelectorAll("main h2")).map((h) => h.textContent?.trim()),
				contrasts: document.querySelectorAll('main a[href^="/minimal-pairs/"]').length,
				first: document
					.querySelector('main a[href^="/minimal-pairs/"]')
					?.getAttribute("aria-label"),
				shipSheep: !!document.querySelector('a[aria-label="ship and sheep"]'),
			}),
			{
				path: "/minimal-pairs",
				heading: "Minimal pairs",
				groups: ["Consonants", "Vowels"],
				contrasts: 27,
				first: "pat and bat",
				shipSheep: true,
			},
		),
		word: observation(
			() => {
				const params = new URL(location.href).searchParams;
				return {
					path: location.pathname,
					heading: document.querySelector("h1")?.textContent?.trim() ?? null,
					word: params.get("word"),
					sides: Array.from(document.querySelectorAll("[data-side]")).map((card) => [
						card.getAttribute("data-side"),
						card.querySelector("h1, p")?.textContent?.trim(),
						Array.from(card.querySelectorAll("[data-ipa-token]"))
							.map((token) => token.textContent)
							.join(""),
						card.querySelector('[aria-label$="the marked sound"]')?.getAttribute("aria-label"),
					]),
					heard: document.querySelector("[data-heard]")?.getAttribute("data-side") ?? null,
					hear: ["Hear ship", "Hear sheep"].map(
						(label) => !!document.querySelector(`button[aria-label="${label}"]`),
					),
					record: Array.from(document.querySelectorAll("button")).some(
						(button) => button.textContent?.trim() === "Record",
					),
					privacy: Array.from(document.querySelectorAll("main p")).some((p) =>
						p.textContent
							?.trim()
							.startsWith(
								"We don't keep your recording. Microsoft checks it, and the check can be wrong.",
							),
					),
					status:
						document
							.querySelector('[aria-live="polite"][aria-atomic="true"] p')
							?.textContent?.trim() ?? null,
				};
			},
			{
				path: "/minimal-pairs/i-ix",
				heading: "/ɪ/ vs /i/: ship vs sheep",
				word: "ship",
				sides: [
					["target", "ship", "ˈʃɪp", "Details for /ɪ/, the marked sound"],
					["partner", "sheep", "ˈʃip", "Details for /i/, the marked sound"],
				],
				heard: null,
				hear: [true, true],
				record: true,
				privacy: true,
				status: null,
			},
		),
		match: observation(readAttempt, {
			word: "ship",
			heard: "target",
			status: "Your /ɪ/ sounded right. That's ship.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		swapped: observation(readAttempt, {
			word: "ship",
			heard: "partner",
			status: "Your /ɪ/ sounded like /i/, which makes sheep.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again", "Hear sheep"],
		}),
		"not-heard": observation(readAttempt, {
			word: "ship",
			heard: null,
			status: "We didn't catch anything. Check your microphone and try again.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		"random-word": observation(readAttempt, {
			word: "ship",
			heard: null,
			status: "That sounded like kid, not ship. Try again with just the word.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		"added-sounds": observation(readAttempt, {
			word: "ship",
			heard: null,
			status: "That sounded like ships, not ship. Try again with just the word.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		phrase: observation(readAttempt, {
			word: "ship",
			heard: null,
			status: 'We heard "a ship". Say just ship on its own.',
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		"close-call": observation(readAttempt, {
			word: "ship",
			heard: null,
			status: "Somewhere between /ɪ/ and /i/. Try again and make it a clear /ɪ/.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
		}),
		"other-sound": observation(readAttempt, {
			word: "ship",
			heard: null,
			status: "That didn't sound clearly like /ɪ/ or /i/. Try again.",
			buttons: ["Next word", "Hear ship", "Hear sheep", "Try again"],
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
				cardHeading:
					document.querySelector("[data-phoneme-details] h2")?.textContent?.trim() ?? null,
			}),
			{ open: "Details for /i/", cardHeading: "Long E /i/" },
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
		"card-link": observation(
			() => ({
				href:
					Array.from(document.querySelectorAll("[data-phoneme-details] a"))
						.find((link) => link.textContent?.trim().startsWith("Practise saying"))
						?.getAttribute("href") ?? null,
				label:
					Array.from(document.querySelectorAll("[data-phoneme-details] a"))
						.find((link) => link.textContent?.trim().startsWith("Practise saying"))
						?.textContent?.trim() ?? null,
			}),
			{ href: "/minimal-pairs/i-ix", label: "Practise saying /ɪ/ and /i/" },
		),
		"next-word": observation(
			() => {
				const params = new URL(location.href).searchParams;
				const word = document.querySelector('[data-side="target"] p')?.textContent?.trim() ?? "";
				const words =
					"seat sit sheep ship beat bit feet fit heat hit seek sick peak pick cheap chip sleep slip deep dip bean bin cheek chick least list teen tin leak lick".split(
						" ",
					);
				return {
					path: location.pathname,
					urlMatchesHeading: params.get("word") === word,
					moved: word !== "ship",
					inContrast: words.includes(word),
					status:
						document
							.querySelector('[aria-live="polite"][aria-atomic="true"] p')
							?.textContent?.trim() ?? null,
				};
			},
			{
				path: "/minimal-pairs/i-ix",
				urlMatchesHeading: true,
				moved: true,
				inContrast: true,
				status: null,
			},
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
	title: "Minimal-pair pages, FLAG_SPEECH off",
	checkpoints: {
		"contrast-page": contrastPage,
		"unknown-contrast": unknownContrast,
		"sound-page-links": soundPageContrastLinks,
		nav: practiceIndex(),
	},
	coverageLimits: [
		"The journey sees only the flag's effects; it cannot tell how the server was started.",
	],
	expectedResponses: [{ path: "/minimal-pairs/th-zz", status: 404 }],
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
