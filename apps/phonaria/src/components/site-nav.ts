import { useLocation } from "@tanstack/react-router";
import { AudioLines, BookOpen, Globe, Grid3x3, type LucideIcon, Mic } from "lucide-react";
import type { AppFlags } from "@/lib/flags";
import {
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_FREQUENCY_PATH,
	IPA_CHART_INDEX_PATH,
	IPA_CHART_VOWELS_PATH,
} from "@/lib/ipa-chart-metadata";
import { LANGUAGE_HISTORY_PATH } from "@/lib/language-history/metadata";
import { MinimalPairActivity } from "@/lib/practice/minimal-pair-activity";

export type Tool = {
	id: "transcription" | "ipa-chart" | "minimal-pairs" | "practice" | "language-history";
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
		match: (pathname) => pathname === "/",
	},
	{
		id: "ipa-chart",
		href: IPA_CHART_CONSONANTS_PATH,
		label: "IPA Chart",
		icon: Grid3x3,
		match: (pathname) => pathname.startsWith(IPA_CHART_INDEX_PATH),
	},
	{
		id: "minimal-pairs",
		href: MinimalPairActivity.path,
		label: MinimalPairActivity.name,
		icon: Mic,
		match: (pathname) => pathname === MinimalPairActivity.path,
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

export const chartSections = [
	{ href: IPA_CHART_CONSONANTS_PATH, label: "Consonants" },
	{ href: IPA_CHART_VOWELS_PATH, label: "Vowels" },
	{ href: IPA_CHART_FREQUENCY_PATH, label: "Frequency" },
] as const;

export function getTools(flags: AppFlags): readonly Tool[] {
	return tools.filter((tool) => {
		if (tool.id === "minimal-pairs") return flags.speech;
		if (tool.id === "practice") return flags.practice;
		if (tool.id === "language-history") return flags.languageHistory;
		return true;
	});
}

export function usePathname(): string {
	return useLocation({ select: (location) => location.pathname });
}
