import type { Bounds } from "./camera";
import type { Sample, Source, Step, Stop } from "./types";

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
			"north of the Black and Caspian Seas, as most experts think; others say Anatolia (in today's Turkey) or south of the Caucasus Mountains",
		description:
			"The ancestor of most languages in Europe, and of Persian and Hindi. Ancient DNA and old words for wagons lead many experts to the grasslands north of the Black Sea, about 6,000 years ago. Studies that compare language family trees lead others to an older start, in Anatolia or south of the Caucasus.",
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
			"By about 500 BCE, Germanic was a separate branch of the family. Its western group includes English, Frisian, Dutch and German. Its northern group became Icelandic, Norwegian, Swedish and Danish.",
		sources: ["faarlund-2008", "ringe-taylor-2014", "oed-old-english"],
	},
	{
		id: "old-english",
		name: "Old English",
		kind: "language",
		era: { ce: 450 },
		at: [0.5, 52.5],
		areaKm: 200,
		where: "in eastern England, where settlers came from across the North Sea",
		description:
			"After Roman rule ended, settlers from what is now northern Germany and Denmark crossed the North Sea. Ancient DNA shows that some people in eastern England had up to three-quarters of their family roots in these settlers. Their language became Old English. The oldest long texts in it were written around 700 CE.",
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
			"People from Scandinavia settled mostly in the east and north of England. Their language, Old Norse, later died out there. But English kept many everyday words from it, like sky, egg, skin, take and want. It even took they, them and their. Languages very rarely borrow words like these.",
		sources: ["oed-middle-english", "nottingham-danelaw"],
	},
	{
		id: "norman-french",
		name: "French in England",
		kind: "language",
		era: { ce: 1066 },
		at: [0.49, 50.91],
		where: "near Hastings. French then spread with England's new rulers",
		description:
			"After 1066, the people who ruled England and its church spoke French. For a long time, people almost stopped writing in English. When English came back, it had many French words, like peace, mercy, prison and rule. By 1500, more than 40% of all the words English took from French had already arrived.",
		sources: ["english-heritage-hastings", "oed-middle-english"],
	},
	{
		id: "london-english",
		name: "London English",
		kind: "language",
		era: { ce: 1476 },
		at: [-0.13, 51.5],
		where: "at Westminster, next to London",
		description:
			'In 1476, William Caxton set up England\'s first printing press here. His books spread the English of the London area, but spelling still changed from book to book. Caxton saw that English was changing. Should he write "egges", a word from Old Norse, or "eyren", the only word a woman in Kent knew?',
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
		where: "across England. In the north, the vowels changed in a different way",
		description:
			'Long vowels in stressed syllables changed. Most moved higher in the mouth. The two highest became diphthongs: "mine" went from /miːn/ to /maɪn/, and "house" from /huːs/ to /haʊs/. Most of this happened in the 1400s and 1500s. Some experts say it started in the 1200s, as several connected changes, not one.',
		sources: ["harvard-gvs", "oed-early-modern", "stenbrenden-2015", "prichard-2014"],
	},
	{
		id: "american-english",
		name: "American English",
		kind: "language",
		era: { ce: 1607 },
		at: [-76.78, 37.21],
		where: "at Jamestown, Virginia, the first English settlement that lasted",
		description:
			"Jamestown, started in 1607, was the first English settlement in North America that lasted. Most American accents kept the r after vowels, in words like car. Much of southern England later stopped saying it. Noah Webster's 1828 dictionary made his spellings, like color, the standard.",
		sources: ["nps-jamestown", "npg-webster", "trudgill-gordon-2006", "bl-sounds-familiar"],
	},
	{
		id: "australian-english",
		name: "English in Australia",
		kind: "language",
		era: { ce: 1788 },
		at: [151.21, -33.86],
		where: "at Sydney Cove, on the land of the Eora people",
		description:
			"On 26 January 1788, the 11 ships of the First Fleet started a prison settlement at Sydney Cove. This was the start of European colonization of Australia. It changed forever the lives of the Eora people, the traditional owners of the land.",
		sources: ["nma-first-fleet"],
	},
];

