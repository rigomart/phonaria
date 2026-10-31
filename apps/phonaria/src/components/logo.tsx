import type { SVGProps } from "react";

// A slash opens and a bracket closes: one side each of phonemic /…/ and
// phonetic […] transcription. The bracket's arm ends are cut at the slash's angle.
export function Logo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="4 4 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
			<path d="M4.6 28h4.3l9.6-24h-4.3zM21 4h7v24h-9l1.6-4H24V8h-4.6z" fill="currentColor" />
		</svg>
	);
}
