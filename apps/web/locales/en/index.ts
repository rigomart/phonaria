export default {
	components: {
		header: {
			navigation: {
				overview: "Overview",
				transcription: "Transcription",
				"ipa-chart": "IPA Reference",
				insights: "Insights",
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
		"dictionary-dialog": {
			"source-info": {
				"button-aria": "Source information",
				text: "Definitions come from Wiktionary via the Free Dictionary API (CC BY-SA 3.0). Pronunciation audio cites Wikimedia Commons with per-file licenses.",
				link: "View credits",
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
			stats: {
				title: "Pronunciation Insights",
				description: "Explore phoneme frequency and syllable patterns across the corpus.",
				action: "View insights",
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
			"free-dictionary": {
				title: "Free Dictionary API",
				content:
					"Dictionary definitions are provided via the Free Dictionary API (dictionaryapi.dev) using Wiktionary data. Entries carry CC BY-SA 3.0 license metadata, and audio assets cite Wikimedia Commons with per-file licenses.",
				"link-text": "Visit Free Dictionary API",
				"link-url": "https://dictionaryapi.dev/",
				"license-text": "View CC BY-SA 3.0 license",
				"license-url": "https://creativecommons.org/licenses/by-sa/3.0/",
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
			title: "Pronunciation Insights",
			description: "Frequency and pattern insights from the pronunciation corpus",
		},
		title: "Pronunciation Insights",
		description: "Phoneme frequency and syllable distribution across the pronunciation corpus.",
		"source-note": {
			prefix: "Data derived from the CMU Pronouncing Dictionary.",
			link: "View credits",
			suffix: "for authorship and licensing details.",
		},
		sections: {
			overview: {
				title: "Overview",
				updated: "Updated: {date}",
				cards: {
					words: {
						title: "Total Words",
						description: "Entries in the dictionary",
					},
					variants: {
						title: "Total Pronunciations",
						description: "Phonetic transcriptions",
					},
					"multiple-pronunciations": {
						title: "Multiple Pronunciations",
						description: "Words with multiple variants",
					},
				},
			},
			phonemes: {
				title: "Phoneme Frequency",
				description: "Distribution of phonemes across the dictionary corpus",
				tabs: {
					vowels: "Vowels",
					consonants: "Consonants",
					all: "All phonemes",
				},
				chart: {
					label: "Percentage",
					tooltip: {
						labels: {
							phoneme: "Phoneme",
							coverage: "Coverage",
							words: "Words",
						},
					},
				},
			},
			syllables: {
				title: "Syllable Distribution",
				description: "Frequency of words by syllable count",
				"x-axis-label": "Syllables per word",
				chart: {
					label: "Words",
					tooltip: {
						words: "{count} words",
						percentage: "{percentage}% of total",
					},
				},
			},
			"top-phonemes": {
				title: "Top {count} by word coverage",
				info: "Share of CMUDict entries that include the phoneme (word-level coverage).",
				"coverage-label": "Word coverage",
				"words-label": "{count} words",
			},
		},
	},
} as const;
