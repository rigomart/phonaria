import type { Bounds } from "./camera";
import type { Source, Step, Stop } from "./types";

/**
 * The story told on /language-spread. Every stop and card claim is traced to
 * docs/research/language-spread, which records the evidence and the
 * disagreements behind each one. Places are approximate on purpose.
 */

const WORLD: Bounds = { west: -170, south: -56, east: 190, north: 78 };

export const STOPS: readonly Stop[] = [
	// Africa and the first journeys
	{
		id: "humans-in-africa",
		name: "Modern humans in Africa",
		kind: "migration",
		era: { yearsAgo: 300000 },
		at: [22, 4],
		areaKm: 2800,
		where: "across Africa; early fossils come from Morocco, Ethiopia and South Africa",
		description:
			"Our species appeared in Africa roughly 300,000 years ago. Early fossils turn up from Morocco to Ethiopia to South Africa, which points to many connected groups across the continent rather than one birthplace.",
		sources: ["hublin-2017", "scerri-2018"],
	},
	{
		id: "leaving-africa",
		name: "Leaving Africa",
		kind: "migration",
		era: { yearsAgo: 70000, to: 50000 },
		at: [43.3, 12.6],
		areaKm: 500,
		where: "the Horn of Africa or Sinai; the route out is still debated",
		description:
			"A group of modern humans left Africa and their descendants spread across the rest of the world. Some studies favour a crossing at the southern end of the Red Sea, others a route through Egypt and Sinai. Smaller, earlier trips almost certainly happened too.",
		sources: ["pagani-2015", "armitage-2011", "bae-2017"],
	},
	{
		id: "sahul",
		name: "Reaching Australia",
		kind: "migration",
		era: { yearsAgo: 65000, to: 50000 },
		at: [132.9, -12.5],
		where:
			"northern Australia, at the oldest dated site; Australia and New Guinea were then one landmass",
		description:
			"People reached Australia and New Guinea, then one landmass, tens of thousands of years ago. The oldest site in northern Australia has been dated to about 65,000 years ago, though some researchers think 50,000 is safer.",
		sources: ["clarkson-2017", "oconnell-2018", "malaspinas-2016"],
	},

	{
		id: "peopling-americas",
		name: "Into the Americas",
		kind: "migration",
		era: { yearsAgo: 16000, to: 15000 },
		at: [-165, 64],
		areaKm: 1000,
		where: "around the Bering Strait, where land then joined Siberia and Alaska",
		description:
			"The first Americans came from northeast Asia by way of Beringia. Sites from about 16,000 to 14,500 years ago, from Idaho to southern Chile, are widely accepted. Several studies date footprints in New Mexico to about 23,000 years ago, but how early people arrived is still debated.",
		sources: [
			"moreno-mayar-2018",
			"dillehay-2015",
			"davis-2022",
			"bennett-2021",
			"pigati-2023",
			"holliday-2025",
			"oviatt-2022",
		],
	},

	// Families of the last 10,000 years
	{
		id: "afroasiatic",
		name: "Afroasiatic",
		kind: "family",
		era: { yearsAgo: 10000 },
		at: [31, 18],
		areaKm: 1200,
		where: "in northeast Africa near the Nile, in the majority view; some place it in the Levant",
		description:
			"The family of Arabic, Hebrew, ancient Egyptian, Berber, Hausa, Somali and Amharic. Its age is uncertain; some estimates place its beginnings more than 10,000 years ago. Most scholars place its start in northeast Africa; a few argue for the Levant.",
		sources: ["huehnergard-2008", "ehret-2004", "militarev-2002"],
	},
	{
		id: "sino-tibetan",
		name: "Sino-Tibetan",
		kind: "family",
		era: { yearsAgo: 7200, to: 5900 },
		at: [112.5, 35.5],
		areaKm: 400,
		where:
			"the middle Yellow River in northern China, in two dated studies; others favour the eastern Himalaya",
		description:
			"Chinese, Tibetan and Burmese share an ancestor. Two studies of language trees place it among millet farmers on the Yellow River; other scholars place it in the eastern Himalaya, where the family's branches are most varied.",
		sources: ["sagart-2019", "zhang-2019", "van-driem-2018"],
	},
	{
		id: "indo-european",
		name: "Indo-European",
		kind: "family",
		era: { yearsAgo: 8000, to: 6000 },
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
		id: "pama-nyungan",
		name: "Pama-Nyungan",
		kind: "family",
		era: { yearsAgo: 5700 },
		at: [139.5, -17.7],
		areaKm: 300,
		where: "the Gulf Plains, south of the Gulf of Carpentaria",
		description:
			"The family covering most of Australia. A study of 306 of its languages traces it to the Gulf Plains in the last 6,000 years or so, long after people first arrived. It probably spread with new ideas and customs rather than a big movement of people.",
		sources: ["bouckaert-2018"],
	},
	{
		id: "trans-new-guinea",
		name: "Trans-New Guinea",
		kind: "family",
		era: { yearsAgo: 10000, to: 6000 },
		at: [145, -6],
		areaKm: 300,
		where: "the central highlands of Papua New Guinea, a proposed homeland",
		description:
			"New Guinea has more than 900 languages in at least 23 families. Trans-New Guinea, one of the world's largest families, may have spread with farming from the highlands, though where its edges lie is still argued.",
		sources: ["greenhill-2015", "mona-2007"],
	},
	{
		id: "atlantic-congo",
		name: "Atlantic-Congo",
		kind: "family",
		at: [-2, 9],
		areaKm: 1800,
		where: "in West Africa; its homeland is uncertain",
		description:
			"The largest language family by number of languages, about 1,400, including Bantu. It is the well-supported core of a broader grouping called Niger-Congo, and linguists still argue about which other West African groups belong.",
		sources: ["glottolog", "guldemann-2018"],
	},
	{
		id: "bantu",
		name: "Bantu",
		kind: "branch",
		era: { yearsAgo: 5000, to: 4000 },
		at: [10.5, 6],
		areaKm: 300,
		where: "the borderland of today's Nigeria and Cameroon",
		description:
			"People speaking an early Bantu language moved out from here and, over thousands of years, across most of Africa south of the equator. More than 500 Bantu languages descend from it. Whether they went through the rainforest or around it is debated.",
		sources: ["koile-2022", "grollemund-2015", "fortes-lima-2024"],
	},
	{
		id: "click-languages",
		name: "Click-language families",
		kind: "family",
		at: [21, -22],
		areaKm: 700,
		where: "the Kalahari in Namibia and Botswana, plus two languages in Tanzania",
		description:
			"'Khoisan' names the click languages of southern and eastern Africa, but they are not one family and have no agreed date. Linguists see three families in the Kalahari and two lone languages in Tanzania. Bantu-speaking farmers later spread across much of the region, mixing with and displacing earlier communities.",
		sources: ["guldemann-2014", "skoglund-2017"],
	},
	{
		id: "austronesian",
		name: "Austronesian",
		kind: "family",
		era: { yearsAgo: 5200 },
		at: [121, 23.7],
		areaKm: 200,
		where: "Taiwan",
		description:
			"Austronesian languages, from Tagalog to Hawaiian to Malagasy, trace back to Taiwan about 5,000 years ago. Seafarers carried them across half the globe, from Easter Island to Madagascar.",
		sources: ["gray-2009", "lipson-2014", "ko-2014"],
	},
	{
		id: "island-southeast-asia",
		name: "Into the islands",
		kind: "branch",
		era: { yearsAgo: 4000 },
		at: [121.5, 13.5],
		where: "the Philippines, then Borneo, Sulawesi and Java",
		description:
			"Austronesian speakers left Taiwan about 4,000 years ago for the Philippines and the islands beyond. They reached the Mariana Islands, far out in the Pacific, by about 3,500 years ago.",
		sources: ["ko-2014", "lipson-2014", "pugach-2021"],
	},
	{
		id: "dravidian",
		name: "Dravidian",
		kind: "family",
		era: { yearsAgo: 4500 },
		at: [79, 20],
		areaKm: 800,
		where: "somewhere in South Asia; the homeland is not known",
		description:
			"The family of Tamil, Telugu, Kannada and Malayalam, about 4,500 years old. Where it began is not known, and a link to the Indus civilization is a guess, not a finding. Brahui, far off in Pakistan, is one of its puzzles.",
		sources: ["kolipakam-2018"],
	},
	{
		id: "austroasiatic",
		name: "Austroasiatic",
		kind: "family",
		at: [103, 17],
		areaKm: 700,
		where: "in mainland Southeast Asia, one of several proposed homelands",
		description:
			"Vietnamese, Khmer and the Munda languages of India belong to one old family. Its homeland is debated: some place it by the Mekong, some in southern China, some near the Bay of Bengal.",
		sources: ["sidwell-2010", "lipson-2018"],
	},
	{
		id: "tai-kadai",
		name: "Kra-Dai",
		kind: "family",
		era: { yearsAgo: 4000 },
		at: [109, 22.5],
		areaKm: 300,
		where:
			"coastal Guangxi and Guangdong in southern China, the homeland one study favours; others place it inland",
		description:
			"Thai and Lao belong to a family about 4,000 years old. One study traces it to the south China coast, from where its speakers spread to Hainan, inland, and later south into mainland Southeast Asia.",
		sources: ["tao-2023"],
	},
	{
		id: "uralic",
		name: "Uralic",
		kind: "family",
		era: { yearsAgo: 4500 },
		at: [60, 58],
		areaKm: 900,
		where: "around the Ural Mountains; scholars disagree on which side",
		description:
			"Finnish, Estonian, Sami and Hungarian are related, though now far apart. Their ancestor was spoken around the Urals about 4,500 years ago or earlier. One study places it in western Siberia; another on the Kama River west of the mountains.",
		sources: ["grunthal-2022", "parpola-2022", "lamnidis-2018"],
	},

	{
		id: "uto-aztecan",
		name: "Uto-Aztecan",
		kind: "family",
		era: { yearsAgo: 9000, to: 5000 },
		at: [-110.9, 30.7],
		areaKm: 900,
		where:
			"somewhere between the Great Basin and western Mexico; the homeland is the open question",
		description:
			"Shoshone, Hopi and Nahuatl belong to this family, which stretches from the western United States to central Mexico. Some scholars think it began with hunter-gatherers in the Great Basin, others with maize farmers farther south, in western Mexico.",
		sources: ["merrill-2009", "kemp-2010"],
	},
	{
		id: "mayan",
		name: "Mayan",
		kind: "family",
		era: { bce: 2200 },
		at: [-91.4, 15.8],
		areaKm: 200,
		where: "in the highlands of Guatemala, in the dominant view",
		description:
			"About 30 Mayan languages, spoken by millions, grew from one ancestor. Its date is an old estimate that newer models stretch both earlier and later. Classic Maya kings carved texts in a hieroglyphic script between about 250 and 900 CE.",
		sources: ["law-2013", "kelly-2017"],
	},
	{
		id: "tupian",
		name: "Tupian",
		kind: "family",
		era: { yearsAgo: 3000 },
		at: [-62.5, -11],
		areaKm: 300,
		where:
			"in Rondônia in the southwestern Amazon, in the view of many researchers; others favour where the Madeira meets the Amazon",
		description:
			"Tupian languages spread widely across lowland South America. Its Tupi-Guarani branch later spread along rivers to the Atlantic coast and south to Paraguay, where Guaraní is an official language alongside Spanish.",
		sources: ["santos-2015", "gerardi-2023", "paraguay-constitution"],
	},
	{
		id: "arawakan",
		name: "Arawakan",
		kind: "family",
		at: [-67, -8],
		areaKm: 600,
		where: "in western Amazonia by one model; others favour the northwest Amazon",
		description:
			"One of the most widely scattered families in the Americas, once spoken from the Caribbean to the Andean foothills. Arawakan speakers moved into the Caribbean islands from about 2,500 years ago; their descendants included the Taíno.",
		sources: ["walker-ribeiro-2011", "schroeder-2018"],
	},

	// Early writing and the first millennium BCE
	{
		id: "hittite",
		name: "Hittite",
		kind: "language",
		era: { bce: 1900, to: 1600 },
		at: [34.6, 40],
		areaKm: 250,
		where: "central Anatolia, in today's Turkey",
		description:
			"The oldest Indo-European language we can read. Names and words turn up in merchants' letters from about 1900 BCE, and full Hittite texts follow. It belongs to the Anatolian branch of Indo-European, whose languages have all died out.",
		sources: ["kloekhorst-2019", "lazaridis-2025"],
	},
	{
		id: "indo-iranian",
		name: "Indo-Iranian",
		kind: "branch",
		era: { yearsAgo: 4000 },
		at: [59.5, 52.6],
		areaKm: 500,
		where: "on the steppe south of the Urals, in one reconstruction",
		description:
			"Sanskrit, Persian, Hindi and Kurdish share this ancestor. Groups carrying it moved south from the steppe into Iran and South Asia over the following centuries, after the Indus cities had declined.",
		sources: ["narasimhan-2019", "shinde-2019"],
	},
	{
		id: "sanskrit",
		name: "Sanskrit",
		kind: "language",
		era: { bce: 1500, to: 1000 },
		at: [73, 31],
		areaKm: 400,
		where: "in the Punjab and the upper Indus plains, judging by the rivers its hymns name",
		description:
			"The Rigveda is the oldest text in Sanskrit, composed in the second half of the second millennium BCE. Its hymns were passed down by memory for a very long time before anyone wrote them down.",
		sources: ["jamison-brereton-2020"],
	},
	{
		id: "chinese-writing",
		name: "Shang Chinese",
		kind: "language",
		era: { bce: 1250 },
		at: [114.3, 36.1],
		where: "Anyang, the late Shang capital in northern China",
		description:
			"The oldest clear Chinese writing is cut into animal bones and turtle shells, which Shang kings used to put questions to their ancestors.",
		sources: ["anderson-2015", "smithsonian-oracle-bone"],
	},
	{
		id: "japonic",
		name: "Japonic",
		kind: "family",
		era: { yearsAgo: 3000 },
		at: [127, 35.3],
		areaKm: 250,
		where: "the southern Korean peninsula, then across to Kyushu",
		description:
			"Japanese probably came to Japan about 3,000 years ago with rice farmers from the Korean peninsula, who mixed with the hunter-gatherers already there. Whether Japanese and Korean are distantly related to Turkic and Mongolic is still argued.",
		sources: ["robbeets-2021", "cooke-2021"],
	},
	{
		id: "lapita",
		name: "Lapita voyagers",
		kind: "branch",
		era: { yearsAgo: 3000 },
		at: [152, -4.5],
		areaKm: 500,
		where: "the Bismarck Islands off New Guinea, the likely starting area",
		description:
			"Voyagers known for their stamped pottery sailed east into islands no one had lived on before, reaching Vanuatu, Fiji, Tonga and Samoa. Later migrants changed who lived there, but the islanders kept Austronesian languages.",
		sources: ["skoglund-2016", "posth-2018", "almeida-2025"],
	},
	{
		id: "latin",
		name: "Latin",
		kind: "language",
		era: { bce: 800 },
		at: [12.5, 41.9],
		where: "Rome and the surrounding region of Latium",
		description:
			"Latin began as the speech of Rome and its neighbours. As Roman power grew, it became the common language of Italy, then the western Mediterranean, and the everyday Latin of ordinary people later grew into Spanish, French, Italian, Portuguese and Romanian.",
		sources: ["coleman-2015", "adams-2007"],
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
			"A distinct Germanic branch had formed here by about 500 BCE. After Roman rule in Britain ended, settlers crossing the North Sea brought the ancestor of English with them.",
		sources: ["faarlund-2008", "ringe-taylor-2014", "gretzinger-2022"],
	},
	{
		id: "basque",
		name: "Basque",
		kind: "language",
		at: [-2, 43],
		where: "on both sides of the western Pyrenees",
		description:
			"Basque is related to no other living language. It survived while Indo-European languages spread all around it, and where it came from is unknown.",
		sources: ["trask-1997"],
	},

	// The first millennium CE
	{
		id: "arabic",
		name: "Arabic",
		kind: "language",
		era: { ce: 630 },
		at: [39.6, 24.5],
		areaKm: 600,
		where: "in western Arabia, around Medina and Mecca",
		description:
			"Arabic was already written by the 4th century CE. Beginning with the Islamic conquests of the 630s, it spread across the Middle East and North Africa, and later into Spain and Central Asia. People switched to it gradually, often after long periods of speaking two languages.",
		sources: ["louvre-namara", "pat-el-stokes-2022", "owens-2013"],
	},
	{
		id: "swahili",
		name: "Swahili",
		kind: "language",
		era: { ce: 800 },
		at: [39.2, -6],
		areaKm: 500,
		where: "the East African coast and islands, from Mombasa to Kilwa",
		description:
			"A Bantu language of the East African coast. Centuries of Indian Ocean trade gave it many Arabic words, and it grew into a shared language across East and Central Africa.",
		sources: ["brielle-2023", "schadeberg-2009", "unesco-kiswahili"],
	},
	{
		id: "malagasy",
		name: "Malagasy",
		kind: "language",
		era: { ce: 700, to: 800 },
		at: [47, -19],
		where: "Madagascar, settled by sailors from southern Borneo",
		description:
			"Madagascar's language is closest to languages of southern Borneo, thousands of kilometres away. Sailors probably crossed the Indian Ocean in the 7th or 8th century, likely by way of East Africa and the Comoros.",
		sources: ["adelaar-2016", "crowther-2016", "kusuma-2016"],
	},
	{
		id: "turkic",
		name: "Turkic",
		kind: "family",
		era: { ce: 550 },
		at: [102.5, 47.5],
		areaKm: 600,
		where: "in Mongolia and southern Siberia",
		description:
			"Turkish, Kazakh, Uzbek and Uyghur share an ancestor spoken about 2,100 years ago. From the 6th century, Turkic-speaking peoples spread west across the steppe, replacing the languages spoken there before.",
		sources: ["savelyev-robbeets-2020", "sinor-1990", "damgaard-2018"],
	},
	{
		id: "hungarian",
		name: "Hungarian",
		kind: "language",
		era: { ce: 895 },
		at: [19.5, 47],
		where: "the Carpathian Basin, in today's Hungary",
		description:
			"Hungarian is a Uralic language, distantly related to Finnish. It came west with the Magyar tribes, who moved from the Pontic steppe into the Carpathian Basin between about 895 and 905.",
		sources: ["neparaczki-2018"],
	},
	{
		id: "turkish",
		name: "Turkish",
		kind: "language",
		era: { ce: 1071 },
		at: [42.5, 39.2],
		where: "eastern Anatolia, where the battle of Manzikert was fought",
		description:
			"In 1071 a Seljuk army defeated the Byzantine emperor at Manzikert, and Byzantium could no longer stop Turkish settlers moving into Anatolia. Turkish slowly became the main language of what is now Turkey.",
		sources: ["fleet-2009"],
	},
	{
		id: "east-polynesia",
		name: "East Polynesia",
		kind: "branch",
		era: { ce: 1025, to: 1290 },
		at: [210.5, -17.5],
		areaKm: 500,
		where: "the Society Islands, around Tahiti, the first landfall",
		description:
			"Polynesian sailors reached the Society Islands first, then Hawaii, Rapa Nui and New Zealand within about two centuries. Older timelines put this much earlier; recent radiocarbon dating favours the shorter one.",
		sources: ["wilmshurst-2011", "hunt-lipo-2006"],
	},
	{
		id: "maori",
		name: "Māori",
		kind: "language",
		era: { ce: 1280 },
		at: [176.5, -38.3],
		where: "the North Island of New Zealand",
		description:
			"New Zealand was one of the last large places people settled. Polynesian voyagers arrived around 1280, dated by the rats they brought with them, and their language became Māori.",
		sources: ["wilmshurst-2008", "wilmshurst-2011"],
	},

	{
		id: "inuit",
		name: "Inuit",
		kind: "branch",
		era: { ce: 1000, to: 1300 },
		at: [-156.8, 71.3],
		areaKm: 500,
		where: "on the coast of northern Alaska",
		description:
			"The ancestors of today's Inuit spread east from Alaska across the Arctic to Greenland within a few centuries; recent dating favours the 1200s. Their language still forms one long chain of dialects from Alaska to Greenland.",
		sources: ["friesen-arnold-2008", "gullov-mcghee-2006"],
	},
	{
		id: "navajo-apache",
		name: "Navajo and Apache",
		kind: "branch",
		era: { ce: 1200, to: 1500 },
		at: [-109.4, 36.3],
		areaKm: 350,
		where: "in the Four Corners region of the American Southwest",
		description:
			"Navajo and the Apache languages belong to the Dene (Athabaskan) family of Alaska and western Canada. Their speakers' ancestors came south from the far north. When, and by which route, is still debated.",
		sources: ["anlc-languages", "crow-canyon"],
	},
	{
		id: "nahuatl",
		name: "Nahuatl",
		kind: "language",
		era: { ce: 1325 },
		at: [-99.13, 19.43],
		where: "Tenochtitlan, today's Mexico City",
		description:
			"The Mexica spoke Nahuatl, a Uto-Aztecan language, and founded Tenochtitlan around 1325. In 1428 they allied with two other cities to build what we call the Aztec Empire.",
		sources: ["natgeo-aztec"],
	},
	{
		id: "quechua",
		name: "Quechua",
		kind: "language",
		era: { ce: 1400, to: 1532 },
		at: [-71.97, -13.53],
		where: "Cusco, the Inca capital",
		description:
			"Quechua is a family of related languages. It grew out of central Peru and had spread widely centuries before the Incas, who promoted a form of it across their empire, as far as southern Bolivia.",
		sources: ["heggarty-beresford-jones-2010", "adelaar-2017"],
	},

	// Ships and empires
	{
		id: "spanish",
		name: "Spanish",
		kind: "language",
		era: { ce: 1492 },
		at: [-3.7, 40.4],
		where: "in Castile, central Spain; most ships sailed from Seville and Cádiz",
		description:
			"From 1492, Spanish ships carried Castilian to the Caribbean, then Mexico and South America. About 500 million people now speak it as a first language, and Mexico has more speakers than any other country.",
		sources: ["loc-taino", "cervantes-2025", "gaceta-unam"],
	},
	{
		id: "portuguese",
		name: "Portuguese",
		kind: "language",
		era: { ce: 1500 },
		at: [-9.1, 38.7],
		where: "in Lisbon, where the fleets sailed from",
		description:
			"In 1500 a Portuguese fleet reached the coast of Brazil, and the language later took root in parts of Africa, such as Mozambique. Brazil, with about 200 million people, is by far the largest Portuguese-speaking country.",
		sources: ["fausto-2014", "ibge-2022", "rilp-2021"],
	},
	{
		id: "english",
		name: "English",
		kind: "language",
		era: { ce: 1607 },
		at: [-0.1, 51.5],
		where: "in England; London stands in for its ports and trading companies",
		description:
			"English travelled with settlers, traders and soldiers, from Jamestown in 1607 to Sydney in 1788 and across the British Empire. Counting people who speak it as an extra language, it now has more speakers than any other.",
		sources: ["nps-jamestown", "nma-first-fleet", "ethnologue-most-spoken"],
	},
	{
		id: "french",
		name: "French",
		kind: "language",
		era: { ce: 1608 },
		at: [2.35, 48.9],
		where: "in France; Paris stands in for the court and its colonies",
		description:
			"French colonists founded Quebec City in 1608. From the late 1800s, French spread through colonial rule and schooling in much of West and Central Africa. The Francophonie counts several hundred million speakers today, most of them in Africa.",
		sources: ["champlain", "loc-french-west-africa", "oif-2026"],
	},
	{
		id: "russian",
		name: "Russian",
		kind: "language",
		era: { ce: 1582 },
		at: [37.6, 55.75],
		where: "in Muscovy; expeditions set out from the Urals",
		description:
			"In the 1580s Cossacks crossed the Ural Mountains into Siberia, and within about sixty years Russians had reached the Pacific coast. In the 1800s Russian also spread into Central Asia.",
		sources: ["bassin-1999", "morrison-2021"],
	},
	{
		id: "creoles",
		name: "New languages",
		kind: "language",
		era: { ce: 1600, to: 1800 },
		at: [-72.2, 19.8],
		where: "in Haiti, one of many places creoles formed",
		description:
			"Where people with no shared language were thrown together by trade, plantations and slavery, new languages grew. Haitian Creole formed between French colonists and enslaved Africans in Saint-Domingue; Tok Pisin grew through Pacific labour and plantation networks.",
		sources: ["apics-haitian-creole", "apics-tok-pisin"],
	},
];

