export default {
	components: {
		header: {
			navigation: {
				overview: "Overview",
				transcription: "Transcription",
				"ipa-chart": "IPA Reference",
				stats: "Statistics",
			},
		},
		footer: {
			links: {
				credits: "Credits",
				github: "GitHub",
			},
			copyright: "© {year} Phonaria. All rights reserved.",
		},
		"phoneme-details": {
			header: {
				"audio-disclaimer": {
					"button-label": "Audio source information",
					"popover-text": "Audio samples are sourced from Wikimedia Commons.",
					"view-credits": "View full credits",
				},
			},
			articulation: {
				title: "Pronunciation",
				description: "How this sound is produced using your vocal tract.",
				features: "Features",
				"ipa-chart-link": "View on the IPA chart",
				"step-by-step": "Step by step",
				"common-mistakes": "Common mistakes",
				pitfalls: {
					summary: "Summary",
					tip: "Tip",
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
				"most-common": "Spellings:",
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
		"info-button": {
			label: "How to read this chart",
			"label-short": "Guide",
			"aria-consonants": "How to read the consonant chart",
			"aria-monophthongs": "How to read the monophthong vowel chart",
			"aria-diphthongs": "How to read the diphthong vowel chart",
		},
		hint: {
			sounds: "sounds",
			"click-for-details": "Click on a phoneme for details",
		},
		sections: {
			consonants: {
				diagram:
					"Consonants organized by manner (rows: how the sound is made) and place (columns: where in the mouth). Within each cell: voiceless left, voiced right.",
				legend: {
					voiceless: "Voiceless",
					voiced: "Voiced",
				},
			},
			vowels: {
				monophthongs: {
					diagram:
						"Vowels plotted by tongue position. Vertical axis shows tongue height (high to low). Horizontal axis shows tongue backness (front to back).",
				},
				diphthongs: {
					diagram:
						"Vowels that glide between two positions. Each arrow traces the tongue's movement from start to end.",
				},
				legend: {
					rounded: "Rounded",
					unrounded: "Unrounded",
					"r-colored": "R-colored",
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
	"g2p-page": {
		"empty-state": {
			"visual-example": {
				text: "the quick brown fox",
				ipa: "ðə kwɪk braʊn fɑks",
			},
			description: "Click phonemes to hear sounds and view articulation details",
			"try-example": "Or try an example",
			examples: ["Hello world", "Judge the rhythm", "She chose well", "Through thick fog"],
		},
		"transcription-display": {
			"copy-button": {
				"aria-label": "Copy transcription to clipboard",
				"toast-success": "Copied to clipboard",
				"toast-error": "No transcription to copy",
				"toast-error-failed": "Failed to copy to clipboard",
			},
			"info-button": {
				"aria-label": "Transcription information",
				title: "About This Transcription",
				description:
					"Pronunciations are obtained from the CMU Pronouncing Dictionary, which contains over 134,000 North American English words.",
				"limitations-title": "Known limitations:",
				limitations: {
					"newer-words": "Newer words, slang, and specialized terms may not be included",
					"proper-nouns": "Proper nouns and brand names often missing",
					homographs: "Homographs show multiple variants",
				},
			},
		},
	},
	"overview-page": {
		meta: {
			title: "Phonaria",
			description:
				"Pronunciation toolkit for English learners. Convert text to IPA transcription and explore phoneme articulation details.",
		},
		hero: {
			title: "Phoneme based pronunciation toolkit",
			description:
				"A collection of tools designed to decode English spelling. Transcribe text to IPA, explore the sound inventory, and study articulation details.",
			hint: "Click any symbol to explore details",
		},
		launchpad: {
			g2p: {
				title: "Transcription Studio",
				description: "Type any text to see its pronunciation represented in IPA phonemes.",
				action: "Open Studio",
			},
			"ipa-chart": {
				title: "IPA Reference",
				description: "Browse the General American English sound inventory.",
				action: "View Chart",
			},
		},
	},
	"credits-page": {
		meta: {
			title: "Credits & Attribution",
			description: "Credits and acknowledgments for Phonaria resources and data sources",
		},
		title: "Credits & Attribution",
		description:
			"Phonaria builds on the work of open source projects, linguistic research, and public domain resources.",
		sections: {
			wikimedia: {
				title: "Phonetic Audio Samples",
				content:
					'Phonetic audio samples used in this app are derived from recordings in the "General phonetics" gallery on Wikimedia Commons. The original files were created by various Wikimedia Commons contributors, including Peter Isotalo, Erutuon, Denelson83, and Octane, and are used here under Creative Commons Attribution-ShareAlike and other compatible free licenses. For full authorship and licensing details, please see the individual file pages on Wikimedia Commons.',
				"link-text": "View General phonetics gallery",
				"link-url": "https://commons.wikimedia.org/wiki/General_phonetics",
			},
			cmu: {
				title: "CMU Pronouncing Dictionary",
				content:
					"The grapheme-to-phoneme transcription feature uses pronunciation data from the CMU Pronouncing Dictionary, a public domain pronunciation dictionary created by Carnegie Mellon University. The dictionary contains over 134,000 North American English words with their phonetic transcriptions.",
				"link-text": "Learn more about CMU Dict",
				"link-url": "http://www.speech.cs.cmu.edu/cgi-bin/cmudict",
			},
			"phonetic-data": {
				title: "Phonetic Data & Resources",
				content:
					"Articulatory descriptions, phoneme features, and IPA classifications are compiled from established phonetic resources, linguistic research, and educational materials in the public domain.",
			},
		},
	},
	"stats-page": {
		meta: {
			title: "CMUDict Statistics",
			description: "Statistics and insights from the CMU Pronouncing Dictionary",
		},
		title: "CMUDict Statistics",
		description:
			"Insights from the CMU Pronouncing Dictionary, including phoneme frequency, stress patterns, syllable distributions, and ambiguous words.",
		sections: {
			phonemes: {
				title: "Phoneme Frequency",
				description:
					"Most frequent phonemes in CMUDict, shown by token count across all pronunciations.",
			},
			stress: {
				title: "Stress Patterns",
				description:
					"Distribution of stress markers (primary, secondary, unstressed) and most common stress patterns.",
			},
			syllables: {
				title: "Syllable Distribution",
				description: "Distribution of syllable counts per word in CMUDict.",
			},
			ambiguous: {
				title: "Ambiguous Words",
				description: "Words with multiple pronunciation variants in CMUDict.",
			},
		},
	},
} as const;
