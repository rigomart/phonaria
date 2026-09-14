import { CREDITS_PAGE_DESCRIPTION, CREDITS_PAGE_TITLE } from "@/lib/credits-metadata";
import {
	CONSONANTS_PAGE_DESCRIPTION,
	CONSONANTS_PAGE_TITLE,
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_VOWELS_PATH,
	VOWELS_PAGE_DESCRIPTION,
	VOWELS_PAGE_TITLE,
} from "@/lib/ipa-chart-metadata";
import {
	type DocumentMetadata,
	getDocumentMetadata,
	SITE_DESCRIPTION,
	SITE_NAME,
} from "@/lib/site";

type TitleTag = { title: string };
type NamedMetaTag = { name: string; content: string };
type PropertyMetaTag = { property: string; content: string };
type CharsetMetaTag = { charSet: string };
type ViewportMetaTag = { name: "viewport"; content: string };

export type StartMetaTag =
	| TitleTag
	| NamedMetaTag
	| PropertyMetaTag
	| CharsetMetaTag
	| ViewportMetaTag;

export type StartHead = {
	meta: StartMetaTag[];
	links?: Array<{ rel: string; href: string }>;
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
			...seoMetaTags(metadata, metadata?.siteUrl),
		],
	};
}

type PageHeadInput = {
	path: string;
	title: string;
	description: string;
};

export function buildPageHead({ path, title, description }: PageHeadInput): StartHead {
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
			...seoMetaTags(metadata, canonical),
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

function seoMetaTags(
	metadata: DocumentMetadata | undefined,
	canonical: string | undefined,
): StartMetaTag[] {
	if (!metadata || !canonical) return [];
	return [
		{
			name: "robots",
			content: metadata.indexingEnabled ? "index, follow" : "noindex, follow",
		},
		{ property: "og:title", content: metadata.siteName },
		{ property: "og:description", content: metadata.description },
		{ property: "og:site_name", content: metadata.siteName },
		{ property: "og:url", content: canonical },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:title", content: metadata.siteName },
		{ name: "twitter:description", content: metadata.description },
		...(metadata.googleSiteVerification
			? [{ name: "google-site-verification", content: metadata.googleSiteVerification }]
			: []),
	];
}
