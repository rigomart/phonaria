import type { Bounds } from "./camera";
import type { Source, Step, Stop } from "./types";

/**
 * The story told on /language-spread: how English came to be, from its
 * Indo-European ancestor to the language most of the world uses. Every stop
 * and card claim is traced to docs/research/language-spread/english.md, which
 * records the evidence and the disagreements behind each one. Places are
 * approximate on purpose.
 */

const WORLD: Bounds = { west: -170, south: -56, east: 190, north: 78 };

export const STOPS: readonly Stop[] = [
	{
		id: "indo-european",
		name: "Indo-European",
		kind: "family",
		era: { yearsAgo: 9500, to: 6000 },
		at: [42, 47],
		areaKm: 800,
		where:
			"the grasslands north of the Black and Caspian Seas, in the leading view; others favour Anatolia or south of the Caucasus",
		description:
			"The ancestor of most languages of Europe, and of Persian and Hindi. Ancient DNA and words for wagons point many scholars to the steppe about 6,000 years ago. Language-tree studies point others to an older start in Anatolia or south of the Caucasus.",
		sources: [
			"haak-2015",
			"anthony-ringe-2015",
			"bouckaert-2012",
			"heggarty-2023",
			"lazaridis-2025",
		],
	},
	{
		id: "germanic",
		name: "Germanic",
		kind: "branch",
		era: { bce: 500 },
		at: [10, 56],
		areaKm: 400,
		where: "in southern Scandinavia and northern Germany",
		description:
			"A distinct Germanic branch had formed here by about 500 BCE. Its western group includes English, Frisian, Dutch and German; its northern group became Icelandic, Norwegian, Swedish and Danish.",
		sources: ["faarlund-2008", "ringe-taylor-2014", "oed-old-english"],
	},
	{
		id: "old-english",
		name: "Old English",
		kind: "language",
		era: { ce: 450 },
		at: [0.5, 52.5],
		areaKm: 200,
		where: "in eastern England, settled from across the North Sea",
		description:
			"Settlers from what is now northern Germany and Denmark crossed the North Sea after Roman rule ended. Ancient DNA shows some people in eastern England got up to three-quarters of their ancestry from them. Their speech became Old English; its oldest substantial manuscripts date from about 700 CE.",
		sources: ["gretzinger-2022", "oed-old-english"],
	},
	{
		id: "old-norse",
		name: "Old Norse",
		kind: "language",
		era: { ce: 800 },
		at: [-1, 53.8],
		areaKm: 220,
		where: "in the east and north of England",
		description:
			"Scandinavians settled mostly in the east and north of England. Their Old Norse died out there, but English kept everyday words from it, such as sky, egg, skin, take and want. It even took the pronouns they, them and their, which languages very rarely borrow.",
		sources: ["oed-middle-english", "nottingham-danelaw"],
	},
	{
		id: "norman-french",
		name: "French in England",
		kind: "language",
		era: { ce: 1066 },
		at: [0.49, 50.91],
		where: "near Hastings; French then spread with England's new rulers",
		description:
			"After 1066, England's rulers in church and state spoke French, and English almost disappeared from writing. When it came back, it was full of French words such as peace, mercy, prison and rule. By 1500 over 40% of all the words English has borrowed from French had arrived.",
		sources: ["english-heritage-hastings", "oed-middle-english"],
	},
	{
		id: "london-english",
		name: "London English",
		kind: "language",
		era: { ce: 1476 },
		at: [-0.13, 51.5],
		where: "at Westminster, beside London",
		description:
			'Caxton set up England\'s first printing press here in 1476. His books spread the English of the London area, though their spelling still varied. He saw English changing too: should he write "egges", a Norse word, or "eyren", the only word a woman in Kent understood?',
		sources: [
			"bl-caxton-life",
			"bl-caxton-english",
			"westminster-abbey-caxton",
			"nottingham-danelaw",
		],
	},
	{
		id: "great-vowel-shift",
		name: "The Great Vowel Shift",
		kind: "change",
		era: { ce: 1400, to: 1700 },
		at: [-1.2, 52.3],
		areaKm: 250,
		where: "across England; northern dialects changed differently",
		description:
			'Long stressed vowels shifted: most moved up in the mouth, while the highest two became glides: "mine" went from /miːn/ to /maɪn/, "house" from /huːs/ to /haʊs/. Most of it happened in the 1400s and 1500s, but some scholars trace the first changes to the 1200s and see several linked changes, not one.',
		sources: ["harvard-gvs", "oed-early-modern", "stenbrenden-2015", "prichard-2014"],
	},
	{
		id: "american-english",
		name: "American English",
		kind: "language",
		era: { ce: 1607 },
		at: [-76.78, 37.21],
		where: "at Jamestown, Virginia, the first lasting English settlement",
		description:
			"Jamestown, founded in 1607, was the first lasting English settlement in North America. Most American accents kept the r after vowels, in words like car; much of southern England later lost it. Noah Webster's 1828 dictionary made its own spellings, like color, standard.",
		sources: ["nps-jamestown", "npg-webster", "trudgill-gordon-2006", "bl-sounds-familiar"],
	},
	{
		id: "australian-english",
		name: "English in Australia",
		kind: "language",
		era: { ce: 1788 },
		at: [151.21, -33.86],
		where: "at Sydney Cove, on Eora land",
		description:
			"The First Fleet of 11 ships set up a convict settlement at Sydney Cove on 26 January 1788, the start of European colonisation of Australia. It changed forever the lives of the Eora people, the land's traditional owners.",
		sources: ["nma-first-fleet"],
	},
];

