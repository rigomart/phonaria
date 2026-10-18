import { type Feature, observation } from "./feature";

// These functions run in the browser after serialization. Keep their dependencies
// inside the function body and read only rendered DOM and browser state.
//
// Expected values are literals taken from the story data in
// apps/phonaria/src/lib/language-spread/story.ts and from the product requirements:
// 11 steps, 9 places, 8 spread routes, 9 main works. Routes drawn by step are cumulative:
// intro 0, indo-european 1, germanic 1, old-english 3, vikings 5, norman-conquest 6,
// great-vowel-shift 6, printing 6, america 7, around-the-world 8, today 8.
//
// Camera bounds are the step's `camera` rectangle in degrees (west, south, east, north):
//   germanic -12, 44, 30, 64     vikings -14, 48, 16, 63     printing -6, 49.5, 4, 55
//   america -90, 25, 5, 58       around-the-world 10, -45, 160, 20
// Card placements (`card`, default center-left): intro center-left, vikings bottom-right,
// printing top-left, america bottom-left, around-the-world top-right. Phones always put the
// card at the bottom.
//
// The centre reads as "lon,lat" in data-camera-center and the zoom in data-camera-zoom, where 1
// means the whole globe exactly fits the area the card and era dial leave free. Both are written
// when the camera lands. Measured at 1280 x 800: the whole-globe view is 0.88 and every story step
// lands above 1 (around-the-world, the widest, at 1.06).

const stepsInOrder = [
	"intro",
	"indo-european",
	"germanic",
	"old-english",
	"vikings",
	"norman-conquest",
	"great-vowel-shift",
	"printing",
	"america",
	"around-the-world",
	"today",
];

const intro = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const sources = document.querySelector('section[aria-labelledby="language-spread-sources"]');
		const links = Array.from(sources?.querySelectorAll("a") ?? []);
		const cards = Array.from(document.querySelectorAll<HTMLElement>("li[data-step] > * article"));
		const card = document.querySelector('[data-step="intro"] article')?.getBoundingClientRect();
		const previous = document.querySelector<HTMLButtonElement>(
			'button[aria-label="Previous step"]',
		);
		// Cards sit 24 px inside the map region on wide screens. Placement is measured against the
		// region rather than the window, since the page's scrollbar narrows it.
		const frameMiddle = ((box?.top ?? 0) + (box?.bottom ?? 0)) / 2;
		return {
			path: location.pathname,
			title: document.title,
			heading: document.querySelector("h1")?.textContent?.trim() ?? null,
			navCurrent:
				document
					.querySelector('nav[aria-label="Main"] a[href="/language-spread"]')
					?.getAttribute("aria-current") ?? null,
			robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
			share: (() => {
				const meta = (key: string) =>
					Array.from(
						document.querySelectorAll<HTMLMetaElement>(
							`meta[property="${key}"], meta[name="${key}"]`,
						),
					).map((tag) => tag.content);
				const article = Array.from(
					document.querySelectorAll('script[type="application/ld+json"]'),
				).map((script) => JSON.parse(script.textContent ?? "{}"));
				return {
					ogType: meta("og:type"),
					ogTitle: meta("og:title"),
					ogDescription:
						meta("og:description")[0]?.startsWith("English from Indo-European roots") ?? false,
					// Every og:image and twitter:image, whatever origin they carry, is the page's own image.
					images: [...meta("og:image"), ...meta("twitter:image")].every((url) =>
						url.endsWith("/og/language-spread.jpg"),
					),
					imageSize: `${meta("og:image:width")[0]}x${meta("og:image:height")[0]}`,
					twitterCard: meta("twitter:card"),
					twitterTitle: meta("twitter:title"),
					structuredData: article.map((item) => ({
						type: item["@type"],
						citations: Array.isArray(item.citation) ? item.citation.length : null,
					})),
				};
			})(),
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel:
				Array.from(document.querySelectorAll(".sr-only"))
					.map((element) => /Step \d+ of \d+/.exec(element.textContent ?? "")?.[0])
					.find(Boolean) ?? null,
			steps: Array.from(document.querySelectorAll("li[data-step]")).map((item) =>
				item.getAttribute("data-step"),
			),
			ticks: document.querySelectorAll("ol[aria-hidden] > li").length,
			stops: document.querySelectorAll("[data-stop]").length,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			wholeGlobe: Number(region?.dataset.cameraZoom) < 1,
			pinnedTop: !!box && Math.abs(box.top - 48) <= 2,
			pinnedHeight: !!box && Math.abs(box.height - (innerHeight - 48)) <= 2,
			cardVisible:
				cards.length > 0 &&
				getComputedStyle(cards[0]).opacity === "1" &&
				!cards[0].closest("[inert]"),
			cardCenterLeft:
				!!card &&
				Math.abs(card.left - 24) <= 2 &&
				Math.abs((card.top + card.bottom) / 2 - frameMiddle) <= 2,
			otherCardsTransparent: cards
				.slice(1)
				.every((other) => getComputedStyle(other).opacity === "0"),
			previousDisabled:
				!!previous && (previous.disabled || previous.getAttribute("aria-disabled") === "true"),
			sources: {
				heading: sources?.querySelector("h2")?.textContent?.trim() ?? null,
				links: links.length,
				https: links.every((link) => link.getAttribute("href")?.startsWith("https://")),
			},
		};
	},
	{
		path: "/language-spread",
		title: "The history of English, from Old English to today - Phonaria",
		heading: "The story of English",
		navCurrent: "page",
		// Robots follows SITE_INDEXING_ENABLED, which is "0" in wrangler.jsonc's local vars and unset in .dev.vars.
		robots: "noindex, follow",
		share: {
			ogType: ["article"],
			ogTitle: ["The history of English, from Old English to today"],
			ogDescription: true,
			images: true,
			imageSize: "1200x630",
			twitterCard: ["summary_large_image"],
			twitterTitle: ["The history of English, from Old English to today"],
			structuredData: [{ type: "Article", citations: 28 }],
		},
		era: "~4000 BCE",
		step: "intro",
		stepLabel: "Step 1 of 11",
		steps: stepsInOrder,
		ticks: 11,
		stops: 9,
		revealed: 0,
		routesDrawn: "0",
		camera: "settled",
		wholeGlobe: true,
		pinnedTop: true,
		pinnedHeight: true,
		cardVisible: true,
		cardCenterLeft: true,
		otherCardsTransparent: true,
		previousDisabled: true,
		sources: { heading: "Sources", links: 9, https: true },
	},
);

