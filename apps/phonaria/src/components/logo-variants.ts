// Prototype: logo directions for the user to pick from. Each mark is drawn on a
// 32-unit grid (2 units = 1px at 16px) with its outer edge kept 4 units in,
// so the same drawing serves as the header mark and the favicon tile.

export type LogoShape =
	| {
			kind: "stroke";
			d: string;
			width: number;
			cap: "butt" | "round" | "square";
			join: "miter" | "round";
	  }
	| { kind: "fill"; d: string };

export type LogoVariant = {
	id: string;
	name: string;
	description: string;
	shapes: LogoShape[];
};

export const LOGO_VARIANTS: LogoVariant[] = [
	{
		id: "ligature",
		name: "Ligature",
		description:
			"Upright brackets joined by one solidus into a single monoline stroke, so [ / ] reads as one drawn glyph.",
		shapes: [
			{ kind: "stroke", d: "M12 6H6v20h6L20 6h6v20h-6", width: 4, cap: "butt", join: "miter" },
		],
	},
	{
		id: "specimen",
		name: "Specimen",
		description:
			"A free-standing solidus set inside a pair of light upright brackets, like a glyph in a type specimen.",
		shapes: [
			{ kind: "stroke", d: "M11 5H6.5v22H11M21 5h4.5v22H21", width: 3, cap: "butt", join: "miter" },
			{ kind: "stroke", d: "M12.5 25.5 19.5 6.5", width: 3, cap: "butt", join: "miter" },
		],
	},
	{
		id: "soft",
		name: "Soft",
		description:
			"Short, round-ended brackets with a free-standing solidus that rises past them, the way a slash overshoots in running text.",
		shapes: [
			{
				kind: "stroke",
				d: "M9.5 8.5h-4v15h4M22.5 8.5h4v15h-4",
				width: 3.5,
				cap: "round",
				join: "miter",
			},
			{ kind: "stroke", d: "M13 26 19 6", width: 3.5, cap: "round", join: "round" },
		],
	},
	{
		id: "book",
		name: "Book",
		description:
			"Book-typeface contrast: heavy bracket stems, thin arms and a slim solidus fused to both, like the brackets in a dictionary's pronunciation key.",
		shapes: [
			{ kind: "fill", d: "M5 4h9v2H9.5v20H14v2H5zM27 4h-9v2h4.5v20H18v2h9z" },
			{ kind: "fill", d: "M11.25 28h2.5L20.75 4h-2.5z" },
		],
	},
	{
		id: "half",
		name: "Half and half",
		description:
			"One side of each notation: the phonemic slash opens, the phonetic bracket closes, so the mark spells /…].",
		shapes: [
			{ kind: "stroke", d: "M7 26 15 6", width: 4, cap: "butt", join: "miter" },
			{ kind: "stroke", d: "M19 6h6v20h-6", width: 4, cap: "butt", join: "miter" },
		],
	},
];

export const CURRENT_LOGO_ID = "current";

export function getLogoVariant(id: string | null | undefined): LogoVariant | undefined {
	return LOGO_VARIANTS.find((variant) => variant.id === id);
}

export function logoVariantSvg(
	variant: LogoVariant,
	{ color, tile }: { color: string; tile?: string },
): string {
	const body = variant.shapes
		.map((shape) =>
			shape.kind === "fill"
				? `<path d="${shape.d}" fill="${color}"/>`
				: `<path d="${shape.d}" fill="none" stroke="${color}" stroke-width="${shape.width}" stroke-linecap="${shape.cap}" stroke-linejoin="${shape.join}"/>`,
		)
		.join("");
	const background = tile ? `<rect width="32" height="32" rx="7" fill="${tile}"/>` : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${background}${body}</svg>`;
}
