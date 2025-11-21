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
		"info-button": {
			label: "How to read this chart",
			"label-short": "Guide",
			"aria-consonants": "How to read the consonant chart",
			"aria-monophthongs": "How to read the monophthong vowel chart",
			"aria-diphthongs": "How to read the diphthong vowel chart",
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
