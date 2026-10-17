# Language spread: research behind the page

Research for the flagged `/language-spread` page (`FLAG_LANGUAGE_SPREAD`), which tells how languages spread across the world as a scrolling story over a map. Researched 2026-10-17. The page copy, stops and source list are in `apps/phonaria/src/lib/language-spread/story.ts`. These notes record why each claim is there.

## How the research was done

Research was split by region among five research agents, each working from primary and scholarly sources: Glottolog, Ethnologue, academic handbooks, peer-reviewed papers, and museum, government and university pages. Wikipedia was used only to find leads and is never cited. Each agent marked how it checked a source: full text, abstract, search summary, or secondhand. Weak claims were marked for removal.

| Notes | Scope |
| --- | --- |
| [africa.md](africa.md) | Modern humans in Africa, the out-of-Africa dispersal, reaching Sahul, and the families of Africa |
| [western-eurasia.md](western-eurasia.md) | Indo-European and its homeland debate, Hittite, Indo-Iranian and Sanskrit, Latin, Germanic, Uralic, Turkic, Arabic, Basque |
| [asia-pacific.md](asia-pacific.md) | Sino-Tibetan, Austronesian and the Pacific, Dravidian, Austroasiatic, Kra-Dai, Japonic, Pama-Nyungan, Trans-New Guinea |
| [americas.md](americas.md) | The peopling of the Americas, the main Indigenous families, and Inuit, Dene, Nahuatl and Quechua |
| [modern.md](modern.md) | Colonial and modern spread, creoles, and the world's languages today |
| [verification.md](verification.md) | Browser verification runs, performance checks and the independent code review |
| [handoff.md](handoff.md) | Current state, file map and caveats for whoever picks the page up next |

The page was written from these notes. A claim was kept only when the notes show it in a reputable source and it does not rest on a single weak one. Copy uses the widely accepted view, and where scholars are closely split, the description says so. Dates are shown as approximate, and places as general areas.

## Judgment calls

- **Where language began.** The story opens with people in Africa who could already talk. It says nobody knows where or when language began. It does not reconstruct or name a first language.
- **The Indo-European homeland.** The pin sits on the steppe north of the Black and Caspian Seas, the leading view in ancient DNA and archaeology. The card and the pin both name the Anatolian and south-of-the-Caucasus alternatives, and say recent work on both sides points toward the Caucasus.
- **Contested groupings.** "Khoisan" is shown as click-language families, not one family. "Nilo-Saharan", "Amerind" and "Transeurasian/Altaic" are not given pins. Amerind is mentioned only as a proposal most specialists reject, and the Japonic pin says the wider link is still argued.
- **Undated stops.** Atlantic-Congo, the click-language families, Austroasiatic, Arawakan and Basque show "no agreed date" instead of an invented year.
- **Ranges.** Where sources give a range or competing estimates, the page shows a range, such as "~7,200–5,900 years ago" for Sino-Tibetan.
- **Numbers.** Speaker counts are rounded ("about 500 million", "about 1.5 billion") because editions and methods differ. Disputed figures are left out: Kinshasa as the largest French-speaking city, Mozambique percentages, and Russian speaker counts.
- **Map.** Pins mark the general area where a group or language took shape. Soft glows mark broad regions. Arrows show the direction of spread, and many follow schematic routes, not documented ones. The Polynesia and Lapita routes use longitudes past 180° so they cross the Pacific without wrapping.
- **Sources on the page.** Each pin's details list the works behind it. Cards whose own text makes claims list their sources too. The page ends with a short list of the main works.

## Checked in this pass

These were checked directly, beyond the agents' notes:

- **Shang oracle bones.** The Smithsonian's National Museum of Asian Art dates inscribed oracle-bone fragments from Anyang to ca. 1250–1050 BCE (object FSC-O-1a-e, https://asia.si.edu/object/FSC-O-1a-e). With Anderson 2015, that supports "around 1250 BCE".
- **Russia reaches the Pacific.** Dartmouth's *Encyclopedia Arctica* (https://collections.dartmouth.edu/arctica-beta/html/EA12-09.html) agrees with EBSCO that Russians reached the Pacific in 1639, less than a century after Yermak. Both are secondary sources, so the claim went to the independent review below, which found a scholarly source (Bassin) that now replaces EBSCO on the page.

## Steps and stops

Every step and stop on the page, with the notes and sources behind it. The tables were generated from `story.ts`; the story tests check that every id appears here.