// Enter on the focused Next or Previous step button. The step changes by scrolling the page; once
// it lands, the dial's status region announces the step and focus moves to the card now showing,
// since the previous card's controls become unreachable. Scrolling by hand announces nothing.
const stepButton = () => {
	const active = document.querySelector<HTMLElement>('[data-step][aria-current="step"]');
	const card = active?.querySelector("article");
	const dial = (() => {
		let element = document.querySelector("[data-era]")?.parentElement;
		while (element && !element.querySelector('[role="status"]')) element = element.parentElement;
		return element;
	})();
	return {
		step: active?.getAttribute("data-step") ?? null,
		era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
		announcement: dial?.querySelector('[role="status"]')?.textContent?.trim() ?? null,
		focusOnCard: !!card && document.activeElement === card,
		cardVisible: !!card && getComputedStyle(card).opacity === "1",
		otherCardsTransparent: Array.from(document.querySelectorAll("li[data-step] article"))
			.filter((other) => other !== card)
			.every((other) => getComputedStyle(other).opacity === "0"),
		revealed: Array.from(document.querySelectorAll("[data-stop][data-revealed]")).map((pin) =>
			pin.getAttribute("data-stop"),
		),
	};
};

const nextStep = observation(stepButton, {
	step: "indo-european",
	era: "~4000 BCE",
	announcement: "Step 2 of 11, ~4000 BCE: One ancestor, many languages",
	focusOnCard: true,
	cardVisible: true,
	otherCardsTransparent: true,
	revealed: ["indo-european"],
});

const previousStep = observation(stepButton, {
	step: "intro",
	era: "~4000 BCE",
	announcement: "Step 1 of 11, ~4000 BCE: The story of English",
	focusOnCard: true,
	cardVisible: true,
	otherCardsTransparent: true,
	revealed: [],
});

// Reads the flight recorded by `recordFlight` and works out the globe's zoom on every frame from
// where the pins were drawn. In an orthographic view a place at (lon, lat) is drawn at
// centre + radius * projection, so for a candidate camera centre the radius and screen centre
// follow by least squares; a grid search over centres keeps the best fit. The radius at landing,
// with the centre the page reports, turns radii into the page's zoom.
const flight = observation(
	() => {
		const places: Record<string, [number, number]> = {
			"indo-european": [42, 47],
			germanic: [10, 56],
			"old-english": [0.5, 52.5],
			"old-norse": [-1, 53.8],
			"norman-french": [0.49, 50.91],
			"great-vowel-shift": [-1.2, 52.3],
			"london-english": [-0.13, 51.5],
			"american-english": [-76.78, 37.21],
			"australian-english": [151.21, -33.86],
		};
		const england = [
			"old-english",
			"old-norse",
			"norman-french",
			"great-vowel-shift",
			"london-english",
		];
		type Pin = [id: string, x: number, y: number];
		const recorded = (
			window as unknown as {
				__spreadFlight?: {
					startZoom: number;
					start: Pin[];
					frames: Pin[][];
					landing: Pin[];
					done: boolean;
					timedOut: boolean;
				};
			}
		).__spreadFlight;
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const rad = Math.PI / 180;
		const project = (id: string, lon: number, lat: number) => {
			const [plon, plat] = places[id];
			const d = (plon - lon) * rad;
			return [
				Math.cos(plat * rad) * Math.sin(d),
				-(
					Math.cos(lat * rad) * Math.sin(plat * rad) -
					Math.sin(lat * rad) * Math.cos(plat * rad) * Math.cos(d)
				),
			];
		};
		const fit = (pins: Pin[], lon: number, lat: number) => {
			const p = pins.map(([id]) => project(id, lon, lat));
			const n = pins.length;
			let mx = 0;
			let my = 0;
			let px = 0;
			let py = 0;
			pins.forEach(([, x, y], i) => {
				mx += x / n;
				my += y / n;
				px += p[i][0] / n;
				py += p[i][1] / n;
			});
			let num = 0;
			let den = 0;
			pins.forEach(([, x, y], i) => {
				num += (x - mx) * (p[i][0] - px) + (y - my) * (p[i][1] - py);
				den += (p[i][0] - px) ** 2 + (p[i][1] - py) ** 2;
			});
			const radius = num / den;
			let error = 0;
			pins.forEach(([, x, y], i) => {
				error += (x - mx - radius * (p[i][0] - px)) ** 2 + (y - my - radius * (p[i][1] - py)) ** 2;
			});
			return { radius, lon, lat, rms: Math.sqrt(error / n) };
		};
		const solve = (pins: Pin[]) => {
			let best = { radius: 0, lon: 0, lat: 0, rms: Infinity };
			for (let lon = -180; lon < 180; lon += 3) {
				for (let lat = -84; lat <= 84; lat += 3) {
					const f = fit(pins, lon, lat);
					if (f.radius > 0 && f.rms < best.rms) best = f;
				}
			}
			for (let step = 1; step >= 0.05; step /= 4) {
				const { lon: clon, lat: clat } = best;
				for (let lon = clon - 4 * step; lon <= clon + 4 * step; lon += step) {
					for (let lat = clat - 4 * step; lat <= clat + 4 * step; lat += step) {
						const f = fit(pins, lon, lat);
						if (f.radius > 0 && f.rms < best.rms) best = f;
					}
				}
			}
			return best;
		};
		// England's five places sit within a few degrees, so they count as one point unless the
		// view is close enough to tell them apart; a fit needs three separate points.
		const solvable = (pins: Pin[]) => {
			const english = pins.filter(([id]) => england.includes(id)).length;
			return pins.length - english + (english ? 1 : 0) >= 3 || english >= 4;
		};
		if (!recorded?.done || !region?.dataset.cameraCenter) {
			return {
				recorded: false,
				fitsPins: false,
				startsWhereItWas: false,
				landsZoomedIn: false,
				dips: false,
				wholeGlobe: false,
			};
		}
		const [lon, lat] = region.dataset.cameraCenter.split(",").map(Number);
		const landingZoom = Number(region.dataset.cameraZoom);
		const landing = fit(recorded.landing, lon, lat);
		const unit = landing.radius / landingZoom;
		const solved = recorded.frames.filter(solvable).map(solve);
		const zooms = solved.map((frame) => frame.radius / unit);
		const lowest = Math.min(...zooms);
		// The largest jump, in pixels, of a pin between the view before the step changed and the
		// flight's first frame. Pin positions, not a fitted centre, since a tight cluster of
		// places pins down the radius but hardly the centre.
		const firstFrame = recorded.frames[0] ?? [];
		const jumps = recorded.start.flatMap(([id, x, y]) => {
			const same = firstFrame.find(([other]) => other === id);
			return same ? [Math.hypot(same[1] - x, same[2] - y)] : [];
		});
		return {
			recorded: !recorded.timedOut && solved.length >= 10 && recorded.landing.length >= 2,
			// Residuals of a few pixels at most mean the pins really sat on one orthographic globe.
			fitsPins: solved.every((frame) => frame.rms < 3) && landing.rms < 3,
			// The first frame is a few pixels from the view before the step changed, dragged or not.
			startsWhereItWas: jumps.length > 0 && Math.max(...jumps) < 10,
			landsZoomedIn: landingZoom > 1,
			// Below both ends of the flight: the camera pulled back on the way.
			dips: lowest < Math.min(recorded.startZoom, landingZoom) * 0.95,
			wholeGlobe: lowest < 1,
		};
	},
	{
		recorded: true,
		fitsPins: true,
		startsWhereItWas: true,
		landsZoomedIn: true,
		dips: false,
		wholeGlobe: false,
	},
);

