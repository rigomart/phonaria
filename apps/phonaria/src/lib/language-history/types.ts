import type { Bounds } from "./camera";
import type { Era } from "./era";

/** Longitude, latitude in degrees. Longitudes past 180 continue across the Pacific. */
export type LonLat = readonly [lon: number, lat: number];

/** `change` is a change within the language, such as a shift in its sounds, rather than a place it reached. */
export type StopKind = "family" | "branch" | "language" | "change";

/** A place on the map where a language family, a language or a change in it shows up. */
export type Stop = {
	id: string;
	name: string;
	kind: StopKind;
	/** Left out when scholars have no agreed date. */
	era?: Era;
	/** Roughly where, never an exact spot. */
	at: LonLat;
	/** Radius of the soft area around the point, in km, when the place is a broad region. */
	areaKm?: number;
	/** The rough location in words, e.g. "around today's Nigeria–Cameroon border". */
	where: string;
	description: string;
	/** Ids from the sources list that back this stop. */
	sources: readonly string[];
};

/**
 * Where a step's card sits over the globe on wide screens, chosen so it doesn't
 * cover the place the step is about. Phones always show the card at the bottom.
 */
export type CardPlacement =
	| "top-left"
	| "center-left"
	| "bottom-left"
	| "top-right"
	| "center-right"
	| "bottom-right";

/** One card of the story: what the reader sees while the card is in view. */
export type Step = {
	id: string;
	title: string;
	era: Era;
	paragraphs: readonly string[];
	/** Defaults to "center-left". */
	card?: CardPlacement;
	/** The region the camera frames. */
	camera: Bounds;
	/** Stops revealed by this step, in the order they appear. */
	stops: readonly string[];
	/** Spread arrows drawn by this step, each from its origin through waypoints to the end. */
	routes: readonly (readonly LonLat[])[];
	/** Turn the globe slowly once the camera arrives, for a step that shows the whole world. */
	spin?: boolean;
	/** Sources for claims the card makes beyond its stops. */
	sources?: readonly string[];
};

/** One version of the sample sentence, quoted as its edition prints it. */
export type Sample = {
	id: string;
	/** The card that shows it; left out for a version shown only in the comparison. */
	step?: string;
	/** The stage of English or the book, e.g. "Old English" or "King James Bible". */
	stage: string;
	/** When this version was written, e.g. "~1000 CE". */
	written: string;
	text: string;
	/** BCP 47 tag for screen readers when the text isn't modern English: "ang" Old English, "enm" Middle English. */
	lang?: "ang" | "enm";
	/** Today's word for each word of `text`, in order, when a modern reader can't follow it. */
	gloss?: readonly string[];
	/** A few words to help read it, e.g. "þ = th". */
	note?: string;
	/** Ids from the sources list; absent for modern English. */
	sources?: readonly string[];
};

export type Source = {
	id: string;
	/** Short citation, e.g. "Gray, Drummond & Greenhill 2009, Science". */
	citation: string;
	title: string;
	url: string;
};
