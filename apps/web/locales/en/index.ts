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
			title: "Current Phonaria tools",
			description:
				"Preview the transcription studio, phoneme inspector, and IPA reference that are available today.",
		},
		"core-modules-section": {
			title: "Explore the active modules",
			description:
				"Each card shows what the tool does right now. Open the link below any card to jump straight to the workspace.",
			"action-label": "Open workspace",
			"feature-cards": {
				g2p: {
					name: "Transcription studio",
					tagline: "Paste text, inspect IPA",
					description:
						"Turn any sentence into a clean IPA line with stress marks, clickable phonemes, and quick dictionary checks.",
					highlights: {
						input: "Accepts multi-sentence passages and trims stray formatting.",
						selection: "Tap a phoneme chip to read articulation, spelling, and contrast notes.",
						dictionary: "Select a word to open dictionary audio and definitions in a side drawer.",
					},
					preview: {
						"input-label": "Input text",
						"input-example": "thoughtful learner",
						"output-label": "IPA transcription",
						"tap-hint": "Tap a phoneme to inspect articulation, spelling, and contrast info.",
					},
				},
				inspector: {
					name: "Phoneme inspector",
					tagline: "Articulation, spelling, contrasts",
					description:
						"Explains whichever phoneme you clicked in the transcript with diagrams, spelling cues, and minimal pairs.",
					highlights: {
						articulation: "Summarizes place, manner, voicing, and airflow cues for each selection.",
						patterns: "Lists reliable spelling patterns so you can search for extra examples.",
						contrasts: "Links to contrast sets whenever the dataset includes them.",
					},
					preview: {
						"selected-label": "Selected phoneme",
						"keywords-label": "Keywords",
						"keywords-example": "learn, word, nurse",
						"articulation-label": "Articulation notes",
						articulation: {
							first: "Mid-central r-colored vowel with steady tongue root tension.",
							second: "Keep the tip low while the back of the tongue lifts toward the palate.",
						},
						"patterns-label": "Common spellings",
						patterns: {
							first: "er",
							second: "ir",
							third: "ur",
						},
						"note": "Use contrast links in the inspector when you want to compare nearby sounds.",
					},
				},
				"ipa-chart": {
					name: "IPA reference",
					tagline: "Interactive chart with audio",
					description:
						"Browse the General American consonant and vowel grid with audio, diagrams, and keyword cues.",
					highlights: {
						layout: "Switch between vowel and consonant layouts to narrow your focus.",
						cells: "Click any symbol to read articulation diagrams and hear sample audio.",
						keywords: "Skim quick keyword lists before returning to your own transcript.",
					},
					preview: {
						"feature-left": "Interactive cells",
						"feature-right": "Audio ready",
						"vowels-label": "Vowels",
						"consonants-label": "Consonants",
						"hint": "Click a tile to open diagrams, keywords, and audio.",
					},
				},
			},
		},
		"tool-combination-section": {
			title: "Practical study loops",
			description: "Use these routines to connect the transcription studio and IPA reference.",
			suggestions: {
				"transcript-to-chart": {
					title: "Start in the transcription studio, confirm with the chart",
					description:
						"Paste a sentence, note which phonemes feel unsure, then open the IPA reference to review the same sounds in isolation.",
					links: {
						transcription: "Open transcription workspace",
						"ipa-chart": "Check the IPA chart",
					},
				},
				"chart-to-examples": {
					title: "Use the chart to pick a target, then collect your own examples",
					description:
						"Choose a phoneme in the chart, read its spelling cues, then build a list of words in the transcription studio to hear it in context.",
					links: {
						"ipa-chart": "Browse the IPA reference",
						transcription: "Test the sentence or word list",
					},
				},
			},
		},
	},
} as const;