// Old English to the Vikings: a near move that pans and zooms without pulling back.
const nearMove = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const card = document.querySelector('[data-step="vikings"] article');
		const box = card?.getBoundingClientRect();
		const previous = document.querySelector('[data-step="old-english"] article');
		const chips = (step: string) =>
			Array.from(document.querySelectorAll(`[data-step="${step}"] article button`));
		let dialElement = document.querySelector("[data-era]")?.parentElement;
		while (dialElement && !dialElement.querySelector('[role="status"]')) {
			dialElement = dialElement.parentElement;
		}
		const dial = dialElement?.getBoundingClientRect();
		const pin = document.querySelector('[data-stop="old-norse"]')?.getBoundingClientRect();
		const width = region?.getBoundingClientRect().right ?? 0;
		const height = region?.getBoundingClientRect().bottom ?? 0;
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			revealed: Array.from(document.querySelectorAll("[data-stop][data-revealed]")).map((item) =>
				item.getAttribute("data-stop"),
			),
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -14 && lon <= 16 && lat >= 48 && lat <= 63,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
			cardVisible: !!card && getComputedStyle(card).opacity === "1",
			cardBottomRight:
				!!box &&
				Math.abs(box.right - (width - 24)) <= 2 &&
				Math.abs(box.bottom - (height - 24)) <= 2,
			chipsReachable:
				chips("vikings").length > 0 && chips("vikings").every((chip) => !chip.closest("[inert]")),
			previousTransparent: !!previous && getComputedStyle(previous).opacity === "0",
			previousChipsInert:
				chips("old-english").length > 0 &&
				chips("old-english").every((chip) => !!chip.closest("[inert]")),
			pinInFreeArea:
				!!pin &&
				!!box &&
				!!dial &&
				pin.top > dial.bottom &&
				pin.left >= 0 &&
				pin.right <= width &&
				pin.bottom <= height &&
				(pin.right < box.left || pin.bottom < box.top),
		};
	},
	{
		era: "~800 CE",
		step: "vikings",
		revealed: ["indo-european", "germanic", "old-english", "old-norse"],
		routesDrawn: "5",
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
		cardVisible: true,
		cardBottomRight: true,
		chipsReachable: true,
		previousTransparent: true,
		previousChipsInert: true,
		pinInFreeArea: true,
	},
);

// Reads the details panel for whichever place is open, and the opener's state.
const detailsOpen = () => {
	const panel = document.querySelector("[data-stop-details]");
	const id = panel?.getAttribute("data-stop-details") ?? null;
	const paragraphs = Array.from(panel?.querySelectorAll("p") ?? []).map((p) =>
		p.textContent?.trim(),
	);
	return {
		panel: id,
		inLiveRegion: !!panel?.closest("[aria-live]"),
		name: panel?.querySelector("h3")?.textContent?.trim() ?? null,
		kindAndDate: paragraphs[0] ?? null,
		description: paragraphs[1] ?? null,
		area: paragraphs[2] ?? null,
		sources: panel?.querySelector("details > summary")?.textContent?.trim() ?? null,
		close: !!panel?.querySelector(
			`button[aria-label="Close ${panel.querySelector("h3")?.textContent?.trim()}"]`,
		),
		pinExpanded: id
			? document.querySelector(`[data-stop="${id}"]`)?.getAttribute("aria-expanded")
			: null,
		era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
	};
};

// Old Norse belongs to the vikings step. At "printing" the camera is close on England and its pin
// stands to the right of the top-left card, so a pointer can reach it.
const earlierPin = observation(detailsOpen, {
	panel: "old-norse",
	inLiveRegion: true,
	name: "Old Norse",
	kindAndDate: "Language, ~800 CE",
	description:
		"Scandinavians settled mostly in the east and north of England. Their Old Norse died out there, but English kept everyday words from it, such as sky, egg, skin, take and want. It even took the pronouns they, them and their, which languages very rarely borrow.",
	area: "Roughly in the east and north of England. The pin marks the general area, not an exact spot.",
	sources: "Sources (2)",
	close: true,
	pinExpanded: "true",
	era: "~1476 CE",
	step: "printing",
});

const detailsClosed = observation(
	() => ({
		panel: document.querySelector("[data-stop-details]") !== null,
		focus: document.activeElement?.getAttribute("data-stop") ?? null,
		pinExpanded: document.querySelector('[data-stop="old-norse"]')?.getAttribute("aria-expanded"),
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
	}),
	{ panel: false, focus: "old-norse", pinExpanded: "false", step: "printing" },
);

