/**
 * PROTOTYPE ONLY — throwaway.
 *
 * Round 4 is a clean 2x2: PLACEMENT (in the flow under the field, or docked to
 * the bottom edge) x TREATMENT (recessed glyphs, or bordered keys). Placement is
 * a real layout difference and lives in its own variant file. Treatment is only
 * key styling, so it lives here — that way the two axes stay independent and a
 * comparison only ever changes one thing.
 */

export type PaletteTreatment = "ghost" | "keys";

export const TREATMENT_KEY_CLASS: Record<PaletteTreatment, string> = {
	/** No border, no fill. The glyph comes forward on hover and on search match. */
	ghost:
		"size-9 rounded-md text-lg text-muted-foreground hover:bg-background-soft hover:text-foreground",
	/** A physical key: border and fill, pressable-looking. */
	keys: "size-9 rounded-md border bg-background text-lg hover:border-primary hover:bg-background-strong",
};
