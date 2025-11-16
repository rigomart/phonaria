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
			description:
				"Reference tool for understanding English phonemes. Click on any symbol to see articulation details, example words, and audio pronunciation.",
			phonemes: "phonemes",
			vowels: "vowels",
			consonants: "consonants",
		},
		"nav-tabs": {
			consonants: "Consonants",
			vowels: "Vowels",
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
					"Vowel sounds organized by type and characteristics. Click any phoneme for pronunciation details.",
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
			title: "Phonaria",
			description:
				"Pronunciation toolkit for English learners. Convert text to IPA transcription and explore phoneme articulation details.",
		},
		title: "Pronunciation Toolkit",
		description:
			"Phonaria provides two core tools for understanding English pronunciation. Use them separately or together as you work with unfamiliar words and sounds.",
		tools: {
			g2p: {
				title: "Text to IPA Transcription",
				description:
					"Paste any English text to see its IPA pronunciation with stress markers. Click phonemes for articulation details and example words.",
				"what-you-get": "What you get",
				features: {
					transcription: "IPA transcription with primary and secondary stress marked",
					phonemes: "Click any phoneme to see how it's produced",
					dictionary: "Dictionary definitions when available",
				},
				"link-text": "Open transcription tool",
			},
			"ipa-chart": {
				title: "IPA Reference Chart",
				description:
					"Browse all General American English phonemes organized by type. Click any symbol to hear it and see articulation guidance.",
				"what-you-get": "What you get",
				features: {
					chart: "Complete consonant and vowel charts",
					audio: "Audio pronunciation for each phoneme",
					details: "Articulation diagrams and production steps",
					examples: "Example words showing each sound",
				},
				"link-text": "Open IPA chart",
			},
			"phoneme-details": {
				title: "Phoneme Detail Panels",
				description:
					"Available throughout the app when you click a phoneme. Each panel shows how the sound is produced, common spelling patterns, and sounds that learners often confuse.",
				"what-you-get": "What you get",
				features: {
					articulation: "Step-by-step production guidance with diagrams",
					audio: "Audio examples and playback controls",
					patterns: "Common spelling patterns for the sound",
					contrasts: "Minimal pairs with frequently confused sounds",
				},
			},
		},
	},
} as const;