// At "printing" the camera is close on England and the steppe pin lies far off the map's right
// edge. Off-map pins are hidden and inert like far-side ones, so Tab from the header's last
// control skips them and lands on a pin whose head is wholly inside the map, and the clipped
// map never scrolls sideways to show a focused pin.
const offMapPins = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const anchor = document.querySelector('[data-stop="indo-european"]')?.closest("li")
			?.firstElementChild as HTMLElement | null | undefined;
		const focused = document.activeElement;
		const box = focused?.getBoundingClientRect();
		const map = region?.getBoundingClientRect();
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			steppeHidden: !!anchor && anchor.style.visibility === "hidden" && !!anchor.closest("[inert]"),
			focusOnPin: !!focused?.hasAttribute("data-stop"),
			focusNotSteppe: focused?.getAttribute("data-stop") !== "indo-european",
			focusInsideMap:
				!!box &&
				!!map &&
				box.left >= map.left &&
				box.right <= map.right &&
				box.top >= map.top &&
				box.bottom <= map.bottom,
			scrollLeft: region?.scrollLeft ?? null,
		};
	},
	{
		step: "printing",
		steppeHidden: true,
		focusOnPin: true,
		focusNotSteppe: true,
		focusInsideMap: true,
		scrollLeft: 0,
	},
);

// Printing to America: the camera pulls out from England to frame the North Atlantic. The step's
// bounds (-90, 25, 5, 58) take in both coasts, so this is a zoom-out, not a far move.
const atlantic = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const card = document.querySelector('[data-step="america"] article');
		const box = card?.getBoundingClientRect();
		const previous = document.querySelector('[data-step="printing"] article');
		const previousChips = Array.from(
			document.querySelectorAll('[data-step="printing"] article button'),
		);
		let dialElement = document.querySelector("[data-era]")?.parentElement;
		while (dialElement && !dialElement.querySelector('[role="status"]')) {
			dialElement = dialElement.parentElement;
		}
		const dial = dialElement?.getBoundingClientRect();
		const pin = document.querySelector('[data-stop="american-english"]')?.getBoundingClientRect();
		const width = region?.getBoundingClientRect().right ?? 0;
		const height = region?.getBoundingClientRect().bottom ?? 0;
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			jamestown: !!document.querySelector('[data-stop="american-english"][data-revealed]'),
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -90 && lon <= 5 && lat >= 25 && lat <= 58,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
			cardVisible: !!card && getComputedStyle(card).opacity === "1",
			cardBottomLeft:
				!!box && Math.abs(box.left - 24) <= 2 && Math.abs(box.bottom - (height - 24)) <= 2,
			previousTransparent: !!previous && getComputedStyle(previous).opacity === "0",
			previousChipsInert:
				previousChips.length > 0 && previousChips.every((chip) => !!chip.closest("[inert]")),
			pinKeepsFocus: document.activeElement?.getAttribute("data-stop") === "old-norse",
			pinInFreeArea:
				!!pin &&
				!!box &&
				!!dial &&
				pin.top > dial.bottom &&
				pin.right <= width &&
				pin.bottom <= height &&
				(pin.left > box.right || pin.bottom < box.top),
		};
	},
	{
		era: "~1607 CE",
		step: "america",
		revealed: 8,
		jamestown: true,
		routesDrawn: "7",
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
		cardVisible: true,
		cardBottomLeft: true,
		previousTransparent: true,
		previousChipsInert: true,
		pinKeepsFocus: true,
		pinInFreeArea: true,
	},
);

// America to Around the world: Virginia to the Indian Ocean and Sydney, a far move. England and
// Virginia end up on the far side of the globe, where their pins are hidden and unreachable.
const farMove = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const box = document
			.querySelector('[data-step="around-the-world"] article')
			?.getBoundingClientRect();
		let dialElement = document.querySelector("[data-era]")?.parentElement;
		while (dialElement && !dialElement.querySelector('[role="status"]')) {
			dialElement = dialElement.parentElement;
		}
		const dial = dialElement?.getBoundingClientRect();
		const pin = document.querySelector('[data-stop="australian-english"]')?.getBoundingClientRect();
		const width = region?.getBoundingClientRect().right ?? 0;
		const height = region?.getBoundingClientRect().bottom ?? 0;
		const farSide = (id: string) => {
			const anchor = document.querySelector<HTMLElement>(`[data-stop="${id}"]`)?.closest("li")
				?.firstElementChild as HTMLElement | null | undefined;
			return !!anchor && anchor.style.visibility === "hidden" && !!anchor.closest("[inert]");
		};
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= 10 && lon <= 160 && lat >= -45 && lat <= 20,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
			cardTopRight: !!box && Math.abs(box.right - (width - 24)) <= 2 && Math.abs(box.top - 72) <= 2,
			pinInFreeArea:
				!!pin &&
				!!box &&
				!!dial &&
				pin.top > dial.bottom &&
				pin.left >= 0 &&
				pin.bottom <= height &&
				(pin.right < box.left || pin.top > box.bottom),
			// Old Norse kept focus since details-closed; now behind the globe, it hands focus to the card.
			focusOnCard:
				document.activeElement === document.querySelector('[data-step="around-the-world"] article'),
			hiddenBehindGlobe: {
				"london-english": farSide("london-english"),
				"american-english": farSide("american-english"),
				"australian-english": farSide("australian-english"),
			},
		};
	},
	{
		era: "~1788 CE",
		step: "around-the-world",
		revealed: 9,
		routesDrawn: "8",
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
		cardTopRight: true,
		pinInFreeArea: true,
		focusOnCard: true,
		hiddenBehindGlobe: {
			"london-english": true,
			"american-english": true,
			"australian-english": false,
		},
	},
);

const scrollBack = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const later = (id: string) => {
			const pin = document.querySelector(`[data-stop="${id}"]`);
			return {
				inert: pin?.closest("li")?.hasAttribute("inert") ?? null,
				revealed: pin?.hasAttribute("data-revealed") ?? null,
			};
		};
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			revealed: Array.from(document.querySelectorAll("[data-stop][data-revealed]")).map((pin) =>
				pin.getAttribute("data-stop"),
			),
			oldEnglish: later("old-english"),
			americanEnglish: later("american-english"),
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -12 && lon <= 30 && lat >= 44 && lat <= 64,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
		};
	},
	{
		era: "~500 BCE",
		step: "germanic",
		revealed: ["indo-european", "germanic"],
		oldEnglish: { inert: true, revealed: false },
		americanEnglish: { inert: true, revealed: false },
		routesDrawn: "1",
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
	},
);

