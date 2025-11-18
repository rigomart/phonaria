export default {
	components: {
		header: {
			navigation: {
				overview: "Overview",
				transcription: "Transcription",
				"ipa-chart": "IPA Reference",
			},
		},
		"phoneme-details": {
			articulation: {
				title: "Pronunciation",
				description: "How this sound is produced using your vocal tract.",
				features: "Features",
				"step-by-step": "Step by step",
				"common-mistakes": "Common mistakes",
				pitfalls: {
					summary: "Summary",
					tip: "Tip",
				},
				diagram: {
					vowel: {
						title: "Vowel diagram",
						description:
							"The marker shows the tongue's height (up/down) and position (front/back) for this vowel. A filled marker means it’s rounded.",
					},
					diphthong: {
						title: "Vowel diagram",
						description:
							"The two markers show the start and end positions of the diphthong. The arrow shows the glide between them. Filled markers indicate rounding.",
					},
					consonant: {
						title: "Vocal tract side view",
						description:
							"Side view of how the sound is formed. Look for: place (where airflow narrows), manner (how it narrows or releases), voicing (wavy lines show throat vibration), and nasal airflow (soft palate open for nasals).",
					},
				},
			},
			contrasts: {
				title: "Contrasts",
				"learn-more-aria": "Learn more about practice contrasts",
				description: "Minimal pairs that highlight how this sound differs from similar phonemes.",
				"open-contrast": "Open contrast",
				"differs-in": "Differs in",
				vs: "vs",
			},
			patterns: {
				title: "Spelling Patterns",
				description: "Common letter combinations that represent this sound in English spelling.",
				"most-common": "Most commonly spelled as:",
			},
			allophones: {
				title: "Variations",
				description:
					"This sound has slight variations depending on where it appears in a word or accent.",
			},
		},
	},
	"locale-layout": {
		title: "Phonaria - English Phoneme Learning",
		description: "Interactive tool for learning English phonemes with IPA transcription",
	},
	"not-found-page": {
		title: "Page not found",
		description:
			"Please double-check the browser address bar or use the navigation to go to a known page.",
	},
	"ipa-chart": {
		title: "IPA Reference",
		description:
			"Reference tool for understanding English phonemes. Click on any symbol to see articulation details, example words, and audio pronunciation.",
		"hero-section": {
			title: "English Phoneme Reference",
			short: "Interactive IPA Chart",
			description: "Reference tool for understanding English phonemes.",
			phonemes: "phonemes",
			vowels: "vowels",
			consonants: "consonants",
		},
		"nav-tabs": {
			consonants: "Consonants",
			vowels: "Vowels",
			monophthongs: "Vowels · Monophthongs",
			diphthongs: "Vowels · Diphthongs",
		},
		sections: {
			consonants: {
				title: "Consonant Phonemes",
				description:
					"Consonant sounds organized by type and characteristics. Click any phoneme for detailed pronunciation information.",
			},
			vowels: {
				title: "Vowel Phonemes",
				description:
					"Vowel sounds plotted by tongue height, backness, and rounding. Select any marker to open articulation details.",
				monophthongs: {
					title: "Monophthongs & Rhotic Vowels",
					description: "Single steady vowels organized by their tongue position.",
				},
				diphthongs: {
					title: "Diphthongs",
					description: "Two-part vowels that glide from a starting position to an ending position.",
				},
				legend: {
					rounded: "Rounded",
					unrounded: "Unrounded",
					rhotic: "Rhotic",
					diphthong: "Arrow = glide path",
				},
			},
		},
		dialog: {
			"sagittal-title": "Sagittal view",
			"sagittal-aria-label": "Sagittal view placeholder",
			"sagittal-placeholder": "Sagittal view placeholder",
		},
		card: {
			"tooltip-hint": "Click for articulation details",
		},
	},
	"overview-page": {
		meta: {
			title: "Phonaria tools overview",
			description:
				"Preview the grapheme-to-phoneme workspace, IPA reference chart, and sound contrast activities available in Phonaria.",
		},
		"core-modules-section": {
			title: "Pronunciation learning tools",
			description:
				"Each tool focuses on a different aspect of pronunciation learning. Use them together or focus on the one that matches your current learning goal.",
		},
	},
} as const;
