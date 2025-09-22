import type { MinimalPairSet } from "./types";
import { getExampleAudioUrl } from "./utils/audio";

export const minimalPairSets: MinimalPairSet[] = [
	{
		id: "vowel-short-long-i",
		slug: "short-i-vs-long-ee",
		title: "/ɪ/ vs /iː/: Ship vs. Sheep",
		category: "vowel",
		focusPhonemes: ["ɪ", "iː"],
		summary: "Contrast the relaxed short /ɪ/ with the tense, lengthened /iː/",
		description:
			"Keep the tongue high at the front for both vowels, but shorten and relax /ɪ/ while lengthening /iː/ with tighter lips.",
		tags: ["front vowels", "length", "common ESL"],
		difficulty: "foundational",
		l1Notes:
			"Learners from Japanese, Spanish, and Portuguese backgrounds often merge these vowels due to absent length contrast.",
		articulationHighlights: [
			{
				phoneme: "ɪ",
				headline: "Lax near-high front vowel",
				details: "Tongue sits high and front but remains relaxed and brief with neutral lips.",
			},
			{
				phoneme: "iː",
				headline: "Tense high front vowel",
				details: "Raise the tongue fully high-front, spread the lips, and sustain the vowel.",
			},
		],
		pairs: [
			{
				id: "ship-sheep",
				contrastLabel: "short vs. long vowel",
				description: "The vowel length changes meaning even with identical consonants.",
				practiceNote: "Keep /ɪ/ quick—avoid gliding toward /i/.",
				words: [
					{
						word: "ship",
						phonemic: "ʃɪp",
						graphemeHint: "i",
						audioUrl: getExampleAudioUrl("ship"),
						pronunciationTip: "Relax the tongue and stop the vowel quickly.",
					},
					{
						word: "sheep",
						phonemic: "ʃiːp",
						graphemeHint: "ee",
						audioUrl: getExampleAudioUrl("sheep"),
						pronunciationTip: "Hold the vowel slightly longer with a smile shape.",
					},
				],
			},
			{
				id: "live-leave",
				contrastLabel: "short vs. long vowel",
				description: "The voiced consonant cluster stays the same—only the vowel shifts.",
				practiceNote: "Link into the following consonant without adding a glide.",
				words: [
					{
						word: "live",
						phonemic: "lɪv",
						graphemeHint: "i",
						audioUrl: getExampleAudioUrl("live"),
					},
					{
						word: "leave",
						phonemic: "liːv",
						graphemeHint: "ea",
						audioUrl: getExampleAudioUrl("leave"),
					},
				],
			},
			{
				id: "sit-seat",
				contrastLabel: "short vs. long vowel",
				description: "Listen for the clipped /ɪ/ compared with the gliding /iː/.",
				practiceNote: "Touch the top teeth lightly for the final /t/ to keep timing even.",
				words: [
					{
						word: "sit",
						phonemic: "sɪt",
						graphemeHint: "i",
						audioUrl: getExampleAudioUrl("sit"),
					},
					{
						word: "seat",
						phonemic: "siːt",
						graphemeHint: "ea",
						audioUrl: getExampleAudioUrl("seat"),
					},
				],
			},
			{
				id: "lick-leek",
				contrastLabel: "short vs. long vowel",
				description:
					"A final voiceless consonant makes vowel length harder to hear—focus carefully.",
				practiceNote: "Keep /ɪ/ centered and avoid rounding.",
				words: [
					{
						word: "lick",
						phonemic: "lɪk",
						graphemeHint: "i",
						audioUrl: getExampleAudioUrl("lick"),
					},
					{
						word: "leek",
						phonemic: "liːk",
						graphemeHint: "ee",
						audioUrl: getExampleAudioUrl("leek"),
					},
				],
			},
			{
				id: "fill-feel",
				contrastLabel: "short vs. long vowel",
				description: "Minimal change in letters—listen for the length cue.",
				practiceNote: "Avoid adding a schwa to the /l/ in feel.",
				words: [
					{
						word: "fill",
						phonemic: "fɪl",
						graphemeHint: "i",
						audioUrl: getExampleAudioUrl("fill"),
					},
					{
						word: "feel",
						phonemic: "fiːl",
						graphemeHint: "ee",
						audioUrl: getExampleAudioUrl("feel"),
					},
				],
			},
		],
	},
	{
		id: "vowel-e-vs-ae",
		slug: "open-e-vs-ash",
		title: "/ɛ/ vs /æ/: Bet vs. Bat",
		category: "vowel",
		focusPhonemes: ["ɛ", "æ"],
		summary: "Differentiate the mid-front /ɛ/ from the open-front /æ/",
		description:
			"Drop the jaw further for /æ/, keeping the tongue low and front, while /ɛ/ stays mid-height and tighter.",
		tags: ["front vowels", "jaw height"],
		difficulty: "foundational",
		l1Notes:
			"Speakers of Romance and East Asian languages often under-open the jaw, merging both vowels toward /e/.",
		articulationHighlights: [
			{
				phoneme: "ɛ",
				headline: "Mid front lax vowel",
				details: "Jaw slightly open; tongue relaxed but not low.",
			},
			{
				phoneme: "æ",
				headline: "Open front vowel",
				details: "Jaw opens wide, tongue presses forward and low—feel the stretch.",
			},
		],
		pairs: [
			{
				id: "bet-bat",
				contrastLabel: "mid vs. open vowel",
				description: "Jaw opening is the clearest signal in this pair.",
				practiceNote: "Aim for a brighter, wider sound on /æ/.",
				words: [
					{
						word: "bet",
						phonemic: "bɛt",
						graphemeHint: "e",
						audioUrl: getExampleAudioUrl("bet"),
					},
					{
						word: "bat",
						phonemic: "bæt",
						graphemeHint: "a",
						audioUrl: getExampleAudioUrl("bat"),
					},
				],
			},
			{
				id: "pen-pan",
				contrastLabel: "mid vs. open vowel",
				description: "The nasal ending keeps the vowel duration similar—focus on quality.",
				practiceNote: "Open the jaw then close quickly into /n/ for pan.",
				words: [
					{
						word: "pen",
						phonemic: "pɛn",
						graphemeHint: "e",
						audioUrl: getExampleAudioUrl("pen"),
					},
					{
						word: "pan",
						phonemic: "pæn",
						graphemeHint: "a",
						audioUrl: getExampleAudioUrl("pan"),
					},
				],
			},
			{
				id: "men-man",
				contrastLabel: "mid vs. open vowel",
				description: "A steady nasal pair to reinforce the height difference.",
				practiceNote: "Keep the vowel pure before the nasal.",
				words: [
					{
						word: "men",
						phonemic: "mɛn",
						graphemeHint: "e",
						audioUrl: getExampleAudioUrl("men"),
					},
					{
						word: "man",
						phonemic: "mæn",
						graphemeHint: "a",
						audioUrl: getExampleAudioUrl("man"),
					},
				],
			},
			{
				id: "send-sand",
				contrastLabel: "mid vs. open vowel",
				description: "The consonant cluster adds challenge—keep the vowel clear.",
				practiceNote: "Lightly tap the /d/ in send to avoid altering the vowel.",
				words: [
					{
						word: "send",
						phonemic: "sɛnd",
						graphemeHint: "e",
						audioUrl: getExampleAudioUrl("send"),
					},
					{
						word: "sand",
						phonemic: "sænd",
						graphemeHint: "a",
						audioUrl: getExampleAudioUrl("sand"),
					},
				],
			},
			{
				id: "said-sad",
				contrastLabel: "mid vs. open vowel",
				description: "A common spelling trap—letters stay the same except the final consonant.",
				practiceNote: "Relax the tongue for /ɛ/; drop the jaw and front the tongue for /æ/.",
				words: [
					{
						word: "said",
						phonemic: "sɛd",
						graphemeHint: "ai",
						audioUrl: getExampleAudioUrl("said"),
					},
					{
						word: "sad",
						phonemic: "sæd",
						graphemeHint: "a",
						audioUrl: getExampleAudioUrl("sad"),
					},
				],
			},
		],
	},
	{
		id: "vowel-pull-pool",
		slug: "pull-vs-pool",
		title: "/ʊ/ vs /uː/: Pull vs. Pool",
		category: "vowel",
		focusPhonemes: ["ʊ", "uː"],
		summary: "Contrast the short rounded /ʊ/ with the long, tense /uː/",
		description:
			"Both vowels require rounded lips, but /ʊ/ is shorter with a central tongue, while /uː/ is longer with a tighter high-back position.",
		tags: ["back vowels", "length", "rounded"],
		difficulty: "intermediate",
		l1Notes: "Germanic learners often over-tense /ʊ/, while Romance speakers merge toward /u/.",
		articulationHighlights: [
			{
				phoneme: "ʊ",
				headline: "Short lax back vowel",
				details: "Rounded lips but keep the tongue slightly lower and central.",
			},
			{
				phoneme: "uː",
				headline: "Long tense back vowel",
				details: "Round firmly, pull the tongue high and back, and sustain.",
			},
		],
		pairs: [
			{
				id: "pull-pool",
				contrastLabel: "short vs. long rounded vowel",
				description:
					"Lip rounding stays similar—the difference lives in length and tongue tension.",
				practiceNote: "Keep /ʊ/ short and relaxed before the /l/.",
				words: [
					{
						word: "pull",
						phonemic: "pʊl",
						graphemeHint: "u",
						audioUrl: getExampleAudioUrl("pull"),
					},
					{
						word: "pool",
						phonemic: "puːl",
						graphemeHint: "oo",
						audioUrl: getExampleAudioUrl("pool"),
					},
				],
			},
			{
				id: "full-fool",
				contrastLabel: "short vs. long rounded vowel",
				description: "Same consonants across both syllables—listen for vowel core.",
				practiceNote: "Avoid diphthongizing /uː/.",
				words: [
					{
						word: "full",
						phonemic: "fʊl",
						graphemeHint: "u",
						audioUrl: getExampleAudioUrl("full"),
					},
					{
						word: "fool",
						phonemic: "fuːl",
						graphemeHint: "oo",
						audioUrl: getExampleAudioUrl("fool"),
					},
				],
			},
			{
				id: "foot-food",
				contrastLabel: "short vs. long rounded vowel",
				description: "One of the most frequent listening confusions for English learners.",
				practiceNote: "Keep /uː/ steady—no glide toward /ʊ/.",
				words: [
					{
						word: "foot",
						phonemic: "fʊt",
						graphemeHint: "oo",
						audioUrl: getExampleAudioUrl("foot"),
					},
					{
						word: "food",
						phonemic: "fuːd",
						graphemeHint: "oo",
						audioUrl: getExampleAudioUrl("food"),
					},
				],
			},
			{
				id: "could-cooed",
				contrastLabel: "short vs. long rounded vowel",
				description: "Spelling stays the same—only vowel length signals the meaning.",
				practiceNote: "Keep /ʊ/ central; pull /uː/ farther back.",
				words: [
					{
						word: "could",
						phonemic: "kʊd",
						graphemeHint: "ou",
						audioUrl: getExampleAudioUrl("could"),
					},
					{
						word: "cooed",
						phonemic: "kuːd",
						graphemeHint: "oo",
						audioUrl: getExampleAudioUrl("cooed"),
					},
				],
			},
			{
				id: "pull-peel",
				contrastLabel: "rounded vs. unrounded",
				description: "A bonus contrast mixing vowel quality and length cues.",
				practiceNote: "Feel the lips relax for the /iː/ in peel.",
				words: [
					{
						word: "pull",
						phonemic: "pʊl",
						graphemeHint: "u",
						audioUrl: getExampleAudioUrl("pull"),
					},
					{
						word: "peel",
						phonemic: "piːl",
						graphemeHint: "ee",
						audioUrl: getExampleAudioUrl("peel"),
					},
				],
			},
		],
	},
	{
		id: "consonant-th-vs-s",
		slug: "th-vs-s",
		title: "/θ/ vs /s/: Think vs. Sink",
		category: "consonant",
		focusPhonemes: ["θ", "s"],
		summary: "Contrast the dental fricative /θ/ with the alveolar fricative /s/",
		description:
			"/θ/ pushes air between the tongue tip and teeth, while /s/ channels air along the alveolar ridge behind the teeth.",
		tags: ["fricatives", "dental", "common ESL"],
		difficulty: "foundational",
		l1Notes:
			"Arabic, Spanish, and French speakers often replace /θ/ with /s/ because the non-native dental fricative feels unstable.",
		articulationHighlights: [
			{
				phoneme: "θ",
				headline: "Voiceless dental fricative",
				details: "Rest the tongue lightly between the teeth; let air hiss softly.",
			},
			{
				phoneme: "s",
				headline: "Voiceless alveolar fricative",
				details: "Tongue tip touches the ridge behind the teeth creating a narrow groove for air.",
			},
		],
		pairs: [
			{
				id: "think-sink",
				contrastLabel: "dental vs. alveolar",
				description: "Both start with voiceless fricatives—focus on tongue placement.",
				practiceNote:
					"For /θ/, bite the tongue gently and blow; for /s/, keep it behind the teeth.",
				words: [
					{
						word: "think",
						phonemic: "θɪŋk",
						graphemeHint: "th",
						audioUrl: getExampleAudioUrl("think"),
					},
					{
						word: "sink",
						phonemic: "sɪŋk",
						graphemeHint: "s",
						audioUrl: getExampleAudioUrl("sink"),
					},
				],
			},
			{
				id: "thin-sin",
				contrastLabel: "dental vs. alveolar",
				description: "Minimal difference at the start of the word.",
				practiceNote: "Hold /θ/ slightly longer to feel airflow.",
				words: [
					{
						word: "thin",
						phonemic: "θɪn",
						graphemeHint: "th",
						audioUrl: getExampleAudioUrl("thin"),
					},
					{
						word: "sin",
						phonemic: "sɪn",
						graphemeHint: "s",
						audioUrl: getExampleAudioUrl("sin"),
					},
				],
			},
			{
				id: "thank-sank",
				contrastLabel: "dental vs. alveolar",
				description: "Cluster contrast emphasizes the initiating consonant.",
				practiceNote: "Anchor the /θ/ with gentle tongue pressure between teeth.",
				words: [
					{
						word: "thank",
						phonemic: "θæŋk",
						graphemeHint: "th",
						audioUrl: getExampleAudioUrl("thank"),
					},
					{
						word: "sank",
						phonemic: "sæŋk",
						graphemeHint: "s",
						audioUrl: getExampleAudioUrl("sank"),
					},
				],
			},
			{
				id: "mouth-mouse",
				contrastLabel: "dental vs. alveolar",
				description: "A tricky diphthong pair where only the fricative shifts.",
				practiceNote: "Stay voiceless on both endings—focus on the first consonant.",
				words: [
					{
						word: "mouth",
						phonemic: "maʊθ",
						graphemeHint: "th",
						audioUrl: getExampleAudioUrl("mouth"),
					},
					{
						word: "mouse",
						phonemic: "maʊs",
						graphemeHint: "s",
						audioUrl: getExampleAudioUrl("mouse"),
					},
				],
			},
			{
				id: "math-mass",
				contrastLabel: "dental vs. alveolar",
				description: "Final consonant shift alters the noun entirely.",
				practiceNote: "Release /θ/ softly; keep /s/ sharper.",
				words: [
					{
						word: "math",
						phonemic: "mæθ",
						graphemeHint: "th",
						audioUrl: getExampleAudioUrl("math"),
					},
					{
						word: "mass",
						phonemic: "mæs",
						graphemeHint: "ss",
						audioUrl: getExampleAudioUrl("mass"),
					},
				],
			},
		],
	},
	{
		id: "consonant-r-vs-l",
		slug: "r-vs-l",
		title: "/ɹ/ vs /l/: Rice vs. Lice",
		category: "consonant",
		focusPhonemes: ["ɹ", "l"],
		summary: "Contrast the American English retroflex /ɹ/ with the alveolar lateral /l/",
		description:
			"/ɹ/ curls the tongue tip without touching the ridge, while /l/ taps the ridge and lets air flow around the sides.",
		tags: ["liquids", "retroflex", "common ESL"],
		difficulty: "intermediate",
		l1Notes:
			"Japanese and Korean speakers often substitute /l/ for /ɹ/ because their languages lack the retroflex approximant.",
		articulationHighlights: [
			{
				phoneme: "ɹ",
				headline: "Retroflex approximant",
				details: "Curl the tongue tip up or bunch the tongue without touching the alveolar ridge.",
			},
			{
				phoneme: "l",
				headline: "Alveolar lateral approximant",
				details: "Touch the ridge with the tongue tip and let air pass along the sides.",
			},
		],
		pairs: [
			{
				id: "rice-lice",
				contrastLabel: "retroflex vs. lateral",
				description: "Classic starter pair for distinguishing /ɹ/ and /l/.",
				practiceNote: "Keep the tongue tip off the ridge for /ɹ/.",
				words: [
					{
						word: "rice",
						phonemic: "ɹaɪs",
						graphemeHint: "r",
						audioUrl: getExampleAudioUrl("rice"),
					},
					{
						word: "lice",
						phonemic: "laɪs",
						graphemeHint: "l",
						audioUrl: getExampleAudioUrl("lice"),
					},
				],
			},
			{
				id: "right-light",
				contrastLabel: "retroflex vs. lateral",
				description: "Single-syllable pair for repeated practice.",
				practiceNote: "Imagine a neutral schwa before /ɹ/ to avoid adding a vowel.",
				words: [
					{
						word: "right",
						phonemic: "ɹaɪt",
						graphemeHint: "r",
						audioUrl: getExampleAudioUrl("right"),
					},
					{
						word: "light",
						phonemic: "laɪt",
						graphemeHint: "l",
						audioUrl: getExampleAudioUrl("light"),
					},
				],
			},
			{
				id: "road-load",
				contrastLabel: "retroflex vs. lateral",
				description: "Word-final consonants highlight the difference.",
				practiceNote: "Keep lips rounded for /ɹ/ without touching the ridge.",
				words: [
					{
						word: "road",
						phonemic: "ɹoʊd",
						graphemeHint: "r",
						audioUrl: getExampleAudioUrl("road"),
					},
					{
						word: "load",
						phonemic: "loʊd",
						graphemeHint: "l",
						audioUrl: getExampleAudioUrl("load"),
					},
				],
			},
			{
				id: "rock-lock",
				contrastLabel: "retroflex vs. lateral",
				description: "Initial consonant swap inside the same vowel context.",
				practiceNote: "Stay relaxed on /l/ to avoid turning it into /ɹ/.",
				words: [
					{
						word: "rock",
						phonemic: "ɹɑk",
						graphemeHint: "r",
						audioUrl: getExampleAudioUrl("rock"),
					},
					{
						word: "lock",
						phonemic: "lɑk",
						graphemeHint: "l",
						audioUrl: getExampleAudioUrl("lock"),
					},
				],
			},
			{
				id: "arrive-alive",
				contrastLabel: "retroflex vs. lateral",
				description: "A two-syllable pair to practice in sentences.",
				practiceNote: "Link the /ɹ/ smoothly into the stressed vowel in arrive.",
				words: [
					{
						word: "arrive",
						phonemic: "əɹaɪv",
						graphemeHint: "r",
						audioUrl: getExampleAudioUrl("arrive"),
					},
					{
						word: "alive",
						phonemic: "əlaɪv",
						graphemeHint: "l",
						audioUrl: getExampleAudioUrl("alive"),
					},
				],
			},
		],
	},
];

export const FEATURED_MINIMAL_PAIR_SET_ID = minimalPairSets[0]?.id ?? "";