// 10 earlier ticks are past-coloured and the last is current, so none keeps the unfilled border colour.
const today = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const ticks = Array.from(document.querySelectorAll("ol[aria-hidden] > li"));
		const next = document.querySelector<HTMLButtonElement>('button[aria-label="Next step"]');
		return {
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			stepLabel:
				Array.from(document.querySelectorAll(".sr-only"))
					.map((element) => /Step \d+ of \d+/.exec(element.textContent ?? "")?.[0])
					.find(Boolean) ?? null,
			revealed: document.querySelectorAll("[data-stop][data-revealed]").length,
			routesDrawn: region?.dataset.routesDrawn ?? null,
			camera: region?.dataset.camera ?? null,
			wholeGlobe: Number(region?.dataset.cameraZoom) < 1,
			filledTicks: ticks.filter((tick) => !tick.classList.contains("bg-border")).length,
			ticks: ticks.length,
			nextDisabled: !!next && (next.disabled || next.getAttribute("aria-disabled") === "true"),
		};
	},
	{
		era: "Today",
		step: "today",
		stepLabel: "Step 11 of 11",
		revealed: 9,
		routesDrawn: "8",
		camera: "settled",
		wholeGlobe: true,
		filledTicks: 11,
		ticks: 11,
		nextDisabled: true,
	},
);

// Phone, 390 x 844: the card sits at the bottom across the width, the era dial across the top,
// and the camera frames the step's pin in the space between them.
const mobile = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const card = document.querySelector('[data-step="vikings"] article')?.getBoundingClientRect();
		let dialElement = document.querySelector("[data-era]")?.parentElement;
		while (dialElement && !dialElement.querySelector('[role="status"]')) {
			dialElement = dialElement.parentElement;
		}
		const dial = dialElement?.getBoundingClientRect();
		const pin = document.querySelector('[data-stop="old-norse"]')?.getBoundingClientRect();
		const width = region?.getBoundingClientRect().right ?? 0;
		return {
			width: innerWidth,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -14 && lon <= 16 && lat >= 48 && lat <= 63,
			zoomedIn: Number(region?.dataset.cameraZoom) > 1,
			pinnedTop: !!box && Math.abs(box.top - 48) <= 2,
			pinnedHeight: !!box && Math.abs(box.height - (innerHeight - 48)) <= 2,
			cardAtBottom: !!card && card.bottom <= innerHeight && card.bottom >= innerHeight - 40,
			cardFullWidth: !!card && card.left <= 16 && card.right >= width - 16,
			dialInTop: !!dial && dial.top >= 48 && dial.bottom <= 160,
			pinBetween: !!pin && !!card && !!dial && pin.top > dial.bottom && pin.bottom < card.top,
			pinOnScreen: !!pin && pin.left >= 0 && pin.right <= width,
		};
	},
	{
		width: 390,
		step: "vikings",
		camera: "settled",
		centerInBounds: true,
		zoomedIn: true,
		pinnedTop: true,
		pinnedHeight: true,
		cardAtBottom: true,
		cardFullWidth: true,
		dialInTop: true,
		pinBetween: true,
		pinOnScreen: true,
	},
);

// With reduced motion the camera jumps and arrows appear drawn at once, the card shows without
// an entrance animation, and Tailwind's motion-reduce:transition-none computes the pins'
// transition-property to "none".
const reducedMotion = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const card = document.querySelector('[data-step="vikings"] article');
		const pin = document.querySelector('[data-stop="old-norse"]');
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		return {
			reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -14 && lon <= 16 && lat >= 48 && lat <= 63,
			routesDrawn: region?.dataset.routesDrawn ?? null,
			cardVisible: !!card && getComputedStyle(card).opacity === "1",
			cardAnimations: card ? card.getAnimations({ subtree: true }).length : null,
			pinTransition: pin ? getComputedStyle(pin).transitionProperty : null,
		};
	},
	{
		reduced: true,
		era: "~800 CE",
		step: "vikings",
		camera: "settled",
		centerInBounds: true,
		routesDrawn: "5",
		cardVisible: true,
		cardAnimations: 0,
		pinTransition: "none",
	},
);

// The recipe saves `window.__dragFrom`, the landed centre, before each mouse drag.
const dragState = () => {
	const region = document.querySelector<HTMLElement>(
		'[role="region"][aria-label^="Map of where languages spread"]',
	);
	const recenter = region?.querySelector<HTMLElement>("[data-recenter]");
	return {
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
		camera: region?.dataset.camera ?? null,
		moved:
			region?.dataset.cameraCenter !== (window as unknown as { __dragFrom?: string }).__dragFrom,
		recenter: recenter
			? {
					name: recenter.getAttribute("aria-label"),
					visible: recenter.getClientRects().length > 0,
				}
			: null,
	};
};

const recenterShown = { name: "Recenter on this step", visible: true };

// Vikings, after a mouse drag and release: the camera glided and settled on a new centre, and
// the Recenter button appeared.
const dragMidStory = observation(dragState, {
	step: "vikings",
	camera: "settled",
	moved: true,
	recenter: recenterShown,
});

// Next after the drag: the flight to the Norman Conquest started from the dragged view
// (`drag-flight`, the generic flight read) and landed on the step, with the button gone.
const afterDragNext = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const card = document.querySelector('[data-step="norman-conquest"] article');
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			era: document.querySelector("[data-era]")?.textContent?.trim() ?? null,
			camera: region?.dataset.camera ?? null,
			centerInBounds: lon >= -8 && lon <= 8 && lat >= 46 && lat <= 56,
			cardVisible: !!card && getComputedStyle(card).opacity === "1",
			recenter: !!region?.querySelector("[data-recenter]"),
		};
	},
	{
		step: "norman-conquest",
		era: "~1066 CE",
		camera: "settled",
		centerInBounds: true,
		cardVisible: true,
		recenter: false,
	},
);

// At printing with Old Norse open again: a plain click on empty globe closes the details, and a
// click is not a drag, so the camera stays where it was.
const globeClick = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		return {
			panel: document.querySelector("[data-stop-details]") !== null,
			pinExpanded: document.querySelector('[data-stop="old-norse"]')?.getAttribute("aria-expanded"),
			camera: region?.dataset.camera ?? null,
			moved:
				region?.dataset.cameraCenter !== (window as unknown as { __dragFrom?: string }).__dragFrom,
			recenter: !!region?.querySelector("[data-recenter]"),
		};
	},
	{ panel: false, pinExpanded: "false", camera: "settled", moved: false, recenter: false },
);

