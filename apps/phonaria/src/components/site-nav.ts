import { useLocation } from "@tanstack/react-router";
import { AudioLines, BookOpen, Globe, Grid3x3, type LucideIcon } from "lucide-react";
import type { AppFlags } from "@/lib/flags";
import {
	IPA_CHART_CONSONANTS_PATH,
	IPA_CHART_FREQUENCY_PATH,
	IPA_CHART_INDEX_PATH,
	IPA_CHART_VOWELS_PATH,
} from "@/lib/ipa-chart-metadata";
import { LANGUAGE_SPREAD_PATH } from "@/lib/language-spread/metadata";

export type Tool = {
	id: "transcription" | "ipa-chart" | "practice" | "language-spread";
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
		id: "practice",
		href: "/practice",
		label: "Practice",
		icon: BookOpen,
		match: (pathname) => pathname.startsWith("/practice"),
	},
	{
		id: "language-spread",
		href: LANGUAGE_SPREAD_PATH,
		label: "Language Spread",
		icon: Globe,
		match: (pathname) => pathname === LANGUAGE_SPREAD_PATH,
	},
];

export const chartSections = [
	{ href: IPA_CHART_CONSONANTS_PATH, label: "Consonants" },
	{ href: IPA_CHART_VOWELS_PATH, label: "Vowels" },
	{ href: IPA_CHART_FREQUENCY_PATH, label: "Frequency" },
] as const;

export function getTools(flags: AppFlags): readonly Tool[] {
	return tools.filter((tool) => {
		if (tool.id === "practice") return flags.practice;
		if (tool.id === "language-spread") return flags.languageSpread;
		return true;
	});
}

export function usePathname(): string {
	return useLocation({ select: (location) => location.pathname });
}
