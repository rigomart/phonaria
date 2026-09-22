import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Portable image renderer for TanStack Start.
 *
 * `fill` preserves the previous layout: the parent must be `relative`, and the
 * image covers that box. `unoptimized` is accepted and ignored — rendering is
 * always a native `img`.
 */
export type AppImageProps = Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"src" | "alt" | "width" | "height"
> & {
	src: string;
	alt: string;
	fill?: boolean;
	width?: number;
	height?: number;
	unoptimized?: boolean;
};

export function imageClassName(fill: boolean | undefined, className?: string): string | undefined {
	return fill ? cn("absolute inset-0 size-full", className) : className;
}

export function Image({
	src,
	alt,
	fill,
	width,
	height,
	className,
	unoptimized: _unoptimized,
	...rest
}: AppImageProps) {
	return (
		// Articulation SVGs are already served unoptimized.
		// biome-ignore lint/performance/noImgElement: framework-neutral <img> is the application image contract
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={imageClassName(fill, className)}
			{...rest}
		/>
	);
}
