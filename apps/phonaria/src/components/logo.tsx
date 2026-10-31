import type { SVGProps } from "react";
import { useLogoVariant } from "@/hooks/use-logo-variant";
import type { LogoVariant } from "./logo-variants";

export function Logo(props: SVGProps<SVGSVGElement>) {
	const { variant } = useLogoVariant();
	return variant ? <VariantLogo variant={variant} {...props} /> : <CurrentLogo {...props} />;
}

export function CurrentLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 256 256"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			<path
				d="M32 224 88 32H48m176 0-56 192h40"
				stroke="currentColor"
				strokeWidth={32}
				strokeLinecap="round"
			/>
			<path d="M152 16h-24L64 240h24zm40 0h-24l-64 224h24z" fill="currentColor" />
		</svg>
	);
}

// The variants keep a 4-unit margin for the favicon tile; crop it here so the
// mark fills its box like the current one does.
export function VariantLogo({
	variant,
	...props
}: SVGProps<SVGSVGElement> & { variant: LogoVariant }) {
	return (
		<svg
			viewBox="4 4 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			{...props}
		>
			{variant.shapes.map((shape) =>
				shape.kind === "fill" ? (
					<path key={shape.d} d={shape.d} fill="currentColor" />
				) : (
					<path
						key={shape.d}
						d={shape.d}
						stroke="currentColor"
						strokeWidth={shape.width}
						strokeLinecap={shape.cap}
						strokeLinejoin={shape.join}
					/>
				),
			)}
		</svg>
	);
}
