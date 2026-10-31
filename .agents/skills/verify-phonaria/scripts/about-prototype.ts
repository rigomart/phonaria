import { type Feature, observation } from "./feature";

// Runs in the browser after serialization; keep dependencies inside the body.
// Expected values are the prototype's own copy for #264, one set per variant.

const read = () => ({
	path: location.pathname + location.search,
	robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
	h1: Array.from(document.querySelectorAll("main h1")).map((h) => h.textContent?.trim()),
	h2: Array.from(document.querySelectorAll("main h2")).map((h) => h.textContent?.trim()),
	current:
		document
			.querySelector('nav[aria-label="Prototype variants"] [aria-current="page"]')
			?.textContent?.trim() ?? null,
	recordings:
		Array.from(document.querySelectorAll("main button[data-status]"))
			.map((b) => b.textContent?.trim())
			.filter((t) => t === "pick" || t === "peak").length > 0,
	footerAbout: !!document.querySelector('footer a[href="/about"]'),
	overflow: document.documentElement.scrollWidth > window.innerWidth,
});

const variantA = observation(read, {
	path: "/about?variant=a",
	robots: "noindex, follow",
	h1: ["About Phonaria"],
	h2: ["How a sound improves", "Each sound has its own stage", "How to improve a sound"],
	current: "A · Fewer words",
	recordings: true,
	footerAbout: true,
	overflow: false,
});

const variantB = observation(read, {
	path: "/about?variant=b",
	robots: "noindex, follow",
	h1: ["Play these two words."],
	h2: [
		"What a listener hears",
		"Your sounds are not all at the same stage",
		"How Phonaria helps with one sound",
		"About Phonaria",
	],
	current: "B · Listen first",
	recordings: true,
	footerAbout: true,
	overflow: false,
});

const variantC = observation(read, {
	path: "/about?variant=c",
	robots: "noindex, follow",
	h1: ["About Phonaria"],
	h2: ["The tools", "How pronunciation improves"],
	current: "C · Tools first",
	recordings: true,
	footerAbout: true,
	overflow: false,
});

const answerSame = observation(
	() => ({
		pressed:
			document.querySelector('main button[aria-pressed="true"]')?.textContent?.trim() ?? null,
		answer: Array.from(document.querySelectorAll("main p")).some((p) =>
			p.textContent?.startsWith("That is normal."),
		),
	}),
	{ pressed: "They sound the same", answer: true },
);

const soundDetails = observation(
	() => ({
		open: !!document.querySelector("[data-phoneme-details]"),
		title:
			document
				.querySelector("[data-phoneme-details] h2, [data-phoneme-details] h3")
				?.textContent?.trim()
				.includes("θ") ?? false,
	}),
	{ open: true, title: true },
);

export const aboutPrototype = {
	title: "About page prototype (#264)",
	checkpoints: {
		"variant-a": variantA,
		"variant-b": variantB,
		"variant-c": variantC,
		"answer-same": answerSame,
		"sound-details": soundDetails,
	},
	coverageLimits: [
		"prototype copy, judged by the owner; checkpoints only confirm each variant renders and its controls work",
		"audio playback is not checked beyond the recordings rendering as buttons",
	],
} satisfies Feature;
