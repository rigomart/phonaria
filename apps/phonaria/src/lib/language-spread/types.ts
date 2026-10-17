import type { Bounds } from "./camera";
import type { Era } from "./era";

/** Longitude, latitude in degrees. Longitudes past 180 continue across the Pacific. */
export type LonLat = readonly [lon: number, lat: number];

export type StopKind = "migration" | "family" | "branch" | "language";

/** A place on the map where people, a language family or a language shows up. */
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

/** One card of the story: what the reader sees while the card is in view. */
export type Step = {
	id: string;
	title: string;
	era: Era;
	paragraphs: readonly string[];
	/** The region the camera frames. */
	camera: Bounds;
	/** Stops revealed by this step, in the order they appear. */
	stops: readonly string[];
	/** Spread arrows drawn by this step, each from its origin through waypoints to the end. */
	routes: readonly (readonly LonLat[])[];
	/** Sources for claims the card makes beyond its stops. */
	sources?: readonly string[];
};

export type Source = {
	id: string;
	/** Short citation, e.g. "Gray, Drummond & Greenhill 2009, Science". */
	citation: string;
	title: string;
	url: string;
};