// Reads what `fastScroll` saw: every card that became visible while the page scrolled from
// germanic to today over 24 frames and for 2.5 s after.
const fastScrollRead = observation(
	() => {
		const seen = (
			window as unknown as { __spreadFastScroll?: { active: string[]; cards: string[] } }
		).__spreadFastScroll;
		return {
			passedSteps: (seen?.active.length ?? 0) >= 4,
			cardsSeen: seen?.cards ?? null,
		};
	},
	{ passedSteps: true, cardsSeen: ["germanic", "today"] },
);

// Today, mouse button held after moving 140 px: the container reads "dragging".
const dragHeld = observation(
	() => ({
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
		camera:
			document.querySelector<HTMLElement>(
				'[role="region"][aria-label^="Map of where languages spread"]',
			)?.dataset.camera ?? null,
	}),
	{ step: "today", camera: "dragging" },
);

const dragReleased = observation(dragState, {
	step: "today",
	camera: "settled",
	moved: true,
	recenter: recenterShown,
});

// After clicking Recenter: back on today's own view, which the spin has turned since, button gone.
const recentered = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			// The drag also moved the view 60 px south, and the spin only turns longitude, so the
			// landing latitude shows the return; the longitude is today's 10.0 less the spin since.
			latitude: region?.dataset.cameraCenter?.split(",")[1] ?? null,
			westOfStep: (() => {
				const lon = Number(region?.dataset.cameraCenter?.split(",")[0]);
				return lon <= 10 && lon >= -60;
			})(),
			recenter: !!region?.querySelector("[data-recenter]"),
		};
	},
	{ step: "today", camera: "settled", latitude: "11.0", westOfStep: true, recenter: false },
);

// Phone, after `touchSpin` swiped 120 px left and 60 px up with touch pointer events: only the
// longitude changed, and the canvas leaves vertical panning to the page.
const phoneSpin = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const spin = (window as unknown as { __spreadSpin?: { from: string } }).__spreadSpin;
		const [fromLon, fromLat] = (spin?.from ?? "").split(",").map(Number);
		const [lon, lat] = (region?.dataset.cameraCenter ?? "").split(",").map(Number);
		const canvas = region?.querySelector("canvas");
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			camera: region?.dataset.camera ?? null,
			// Swiping left turns the globe east.
			turnedEast: lon > fromLon + 1,
			latitudeKept: lat === fromLat,
			touchAction: canvas ? getComputedStyle(canvas).touchAction : null,
		};
	},
	{
		step: "vikings",
		camera: "settled",
		turnedEast: true,
		latitudeKept: true,
		touchAction: "pan-y pinch-zoom",
	},
);

// The sitemap, fetched into `window.__sitemap` by the recipe rather than opened, since opening
// the XML makes the browser ask for a favicon the app doesn't serve.
const sitemapRead = () => ({
	paths: (window as unknown as { __sitemap?: string[] }).__sitemap ?? null,
});

const sitemap = observation(sitemapRead, {
	paths: [
		"/",
		"/ipa-chart/consonants",
		"/ipa-chart/vowels",
		"/ipa-chart/frequency",
		"/credits",
		"/language-spread",
	],
});

const spinState = () => {
	const region = document.querySelector<HTMLElement>(
		'[role="region"][aria-label^="Map of where languages spread"]',
	);
	const box = region?.getBoundingClientRect();
	const shown = box ? Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0)) : 0;
	const anchor = document.querySelector('[data-stop="indo-european"]')?.closest("li")
		?.firstElementChild as HTMLElement | null | undefined;
	return {
		step:
			document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? null,
		spinning: !!region?.hasAttribute("data-spinning"),
		camera: region?.dataset.camera ?? null,
		center: region?.dataset.cameraCenter ?? null,
		// The recipe saves the steppe pin's transform in `window.__pinAt` once the spin starts.
		pinMoved:
			!!anchor && anchor.style.transform !== (window as unknown as { __pinAt?: string }).__pinAt,
		mapMostlyShown: !!box && box.height > 0 && shown / box.height >= 0.5,
	};
};

// Today, mouse off the globe: the globe turns while the camera attributes keep the landing.
const spinToday = observation(spinState, {
	step: "today",
	spinning: true,
	camera: "settled",
	center: "10.0,11.0",
	pinMoved: true,
	mapMostlyShown: true,
});

// Hovering the globe holds it still.
const spinHover = observation(
	() => {
		const region = document.querySelector(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			spinning: !!region?.hasAttribute("data-spinning"),
			hovered: !!region?.matches(":hover"),
		};
	},
	{ step: "today", spinning: false, hovered: true },
);

// Scrolled down to the sources: still the today step, but less than half the map shows.
const spinSources = observation(
	() => {
		const region = document.querySelector(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		const box = region?.getBoundingClientRect();
		const shown = box ? Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, 0)) : 0;
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			spinning: !!region?.hasAttribute("data-spinning"),
			mapMostlyShown: !!box && box.height > 0 && shown / box.height >= 0.5,
		};
	},
	{ step: "today", spinning: false, mapMostlyShown: false },
);

// Left today for around-the-world, a step without a spin.
const leftToday = observation(
	() => {
		const region = document.querySelector<HTMLElement>(
			'[role="region"][aria-label^="Map of where languages spread"]',
		);
		return {
			step:
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ??
				null,
			spinning: !!region?.hasAttribute("data-spinning"),
			camera: region?.dataset.camera ?? null,
		};
	},
	{ step: "around-the-world", spinning: false, camera: "settled" },
);

// With reduced motion, `watchSpin` scrolled to today and watched for 3.5 s.
const reducedNoSpin = observation(
	() => {
		const watched = (
			window as unknown as { __spreadSpinWatch?: { step: string; everSpun: boolean } }
		).__spreadSpinWatch;
		return { step: watched?.step ?? null, everSpun: watched?.everSpun ?? null };
	},
	{ step: "today", everSpun: false },
);