export const STEPS: readonly Step[] = [
	{
		id: "intro",
		title: "How languages spread",
		era: { yearsAgo: 70000 },
		paragraphs: [
			"Every language alive today was carried somewhere by people: walking, sailing, farming, trading or conquering. Follow some of the great journeys, from modern humans leaving Africa to the languages most of the world speaks now.",
			"Pins mark approximate places in each part of the story, never exact spots. Where experts disagree, the story says so.",
		],
		camera: WORLD,
		stops: [],
		routes: [],
	},
	{
		id: "africa",
		title: "People who could already talk",
		era: { yearsAgo: 70000 },
		paragraphs: [
			"Our species appeared in Africa roughly 300,000 years ago. By the time some groups set out for Asia, people were almost certainly talking.",
			"Nobody knows where or when language began. Speech leaves no fossils, and bones and genes can't settle it. But every human group alive today has a full language, so the ability is very probably older than the journeys out of Africa.",
		],
		camera: { west: -20, south: -36, east: 55, north: 38 },
		stops: ["humans-in-africa"],
		routes: [],
		sources: ["hauser-2014", "dediu-levinson-2013"],
	},
	{
		id: "out-of-africa",
		title: "Out of Africa",
		era: { yearsAgo: 60000 },
		paragraphs: [
			"Between about 70,000 and 50,000 years ago, a group of modern humans left Africa. Their descendants spread across the rest of the world, carrying language with them.",
			"Tens of thousands of years ago, people reached Australia and New Guinea, then joined as one landmass.",
		],
		camera: { west: 20, south: -40, east: 150, north: 45 },
		stops: ["leaving-africa", "sahul"],
		routes: [
			[
				[43.3, 12.6],
				[52, 17],
				[60, 23],
				[70, 22],
				[82, 15],
				[95, 15],
				[105, 2],
				[118, -8],
				[132.9, -12.5],
			],
			[
				[43.3, 12.6],
				[45, 24],
				[48, 33],
				[60, 42],
			],
		],
	},
	{
		id: "americas",
		title: "Into the Americas",
		era: { yearsAgo: 15000 },
		paragraphs: [
			"People first reached the Americas from northeast Asia, across land that then joined Siberia and Alaska. Most researchers agree they were south of the ice sheets by about 15,000 years ago; some sites hint at earlier arrivals.",
			"They may have travelled down the Pacific coast, since an inland route between the ice sheets probably opened later.",
		],
		camera: { west: -175, south: -50, east: -40, north: 72 },
		stops: ["peopling-americas"],
		routes: [
			[
				[-165, 64],
				[-148, 59],
				[-130, 51],
				[-120, 36],
				[-104, 19],
				[-84, 8],
				[-80, -4],
				[-75, -22],
				[-73.2, -41.5],
			],
		],
		sources: ["pedersen-2016"],
	},
	{
		id: "afroasiatic",
		title: "Afroasiatic",
		era: { yearsAgo: 10000 },
		paragraphs: [
			"The language families linguists can trace are far younger than language itself. One of the oldest links Arabic, Hebrew, ancient Egyptian, Berber, Hausa and Somali.",
			"Its age is uncertain, but some estimates reach back more than 10,000 years. Most scholars place its start in northeast Africa; a few argue for the Levant.",
		],
		camera: { west: -15, south: 0, east: 55, north: 40 },
		stops: ["afroasiatic"],
		routes: [
			[
				[31, 18],
				[31, 28.9],
			],
			[
				[31, 18],
				[15, 26],
				[1.5, 25.9],
			],
			[
				[31, 18],
				[20, 13],
				[14, 10.4],
			],
			[
				[31, 18],
				[37.8, 5.3],
			],
			[
				[31, 18],
				[41.8, 29.2],
			],
		],
	},
	{
		id: "sino-tibetan",
		title: "Millet farmers of the Yellow River",
		era: { bce: 5000 },
		paragraphs: [
			"Chinese, Tibetan and Burmese share an ancestor. Two studies of language trees place it among millet farmers on the Yellow River, about 7,200 to 5,900 years ago.",
			"Other scholars put the start in the eastern Himalaya, where the family's branches are most varied.",
		],
		camera: { west: 80, south: 15, east: 125, north: 42 },
		stops: ["sino-tibetan"],
		routes: [
			[
				[112.5, 35.5],
				[100, 33],
				[91, 31],
			],
			[
				[112.5, 35.5],
				[104, 29],
				[97, 25],
			],
			[
				[112.5, 35.5],
				[114, 30.5],
			],
		],
	},
	{
		id: "indo-european",
		title: "Indo-European",
		era: { bce: 4000 },
		paragraphs: [
			"Most languages of Europe, along with Persian and Hindi, come from one ancestor spoken before writing. Where it was spoken is still argued.",
			"Many archaeologists and geneticists favour the grasslands north of the Black Sea, about 6,000 years ago. Language-tree studies point others to an older start south of the Caucasus or in Anatolia. Recent work on both sides points toward the Caucasus.",
		],
		camera: { west: -10, south: 30, east: 75, north: 62 },
		stops: ["indo-european"],
		routes: [
			[
				[42, 47],
				[30, 49],
				[14, 50],
			],
			[
				[42, 47],
				[52, 51],
				[60, 52.5],
			],
		],
	},
	{
		id: "sahul-families",
		title: "Australia and New Guinea",
		era: { bce: 4000 },
		paragraphs: [
			"People had lived in Australia for tens of thousands of years. Yet Pama-Nyungan, the family covering most of the continent, spread from the Gulf of Carpentaria only in the last 6,000 years or so.",
			"New Guinea has more languages than almost anywhere. Many belong to Trans-New Guinea, which may have spread with farming from the highlands.",
		],
		camera: { west: 112, south: -42, east: 156, north: 2 },
		stops: ["pama-nyungan", "trans-new-guinea"],
		routes: [
			[
				[139.5, -17.7],
				[128, -25],
			],
			[
				[139.5, -17.7],
				[118, -22],
			],
			[
				[139.5, -17.7],
				[147, -33],
			],
			[
				[145, -6],
				[137.5, -4],
			],
			[
				[145, -6],
				[147.5, -8.5],
			],
		],
	},
	{
		id: "bantu",
		title: "The Bantu expansion",
		era: { bce: 3000 },
		paragraphs: [
			"About 5,000 years ago, people speaking an early Bantu language began moving out from the borderland of today's Nigeria and Cameroon. Over thousands of years their descendants spread east and south across Africa.",
			"Today more than 500 Bantu languages, from Swahili to Zulu, trace back to them.",
		],
		camera: { west: -12, south: -36, east: 52, north: 16 },
		stops: ["atlantic-congo", "bantu", "click-languages"],
		routes: [
			[
				[10.5, 6],
				[20, -3],
				[31, -1.5],
				[38.5, -6],
			],
			[
				[10.5, 6],
				[13, -6],
				[20, -15],
				[29, -24],
			],
		],
	},
	{
		id: "austronesian",
		title: "Out of Taiwan",
		era: { bce: 3000 },
		paragraphs: [
			"Austronesian languages, from Tagalog to Hawaiian to Malagasy, trace back to Taiwan about 5,000 years ago.",
			"From there, sailors and farmers carried them south through the Philippines and into Borneo, Sulawesi and Java over the next couple of thousand years.",
		],
		camera: { west: 95, south: -12, east: 160, north: 28 },
		stops: ["austronesian", "island-southeast-asia"],
		routes: [
			[
				[121, 23.7],
				[121, 17],
				[120, 11],
				[117, 5],
				[114, 1],
			],
			[
				[121.5, 13.5],
				[124, 7],
				[120.5, -2],
			],
			[
				[114, 1],
				[110, -7.2],
			],
			[
				[121.5, 13.5],
				[144.8, 13.4],
			],
		],
	},
	{
		id: "southern-asia",
		title: "Families of southern Asia",
		era: { bce: 2500 },
		paragraphs: [
			"Tamil, Telugu and Kannada belong to Dravidian, about 4,500 years old. Nobody knows where it began.",
			"Vietnamese, Khmer and India's Munda languages form Austroasiatic, whose homeland is debated. Thai and Lao belong to Kra-Dai, about 4,000 years old.",
		],
		camera: { west: 62, south: 2, east: 115, north: 32 },
		stops: ["dravidian", "austroasiatic", "tai-kadai"],
		routes: [
			[
				[79, 20],
				[78.8, 10.5],
			],
			[
				[79, 20],
				[66.5, 29],
			],
			[
				[103, 17],
				[108, 15.5],
			],
			[
				[103, 17],
				[105, 12.5],
			],
			[
				[103, 17],
				[95, 22],
				[86, 22.5],
			],
			[
				[109, 22.5],
				[104, 25],
			],
			[
				[109, 22.5],
				[102, 16],
			],
		],
	},
	{
		id: "uralic",
		title: "Across the northern forests",
		era: { bce: 2500 },
		paragraphs: [
			"Finnish, Estonian, Sami and Hungarian are related, though they are now far apart. Their ancestor was spoken around the Ural Mountains about 4,500 years ago or earlier.",
			"Scholars disagree on which side: one study places it in western Siberia, another on the Kama River to the west. From there it spread west across the forests of the north.",
		],
		camera: { west: 10, south: 42, east: 80, north: 72 },
		stops: ["uralic"],
		routes: [
			[
				[60, 58],
				[46, 55],
			],
			[
				[60, 58],
				[40, 60],
				[26, 61],
			],
			[
				[60, 58],
				[40, 65],
				[22, 68],
			],
		],
	},
	{
		id: "americas-families",
		title: "Families of the Americas",
		era: { bce: 2000 },
		paragraphs: [
			"The Americas hold dozens of language families and isolates. An old proposal grouped most of them into one family; most specialists reject it.",
			"Uto-Aztecan reaches from the western United States into Mexico, and Mayan grew in the Guatemalan highlands. In South America, Tupian and Arawakan spread across the lowlands, Arawakan as far as the Caribbean; where each began is debated.",
		],
		camera: { west: -125, south: -32, east: -35, north: 45 },
		stops: ["uto-aztecan", "mayan", "tupian", "arawakan"],
		routes: [
			[
				[-110.9, 30.7],
				[-115, 40],
			],
			[
				[-110.9, 30.7],
				[-104.5, 23],
				[-99, 19.5],
			],
			[
				[-91.4, 15.8],
				[-98.5, 21.5],
			],
			[
				[-91.4, 15.8],
				[-89, 18.8],
			],
			[
				[-62.5, -11],
				[-54.5, -9.5],
				[-46, -20],
				[-43.2, -22.9],
			],
			[
				[-54.5, -9.5],
				[-57.1, -25.6],
			],
			[
				[-67, -8],
				[-64, 1],
				[-61.5, 8.6],
				[-66.5, 18.3],
				[-75, 20.5],
			],
		],
		sources: ["glottolog", "gregersen-2025"],
	},
	{
		id: "oldest-texts",
		title: "The oldest written words",
		era: { bce: 1500 },
		paragraphs: [
			"The oldest Indo-European language we can read is Hittite, recorded in what is now Turkey nearly 4,000 years ago.",
			"Further east, Indo-Iranian speakers moved from the steppe toward Iran and India, and an Indo-Aryan branch reached South Asia. The Rigveda, the oldest surviving Sanskrit text, was kept alive by memory long before it was written down.",
		],
		camera: { west: 26, south: 18, east: 90, north: 58 },
		stops: ["hittite", "indo-iranian", "sanskrit"],
		routes: [
			[
				[59.5, 52.6],
				[60, 42],
				[52, 33],
			],
			[
				[59.5, 52.6],
				[66, 40],
				[73, 31],
			],
			[
				[73, 31],
				[80, 27],
			],
		],
	},
	{
		id: "east-asia",
		title: "Bones, shells and rice",
		era: { bce: 1250 },
		paragraphs: [
			"The oldest clear Chinese writing appears around 1250 BCE, cut into bones and turtle shells.",
			"Not long after, rice farmers from the Korean peninsula crossed to Japan, probably bringing the ancestor of Japanese.",
		],
		camera: { west: 100, south: 22, east: 145, north: 46 },
		stops: ["chinese-writing", "japonic"],
		routes: [
			[
				[127, 35.3],
				[130.5, 33.5],
				[135.5, 34.8],
			],
		],
	},
	{
		id: "lapita",
		title: "Into the open Pacific",
		era: { bce: 1000 },
		paragraphs: [
			"About 3,000 years ago, voyagers sailed east from the islands off New Guinea into a part of the Pacific no one had ever reached, taking an Austronesian language with them.",
			"Within a few centuries they had settled Vanuatu, Fiji, Tonga and Samoa.",
		],
		camera: { west: 140, south: -30, east: 195, north: 2 },
		stops: ["lapita"],
		routes: [
			[
				[152, -4.5],
				[160, -9.5],
				[168.3, -17.7],
				[178, -17.8],
				[184.8, -21.2],
			],
			[
				[178, -17.8],
				[187.9, -13.8],
			],
		],
	},
	{
		id: "europe",
		title: "Latin and its neighbours",
		era: { bce: 200 },
		paragraphs: [
			"As Roman power grew, Latin spread from Rome across Italy and the western Mediterranean, and later grew into the Romance languages.",
			"To the north, Germanic took shape in Scandinavia and northern Germany; after Roman rule ended, it crossed to Britain as early English. Basque, related to none of them, stayed where it was.",
		],
		camera: { west: -12, south: 34, east: 30, north: 62 },
		stops: ["latin", "germanic", "basque"],
		routes: [
			[
				[12.5, 41.9],
				[2.5, 46.5],
			],
			[
				[12.5, 41.9],
				[3, 41],
				[-4, 40],
			],
			[
				[12.5, 41.9],
				[25, 45.5],
			],
			[
				[10, 56],
				[0, 52.5],
			],
			[
				[10, 56],
				[6, 51.5],
			],
		],
	},
	{
		id: "arabic",
		title: "Arabic spreads",
		era: { ce: 650 },
		paragraphs: [
			"Arabic was spoken across Arabia long before Islam. Beginning with the Islamic conquests of the 7th century, it spread across North Africa and later into Spain and Central Asia.",
			"People switched over centuries, not overnight, and it became the everyday language of most of the Middle East and North Africa.",
		],
		camera: { west: -12, south: 10, east: 75, north: 45 },
		stops: ["arabic"],
		routes: [
			[
				[39.6, 24.5],
				[38, 33],
			],
			[
				[39.6, 24.5],
				[31, 30],
				[10, 34],
				[-4.5, 37.5],
			],
			[
				[39.6, 24.5],
				[48, 32],
				[60, 37],
			],
		],
	},
	{
		id: "indian-ocean",
		title: "Across the Indian Ocean",
		era: { ce: 800 },
		paragraphs: [
			"On the East African coast, Swahili grew as a Bantu language rich in Arabic words from Indian Ocean trade.",
			"Across the water, Madagascar's language is closest to languages of southern Borneo. Sailors probably crossed the ocean about 1,300 years ago, likely by way of East Africa.",
		],
		camera: { west: 30, south: -28, east: 120, north: 8 },
		stops: ["swahili", "malagasy"],
		routes: [
			[
				[115.1, -2.1],
				[95, -6],
				[70, -8],
				[43.3, -11.7],
				[47, -19],
			],
			[
				[39.2, -6],
				[35, -3.5],
				[31, -1.5],
			],
		],
	},
	{
		id: "steppe",
		title: "Riders of the steppe",
		era: { ce: 900 },
		paragraphs: [
			"From the 6th century, Turkic-speaking peoples spread west from Mongolia across the steppe. After 1071, Turkish slowly became the main language of Anatolia.",
			"Around 895, the Magyars brought Hungarian, a Uralic language, into the Carpathian Basin.",
		],
		camera: { west: 12, south: 30, east: 110, north: 58 },
		stops: ["turkic", "hungarian", "turkish"],
		routes: [
			[
				[102.5, 47.5],
				[75, 48],
				[47, 48],
			],
			[
				[102.5, 47.5],
				[80, 42],
				[65, 40],
			],
			[
				[65, 40],
				[52, 36],
				[42.5, 39.2],
			],
			[
				[32, 47],
				[19.5, 47],
			],
		],
	},
	{
		id: "polynesia",
		title: "The last islands",
		era: { ce: 1100 },
		paragraphs: [
			"Polynesian sailors reached the Society Islands, then within about two centuries Hawaii, Rapa Nui and New Zealand: among the last places on Earth people settled.",
		],
		camera: { west: 160, south: -48, east: 260, north: 25 },
		stops: ["east-polynesia", "maori"],
		routes: [
			[
				[187.9, -13.8],
				[210.5, -17.5],
			],
			[
				[210.5, -17.5],
				[204.5, 19.8],
			],
			[
				[210.5, -17.5],
				[250.6, -27.1],
			],
			[
				[210.5, -17.5],
				[176.5, -38.3],
			],
		],
	},
	{
		id: "americas-late",
		title: "Arctic travellers and Andean empires",
		era: { ce: 1400 },
		paragraphs: [
			"Inuit ancestors crossed the Arctic from Alaska to Greenland within a few centuries, and the ancestors of the Navajo and Apache came south from the far north to the Southwest.",
			"Nahuatl was the language of the Aztec capital, founded around 1325. The Incas promoted a form of Quechua across their empire, though the family was already old and widespread.",
		],
		camera: { west: -170, south: -30, east: -40, north: 78 },
		stops: ["inuit", "navajo-apache", "nahuatl", "quechua"],
		routes: [
			[
				[-156.8, 71.3],
				[-124, 69.5],
				[-95, 69],
				[-72, 66],
			],
			[
				[-95, 72],
				[-70, 77.5],
				[-51.5, 64.5],
			],
			[
				[-125, 60],
				[-115, 48],
				[-109.4, 36.3],
			],
			[
				[-71.97, -13.53],
				[-65.3, -19],
			],
			[
				[-71.97, -13.53],
				[-78.5, -0.2],
			],
		],
	},
	{
		id: "iberia",
		title: "Ships from Iberia",
		era: { ce: 1500 },
		paragraphs: [
			"From 1492, Spanish ships carried Castilian to the Caribbean, then to Mexico and South America. In 1500 a Portuguese fleet reached Brazil.",
			"Today about 500 million people speak Spanish as a first language, and Brazil alone has about 200 million people.",
		],
		camera: { west: -110, south: -40, east: 45, north: 48 },
		stops: ["spanish", "portuguese"],
		routes: [
			[
				[-5, 37.5],
				[-40, 28],
				[-69.9, 18.5],
			],
			[
				[-69.9, 18.5],
				[-99.1, 19.4],
			],
			[
				[-69.9, 18.5],
				[-80, 5],
				[-77, -12],
			],
			[
				[-9.1, 38.7],
				[-25, 10],
				[-39, -16.4],
			],
			[
				[-9.1, 38.7],
				[-14, 10],
				[8, -12],
				[19, -36],
				[40.7, -15],
			],
		],
	},
	{
		id: "empires",
		title: "Empires and new languages",
		era: { ce: 1600 },
		paragraphs: [
			"English reached Jamestown in 1607 and Sydney in 1788. French colonists founded Quebec in 1608, and French later spread through colonial rule in West and Central Africa. Russians crossed Siberia to the Pacific within about sixty years.",
			"Where people with no shared language were thrown together by trade, plantations and slavery, new languages were born.",
		],
		camera: { west: -130, south: -42, east: 190, north: 72 },
		stops: ["english", "french", "russian", "creoles"],
		routes: [
			[
				[-0.1, 51.5],
				[-40, 46],
				[-76.8, 37.2],
			],
			[
				[-0.1, 51.5],
				[-20, 10],
				[18, -36],
				[80, -25],
				[151.2, -33.9],
			],
			[
				[2.35, 48.9],
				[-40, 52],
				[-71.2, 46.8],
			],
			[
				[2.35, 48.9],
				[-17.5, 14.7],
			],
			[
				[37.6, 55.75],
				[68.2, 58.2],
				[110, 61],
				[143.2, 59.4],
			],
		],
	},
	{
		id: "today",
		title: "Today",
		era: "today",
		paragraphs: [
			"About 7,200 languages are in use today. Counting second languages, English has the most speakers; Mandarin Chinese has the most first-language speakers.",
			"The 20 biggest languages are the first language of nearly half of all people. Meanwhile about 4 in 10 languages are endangered, many with fewer than 1,000 speakers left.",
		],
		camera: WORLD,
		stops: [],
		routes: [],
		sources: [
			"ethnologue-2026",
			"owid-ethnologue-2026",
			"ethnologue-most-spoken",
			"ethnologue-how-many",
		],
	},
];

