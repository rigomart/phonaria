/**
 * Gall stereographic projection fitted to the world map viewbox. It is
 * cylindrical, so x is linear in longitude and copies of the map tile
 * seamlessly every MAP_WIDTH. Shared by the land-path generator and the page so
 * points land on the generated outline.
 */

/** Northern edge of the map; Greenland tops out near 83.7°N. */
export const MAP_NORTH_LAT = 84;
/** Southern edge of the map; Antarctica is cropped out, Tierra del Fuego ends near 55.9°S. */
export const MAP_SOUTH_LAT = -58;
export const MAP_WIDTH = 1000;

const RAD = Math.PI / 180;
const Y_FACTOR = 1 + Math.SQRT1_2;
const SCALE = MAP_WIDTH / (2 * Math.PI * Math.SQRT1_2);

function gallY(lat: number): number {
	return Y_FACTOR * Math.tan((lat * RAD) / 2);
}

const TOP_Y = gallY(MAP_NORTH_LAT);

export const MAP_HEIGHT = Math.round((TOP_Y - gallY(MAP_SOUTH_LAT)) * SCALE * 10) / 10;

/**
 * Projects a place to viewbox coordinates: x grows east, y grows south.
 * Longitudes outside ±180 continue into the neighbouring tile.
 */
export function project(lon: number, lat: number): { x: number; y: number } {
	return {
		x: MAP_WIDTH / 2 + lon * RAD * Math.SQRT1_2 * SCALE,
		y: (TOP_Y - gallY(lat)) * SCALE,
	};
}

/** The place at viewbox point (x, y), with longitude wrapped to ±180. Inverse of `project`. */
export function unproject(x: number, y: number): { lon: number; lat: number } {
	const lon = ((((x - MAP_WIDTH / 2) / (RAD * Math.SQRT1_2 * SCALE) + 180) % 360) + 360) % 360;
	const lat = (2 * Math.atan((TOP_Y - y / SCALE) / Y_FACTOR)) / RAD;
	return { lon: lon - 180, lat };
}