/** Fetches /sitemap.xml and saves its paths in `window.__sitemap` for the `sitemap` checkpoints. */
export function readSitemap() {
	return fetch("/sitemap.xml")
		.then((response) => response.text())
		.then((text) => {
			const xml = new DOMParser().parseFromString(text, "application/xml");
			const paths = Array.from(xml.querySelectorAll("loc")).map(
				(loc) => new URL(loc.textContent ?? "").pathname,
			);
			(window as unknown as { __sitemap: string[] }).__sitemap = paths;
			return JSON.stringify(paths);
		});
}

/**
 * Scrolls to step `to` and watches `data-spinning` on every frame for 3.5 s, saving whether it
 * ever appeared in `window.__spreadSpinWatch`.
 */
export function watchSpin(to: string) {
	const region = document.querySelector(
		'[role="region"][aria-label^="Map of where languages spread"]',
	);
	document.querySelector(`[data-step="${to}"]`)?.scrollIntoView();
	const watched = { step: "", everSpun: false };
	(window as unknown as { __spreadSpinWatch: typeof watched }).__spreadSpinWatch = watched;
	const start = performance.now();
	return new Promise<string>((done) => {
		const frame = (now: number) => {
			watched.everSpun ||= !!region?.hasAttribute("data-spinning");
			watched.step =
				document.querySelector('[data-step][aria-current="step"]')?.getAttribute("data-step") ?? "";
			if (now - start < 3500) requestAnimationFrame(frame);
			else done(JSON.stringify(watched));
		};
		requestAnimationFrame(frame);
	});
}

/**
 * Scrolls the page to step `to` over 24 frames (about 400 ms), then watches 2.5 s more. Every
 * frame notes the active step and every card with computed opacity above 0.05, in order of first
 * sight, for the `fast-scroll` checkpoint.
 */
export function fastScroll(to: string) {
	const section = document.querySelector<HTMLElement>(`[data-step="${to}"]`);
	const from = scrollY;
	// Scroll until the section's top sits mid-screen, as the step buttons do.
	const target = (section?.getBoundingClientRect().top ?? 0) + scrollY - innerHeight / 2;
	const seen = {
		active: [] as string[],
		cards: [] as string[],
		// Time, scroll position and active step per frame, for investigating a failure.
		frames: [] as [number, number, string | undefined][],
	};
	(window as unknown as { __spreadFastScroll: typeof seen }).__spreadFastScroll = seen;
	const note = (list: string[], id: string | null | undefined) => {
		if (id && !list.includes(id)) list.push(id);
	};
	// Counted in frames rather than time, so a slow frame can't turn the scroll into one jump.
	const scrollFrames = 24;
	let frames = 0;
	let end = 0;
	return new Promise<string>((done) => {
		const frame = (now: number) => {
			frames += 1;
			scrollTo(0, from + ((target - from) * Math.min(frames, scrollFrames)) / scrollFrames);
			if (frames === scrollFrames) end = now;
			seen.frames.push([
				Math.round(now),
				Math.round(scrollY),
				document.querySelector<HTMLElement>('[data-step][aria-current="step"]')?.dataset.step,
			]);
			note(
				seen.active,
				document.querySelector<HTMLElement>('[data-step][aria-current="step"]')?.dataset.step,
			);
			for (const card of Array.from(document.querySelectorAll("li[data-step] article"))) {
				if (Number(getComputedStyle(card).opacity) > 0.05) {
					note(seen.cards, card.closest("li[data-step]")?.getAttribute("data-step"));
				}
			}
			if (!end || now - end < 2500) requestAnimationFrame(frame);
			else done(JSON.stringify(seen));
		};
		requestAnimationFrame(frame);
	});
}

/**
 * Swipes the globe by (dx, dy) px with synthetic touch pointer events, one move per frame, then
 * waits for the camera to settle. agent-browser can't send native touches to desktop Chromium.
 * The pointer id is 1, the always-present mouse pointer, so the page's pointer capture call
 * accepts it. Saves the centre before the swipe for `phone-spin`.
 */
export function touchSpin(dx: number, dy: number) {
	const region = document.querySelector<HTMLElement>(
		'[role="region"][aria-label^="Map of where languages spread"]',
	);
	const canvas = region?.querySelector("canvas");
	if (!region || !canvas) return Promise.reject(new Error("No globe"));
	(window as unknown as { __spreadSpin: { from: string } }).__spreadSpin = {
		from: region.dataset.cameraCenter ?? "",
	};
	const box = region.getBoundingClientRect();
	const x = box.left + box.width / 2;
	const y = box.top + 220;
	const send = (type: string, step: number, buttons: number) =>
		canvas.dispatchEvent(
			new PointerEvent(type, {
				pointerId: 1,
				pointerType: "touch",
				isPrimary: true,
				button: type === "pointermove" ? -1 : 0,
				buttons,
				clientX: x + (dx * step) / 12,
				clientY: y + (dy * step) / 12,
				bubbles: true,
				cancelable: true,
			}),
		);
	const nextFrame = () => new Promise((ok) => requestAnimationFrame(ok));
	return (async () => {
		send("pointerdown", 0, 1);
		for (let step = 1; step <= 12; step += 1) {
			await nextFrame();
			send("pointermove", step, 1);
		}
		send("pointerup", 12, 0);
		const until = performance.now() + 3000;
		while (region.dataset.camera !== "settled" && performance.now() < until) await nextFrame();
		return `${region.dataset.camera} at ${region.dataset.cameraCenter}`;
	})();
}

/**
 * Records a camera flight for the `*-flight` checkpoints: the screen position of every pin on the
 * near side of the globe on each frame while the map reads `data-camera="moving"`, then once more
 * after it lands. Install it with `eval -b` (see the feature map) just before changing the step.
 */