/** The overview works listed at the end of the page; each pin lists its own sources. */
export const MAIN_SOURCES: readonly string[] = [
	"glottolog",
	"ethnologue-2026",
	"hauser-2014",
	"pagani-2015",
	"moreno-mayar-2018",
	"koile-2022",
	"sagart-2019",
	"haak-2015",
	"heggarty-2023",
	"gray-2009",
	"kolipakam-2018",
	"wilmshurst-2011",
];

const doi = (id: string) => `https://doi.org/${id}`;

/** The main works behind the story, listed on the page. Full notes are in docs/research. */
export const SOURCES: readonly Source[] = [
	{
		id: "hublin-2017",
		citation: "Hublin et al. 2017, Nature",
		title: "New fossils from Jebel Irhoud, Morocco and the pan-African origin of Homo sapiens",
		url: doi("10.1038/nature22336"),
	},
	{
		id: "scerri-2018",
		citation: "Scerri et al. 2018, Trends in Ecology & Evolution",
		title:
			"Did our species evolve in subdivided populations across Africa, and why does it matter?",
		url: doi("10.1016/j.tree.2018.05.005"),
	},
	{
		id: "hauser-2014",
		citation: "Hauser et al. 2014, Frontiers in Psychology",
		title: "The mystery of language evolution",
		url: doi("10.3389/fpsyg.2014.00401"),
	},
	{
		id: "dediu-levinson-2013",
		citation: "Dediu & Levinson 2013, Frontiers in Psychology",
		title: "On the antiquity of language",
		url: doi("10.3389/fpsyg.2013.00397"),
	},
	{
		id: "pagani-2015",
		citation: "Pagani et al. 2015, American Journal of Human Genetics",
		title:
			"Tracing the route of modern humans out of Africa by using 225 human genome sequences from Ethiopians and Egyptians",
		url: doi("10.1016/j.ajhg.2015.04.019"),
	},
	{
		id: "armitage-2011",
		citation: "Armitage et al. 2011, Science",
		title:
			'The southern route "out of Africa": evidence for an early expansion of modern humans into Arabia',
		url: doi("10.1126/science.1199113"),
	},
	{
		id: "bae-2017",
		citation: "Bae, Douka & Petraglia 2017, Science",
		title: "On the origin of modern humans: Asian perspectives",
		url: doi("10.1126/science.aai9067"),
	},
	{
		id: "clarkson-2017",
		citation: "Clarkson et al. 2017, Nature",
		title: "Human occupation of northern Australia by 65,000 years ago",
		url: doi("10.1038/nature22968"),
	},
	{
		id: "oconnell-2018",
		citation: "O'Connell et al. 2018, PNAS",
		title: "When did Homo sapiens first reach Southeast Asia and Sahul?",
		url: doi("10.1073/pnas.1808385115"),
	},
	{
		id: "malaspinas-2016",
		citation: "Malaspinas et al. 2016, Nature",
		title: "A genomic history of Aboriginal Australia",
		url: doi("10.1038/nature18299"),
	},
	{
		id: "davis-2022",
		citation: "Davis et al. 2022, Science Advances",
		title:
			"Dating of a large tool assemblage at the Cooper's Ferry site (Idaho, USA) to ~15,785 cal yr B.P.",
		url: doi("10.1126/sciadv.ade1248"),
	},
	{
		id: "pigati-2023",
		citation: "Pigati et al. 2023, Science",
		title:
			"Independent age estimates resolve the controversy of ancient human footprints at White Sands",
		url: doi("10.1126/science.adh5007"),
	},
	{
		id: "holliday-2025",
		citation: "Holliday et al. 2025, Science Advances",
		title:
			"Paleolake geochronology supports Last Glacial Maximum age for human tracks at White Sands, New Mexico",
		url: doi("10.1126/sciadv.adv4951"),
	},
	{
		id: "militarev-2002",
		citation: "Militarev 2002, McDonald Institute for Archaeological Research",
		title: "The prehistory of a dispersal: the Proto-Afrasian (Afroasiatic) farming lexicon",
		url: "https://starlingdb.org/Texts/afrfarm.pdf",
	},
	{
		id: "moreno-mayar-2018",
		citation: "Moreno-Mayar et al. 2018, Nature",
		title:
			"Terminal Pleistocene Alaskan genome reveals first founding population of Native Americans",
		url: doi("10.1038/nature25173"),
	},
	{
		id: "dillehay-2015",
		citation: "Dillehay et al. 2015, PLOS ONE",
		title: "New archaeological evidence for an early human presence at Monte Verde, Chile",
		url: doi("10.1371/journal.pone.0141923"),
	},
	{
		id: "bennett-2021",
		citation: "Bennett et al. 2021, Science",
		title: "Evidence of humans in North America during the Last Glacial Maximum",
		url: doi("10.1126/science.abg7586"),
	},
	{
		id: "oviatt-2022",
		citation: "Oviatt et al. 2022, Quaternary Research",
		title:
			"A critical assessment of claims that human footprints in the Lake Otero basin, New Mexico date to the Last Glacial Maximum",
		url: doi("10.1017/qua.2022.38"),
	},
	{
		id: "pedersen-2016",
		citation: "Pedersen et al. 2016, Nature",
		title: "Postglacial viability and colonization in North America's ice-free corridor",
		url: doi("10.1038/nature19085"),
	},
	{
		id: "gregersen-2025",
		citation: "Gregersen 2025, LINGUIST List",
		title: "Review of Campbell, The Indigenous Languages of the Americas",
		url: "https://linguistlist.org/issues/36/1037",
	},
	{
		id: "merrill-2009",
		citation: "Merrill et al. 2009, PNAS",
		title: "The diffusion of maize to the southwestern United States and its impact",
		url: doi("10.1073/pnas.0906075106"),
	},
	{
		id: "kemp-2010",
		citation: "Kemp et al. 2010, PNAS",
		title:
			"Evaluating the farming/language dispersal hypothesis with genetic variation in the Southwest and Mesoamerica",
		url: doi("10.1073/pnas.0905753107"),
	},
	{
		id: "law-2013",
		citation: "Law 2013, Language and Linguistics Compass",
		title: "Mayan historical linguistics in a new age",
		url: doi("10.1111/lnc3.12012"),
	},
	{
		id: "kelly-2017",
		citation: "Kelly 2017, SALSA proceedings, University of Texas",
		title: "The scribe's hand betrays his tongue: diglossia among the ancient Maya",
		url: "https://asol.ling.utexas.edu/salsa/proceedings/2017/Kelly.pdf",
	},
	{
		id: "santos-2015",
		citation: "Santos et al. 2015, Boletim do Museu Paraense Emílio Goeldi",
		title: "Origins and demographic dynamics of Tupí expansion: a genetic tale",
		url: doi("10.1590/1981-81222015000200003"),
	},
	{
		id: "gerardi-2023",
		citation: "Gerardi et al. 2023, PLOS ONE",
		title: "Lexical phylogenetics of the Tupí-Guaraní family",
		url: doi("10.1371/journal.pone.0272226"),
	},
	{
		id: "paraguay-constitution",
		citation: "Constitution of Paraguay, Article 140",
		title: "Constitute Project",
		url: "https://www.constituteproject.org/constitution/Paraguay_2011?lang=en",
	},
	{
		id: "walker-ribeiro-2011",
		citation: "Walker & Ribeiro 2011, Proceedings of the Royal Society B",
		title: "Bayesian phylogeography of the Arawak expansion in lowland South America",
		url: doi("10.1098/rspb.2010.2579"),
	},
	{
		id: "schroeder-2018",
		citation: "Schroeder et al. 2018, PNAS",
		title: "Origins and genetic legacies of the Caribbean Taino",
		url: doi("10.1073/pnas.1716839115"),
	},
	{
		id: "friesen-arnold-2008",
		citation: "Friesen & Arnold 2008, American Antiquity",
		title: "The timing of the Thule migration: new dates from the western Canadian Arctic",
		url: doi("10.1017/S0002731600046850"),
	},
	{
		id: "gullov-mcghee-2006",
		citation: "Gulløv & McGhee 2006, Alaska Journal of Anthropology",
		title: "Did Bering Strait people initiate the Thule migration?",
		url: "https://www.alaskaanthropology.org/wp-content/uploads/2017/08/Vol_4_1-2-Article-4-Gullov-McGhee.pdf",
	},
	{
		id: "anlc-languages",
		citation: "Alaska Native Language Center",
		title: "Languages",
		url: "https://www.uaf.edu/anlc/languages-move/languages.php",
	},
	{
		id: "crow-canyon",
		citation: "Crow Canyon Archaeological Center",
		title: "Post-Pueblo: Navajo history and culture",
		url: "https://crowcanyon.org/EducationProducts/peoples_mesa_verde/post_pueblo_navajo.php",
	},
	{
		id: "natgeo-aztec",
		citation: "National Geographic Education",
		title: "Aztec civilization",
		url: "https://education.nationalgeographic.org/resource/aztec-civilization/",
	},
	{
		id: "heggarty-beresford-jones-2010",
		citation: "Heggarty & Beresford-Jones 2010, Boletín de Arqueología PUCP",
		title: "Archaeology, language, and the Andean past",
		url: "https://revistas.pucp.edu.pe/index.php/boletindearqueologia/article/download/1181/1142",
	},
	{
		id: "adelaar-2017",
		citation: "Adelaar 2017, Cambridge University Press",
		title: "A typological overview of Aymaran and Quechuan language structure",
		url: doi("10.1017/9781316135716.021"),
	},
	{
		id: "huehnergard-2008",
		citation: "Huehnergard 2008, Cambridge University Press",
		title: "Afro-Asiatic, in The Ancient Languages of Syria-Palestine and Arabia",
		url: "https://www.cambridge.org/core/books/ancient-languages-of-syriapalestine-and-arabia/afroasiatic/52090A4EA262B5236AC49C5E34B5A332",
	},
	{
		id: "ehret-2004",
		citation: "Ehret, Keita & Newman 2004, Science",
		title: "The origins of Afroasiatic",
		url: "https://hdl.handle.net/2022/21062",
	},
	{
		id: "sagart-2019",
		citation: "Sagart et al. 2019, PNAS",
		title: "Dated language phylogenies shed light on the ancestry of Sino-Tibetan",
		url: doi("10.1073/pnas.1817972116"),
	},
	{
		id: "zhang-2019",
		citation: "Zhang et al. 2019, Nature",
		title: "Phylogenetic evidence for Sino-Tibetan origin in northern China in the Late Neolithic",
		url: doi("10.1038/s41586-019-1153-z"),
	},
	{
		id: "van-driem-2018",
		citation: "van Driem 2018, Journal of the Asiatic Society",
		title: "The East Asian linguistic phylum: a reconstruction based on language and genes",
		url: "https://www.isw.unibe.ch/e41142/e41180/e523709/e826354/2018i_ger.pdf",
	},
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
		id: "bouckaert-2018",
		citation: "Bouckaert, Bowern & Atkinson 2018, Nature Ecology & Evolution",
		title: "The origin and expansion of Pama-Nyungan languages across Australia",
		url: doi("10.1038/s41559-018-0489-3"),
	},
	{
		id: "greenhill-2015",
		citation: "Greenhill 2015, PLOS ONE",
		title: "TransNewGuinea.org: an online database of New Guinea languages",
		url: doi("10.1371/journal.pone.0141563"),
	},
	{
		id: "mona-2007",
		citation: "Mona et al. 2007, Molecular Biology and Evolution",
		title: "Patterns of Y-chromosome diversity intersect with the Trans-New Guinea hypothesis",
		url: doi("10.1093/molbev/msm187"),
	},
	{
		id: "glottolog",
		citation: "Hammarström, Forkel, Haspelmath & Bank, Glottolog 5.3",
		title: "Glottolog: a catalogue of the world's languages and families",
		url: "https://glottolog.org",
	},
	{
		id: "guldemann-2018",
		citation: "Güldemann 2018, De Gruyter Mouton",
		title: "Historical linguistics and genealogical language classification in Africa",
		url: doi("10.1515/9783110421668-002"),
	},
	{
		id: "koile-2022",
		citation: "Koile et al. 2022, PNAS",
		title: "Phylogeographic analysis of the Bantu language expansion supports a rainforest route",
		url: doi("10.1073/pnas.2112853119"),
	},
	{
		id: "grollemund-2015",
		citation: "Grollemund et al. 2015, PNAS",
		title: "Bantu expansion shows that habitat alters the route and pace of human dispersals",
		url: doi("10.1073/pnas.1503793112"),
	},
	{
		id: "fortes-lima-2024",
		citation: "Fortes-Lima et al. 2024, Nature",
		title: "The genetic legacy of the expansion of Bantu-speaking peoples in Africa",
		url: doi("10.1038/s41586-023-06770-6"),
	},
	{
		id: "guldemann-2014",
		citation: "Güldemann 2014, John Benjamins",
		title: '"Khoisan" linguistic classification today',
		url: doi("10.1075/cilt.330.01gul"),
	},
	{
		id: "skoglund-2017",
		citation: "Skoglund et al. 2017, Cell",
		title: "Reconstructing prehistoric African population structure",
		url: doi("10.1016/j.cell.2017.08.049"),
	},
	{
		id: "gray-2009",
		citation: "Gray, Drummond & Greenhill 2009, Science",
		title: "Language phylogenies reveal expansion pulses and pauses in Pacific settlement",
		url: doi("10.1126/science.1166858"),
	},
	{
		id: "lipson-2014",
		citation: "Lipson et al. 2014, Nature Communications",
		title: "Reconstructing Austronesian population history in Island Southeast Asia",
		url: doi("10.1038/ncomms5689"),
	},
	{
		id: "ko-2014",
		citation: "Ko et al. 2014, American Journal of Human Genetics",
		title: "Early Austronesians: into and out of Taiwan",
		url: doi("10.1016/j.ajhg.2014.02.003"),
	},
	{
		id: "pugach-2021",
		citation: "Pugach et al. 2021, PNAS",
		title: "Ancient DNA from Guam and the peopling of the Pacific",
		url: doi("10.1073/pnas.2022112118"),
	},
	{
		id: "kolipakam-2018",
		citation: "Kolipakam et al. 2018, Royal Society Open Science",
		title: "A Bayesian phylogenetic study of the Dravidian language family",
		url: doi("10.1098/rsos.171504"),
	},
	{
		id: "sidwell-2010",
		citation: "Sidwell 2010, Journal of Language Relationship",
		title: "The Austroasiatic central riverine hypothesis",
		url: "https://cyberleninka.ru/article/n/the-austroasiatic-central-riverine-hypothesis",
	},
	{
		id: "lipson-2018",
		citation: "Lipson et al. 2018, Science",
		title: "Ancient genomes document multiple waves of migration in Southeast Asian prehistory",
		url: doi("10.1126/science.aat3188"),
	},
	{
		id: "tao-2023",
		citation: "Tao et al. 2023, Nature Communications",
		title:
			"Phylogenetic evidence reveals early Kra-Dai divergence and dispersal in the late Holocene",
		url: doi("10.1038/s41467-023-42761-x"),
	},
	{
		id: "grunthal-2022",
		citation: "Grünthal et al. 2022, Diachronica",
		title: "Drastic demographic events triggered the Uralic spread",
		url: doi("10.1075/dia.20038.gru"),
	},
	{
		id: "parpola-2022",
		citation: "Parpola 2022, Archaeology of the Eurasian Steppes",
		title: "Location of the Uralic proto-language in the Kama River Valley",
		url: "https://doi.org/10.24852/2587-6112.2022.2.258.277",
	},
	{
		id: "lamnidis-2018",
		citation: "Lamnidis et al. 2018, Nature Communications",
		title: "Ancient Fennoscandian genomes reveal origin and spread of Siberian ancestry in Europe",
		url: doi("10.1038/s41467-018-07483-5"),
	},
	{
		id: "kloekhorst-2019",
		citation: "Kloekhorst 2019, Brill",
		title: "Kanišite Hittite: The Earliest Attested Record of Indo-European",
		url: doi("10.1163/9789004382107"),
	},
	{
		id: "narasimhan-2019",
		citation: "Narasimhan et al. 2019, Science",
		title: "The formation of human populations in South and Central Asia",
		url: doi("10.1126/science.aat7487"),
	},
	{
		id: "shinde-2019",
		citation: "Shinde et al. 2019, Cell",
		title: "An ancient Harappan genome lacks ancestry from steppe pastoralists or Iranian farmers",
		url: doi("10.1016/j.cell.2019.08.048"),
	},
	{
		id: "jamison-brereton-2020",
		citation: "Jamison & Brereton 2020, Oxford University Press",
		title: "The Rigveda: A Guide",
		url: doi("10.1093/oso/9780190633363.001.0001"),
	},
	{
		id: "anderson-2015",
		citation: "Anderson 2015, University of Pennsylvania",
		title: "Change and Standardization in Anyang: Writing and Culture in Bronze Age China",
		url: "https://repository.upenn.edu/edissertations/1589",
	},
	{
		id: "smithsonian-oracle-bone",
		citation: "National Museum of Asian Art, Smithsonian, FSC-O-1a-e",
		title: "Inscribed oracle bone fragments, Anyang, ca. 1250–1050 BCE",
		url: "https://asia.si.edu/object/FSC-O-1a-e",
	},
	{
		id: "robbeets-2021",
		citation: "Robbeets et al. 2021, Nature",
		title: "Triangulation supports agricultural spread of the Transeurasian languages",
		url: doi("10.1038/s41586-021-04108-8"),
	},
	{
		id: "cooke-2021",
		citation: "Cooke et al. 2021, Science Advances",
		title: "Ancient genomics reveals tripartite origins of Japanese populations",
		url: doi("10.1126/sciadv.abh2419"),
	},
	{
		id: "skoglund-2016",
		citation: "Skoglund et al. 2016, Nature",
		title: "Genomic insights into the peopling of the Southwest Pacific",
		url: doi("10.1038/nature19844"),
	},
	{
		id: "posth-2018",
		citation: "Posth et al. 2018, Nature Ecology & Evolution",
		title: "Language continuity despite population replacement in Remote Oceania",
		url: doi("10.1038/s41559-018-0498-2"),
	},
	{
		id: "almeida-2025",
		citation: "Almeida et al. 2025, Scientific Reports",
		title:
			"Leveraging known Pacific colonisation times to test models for the ancestry of Southeast Asians",
		url: doi("10.1038/s41598-025-20856-3"),
	},
	{
		id: "coleman-2015",
		citation: "Coleman 2015, Oxford Classical Dictionary",
		title: "Latin language",
		url: doi("10.1093/acrefore/9780199381135.013.3598"),
	},
	{
		id: "adams-2007",
		citation: "Adams 2007, Cambridge University Press",
		title: "The Regional Diversification of Latin 200 BC – AD 600",
		url: doi("10.1017/CBO9780511482977"),
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
		id: "trask-1997",
		citation: "Trask 1997, Routledge",
		title: "The History of Basque",
		url: "https://www.routledge.com/The-History-of-Basque/Trask/p/book/9780415131162",
	},
	{
		id: "louvre-namara",
		citation: "Musée du Louvre, AO 4083",
		title: "Lintel of Imru' al-Qays (Namara inscription)",
		url: "https://collections.louvre.fr/en/ark:/53355/cl010123278",
	},
	{
		id: "pat-el-stokes-2022",
		citation: "Pat-El & Stokes 2022, Journal of Semitic Studies",
		title: "The 'Aramaic substrate' hypothesis in the Levant revisited",
		url: "https://academic.oup.com/jss/article-abstract/67/2/563/6581415",
	},
	{
		id: "owens-2013",
		citation: "Owens 2013, Oxford University Press",
		title: "History, in The Oxford Handbook of Arabic Linguistics",
		url: doi("10.1093/oxfordhb/9780199764136.013.0020"),
	},
	{
		id: "brielle-2023",
		citation: "Brielle et al. 2023, Nature",
		title: "Entwined African and Asian genetic roots of medieval peoples of the Swahili coast",
		url: doi("10.1038/s41586-023-05754-w"),
	},
	{
		id: "schadeberg-2009",
		citation: "Schadeberg 2009, World Loanword Database",
		title: "Loanwords in Swahili",
		url: "https://wold.clld.org/vocabulary/1",
	},
	{
		id: "unesco-kiswahili",
		citation: "UNESCO",
		title: "World Kiswahili Language Day",
		url: "https://www.unesco.org/en/days/kiswahili-language",
	},
	{
		id: "adelaar-2016",
		citation: "Adelaar 2016, NUSA",
		title: "A linguist's perspective on the settlement history of Madagascar",
		url: "https://tufs.repo.nii.ac.jp/record/1402/files/04Adelaar.pdf",
	},
	{
		id: "crowther-2016",
		citation: "Crowther et al. 2016, PNAS",
		title:
			"Ancient crops provide first archaeological signature of the westward Austronesian expansion",
		url: doi("10.1073/pnas.1522714113"),
	},
	{
		id: "kusuma-2016",
		citation: "Kusuma et al. 2016, Scientific Reports",
		title: "Contrasting linguistic and genetic origins of the Asian source populations of Malagasy",
		url: doi("10.1038/srep26066"),
	},
	{
		id: "savelyev-robbeets-2020",
		citation: "Savelyev & Robbeets 2020, Journal of Language Evolution",
		title:
			"Bayesian phylolinguistics infers the internal structure and the time-depth of the Turkic language family",
		url: doi("10.1093/jole/lzz010"),
	},
	{
		id: "sinor-1990",
		citation: "Sinor 1990, Cambridge University Press",
		title: "The establishment and dissolution of the Türk empire",
		url: doi("10.1017/CHOL9780521243049.012"),
	},
	{
		id: "damgaard-2018",
		citation: "Damgaard et al. 2018, Nature",
		title: "137 ancient human genomes from across the Eurasian steppes",
		url: doi("10.1038/s41586-018-0094-2"),
	},
	{
		id: "neparaczki-2018",
		citation: "Neparáczki et al. 2018, PLOS ONE",
		title:
			"Mitogenomic data indicate admixture components of Central-Inner Asian and Srubnaya origin in the conquering Hungarians",
		url: doi("10.1371/journal.pone.0205920"),
	},
	{
		id: "fleet-2009",
		citation: "Fleet 2009, Cambridge University Press",
		title: "Introduction, in The Cambridge History of Turkey, vol. 1",
		url: doi("10.1017/CHOL9780521620932.002"),
	},
	{
		id: "wilmshurst-2011",
		citation: "Wilmshurst et al. 2011, PNAS",
		title:
			"High-precision radiocarbon dating shows recent and rapid initial human colonization of East Polynesia",
		url: doi("10.1073/pnas.1015876108"),
	},
	{
		id: "hunt-lipo-2006",
		citation: "Hunt & Lipo 2006, Science",
		title: "Late colonization of Easter Island",
		url: doi("10.1126/science.1121879"),
	},
	{
		id: "wilmshurst-2008",
		citation: "Wilmshurst et al. 2008, PNAS",
		title:
			"Dating the late prehistoric dispersal of Polynesians to New Zealand using the commensal Pacific rat",
		url: doi("10.1073/pnas.0801507105"),
	},
	{
		id: "loc-taino",
		citation: "Library of Congress",
		title: "Columbus and the Taino",
		url: "https://www.loc.gov/exhibits/exploring-the-early-americas/columbus-and-the-taino.html",
	},
	{
		id: "cervantes-2025",
		citation: "Instituto Cervantes 2025",
		title: "El español en el mundo 2025",
		url: "https://cvc.cervantes.es/lengua/anuario/anuario_25/presentacion.htm",
	},
	{
		id: "gaceta-unam",
		citation: "Gaceta UNAM",
		title: "El idioma español nos une en más de 20 países",
		url: "https://www.gaceta.unam.mx/el-idioma-espanol-nos-une-en-mas-de-20-paises/",
	},
	{
		id: "fausto-2014",
		citation: "Fausto 2014, Cambridge University Press",
		title: "A Concise History of Brazil",
		url: "https://assets.cambridge.org/97811070/36208/excerpt/9781107036208_excerpt.pdf",
	},
	{
		id: "ibge-2022",
		citation: "IBGE 2023",
		title: "Censo Demográfico 2022: população e domicílios, primeiros resultados",
		url: "https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/1d7bf06ce40194c3eccf02670aeed984.pdf",
	},
	{
		id: "rilp-2021",
		citation: "Revista Internacional em Língua Portuguesa 2021",
		title: "Teacher training for Portuguese in Mozambique",
		url: "https://rilp-aulp.org/index.php/rilp/article/view/270",
	},
	{
		id: "nps-jamestown",
		citation: "U.S. National Park Service",
		title: "A short history of Jamestown",
		url: "https://www.nps.gov/jame/learn/historyculture/a-short-history-of-jamestown.htm",
	},
	{
		id: "nma-first-fleet",
		citation: "National Museum of Australia",
		title: "The First Fleet arrives at Sydney Cove",
		url: "https://digital-classroom.nma.gov.au/defining-moments/first-fleet-arrives-sydney-cove",
	},
	{
		id: "champlain",
		citation: "The Canadian Encyclopedia",
		title: "Samuel de Champlain",
		url: "https://thecanadianencyclopedia.ca/en/article/samuel-de-champlain",
	},
	{
		id: "oif-2026",
		citation: "Organisation internationale de la Francophonie 2026",
		title: "La langue française dans le monde 2026",
		url: "https://www.francophonie.org/lancement-du-rapport-la-langue-francaise-dans-le-monde-2026-8426",
	},
	{
		id: "bassin-1999",
		citation: "Bassin 1999, Cambridge University Press",
		title: "Early visions and divinations, in Imperial Visions",
		url: doi("10.1017/CBO9780511493638.004"),
	},
	{
		id: "morrison-2021",
		citation: "Morrison 2021, Cambridge University Press",
		title: "The Russian Conquest of Central Asia",
		url: "https://www.cambridge.org/core/books/abs/russian-conquest-of-central-asia/search-for-a-natural-frontier-and-the-fall-of-tashkent-18635/7FD1F1CCE8A5B9A642715B9857C09FAA",
	},
	{
		id: "apics-haitian-creole",
		citation: "Fattier, Atlas of Pidgin and Creole Language Structures",
		title: "Haitian Creole",
		url: "https://apics-online.info/surveys/49",
	},
	{
		id: "loc-french-west-africa",
		citation: "Library of Congress",
		title: "French West Africa",
		url: "https://www.loc.gov/item/a22000957",
	},
	{
		id: "apics-tok-pisin",
		citation: "Smith & Siegel, Atlas of Pidgin and Creole Language Structures",
		title: "Tok Pisin",
		url: "https://apics-online.info/surveys/22",
	},
	{
		id: "ethnologue-2026",
		citation: "Ethnologue, 29th edition, 2026",
		title: "Welcome to the 29th edition",
		url: "https://www.ethnologue.com/ethnoblog/welcome-29th-edition/",
	},
	{
		id: "owid-ethnologue-2026",
		citation: "Our World in Data 2026",
		title: "Update Ethnologue to 29th edition (2026)",
		url: "https://github.com/owid/etl/pull/6907",
	},
	{
		id: "ethnologue-most-spoken",
		citation: "Ethnologue",
		title: "What is the most spoken language?",
		url: "https://www.ethnologue.com/insights/most-spoken-language/",
	},
	{
		id: "ethnologue-how-many",
		citation: "Ethnologue",
		title: "How many languages are there in the world?",
		url: "https://www.ethnologue.com/insights/how-many-languages/",
	},
];