export const STEPS: readonly Step[] = [
	{
		id: "intro",
		title: "The story of English",
		era: { bce: 4000 },
		paragraphs: [
			"English has a family history that goes back thousands of years.",
			"Follow it to today, and see why English spelling and sounds often don't match. Pins show rough areas, not exact places.",
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
			"English is part of the Indo-European family, with most languages of Europe, Persian and Hindi. They all come from one old language that nobody wrote down.",
			"Many experts think people spoke it north of the Black Sea, about 6,000 years ago. Others think it started earlier, further south.",
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
			"By about 500 BCE, people in southern Scandinavia and northern Germany spoke Germanic.",
			"English grew from its western group, together with Frisian, Dutch and German.",
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
			"After Roman rule ended in the early 400s, people from today's northern Germany and Denmark settled in Britain. Their language became Old English.",
			"Most people in Britain spoke Celtic languages then, but English took very few Celtic words.",
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
			"From the late 700s, Vikings from Scandinavia came to England. They spoke Old Norse, a close relative of Old English.",
			"English took words like sky, egg and window from them, and even they, them and their. Languages rarely borrow words like these.",
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
			"In 1066, William of Normandy won the Battle of Hastings and became king of England. The new rulers spoke French.",
			"For years, people almost stopped writing in English. When it came back, it had many French words, like peace and rule. This is Middle English (about 1150 to 1500).",
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
			'Between about 1400 and 1700, the long vowels of English changed. "Mine" used to sound like "meen", and "house" like "hoos".',
			"Spelling didn't change with them, and printing kept the old spellings. That's why English vowel letters often don't match their sounds.",
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
			"In 1476, William Caxton set up England's first printing press, at Westminster near London.",
			"Printed books spread London English. Printers slowly made spelling regular, but kept old spellings while the sounds changed.",
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
			"In 1607, English settlers founded Jamestown, Virginia, the first English settlement in North America that lasted.",
			"Most American accents kept the r in words like car, as the accent on this site does. Webster's 1828 dictionary made spellings like color standard.",
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
			"In 1788, British ships brought prisoners to Sydney Cove, on the land of the Eora people. This began the colonization of Australia.",
			"English spread with the British Empire, and later with American culture. Today it is spoken in 188 countries.",
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
			"About 1.5 billion people speak English, more than any other language. Most of them did not grow up speaking it.",
			"Counting only native speakers, English is third, after Mandarin Chinese and Spanish.",
		],
		camera: WORLD,
		spin: true,
		stops: [],
		routes: [],
		sources: ["statista-2026", "ethnologue-most-spoken", "british-council-future-english"],
	},
];

export const SAMPLE_MEANING = "Our Father in heaven, may your name be kept holy.";

/** The opening of the Lord's Prayer (Matthew 6:9) in each stage of English, oldest first, as Cook 1891 traces it. */
export const SAMPLES: readonly Sample[] = [
	{
		id: "old-english",
		step: "old-english",
		stage: "Old English",
		written: "~1000 CE",
		lang: "ang",
		text: "Fæder úre þu þe eart on heofonum; Si þin nama gehalgod",
		gloss: [
			"father",
			"our",
			"you",
			"who",
			"are",
			"in",
			"heavens",
			"be",
			"your",
			"name",
			"hallowed",
		],
		note: "þ = th",
		sources: ["skeat-1887", "cook-1891"],
	},
	{
		id: "middle-english",
		step: "norman-conquest",
		stage: "Middle English",
		written: "~1390",
		lang: "enm",
		text: "Oure fadir that art in heuenes, halewid be thi name",
		gloss: ["our", "father", "who", "are", "in", "heavens", "hallowed", "be", "your", "name"],
		note: "heuenes = heavens",
		sources: ["forshall-madden-1850", "cook-1891"],
	},
	{
		id: "tyndale",
		step: "printing",
		stage: "Tyndale's New Testament",
		written: "1526",
		text: "O oure father which arte in heven/ halowed be thy name.",
		gloss: ["O", "our", "father", "who", "are", "in", "heaven", "hallowed", "be", "your", "name"],
		note: "heven = heaven",
		sources: ["tyndale-1526"],
	},
	{
		id: "king-james",
		stage: "King James Bible",
		written: "1611",
		text: "Our father which art in heauen, hallowed be thy name.",
		note: "heauen = heaven",
		sources: ["king-james-1611"],
	},
	{
		id: "today",
		step: "today",
		stage: "Modern English",
		written: "Today",
		text: SAMPLE_MEANING,
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
		id: "cook-1891",
		citation: "Cook 1891, American Journal of Philology",
		title: "The evolution of the Lord's Prayer in English",
		url: "https://archive.org/details/jstor-287989",
	},
	{
		id: "skeat-1887",
		citation: "Skeat 1887, Cambridge University Press, p. 54",
		title:
			"The Gospel according to Saint Matthew in Anglo-Saxon, Northumbrian, and Old Mercian versions",
		url: "https://objects.library.uu.nl/reader/1874-374575",
	},
	{
		id: "forshall-madden-1850",
		citation: "Forshall & Madden 1850, Oxford University Press, vol. 4, p. 14",
		title:
			"The Holy Bible in the earliest English versions made by John Wycliffe and his followers",
		url: "https://archive.org/details/holybiblecontain04wycluoft/page/n21",
	},
	{
		id: "tyndale-1526",
		citation: "Fry 1862, facsimile of Tyndale's 1526 New Testament",
		title: "The first New Testament printed in the English language",
		url: "https://archive.org/details/firstnewtestame00frygoog/page/n50",
	},
	{
		id: "king-james-1611",
		citation: "King James Bible, 1611, Robert Barker (University of Pennsylvania copy)",
		title: "The Holy Bible, conteyning the Old Testament, and the New",
		url: "https://archive.org/details/Bible1611/page/n1225",
	},
	{
		id: "british-council-future-english",
		citation: "British Council, reporting David Crystal",
		title: "What's the future of English?",
		url: "https://web.archive.org/web/20260115214447/https://www.britishcouncil.org/voices-magazine/whats-future-english",
	},
];
