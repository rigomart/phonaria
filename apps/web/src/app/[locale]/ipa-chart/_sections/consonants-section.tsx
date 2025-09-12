import { consonants } from "shared-data";
import { PhonemeCategories } from "../_components/phoneme-categories";

export function ConsonantsSection() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">Consonant Phonemes</h2>
				<p className="text-sm text-muted-foreground">
					Consonant sounds organized by type and characteristics. Click any phoneme for detailed
					pronunciation information.
				</p>
			</div>
			<PhonemeCategories phonemes={consonants} type="consonant" defaultOpenCategories={true} />
		</div>
	);
}