| Step | Era shown | Stops | Card sources |
| --- | --- | --- | --- |
| `intro` | ~70,000 years ago | none | via its stops |
| `africa` | ~70,000 years ago | `humans-in-africa` | hauser-2014, dediu-levinson-2013 |
| `out-of-africa` | ~60,000 years ago | `leaving-africa`, `sahul` | via its stops |
| `americas` | ~15,000 years ago | `peopling-americas` | pedersen-2016 |
| `afroasiatic` | ~10,000 years ago | `afroasiatic` | via its stops |
| `sino-tibetan` | ~5000 BCE | `sino-tibetan` | via its stops |
| `indo-european` | ~4000 BCE | `indo-european` | via its stops |
| `sahul-families` | ~4000 BCE | `pama-nyungan`, `trans-new-guinea` | via its stops |
| `bantu` | ~3000 BCE | `atlantic-congo`, `bantu`, `click-languages` | via its stops |
| `austronesian` | ~3000 BCE | `austronesian`, `island-southeast-asia` | via its stops |
| `southern-asia` | ~2500 BCE | `dravidian`, `austroasiatic`, `tai-kadai` | via its stops |
| `uralic` | ~2500 BCE | `uralic` | via its stops |
| `americas-families` | ~2000 BCE | `uto-aztecan`, `mayan`, `tupian`, `arawakan` | glottolog, gregersen-2025 |
| `oldest-texts` | ~1500 BCE | `hittite`, `indo-iranian`, `sanskrit` | via its stops |
| `east-asia` | ~1250 BCE | `chinese-writing`, `japonic` | via its stops |
| `lapita` | ~1000 BCE | `lapita` | via its stops |
| `europe` | ~200 BCE | `latin`, `germanic`, `basque` | via its stops |
| `arabic` | ~650 CE | `arabic` | via its stops |
| `indian-ocean` | ~800 CE | `swahili`, `malagasy` | via its stops |
| `steppe` | ~900 CE | `turkic`, `hungarian`, `turkish` | via its stops |
| `polynesia` | ~1100 CE | `east-polynesia`, `maori` | via its stops |
| `americas-late` | ~1400 CE | `inuit`, `navajo-apache`, `nahuatl`, `quechua` | via its stops |
| `iberia` | ~1500 CE | `spanish`, `portuguese` | via its stops |
| `empires` | ~1600 CE | `english`, `french`, `russian`, `creoles` | via its stops |
| `today` | Today | none | ethnologue-2026, owid-ethnologue-2026, ethnologue-most-spoken, ethnologue-how-many |

