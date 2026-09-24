import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
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
