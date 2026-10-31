import type { EnglishPhonemeSymbolId } from "@phonaria/phonetics-data";
import { ABOUT_PAGE_DESCRIPTION, ABOUT_PAGE_TITLE, ABOUT_PATH } from "@/lib/about-metadata";
import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";
import {
	CONSONANTS_PAGE_DESCRIPTION,
	CONSONANTS_PAGE_TITLE,
	FREQUENCY_PAGE_DESCRIPTION,
	FREQUENCY_PAGE_TITLE,
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_FREQUENCY_PATH,
	IPA_CHART_VOWELS_PATH,
	VOWELS_PAGE_DESCRIPTION,
	VOWELS_PAGE_TITLE,
} from "@/lib/ipa-chart-metadata";
import {
	LANGUAGE_HISTORY_IMAGE,
	LANGUAGE_HISTORY_PAGE_DESCRIPTION,
	LANGUAGE_HISTORY_PAGE_TITLE,
	LANGUAGE_HISTORY_PATH,
} from "@/lib/language-history/metadata";
import {
	buildLanguageHistoryStructuredData,
	serializeJsonLd,
} from "@/lib/language-history/structured-data";
import { type ContrastPage, contrastPagePath } from "@/lib/minimal-pairs";
import { PracticeActivity } from "@/lib/practice/activity";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import {
	type DocumentMetadata,
	getDocumentMetadata,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "@/lib/site";
import {
	SOUNDS_PAGE_DESCRIPTION,
	SOUNDS_PAGE_TITLE,
	SOUNDS_PATH,
	soundPageDescription,
	soundPagePath,
	soundPageTitle,
} from "@/lib/sound-pages";

type TitleTag = { title: string };
type NamedMetaTag = { name: string; content: string };
type PropertyMetaTag = { property: string; content: string };
type CharsetMetaTag = { charSet: string };
type ViewportMetaTag = { name: "viewport"; content: string };

type StartMetaTag = TitleTag | NamedMetaTag | PropertyMetaTag | CharsetMetaTag | ViewportMetaTag;

export type StartHead = {
	meta: StartMetaTag[];
	links?: Array<{ rel: string; href: string; type?: string; sizes?: string }>;
	scripts?: Array<{ type: string; children: string }>;
};

type OpenGraphType = "website" | "article";

type SocialImage = {
	path: string;
	width: number;
	height: number;
	alt?: string;
};

type MatchWithMeta = {
	meta?: Array<{ title?: unknown } | undefined>;
};

/** Page titles never depend on SITE_URL, so client hydration can still emit them. */
export function formatDocumentTitle(pageTitle?: string): string {
	return pageTitle ? `${pageTitle} - ${SITE_NAME}` : SITE_NAME;
}

export function creditsDocumentTitle(): string {
	return formatDocumentTitle(CREDITS_PAGE_TITLE);
}

export function consonantsDocumentTitle(): string {
	return formatDocumentTitle(CONSONANTS_PAGE_TITLE);
}

export function vowelsDocumentTitle(): string {
	return formatDocumentTitle(VOWELS_PAGE_TITLE);
}

export function frequencyDocumentTitle(): string {
	return formatDocumentTitle(FREQUENCY_PAGE_TITLE);
}

export function practiceDocumentTitle(pageTitle: string = PracticeActivity.name): string {
	return formatDocumentTitle(pageTitle);
}

type PracticeTopicHeadSource = {
	id: string;
	display: { name: string; blurb: string };
};

function isClient(): boolean {
	return typeof window !== "undefined";
}

function isMissingSiteUrlError(error: unknown): boolean {
	return error instanceof Error && error.message.startsWith("SITE_URL is not set");
}

/**
 * Worker bindings are not available in the Start client bundle. Production
 * `head()` still needs a title when SITE_URL is unset there. Any other
 * `getDocumentMetadata()` failure — including a malformed SITE_URL on the
 * server — is rethrown.
 */
export function tryGetDocumentMetadata(): DocumentMetadata | undefined {
	try {
		return getDocumentMetadata();
	} catch (error) {
		if (isClient() && isMissingSiteUrlError(error)) {
			return undefined;
		}
		throw error;
	}
}

export function extractDocumentTitle(matches: readonly MatchWithMeta[]): string {
	for (let index = matches.length - 1; index >= 0; index -= 1) {
		const metas = matches[index]?.meta;
		if (!metas) continue;
		for (let metaIndex = metas.length - 1; metaIndex >= 0; metaIndex -= 1) {
			const tag = metas[metaIndex];
			if (tag && typeof tag.title === "string" && tag.title.trim().length > 0) {
				return tag.title;
			}
		}
	}
	return SITE_NAME;
}

export function buildRootHead(): StartHead {
	const metadata = tryGetDocumentMetadata();
	return {
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: SITE_NAME },
			{ name: "description", content: metadata?.description ?? SITE_DESCRIPTION },
			...seoMetaTags(metadata, metadata?.siteUrl, {
				title: SITE_NAME,
				description: metadata?.description ?? SITE_DESCRIPTION,
			}),
		],
		links: [
			{ rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
			{ rel: "icon", href: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
			{ rel: "apple-touch-icon", href: APPLE_TOUCH_ICON_PATH },
		],
	};
}

type PageHeadInput = {
	path: string;
	title: string;
	description: string;
	robots?: string;
	/** Defaults to `website`. */
	ogType?: OpenGraphType;
	/** Defaults to the site-wide card. */
	image?: SocialImage;
};

function buildPageHead({
	path,
	title,
	description,
	robots,
	ogType,
	image,
}: PageHeadInput): StartHead {
	const metadata = tryGetDocumentMetadata();
	const canonical = metadata
		? path === "/"
			? metadata.siteUrl
			: `${metadata.siteUrl}${path}`
		: undefined;
	return {
		meta: [
			{ title: formatDocumentTitle(title) },
			{ name: "description", content: description },
			...seoMetaTags(metadata, canonical, { title, description, robots, ogType, image }),
		],
		links: canonical ? [{ rel: "canonical", href: canonical }] : undefined,
	};
}

export function buildHomeHead(): StartHead {
	const metadata = tryGetDocumentMetadata();
	const canonical = metadata?.siteUrl;
	return {
		meta: [
			{ title: SITE_NAME },
			{ name: "description", content: SITE_DESCRIPTION },
			...seoMetaTags(metadata, canonical, { title: SITE_NAME, description: SITE_DESCRIPTION }),
		],
		links: canonical ? [{ rel: "canonical", href: canonical }] : undefined,
	};
}

export function buildCreditsHead(): StartHead {
	return buildPageHead({
		path: "/credits",
		title: CREDITS_PAGE_TITLE,
		description: CREDITS_PAGE_DESCRIPTION,
	});
}

export function buildAboutHead(): StartHead {
	return buildPageHead({
		path: ABOUT_PATH,
		title: ABOUT_PAGE_TITLE,
		description: ABOUT_PAGE_DESCRIPTION,
	});
}

export function buildConsonantsHead(): StartHead {
	return buildPageHead({
		path: IPA_CHART_CONSONANTS_PATH,
		title: CONSONANTS_PAGE_TITLE,
		description: CONSONANTS_PAGE_DESCRIPTION,
	});
}

export function buildVowelsHead(): StartHead {
	return buildPageHead({
		path: IPA_CHART_VOWELS_PATH,
		title: VOWELS_PAGE_TITLE,
		description: VOWELS_PAGE_DESCRIPTION,
	});
}

export function buildFrequencyHead(): StartHead {
	return buildPageHead({
		path: IPA_CHART_FREQUENCY_PATH,
		title: FREQUENCY_PAGE_TITLE,
		description: FREQUENCY_PAGE_DESCRIPTION,
	});
}

export function buildSoundHead(phonemeId: EnglishPhonemeSymbolId): StartHead {
	return buildPageHead({
		path: soundPagePath(phonemeId),
		title: soundPageTitle(phonemeId),
		description: soundPageDescription(phonemeId),
	});
}

export function buildSoundsIndexHead(): StartHead {
	return buildPageHead({
		path: SOUNDS_PATH,
		title: SOUNDS_PAGE_TITLE,
		description: SOUNDS_PAGE_DESCRIPTION,
	});
}

/** Practice stays out of search indexes even when the feature flag is on. */
const PRACTICE_ROBOTS = "noindex, follow";

export function buildPracticeIndexHead(): StartHead {
	return buildPageHead({
		path: "/practice",
		title: PracticeActivity.name,
		description: PracticeActivity.description,
		robots: PRACTICE_ROBOTS,
	});
}

export function buildPracticeTopicHead(topic: PracticeTopicHeadSource | undefined): StartHead {
	if (!topic) {
		return buildPracticeIndexHead();
	}
	return buildPageHead({
		path: `/practice/${topic.id}`,
		title: `${topic.display.name} — Practice`,
		description: topic.display.blurb,
		robots: PRACTICE_ROBOTS,
	});
}

/** Indexable, unlike Practice: the pairs and recordings show without speaking practice. */
export function buildMinimalPairsHead(): StartHead {
	return buildPageHead({
		path: MinimalPairActivity.path,
		title: MinimalPairActivity.name,
		description: MinimalPairActivity.listDescription,
	});
}

export function buildMinimalPairContrastHead(contrast: ContrastPage | undefined): StartHead {
	if (!contrast) return buildMinimalPairsHead();
	const [a, b] = contrast.sounds;
	const [first, second] = contrast.pairs[0] ?? [];
	return buildPageHead({
		path: contrastPagePath(contrast.id),
		title: `/${a.ipa}/ vs /${b.ipa}/: minimal pairs like ${first} and ${second}`,
		description: `${contrast.pairs.length} American English word pairs that differ only by /${a.ipa}/ and /${b.ipa}/, like ${first} and ${second}, with recordings and how each sound is made.`,
	});
}

/** Includes JSON-LD only when SITE_URL is set. */
export function buildLanguageHistoryHead(): StartHead {
	const head = buildPageHead({
		path: LANGUAGE_HISTORY_PATH,
		title: LANGUAGE_HISTORY_PAGE_TITLE,
		description: LANGUAGE_HISTORY_PAGE_DESCRIPTION,
		ogType: "article",
		image: LANGUAGE_HISTORY_IMAGE,
	});
	const metadata = tryGetDocumentMetadata();
	if (!metadata) return head;
	return {
		...head,
		scripts: [
			{
				type: "application/ld+json",
				children: serializeJsonLd(buildLanguageHistoryStructuredData(metadata.siteUrl)),
			},
		],
	};
}

/** Served from `public/`. Social cards need an absolute URL, built from SITE_URL. */
const SITE_IMAGE: SocialImage = { path: "/opengraph-image.jpg", width: 1200, height: 630 };
const APPLE_TOUCH_ICON_PATH = "/apple-touch-icon.png";

type SocialTagsInput = {
	title: string;
	description: string;
	robots?: string;
	ogType?: OpenGraphType;
	image?: SocialImage;
};

function seoMetaTags(
	metadata: DocumentMetadata | undefined,
	canonical: string | undefined,
	{ title, description, robots, ogType = "website", image = SITE_IMAGE }: SocialTagsInput,
): StartMetaTag[] {
	if (!metadata || !canonical) return [];
	const imageUrl = `${metadata.siteUrl}${image.path}`;
	return [
		{
			name: "robots",
			content: robots ?? (metadata.indexingEnabled ? "index, follow" : "noindex, follow"),
		},
		{ property: "og:type", content: ogType },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:site_name", content: metadata.siteName },
		{ property: "og:url", content: canonical },
		{ property: "og:image", content: imageUrl },
		{ property: "og:image:width", content: String(image.width) },
		{ property: "og:image:height", content: String(image.height) },
		...(image.alt ? [{ property: "og:image:alt", content: image.alt }] : []),
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: imageUrl },
		...(image.alt ? [{ name: "twitter:image:alt", content: image.alt }] : []),
		...(metadata.googleSiteVerification
			? [{ name: "google-site-verification", content: metadata.googleSiteVerification }]
			: []),
	];
}
