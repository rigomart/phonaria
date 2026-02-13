import type { LanguageFeatureKey } from "@phonaria/phonetics-data";
import { BarChart3, BookOpen, Mic, Search } from "lucide-react";

export const TOOL_DEFINITIONS = [
	{
		href: "/transcription",
		icon: Mic,
		translationKey: "transcription",
		requiredFeature: "transcription" satisfies LanguageFeatureKey,
	},
	{
		href: "/ipa-chart",
		icon: BookOpen,
		translationKey: "ipa-reference",
		requiredFeature: "articulations" satisfies LanguageFeatureKey,
	},
	{
		href: "/find-by-sound",
		icon: Search,
		translationKey: "find-by-sound",
		requiredFeature: "curatedWordData" satisfies LanguageFeatureKey,
	},
	{
		href: "/insights",
		icon: BarChart3,
		translationKey: "insights",
		requiredFeature: "cmuArpa" satisfies LanguageFeatureKey,
	},
] as const;
