export interface VowelHeightInfo {
	key: string;
	label: string;
	short: string;
	order: number;
}

export interface VowelFrontnessInfo {
	key: string;
	label: string;
	short: string;
	order: number;
}

export const vowelHeights: VowelHeightInfo[] = [
	{
		key: "high",
		label: "High",
		short: "Tongue raised close to the roof; jaw nearly closed.",
		order: 1,
	},
	{
		key: "near-high",
		label: "Near high",
		short: "Slightly lower than high; still close to the roof.",
		order: 2,
	},
	{ key: "high-mid", label: "High‑mid", short: "Between high and mid tongue height.", order: 3 },
	{ key: "mid", label: "Mid", short: "Tongue centrally between high and low positions.", order: 4 },
	{ key: "low-mid", label: "Low‑mid", short: "Between mid and low tongue height.", order: 5 },
	{ key: "near-low", label: "Near low", short: "Slightly higher than fully low.", order: 6 },
	{ key: "low", label: "Low", short: "Tongue lowered; mouth more open.", order: 7 },
];

export const vowelFrontnesses: VowelFrontnessInfo[] = [
	{
		key: "front",
		label: "Front",
		short: "Tongue advanced toward the front of the mouth.",
		order: 1,
	},
	{
		key: "near-front",
		label: "Near front",
		short: "Slightly retracted from fully front.",
		order: 2,
	},
	{
		key: "central",
		label: "Central",
		short: "Tongue positioned near the center of the mouth.",
		order: 3,
	},
	{ key: "near-back", label: "Near back", short: "Slightly advanced from fully back.", order: 4 },
	{ key: "back", label: "Back", short: "Tongue retracted toward the velum (back).", order: 5 },
];
