/**
 * Compact text encoding for land polygons in longitude/latitude, shared by the
 * generator (`scripts/generate-world-map.ts`) and the page.
 *
 * Coordinates are rounded to hundredths of a degree (about 1 km) and written
 * as a stream of zigzag-encoded integers: the polygon count, then per polygon
 * its ring count, then per ring its point count followed by each point's
 * offset from the previous point in the stream. Each integer is a run of
 * base64url characters carrying 5 bits each, with the sixth bit set on every
 * character but the last.
 */

/** A closed ring of [lon, lat] positions; the first position is repeated at the end. */
export type Ring = [number, number][];
export type LandPolygon = Ring[];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const UNITS_PER_DEGREE = 100;

const zigzag = (value: number) => (value < 0 ? -2 * value - 1 : 2 * value);
const unzigzag = (value: number) => (value % 2 === 1 ? -(value + 1) / 2 : value / 2);

function writeInt(out: string[], signed: number) {
	let value = zigzag(signed);
	while (value >= 32) {
		out.push(ALPHABET[32 | (value % 32)]);
		value = Math.floor(value / 32);
	}
	out.push(ALPHABET[value]);
}

/** Encodes polygons whose rings are closed. The closing position is implied and not stored. */
export function encodeLand(polygons: readonly LandPolygon[]): string {
	const out: string[] = [];
	let lon = 0;
	let lat = 0;
	writeInt(out, polygons.length);
	for (const polygon of polygons) {
		writeInt(out, polygon.length);
		for (const ring of polygon) {
			const open = ring.slice(0, -1);
			writeInt(out, open.length);
			for (const [x, y] of open) {
				const qx = Math.round(x * UNITS_PER_DEGREE);
				const qy = Math.round(y * UNITS_PER_DEGREE);
				writeInt(out, qx - lon);
				writeInt(out, qy - lat);
				lon = qx;
				lat = qy;
			}
		}
	}
	return out.join("");
}

export function decodeLand(encoded: string): LandPolygon[] {
	let index = 0;
	const readInt = () => {
		let value = 0;
		let factor = 1;
		for (;;) {
			const digit = ALPHABET.indexOf(encoded[index++]);
			if (digit < 0) throw new Error(`Invalid land data at ${index - 1}.`);
			value += (digit % 32) * factor;
			if (digit < 32) return unzigzag(value);
			factor *= 32;
		}
	};
	let lon = 0;
	let lat = 0;
	const polygons: LandPolygon[] = [];
	const polygonCount = readInt();
	for (let p = 0; p < polygonCount; p += 1) {
		const polygon: LandPolygon = [];
		const ringCount = readInt();
		for (let r = 0; r < ringCount; r += 1) {
			const ring: Ring = [];
			const pointCount = readInt();
			for (let i = 0; i < pointCount; i += 1) {
				lon += readInt();
				lat += readInt();
				ring.push([lon / UNITS_PER_DEGREE, lat / UNITS_PER_DEGREE]);
			}
			ring.push(ring[0]);
			polygon.push(ring);
		}
		polygons.push(polygon);
	}
	return polygons;
}
