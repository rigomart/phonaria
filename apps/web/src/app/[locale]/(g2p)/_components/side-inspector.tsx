import { DefinitionCompactBlock } from "./definition-compact-block";
import { PhonemeCompactBlock } from "./phoneme-compact-block";

export function SideInspector() {
	return (
		<div className="flex flex-col gap-4 h-full min-h-0">
			<div className="flex-1 min-h-0">
				<PhonemeCompactBlock />
			</div>
			<div className="flex-1 min-h-0">
				<DefinitionCompactBlock />
			</div>
		</div>
	);
}
