export type AllophoneContext =
	| { type: "position"; value: "syllable-initial" | "syllable-final" | "intervocalic" }
	| { type: "environment"; value: "before-vowel" | "before-consonant" | "word-final" }
	| { type: "stress"; value: "stressed" | "unstressed" }
	| { type: "register"; value: "formal" | "casual" };

export type Allophone = {
	variant: string;
	contexts: AllophoneContext[];
};

export const phonemeAllophones: Map<string, Allophone[]> = new Map([
	[
		"voiceless-alveolar-stop",
		[
			{
				variant: "ɾ",
				contexts: [
					{ type: "position", value: "intervocalic" },
					{ type: "register", value: "casual" },
				],
			},
			{
				variant: "ʔ",
				contexts: [
					{ type: "environment", value: "before-consonant" },
					{ type: "register", value: "casual" },
				],
			},
		],
	],
	[
		"voiced-alveolar-stop",
		[
			{
				variant: "ɾ",
				contexts: [
					{ type: "position", value: "intervocalic" },
					{ type: "register", value: "casual" },
				],
			},
		],
	],
	[
		"voiced-alveolar-lateral-approximant",
		[
			{
				variant: "ɫ",
				contexts: [{ type: "position", value: "syllable-final" }],
			},
		],
	],
]);

export function getAllophones(phonemeId: string): Allophone[] {
	return phonemeAllophones.get(phonemeId) ?? [];
}
