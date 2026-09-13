import type { APIRequestContext, APIResponse } from "@playwright/test";
import { INDEXABLE_PATHS, type LabContractTarget } from "./constants";

export async function fetchDocument(
	request: APIRequestContext,
	path: string,
): Promise<{ response: APIResponse; html: string }> {
	const response = await request.get(path);
	return { response, html: await response.text() };
}

export function metaContent(html: string, name: string): string | undefined {
	const named = html.match(
		new RegExp(`<meta\\s+name="${escapeRegExp(name)}"\\s+content="([^"]*)"`, "i"),
	);
	if (named?.[1] !== undefined) return decode(named[1]);
	const reversed = html.match(
		new RegExp(`<meta\\s+content="([^"]*)"\\s+name="${escapeRegExp(name)}"`, "i"),
	);
	return reversed?.[1] !== undefined ? decode(reversed[1]) : undefined;
}

export function documentTitle(html: string): string | undefined {
	const match = html.match(/<title>([^<]*)<\/title>/i);
	return match?.[1] !== undefined ? decode(match[1]) : undefined;
}

export function canonicalHref(html: string): string | undefined {
	const match = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
	return match?.[1] !== undefined ? decode(match[1]) : undefined;
}

export function expectedCanonical(target: LabContractTarget, path: string): string {
	return path === "/" ? target.expectedCanonicalOrigin : `${target.expectedCanonicalOrigin}${path}`;
}

export function expectedRobots(target: LabContractTarget): string {
	return target.indexingEnabled ? "index, follow" : "noindex, follow";
}

export function expectedSitemapUrls(target: LabContractTarget): string[] {
	return INDEXABLE_PATHS.map((path) => expectedCanonical(target, path));
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decode(value: string): string {
	return value
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&#x27;", "'");
}
