"use client";

import { vowels } from "shared-data";
import { PhonemeCategories } from "../_components/phoneme-categories";

export function VowelsSection() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-medium">Vowel Phonemes</h2>
				<p className="text-sm text-muted-foreground">
					Vowel sounds organized by type and characteristics. Click any phoneme for pronunciation
					details.
				</p>
			</div>
			<PhonemeCategories phonemes={vowels} type="vowel" defaultOpenCategories={true} />
		</div>
	);
}