export const STEPS: readonly Step[] = [
	{
		id: "intro",
		title: "The story of English",
		era: { bce: 4000 },
		paragraphs: [
			"English is one language with a long family history. Its roots reach back thousands of years, to people who never wrote anything down.",
			"Follow it to the language about 1.5 billion people use today, and see why its spelling and sounds so often disagree. Pins mark approximate places, never exact spots.",
		],
		camera: WORLD,
		stops: [],
		routes: [],
	},
	{
		id: "indo-european",
		title: "One ancestor, many languages",
		era: { bce: 4000 },
		paragraphs: [
			"English belongs to the Indo-European family, with most languages of Europe and also Persian and Hindi. All of them come from one ancestor spoken before writing.",
			"Where it was spoken is still argued. Many archaeologists and geneticists favour the grasslands north of the Black Sea, about 6,000 years ago. Language-tree studies point others to an older start further south.",
		],
		card: "bottom-left",
		camera: { west: 5, south: 36, east: 75, north: 62 },
		stops: ["indo-european"],
		routes: [
			[
				[42, 47],
				[30, 49],
				[18, 52],
				[11, 55],
			],
		],
		sources: ["oed-old-english"],
	},
	{
		id: "germanic",
		title: "The Germanic branch",
		era: { bce: 500 },
		paragraphs: [
			"By about 500 BCE, people in southern Scandinavia and northern Germany spoke a language of their own: Germanic.",
			"Its descendants include English, Frisian, Dutch, German and the Scandinavian languages. English sits in the western group, with Frisian, Dutch and German.",
		],
		card: "bottom-left",
		camera: { west: -12, south: 44, east: 30, north: 64 },
		stops: ["germanic"],
		routes: [],
	},
	{
		id: "old-english",
		title: "Across the North Sea",
		era: { ce: 450 },
		paragraphs: [
			"After Roman rule in Britain ended in the early 400s, settlers from what is now northern Germany and Denmark crossed the North Sea. Their speech became Old English.",
			"Most people in Britain then spoke Celtic languages, and what happened to them is still debated. English took very few Celtic words.",
		],
		card: "bottom-left",
		camera: { west: -14, south: 47, east: 14, north: 60 },
		stops: ["old-english"],
		routes: [
			[
				[9.5, 55],
				[5, 54.5],
				[1.5, 52.8],
			],
			[
				[8, 53.6],
				[4, 53],
				[1.6, 52.3],
			],
		],
	},
	{
		id: "vikings",
		title: "Vikings and Old Norse",
		era: { ce: 800 },
		paragraphs: [
			"From the late 700s, Viking raiders and settlers from Scandinavia came to England. Their Old Norse was a close cousin of English.",
			"English took words like sky, egg, skin and window from them, and even the pronouns they, them and their. Borrowing pronouns is very rare; this probably reflects close contact and the similarity of the two languages.",
		],
		card: "bottom-right",
		camera: { west: -14, south: 48, east: 16, north: 63 },
		stops: ["old-norse"],
		routes: [
			[
				[10, 56],
				[4, 55],
				[-0.3, 53.7],
			],
			[
				[5.5, 60.5],
				[-2, 59.5],
				[-6, 57],
				[-3.2, 54.4],
			],
		],
	},
	{
		id: "norman-conquest",
		title: "The Norman Conquest",
		era: { ce: 1066 },
		paragraphs: [
			"In 1066 William, Duke of Normandy, defeated King Harold at Hastings and took the English throne. England's new rulers, in church and state, spoke French.",
			"English almost vanished from writing. When it came back it was full of French words like peace, mercy and rule. This stage, from about 1150 to 1500, is called Middle English.",
		],
		card: "top-right",
		camera: { west: -8, south: 46, east: 8, north: 56 },
		stops: ["norman-french"],
		routes: [
			[
				[-0.2, 49.3],
				[0.1, 50.2],
				[0.33, 50.8],
			],
		],
	},
	{
		id: "great-vowel-shift",
		title: "The Great Vowel Shift",
		era: { ce: 1400, to: 1700 },
		paragraphs: [
			'Between about 1400 and 1700, the long stressed vowels of English changed. Chaucer\'s "mine" sounded like "meen", his "meet" like "mate" without its glide, and his "house" like "hoos".',
			"Spelling didn't keep up. Printing, which reached England in these years, fixed it in its older form. That's why English vowel letters often don't match their sounds, or their sounds in other languages.",
		],
		card: "center-right",
		camera: { west: -10, south: 48, east: 10, north: 58 },
		stops: ["great-vowel-shift"],
		routes: [],
	},
	{
		id: "printing",
		title: "London English and the printing press",
		era: { ce: 1476 },
		paragraphs: [
			"By the late 1300s English was back in books and official records, above all in London, home to writers like Geoffrey Chaucer. In 1476 William Caxton set up England's first printing press at Westminster, and the Canterbury Tales was among his first books.",
			"Printing helped spread London English. Its spelling still varied, but printers slowly made it regular, keeping old spellings while the sounds moved on.",
		],
		card: "top-left",
		camera: { west: -6, south: 49.5, east: 4, north: 55 },
		stops: ["london-english"],
		routes: [],
		sources: ["oed-middle-english", "oed-early-modern"],
	},
	{
		id: "america",
		title: "Across the Atlantic",
		era: { ce: 1607 },
		paragraphs: [
			"In 1607, 104 English men and boys founded Jamestown, Virginia, the first lasting English settlement in North America.",
			"Most American accents kept the r in car and hard, as the accent taught here does; much of southern England later lost it. Noah Webster's 1828 dictionary made spellings like color and theater standard.",
		],
		card: "bottom-left",
		camera: { west: -90, south: 25, east: 5, north: 58 },
		stops: ["american-english"],
		routes: [
			[
				[-0.1, 51.5],
				[-40, 46],
				[-76.8, 37.2],
			],
		],
		sources: ["npg-webster", "merriam-webster-1828"],
	},
	{
		id: "around-the-world",
		title: "Around the world",
		era: { ce: 1788 },
		paragraphs: [
			"In January 1788 a fleet of 11 ships set up a British convict settlement at Sydney Cove, on the land of the Eora people. It began the colonisation of Australia.",
			"English spread with the British Empire, and later with American culture. Today it is spoken in 188 countries, many of them in Africa.",
		],
		card: "top-right",
		camera: { west: 10, south: -45, east: 160, north: 20 },
		stops: ["australian-english"],
		routes: [
			[
				[-0.1, 51.5],
				[-20, 10],
				[18, -36],
				[80, -25],
				[151.2, -33.9],
			],
		],
		sources: ["ethnologue-most-spoken"],
	},
	{
		id: "today",
		title: "Today",
		era: "today",
		paragraphs: [
			"About 1.5 billion people speak English, more than any other language. Most of them learned it as an extra language.",
			"Counting only native speakers, English comes third, after Mandarin Chinese and Spanish.",
		],
		camera: WORLD,
		spin: true,
		stops: [],
		routes: [],
		sources: ["statista-2026", "ethnologue-most-spoken", "british-council-future-english"],
	},
];