| Stop | Date shown | Notes | Sources on the page |
| --- | --- | --- | --- |
| `humans-in-africa` | ~300,000 years ago | [africa.md](africa.md) | hublin-2017, scerri-2018 |
| `leaving-africa` | ~70,000–50,000 years ago | [africa.md](africa.md) | pagani-2015, armitage-2011, bae-2017 |
| `sahul` | ~65,000–50,000 years ago | [africa.md](africa.md) | clarkson-2017, oconnell-2018, malaspinas-2016 |
| `peopling-americas` | ~16,000–15,000 years ago | [americas.md](americas.md) | moreno-mayar-2018, dillehay-2015, davis-2022, bennett-2021, pigati-2023, holliday-2025, oviatt-2022 |
| `afroasiatic` | ~10,000 years ago | [africa.md](africa.md) | huehnergard-2008, ehret-2004, militarev-2002 |
| `sino-tibetan` | ~7,200–5,900 years ago | [asia-pacific.md](asia-pacific.md) | sagart-2019, zhang-2019, van-driem-2018 |
| `indo-european` | ~8,000–6,000 years ago | [western-eurasia.md](western-eurasia.md) | haak-2015, anthony-ringe-2015, bouckaert-2012, heggarty-2023, lazaridis-2025 |
| `pama-nyungan` | ~5,700 years ago | [asia-pacific.md](asia-pacific.md) | bouckaert-2018 |
| `trans-new-guinea` | ~10,000–6,000 years ago | [asia-pacific.md](asia-pacific.md) | greenhill-2015, mona-2007 |
| `atlantic-congo` | no agreed date | [africa.md](africa.md) | glottolog, guldemann-2018 |
| `bantu` | ~5,000–4,000 years ago | [africa.md](africa.md) | koile-2022, grollemund-2015, fortes-lima-2024 |
| `click-languages` | no agreed date | [africa.md](africa.md) | guldemann-2014, skoglund-2017 |
| `austronesian` | ~5,200 years ago | [asia-pacific.md](asia-pacific.md) | gray-2009, lipson-2014, ko-2014 |
| `island-southeast-asia` | ~4,000 years ago | [asia-pacific.md](asia-pacific.md) | ko-2014, lipson-2014, pugach-2021 |
| `dravidian` | ~4,500 years ago | [asia-pacific.md](asia-pacific.md) | kolipakam-2018 |
| `austroasiatic` | no agreed date | [asia-pacific.md](asia-pacific.md) | sidwell-2010, lipson-2018 |
| `tai-kadai` | ~4,000 years ago | [asia-pacific.md](asia-pacific.md) | tao-2023 |
| `uralic` | ~4,500 years ago | [western-eurasia.md](western-eurasia.md) | grunthal-2022, parpola-2022, lamnidis-2018 |
| `uto-aztecan` | ~9,000–5,000 years ago | [americas.md](americas.md) | merrill-2009, kemp-2010 |
| `mayan` | ~2200 BCE | [americas.md](americas.md) | law-2013, kelly-2017 |
| `tupian` | ~3,000 years ago | [americas.md](americas.md) | santos-2015, gerardi-2023, paraguay-constitution |
| `arawakan` | no agreed date | [americas.md](americas.md) | walker-ribeiro-2011, schroeder-2018 |
| `hittite` | ~1900–1600 BCE | [western-eurasia.md](western-eurasia.md) | kloekhorst-2019, lazaridis-2025 |
| `indo-iranian` | ~4,000 years ago | [western-eurasia.md](western-eurasia.md) | narasimhan-2019, shinde-2019 |
| `sanskrit` | ~1500–1000 BCE | [western-eurasia.md](western-eurasia.md) | jamison-brereton-2020 |
| `chinese-writing` | ~1250 BCE | [asia-pacific.md](asia-pacific.md) | anderson-2015, smithsonian-oracle-bone |
| `japonic` | ~3,000 years ago | [asia-pacific.md](asia-pacific.md) | robbeets-2021, cooke-2021 |
| `lapita` | ~3,000 years ago | [asia-pacific.md](asia-pacific.md) | skoglund-2016, posth-2018, almeida-2025 |
| `latin` | ~800 BCE | [western-eurasia.md](western-eurasia.md) | coleman-2015, adams-2007 |
| `germanic` | ~500 BCE | [western-eurasia.md](western-eurasia.md) | faarlund-2008, ringe-taylor-2014, gretzinger-2022 |
| `basque` | no agreed date | [western-eurasia.md](western-eurasia.md) | trask-1997 |
| `arabic` | ~630 CE | [western-eurasia.md](western-eurasia.md) | louvre-namara, pat-el-stokes-2022, owens-2013 |
| `swahili` | ~800 CE | [africa.md](africa.md) | brielle-2023, schadeberg-2009, unesco-kiswahili |
| `malagasy` | ~700–800 CE | [asia-pacific.md](asia-pacific.md) | adelaar-2016, crowther-2016, kusuma-2016 |
| `turkic` | ~550 CE | [western-eurasia.md](western-eurasia.md) | savelyev-robbeets-2020, sinor-1990, damgaard-2018 |
| `hungarian` | ~895 CE | [western-eurasia.md](western-eurasia.md) | neparaczki-2018 |
| `turkish` | ~1071 CE | [western-eurasia.md](western-eurasia.md) | fleet-2009 |
| `east-polynesia` | ~1025–1290 CE | [asia-pacific.md](asia-pacific.md) | wilmshurst-2011, hunt-lipo-2006 |
| `maori` | ~1280 CE | [asia-pacific.md](asia-pacific.md) | wilmshurst-2008, wilmshurst-2011 |
| `inuit` | ~1000–1300 CE | [americas.md](americas.md) | friesen-arnold-2008, gullov-mcghee-2006 |
| `navajo-apache` | ~1200–1500 CE | [americas.md](americas.md) | anlc-languages, crow-canyon |
| `nahuatl` | ~1325 CE | [americas.md](americas.md) | natgeo-aztec |
| `quechua` | ~1400–1532 CE | [americas.md](americas.md) | heggarty-beresford-jones-2010, adelaar-2017 |
| `spanish` | ~1492 CE | [modern.md](modern.md) | loc-taino, cervantes-2025, gaceta-unam |
| `portuguese` | ~1500 CE | [modern.md](modern.md) | fausto-2014, ibge-2022, rilp-2021 |
| `english` | ~1607 CE | [modern.md](modern.md) | nps-jamestown, nma-first-fleet, ethnologue-most-spoken |
| `french` | ~1608 CE | [modern.md](modern.md) | champlain, loc-french-west-africa, oif-2026 |
| `russian` | ~1582 CE | [modern.md](modern.md) | bassin-1999, morrison-2021 |
| `creoles` | ~1600–1800 CE | [modern.md](modern.md) | apics-haitian-creole, apics-tok-pisin |

## Independent review

An independent reviewer checked the page copy against these notes and the sources. Findings and responses are recorded below.

The review was done on 2026-10-17 by a model from another provider (Codex, GPT-6.1-Sol), working read-only from these notes and the live sources. It checked every stop, card and source link. All of its findings were applied:

