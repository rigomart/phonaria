import { useLocation } from "@tanstack/react-router";
import {
	ArrowLeftRight,
	AudioLines,
	BookOpen,
	Globe,
	type LucideIcon,
	Volume2,
} from "lucide-react";
import type { AppFlags } from "@/lib/flags";
import { SEARCH_PATH } from "@/lib/home-metadata";
import {
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_FREQUENCY_PATH,
	IPA_CHART_INDEX_PATH,
	IPA_CHART_VOWELS_PATH,
} from "@/lib/ipa-chart-metadata";
import { LANGUAGE_HISTORY_PATH } from "@/lib/language-history/metadata";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";
import { SOUNDS_PATH } from "@/lib/sound-pages";

export type Tool = {
	id: "transcription" | "sounds" | "minimal-pairs" | "practice" | "language-history";
	href: string;
	label: string;
	icon: LucideIcon;
	/** Whether `pathname` belongs to this tool, for the active state. */
	match: (pathname: string) => boolean;
};

const tools: readonly Tool[] = [
	{
		id: "transcription",
		href: "/",
		label: "Transcription",
		icon: AudioLines,
		match: (pathname) => pathname === "/" || pathname === SEARCH_PATH,
	},
	{
		id: "sounds",
		href: SOUNDS_PATH,
		label: "Sounds",
		icon: Volume2,
		match: (pathname) =>
			[SOUNDS_PATH, IPA_CHART_INDEX_PATH].some(
				(path) => pathname === path || pathname.startsWith(`${path}/`),
			),
	},
	{
		id: "minimal-pairs",
		href: MinimalPairActivity.path,
		label: MinimalPairActivity.name,
		icon: ArrowLeftRight,
		match: (pathname) =>
			pathname === MinimalPairActivity.path || pathname.startsWith(`${MinimalPairActivity.path}/`),
	},
	{
		id: "practice",
		href: "/practice",
		label: "Practice",
		icon: BookOpen,
		match: (pathname) => pathname.startsWith("/practice"),
	},
	{
		id: "language-history",
		href: LANGUAGE_HISTORY_PATH,
		label: "History",
		icon: Globe,
		match: (pathname) => pathname === LANGUAGE_HISTORY_PATH,
	},
];

/** Pages under the Sounds nav item, in menu order. */
export const soundsSections = [
	{ href: SOUNDS_PATH, label: "All sounds" },
	{ href: IPA_CHART_CONSONANTS_PATH, label: "Consonant chart" },
	{ href: IPA_CHART_VOWELS_PATH, label: "Vowel chart" },
	{ href: IPA_CHART_FREQUENCY_PATH, label: "How common" },
] as const;

/**
 * `aria-current` for a nav item: "page" on the page it links to, "true" elsewhere
 * in its section (a sound's page, a chart under Sounds).
 */
export function navCurrent(tool: Tool, pathname: string): "page" | "true" | undefined {
	if (pathname === tool.href) return "page";
	return tool.match(pathname) ? "true" : undefined;
}

export function getTools(flags: Pick<AppFlags, "practice" | "languageHistory">): readonly Tool[] {
	return tools.filter((tool) => {
		if (tool.id === "practice") return flags.practice;
		if (tool.id === "language-history") return flags.languageHistory;
		return true;
	});
}

export function usePathname(): string {
	return useLocation({ select: (location) => location.pathname });
}
