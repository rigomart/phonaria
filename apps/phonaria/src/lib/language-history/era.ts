/**
 * When a step or stop happened, always approximate. `to` gives the end of a
 * range, for dates scholars put between two estimates.
 */
export type Era =
	| { yearsAgo: number; to?: number }
	| { bce: number; to?: number }
	| { ce: number; to?: number }
	| "today";

const PRESENT_YEAR = 2000;

/** A calendar year for ordering, with BCE years negative. Ranges order by their start. */
export function eraYear(era: Era): number {
	if (era === "today") return PRESENT_YEAR;
	if ("yearsAgo" in era) return PRESENT_YEAR - era.yearsAgo;
	if ("bce" in era) return -era.bce;
	return era.ce;
}

const span = (from: number, to: number | undefined, format: (year: number) => string) =>
	to === undefined ? format(from) : `${format(from)}–${format(to)}`;

/** Plain label such as "~70,000 years ago", "~4000–3000 BCE", "~1500 CE" or "Today". */
export function formatEra(era: Era): string {
	if (era === "today") return "Today";
	if ("yearsAgo" in era) {
		return `~${span(era.yearsAgo, era.to, (years) => years.toLocaleString("en-US"))} years ago`;
	}
	if ("bce" in era) return `~${span(era.bce, era.to, String)} BCE`;
	return `~${span(era.ce, era.to, String)} CE`;
}

/** The label for an era that may be unknown, for use inside a sentence. */
export function formatMaybeEra(era: Era | undefined): string {
	return era ? formatEra(era) : "no agreed date";
}