/** The overview works listed at the end of the page; each pin lists its own sources. */
export const MAIN_SOURCES: readonly string[] = [
	"oed-old-english",
	"oed-middle-english",
	"oed-early-modern",
	"harvard-gvs",
	"haak-2015",
	"heggarty-2023",
	"gretzinger-2022",
	"bl-caxton-english",
	"ethnologue-most-spoken",
];

const doi = (id: string) => `https://doi.org/${id}`;

/** The works behind the story, listed on the page. Full notes are in docs/research. */
export const SOURCES: readonly Source[] = [
	{
		id: "haak-2015",
		citation: "Haak et al. 2015, Nature",
		title: "Massive migration from the steppe was a source for Indo-European languages in Europe",
		url: doi("10.1038/nature14317"),
	},
	{
		id: "anthony-ringe-2015",
		citation: "Anthony & Ringe 2015, Annual Review of Linguistics",
		title: "The Indo-European homeland from linguistic and archaeological perspectives",
		url: doi("10.1146/annurev-linguist-030514-124812"),
	},
	{
		id: "bouckaert-2012",
		citation: "Bouckaert et al. 2012, Science",
		title: "Mapping the origins and expansion of the Indo-European language family",
		url: doi("10.1126/science.1219669"),
	},
	{
		id: "heggarty-2023",
		citation: "Heggarty et al. 2023, Science",
		title:
			"Language trees with sampled ancestors support a hybrid model for the origin of Indo-European languages",
		url: doi("10.1126/science.abg0818"),
	},
	{
		id: "lazaridis-2025",
		citation: "Lazaridis et al. 2025, Nature",
		title: "The genetic origin of the Indo-Europeans",
		url: doi("10.1038/s41586-024-08531-5"),
	},
	{
		id: "faarlund-2008",
		citation: "Faarlund 2008, Cambridge University Press",
		title: "Ancient Nordic, in The Ancient Languages of Europe",
		url: "https://www.cambridge.org/core/books/abs/ancient-languages-of-europe/ancient-nordic/A6B211A84665BCC23094149FA426BB0C",
	},
	{
		id: "ringe-taylor-2014",
		citation: "Ringe & Taylor 2014, Oxford University Press",
		title: "The Development of Old English",
		url: doi("10.1093/acprof:oso/9780199207848.001.0001"),
	},
	{
		id: "gretzinger-2022",
		citation: "Gretzinger et al. 2022, Nature",
		title: "The Anglo-Saxon migration and the formation of the early English gene pool",
		url: doi("10.1038/s41586-022-05247-2"),
	},
	{
		id: "oed-old-english",
		citation: "Durkin, Oxford English Dictionary",
		title: "Old English – an overview",
		url: "https://web.archive.org/web/20240111083547/https://www.oed.com/discover/old-english-an-overview/",
	},
	{
		id: "oed-middle-english",
		citation: "Durkin, Oxford English Dictionary",
		title: "Middle English – an overview",
		url: "https://web.archive.org/web/20260820012839/https://www.oed.com/discover/middle-english-an-overview/",
	},
	{
		id: "oed-early-modern",
		citation: "Weiner, Oxford English Dictionary",
		title: "Early modern English: grammar, pronunciation, and spelling",
		url: "https://web.archive.org/web/20241225170417/https://www.oed.com/discover/early-modern-english-spelling-grammar-and-pronunciation/",
	},
	{
		id: "nottingham-danelaw",
		citation: "University of Nottingham Manuscripts and Special Collections",
		title: "Danelaw Saga: language and runes",
		url: "https://www.nottingham.ac.uk/manuscriptsandspecialcollections/documents/exhibitions/danelaw-saga/ds-language-and-runes.pdf",
	},
	{
		id: "english-heritage-hastings",
		citation: "English Heritage",
		title: "History of 1066 Battle of Hastings, Abbey and Battlefield",
		url: "https://www.english-heritage.org.uk/visit/places/1066-battle-of-hastings-abbey-and-battlefield/history-and-stories/history/",
	},
	{
		id: "bl-caxton-life",
		citation: "British Library",
		title: "Caxton's Chaucer: Caxton's life",
		url: "https://web.archive.org/web/20201202183431/https://www.bl.uk/treasures/caxton/caxtonslife.html",
	},
	{
		id: "bl-caxton-english",
		citation: "British Library",
		title: "Caxton's Chaucer: Caxton's English",
		url: "https://web.archive.org/web/20201114001854/https://www.bl.uk/treasures/caxton/english.html",
	},
	{
		id: "westminster-abbey-caxton",
		citation: "Westminster Abbey",
		title: "William Caxton",
		url: "https://www.westminster-abbey.org/abbey-commemorations/commemorations/william-caxton",
	},
	{
		id: "harvard-gvs",
		citation: "Harvard's Geoffrey Chaucer Website",
		title: "The Great Vowel Shift",
		url: "https://web.archive.org/web/20251112091356/https://chaucer.fas.harvard.edu/pages/great-vowel-shift",
	},
	{
		id: "stenbrenden-2015",
		citation: "Stenbrenden 2015, John Benjamins",
		title: "The development of early Middle English ō",
		url: doi("10.1075/cilt.334.03ste"),
	},
	{
		id: "prichard-2014",
		citation: "Prichard 2014, Journal of Linguistic Geography",
		title: "Northern dialect evidence for the chronology of the Great Vowel Shift",
		url: doi("10.1017/jlg.2014.9"),
	},
	{
		id: "nps-jamestown",
		citation: "U.S. National Park Service",
		title: "A short history of Jamestown",
		url: "https://www.nps.gov/jame/learn/historyculture/a-short-history-of-jamestown.htm",
	},
	{
		id: "npg-webster",
		citation: "National Portrait Gallery, Smithsonian Institution",
		title: "Noah Webster",
		url: "https://npg.si.edu/object/npg_NPG.67.31",
	},
	{
		id: "merriam-webster-1828",
		citation: "Merriam-Webster",
		title: "Webster's 1828 American Dictionary of the English Language",
		url: "https://www.merriam-webster.com/wordplay/noah-webster-dictionary",
	},
	{
		id: "trudgill-gordon-2006",
		citation: "Trudgill & Gordon 2006, English World-Wide",
		title: "Predicting the past",
		url: doi("10.1075/eww.27.3.02tru"),
	},
	{
		id: "bl-sounds-familiar",
		citation: "British Library",
		title: "Sounds Familiar? Phonological variation",
		url: "https://web.archive.org/web/20151224231447/http://www.bl.uk/learning/langlit/sounds/regional-voices/phonological-variation/",
	},
	{
		id: "nma-first-fleet",
		citation: "National Museum of Australia",
		title: "The First Fleet arrives at Sydney Cove",
		url: "https://digital-classroom.nma.gov.au/defining-moments/first-fleet-arrives-sydney-cove",
	},
	{
		id: "ethnologue-most-spoken",
		citation: "Ethnologue",
		title: "What is the most spoken language?",
		url: "https://www.ethnologue.com/insights/most-spoken-language/",
	},
	{
		id: "statista-2026",
		citation: "Statista, 2026",
		title: "The most spoken languages worldwide in 2026",
		url: "https://www.statista.com/statistics/266808/the-most-spoken-languages-worldwide/",
	},
	{
		id: "british-council-future-english",
		citation: "British Council, reporting David Crystal",
		title: "What's the future of English?",
		url: "https://web.archive.org/web/20260115214447/https://www.britishcouncil.org/voices-magazine/whats-future-english",
	},
];
