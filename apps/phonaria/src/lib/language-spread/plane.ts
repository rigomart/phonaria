/** How far a tilted map plane reaches past each edge of the screen, in pixels. */
export type PlaneOverflow = { above: number; below: number; side: number };

/** Extra plane kept past the computed edge, so rounding never shows a seam. */
const MARGIN = 16;
/** Past this, the horizon is on screen and the haze covers the rest. */
const MAX_ABOVE_SCREENS = 1.5;

/**
 * The smallest plane that still covers the screen when tilted back by `tilt`
 * degrees about the anchor point, seen with `perspective` pixels of depth.
 * Points above the anchor recede and shrink, so the plane must reach further
 * up and wider at the top; points below come closer and need nothing extra.
 */
export function tiltedPlaneOverflow({
	width,
	height,
	anchorX,
	anchorY,
	tilt,
	perspective: p,
}: {
	width: number;
	height: number;
	anchorX: number;
	anchorY: number;
	tilt: number;
	perspective: number;
}): PlaneOverflow {
	const radians = (tilt * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	// Distance up the plane whose projection reaches the top of the screen.
	const denominator = p * cos - anchorY * sin;
	const reach =
		denominator > 0
			? Math.min((anchorY * p) / denominator, anchorY + height * MAX_ABOVE_SCREENS)
			: anchorY + height * MAX_ABOVE_SCREENS;
	const scaleAtTop = p / (p + reach * sin);
	const farthestSide = Math.max(anchorX, width - anchorX);
	const belowAnchor = height - anchorY;
	const reachBelow = (belowAnchor * p) / (p * cos + belowAnchor * sin);
	return {
		above: Math.ceil(reach - anchorY + MARGIN),
		below: Math.ceil(Math.max(0, reachBelow - belowAnchor) + MARGIN),
		side: Math.ceil(farthestSide / scaleAtTop - farthestSide + MARGIN),
	};
}