| Where | Finding | Response |
| --- | --- | --- |
| `intro` | "the first people to leave Africa" ignores earlier dispersals, and "where a group or language took shape" doesn't fit arrival pins | Reworded to "modern humans leaving Africa" and "approximate places in each part of the story" |
| `sahul`, `out-of-africa` | "Within a few thousand years of leaving Africa" is narrower than the evidence | Now "tens of thousands of years ago" |
| `peopling-americas` | Idaho site uncited; the footprint debate cited only the original paper and its critique | Added Davis 2022, Pigati 2023 and Holliday 2025; reworded to "several studies date … but how early people arrived is still debated" |
| `afroasiatic` | The 10,000-year estimate rests on dating work that wasn't cited | Now "its age is uncertain; some estimates …", citing Militarev 2002 |
| `atlantic-congo` | Treated Atlantic-Congo and Niger-Congo as synonyms | Now "the well-supported core of a broader grouping called Niger-Congo"; homeland "uncertain" |
| `click-languages` | Genetic evidence doesn't show farmers "took over" the click languages' land | Now "spread across much of the region, mixing with and displacing earlier communities" |
| `dravidian` | Brahui as proof of an older northwest range is one of two competing views | Now "far off in Pakistan, is one of its puzzles" |
| `tai-kadai` | One study's preferred homeland stated as settled | `where` now names it as one study's favourite and notes inland proposals |
| `uto-aztecan` | The farming view concerns western Mexico, not the northwest | Reworded |
| `tupian` | Homeland stated as settled | Now names Rondônia and the Madeira-Amazon junction as competing views |
| `basque` | Ancestry dates (Olalde 2019) were used as dates for Indo-European speech | Removed the date and the Olalde citation |
| `hittite` | "A branch of its own" | Now "the Anatolian branch of Indo-European, whose languages have all died out" |
| `oldest-texts` | Credited the Rigveda to Indo-Iranian speakers as a whole | Now names the Indo-Aryan branch |
| `chinese-writing` | The bamboo sentence was unsourced | Removed |
| `arabic` | Compressed the timeline: Iberia was reached in the 8th century | Now "beginning with … the 7th century … and later into Spain and Central Asia" |
| `quechua` | Blurred a family with its imperial form | Now "a family of related languages … the Incas promoted a form of it" |
| `portuguese` | Africa claim uncited | Narrowed to "parts of Africa, such as Mozambique", citing RILP 2021; Angola arrow removed |
| `french`, `empires` | "French settled … Africa" made the language the settler and called colonial rule settlement | Now "French colonists founded Quebec City in 1608 … French spread through colonial rule and schooling", citing the Library of Congress |
| `creoles` | The "early 1700s" date rested on EBSCO alone; the Tok Pisin source can't support Haitian or Nigerian history | Date dropped (range ~1600–1800 CE from the notes); Nigerian Pidgin removed; each creole cites its own APiCS chapter |
| `today` | Ethnologue's count includes sign languages | "in use" instead of "spoken" |
| `russian` | EBSCO is a weak source | Replaced with Bassin 1999 (Cambridge UP), which the reviewer confirmed gives 1582 and 1639 |
| Links | Adelaar record 404; the INEGI PDF was a Jalisco release that doesn't support Mexico's ranking; the Kloekhorst DOI pointed to a review; Cervantes and IBGE pages redirect | Adelaar now links the PDF; INEGI replaced by Gaceta UNAM; Kloekhorst uses the book DOI; Cervantes links its presentation page; IBGE links the public census release |

Verified by the reviewer: Yermak 1582 and the Pacific in 1639 (Bassin); oracle bones from Anyang ca. 1250–1050 BCE (Smithsonian); about 520 million native Spanish speakers (Cervantes 2025) and Mexico as the largest Spanish-speaking population (Gaceta UNAM); Brazil's 203,062,512 people in 2022 (IBGE); Hittite names at Kanesh about 1970–1710 BCE (Brill's description of Kloekhorst 2019).

Ethnologue, checked afterwards against its own text: the live pages sit behind a Cloudflare bot check, so I read the Internet Archive's copies. The "How many languages" page (captured 2026-01-09, https://web.archive.org/web/20260109011249/https://www.ethnologue.com/insights/how-many-languages/) says "roughly 44% of all languages are now endangered, often with fewer than 1,000 users remaining" and that the 20 largest languages are "the native tongue of more than 3.7 billion people … nearly half of the world's population". The "most spoken language" page (captured 2026-03-14, https://web.archive.org/web/20260314040856/https://www.ethnologue.com/insights/most-spoken-language/) says Mandarin Chinese is the largest by native speakers and English the largest counting non-native speakers too. That page was captured after the 29th edition came out; the "How many languages" capture predates it and still gives the 28th edition's 7,159. The 29th edition's 7,170 comes from Our World in Data's update.