export function recordFlight() {
	const region = document.querySelector<HTMLElement>(
		'[role="region"][aria-label^="Map of where languages spread"]',
	);
	type Pin = [id: string, x: number, y: number];
	const pins = () =>
		Array.from(document.querySelectorAll<HTMLElement>("[data-stop]")).flatMap((pin): Pin[] => {
			const anchor = pin.closest("li")?.firstElementChild as HTMLElement | null;
			const at = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(anchor?.style.transform ?? "");
			return anchor && at && anchor.style.visibility !== "hidden"
				? [[pin.dataset.stop ?? "", Number(at[1]), Number(at[2])]]
				: [];
		});
	const flight = {
		startZoom: Number(region?.dataset.cameraZoom),
		start: pins(),
		frames: [] as Pin[][],
		landing: [] as Pin[],
		moving: false,
		done: false,
		timedOut: false,
	};
	(window as unknown as { __spreadFlight: typeof flight }).__spreadFlight = flight;
	let ticks = 0;
	const record = () => {
		ticks += 1;
		const moving = region?.dataset.camera === "moving";
		if (moving) flight.frames.push(pins());
		if (flight.moving && !moving) {
			flight.landing = pins();
			flight.done = true;
			return;
		}
		flight.moving ||= moving;
		// About 15 s at 60 fps: a flight lasts at most 2.2 s.
		if (ticks > 900) {
			flight.timedOut = true;
			flight.done = true;
			return;
		}
		requestAnimationFrame(record);
	};
	requestAnimationFrame(record);
	return "recording";
}

export const languageSpread = {
	title: "Language Spread story page",
	checkpoints: {
		intro,
		"next-step": nextStep,
		"previous-step": previousStep,
		"near-flight": flight,
		"near-move": nearMove,
		"drag-mid-story": dragMidStory,
		"drag-flight": flight,
		"after-drag-next": afterDragNext,
		"earlier-pin-mid-story": earlierPin,
		"details-closed": detailsClosed,
		"globe-click-closes-details": globeClick,
		"off-map-pins": offMapPins,
		"atlantic-flight": flight,
		atlantic,
		"far-flight": observation(flight.read, {
			recorded: true,
			fitsPins: true,
			startsWhereItWas: true,
			landsZoomedIn: true,
			dips: true,
			wholeGlobe: true,
		}),
		"far-move": farMove,
		"scroll-back": scrollBack,
		"fast-scroll": fastScrollRead,
		today,
		"spin-today": spinToday,
		"spin-hover": spinHover,
		"drag-held": dragHeld,
		"drag-released": dragReleased,
		recentered,
		"spin-sources": spinSources,
		"left-today": leftToday,
		sitemap,
		mobile,
		"phone-spin": phoneSpin,
		"reduced-motion": reducedMotion,
		"reduced-no-spin": reducedNoSpin,
	},
	coverageLimits: [
		"Chromium only, with the page flag on; flag-off behaviour is the separate language-spread-off journey",
		"the landed camera is checked as a centre inside the step's bounds and a zoom above or below 1; land, areas, arrows and visual quality are drawn on a canvas and reviewed in screenshots only",
		"mid-flight zoom is worked out from where pins were drawn on each frame, not read from the page or from canvas pixels; frames with too few separate pins on the near side are skipped",
		"no frame rate or flight smoothness is measured; a settled attribute proves the flight ended, not that it looked right",
		"only some steps are exercised (intro, indo-european, germanic, old-english, vikings, norman-conquest, printing, america, around-the-world, today); the rest are covered by the story data tests",
		"route drawing is read from data-routes-drawn, a count the page keeps; arrowheads and the drawing animation are not observed",
		"phone coverage is one step at 390 x 844 and skips the menu and landscape; the desktop nav is not asserted there",
		"reduced motion is checked through the card's running animations, the pins' computed transition and a 300 ms settle, not by comparing frames",
		"drags use the mouse; touch is synthetic pointer events with pointerType touch, so native touch panning is not exercised and vertical scrolling during a swipe is inferred from computed touch-action only; pen, pinch and the latitude cap are not checked",
		"fast-scroll runs on a fresh page: after a synthetic key press, headless Chrome starves page tasks while a script runs every frame",
		"the today spin is checked by data-spinning and one pin's movement; its speed, the pauses for pin hover, focus and open details, the 2 s resume and a hidden tab are not",
		"robots is expected as noindex, follow from the local SITE_INDEXING_ENABLED=0; the sitemap is fetched, not opened",
		"the step announcement is read from the status region's text, not from a screen reader",
		"place descriptions and sources are read from the page, not checked against the cited studies",
		"evidence screenshots show the viewport: a full-page capture stretches the pinned map to the whole document height",
		"no DevTools trace: tracing stalled headless Chrome's renderer on the earlier version of this page, so the recipe skips `trace start`",
	],
	screenshot: "viewport",
	trace: "skip",
} satisfies Feature;

export const languageSpreadOff = {
	title: "Language Spread flag off",
	checkpoints: {
		"not-found": observation(
			() => ({
				path: location.pathname,
				status: (
					performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
				)?.responseStatus,
				heading: document.querySelector("h1")?.textContent?.trim() ?? null,
				map: !!document.querySelector(
					'[role="region"][aria-label^="Map of where languages spread"]',
				),
				stops: document.querySelectorAll("[data-stop]").length,
				navLinks: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).map((link) =>
					link.textContent?.trim(),
				),
			}),
			{
				path: "/language-spread",
				status: 404,
				heading: "This page doesn't exist",
				map: false,
				stops: 0,
				navLinks: ["Transcription", "IPA Chart", "Practice"],
			},
		),
		"sitemap-hidden": observation(sitemapRead, {
			paths: [
				"/",
				"/ipa-chart/consonants",
				"/ipa-chart/vowels",
				"/ipa-chart/frequency",
				"/credits",
			],
		}),
		"nav-hidden": observation(
			() => ({
				path: location.pathname,
				navLinks: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).map((link) =>
					link.textContent?.trim(),
				),
				visible: Array.from(document.querySelectorAll('nav[aria-label="Main"] a')).every(
					(link) => link.getClientRects().length > 0,
				),
				spreadLinks: document.querySelectorAll('a[href="/language-spread"]').length,
			}),
			{
				path: "/",
				navLinks: ["Transcription", "IPA Chart", "Practice"],
				visible: true,
				spreadLinks: 0,
			},
		),
	},
	coverageLimits: [
		"Chromium desktop only; the phone menu is not opened, but any link to the page anywhere in the DOM is counted",
		"the status comes from the navigation timing entry of the first page load, so open the page directly before observing",
		"Practice is on locally unless FLAG_PRACTICE=0, so the expected labels include it",
		"the server must be started with FLAG_LANGUAGE_SPREAD=0; the journey cannot tell whether it was",
	],
	expectedResponses: [{ path: "/language-spread", status: 404 }],
} satisfies Feature;
