# The story of English

Research notes for refocusing the `/language-spread` page on the history of one language, English. Researched 2026-10-17. This note reuses the Indo-European and Germanic findings in [western-eurasia.md](western-eurasia.md) and the English and "today" findings in [modern.md](modern.md), and adds new research for the steps between them. Wikipedia was used only to find leads and is never cited.

Check levels, as in the other notes: FETCHED (full page text read), ABSTRACT (abstract or publisher description only), SEARCH-CONFIRMED (a search summary only), SECONDHAND (the claim reaches us through a third party). A claim is in the draft copy only if a FETCHED or ABSTRACT source supports it and it does not rest on a single weak source. Several sites block automated fetching (oed.com, merriam-webster.com, npg.si.edu, the live Harvard Chaucer site); for those I read the Internet Archive's copy and give the exact capture URL in the Bibliography.

Conventions: places are `[lon, lat]`, as in `story.ts`. Eras use the `Era` formats in `apps/phonaria/src/lib/language-spread/era.ts`. Character counts for card copy and descriptions were checked by script.

Stops, in page order:

1. `indo-european` (family, reused unchanged)
2. `germanic` (branch, reused with a new description)
3. `old-english` (language, new)
4. `old-norse` (language, new)
5. `norman-french` (language, new)
6. `printing` (language, new)
7. `great-vowel-shift` (language, new)
8. `american-english` (language, new)
9. `australian-english` (language, new)

The old `english` stop (London, 1607) is replaced by `american-english` and `australian-english`. Its sources carry over.

---

## Indo-European

Reused from [western-eurasia.md](western-eurasia.md), "Indo-European: where did it start?". The stop stays as it is in `story.ts`.

- id: `indo-european`
- kind: family
- date shown: ~8,000–6,000 years ago (`{ yearsAgo: 8000, to: 6000 }`)
- place: `[42, 47]`, `areaKm: 800`. The steppe north of the Black and Caspian Seas, the leading view. The wide area is there because the location is the open question.
- location uncertainty: high; see the source note.

Claims:

1. English is Indo-European: Proto-Germanic, the ancestor of English, "itself constitutes a branch of the larger Indo-European language family", whose other branches include Celtic, Italic (Latin and the Romance languages), Greek, Indo-Iranian (Sanskrit and Persian), Baltic and Slavonic. [oed-old-english] FETCHED
2. Homeland and date claims as recorded in western-eurasia.md: steppe view [haak-2015] [anthony-ringe-2015]; Anatolian view [bouckaert-2012]; the hybrid and Caucasus views [heggarty-2023] [lazaridis-2025]. All ABSTRACT there, Lazaridis full text.

Where scholars split: on where and when, as worded now. Not on English being Indo-European.

Draft description: unchanged from `story.ts`.

---

## Germanic

Reused from [western-eurasia.md](western-eurasia.md), "Germanic, and English as a descendant", with a new description. The old one ended with the crossing to Britain, which now has its own stop.

- id: `germanic`
- kind: branch
- date shown: ~500 BCE (`{ bce: 500 }`)
- place: `[10, 56]`, `areaKm: 400`. Southern Scandinavia and the north German coast.
- location uncertainty: medium. The region is agreed; the sub-area and the route from the Indo-European homeland are not.

Claims:

1. A distinct Germanic branch of Indo-European had formed in southern Scandinavia and northern Germany by about 500 BCE. [faarlund-2008] ABSTRACT (checked in western-eurasia.md)
2. English can be traced from Proto-Germanic through Proto-West-Germanic to Old English. [ringe-taylor-2014] ABSTRACT (checked in western-eurasia.md)
3. Old English belongs to the West Germanic branch with Old Frisian, Old Saxon, Old High German and the dialects that became Old Dutch. The North Germanic branch is represented by Old Icelandic, Old Norwegian, Old Swedish and Old Danish, and East Germanic by Gothic. All come from one ancestor, Proto-Germanic. [oed-old-english] FETCHED
4. The prehistoric relationships between Old English and the other Germanic languages are "much debated and very controversial". [oed-old-english] FETCHED

Where scholars split: how and when Germanic speech reached Scandinavia (see western-eurasia.md, including the McColl 2024 preprint, which stays out of the copy).

Draft description (226 chars): "A distinct Germanic branch had formed here by about 500 BCE. Its western group includes English, Frisian, Dutch and German; its northern group became Icelandic, Norwegian, Swedish and Danish. Gothic, in the east, has died out."

The modern descendants (Dutch, German and so on) are a plain step from the OED's Old forms. "Gothic has died out" rests on the OED's "the only representative of the East Germanic branch for which extensive remains survive is Gothic". Drop that last sentence if the owner wants only the OED's exact wording.

---

## Old English: across the North Sea

- id: `old-english`
- name: "Old English"
- kind: language
- date shown: ~450 CE (`{ ce: 450 }`). The OED puts the coming of Germanic settlers "in the period following the collapse of Roman Britain in the early fifth century". 450 is a mid-century marker, not a documented year.
- place: `[0.5, 52.5]`, `areaKm: 200`. Eastern England, where Gretzinger 2022 finds the highest continental ancestry. The area is soft because settlement covered a broad region over centuries.
- where (draft): "in eastern England, settled from across the North Sea"
- location uncertainty: medium. Eastern England is where the DNA signal is strongest, but settlement and the spread of English across what became England took several hundred years.
- spread (routes): from the continental North Sea coast (Jutland and northern Germany) to eastern England. Schematic.

Claims:

1. Old English is the earliest recorded stage of English, up to about 1150. It is the language of the Germanic settlers who came to Britain after Roman Britain collapsed in the early fifth century, used up to the Norman Conquest and for a century after. [oed-old-english] FETCHED
2. Ancient DNA from 460 medieval north-western Europeans shows a large increase of continental northern European ancestry in early medieval England, "closely related to the early medieval and present-day inhabitants of Germany and Denmark", implying large-scale migration across the North Sea. Some people in eastern England got up to 76% of their ancestry from the continental North Sea zone, with much regional variation. [gretzinger-2022] ABSTRACT (Europe PMC, re-read for this note)
3. Before the Anglo-Saxons came, most people in Britain spoke Celtic languages. Over the next several hundred years more and more of what became England came under Anglo-Saxon control. What happened to the British population "is a matter of much debate". English borrowed very few words from Celtic. [oed-old-english] FETCHED
4. The earliest extensive English texts in contemporary copies are Latin-English glossaries from around 700. Most Old English documents come from the late 800s on. [oed-old-english] FETCHED
5. Writing long texts in the Roman alphabet came with the conversion to Christianity, which began in the late 500s; before that, English was written only in short runic inscriptions. [oed-old-english] FETCHED (not used in the copy)

Where scholars split: whether the migration was many families or a small elite. Gretzinger 2022 argues for many; earlier studies argued for fewer (see western-eurasia.md). The OED calls the fate of the Britons "a matter of much debate". The card says "still debated" and doesn't pick a side.

Dropped:

- "Angles, Saxons and Jutes" as three named peoples from three named homelands: a traditional account I found only in encyclopedia-style leads, and the DNA paper doesn't support it at that level of detail.
- Specific claims about Celtic retreating to Wales, Cornwall and Scotland: plausible, but the only source I read (OED) gives only the general picture. Add it if a source is found.

Draft description (295 chars): "Settlers from what is now northern Germany and Denmark crossed the North Sea after Roman rule ended. Ancient DNA shows some people in eastern England got up to three-quarters of their ancestry from them. Their speech became Old English; its oldest substantial manuscripts date from about 700 CE."

Sources on the page: gretzinger-2022, oed-old-english.

---

## Old Norse: the Vikings

- id: `old-norse`
- name: "Old Norse"
- kind: language
- date shown: ~800 CE (`{ ce: 800 }`). The OED dates the raids and settlement "from the late-eighth century onwards". 800 rounds that.
- place: `[-1, 53.8]`, `areaKm: 220`. Northern and eastern England (Yorkshire and the East Midlands), the core of Scandinavian settlement.
- where (draft): "in the east and north of England"
- location uncertainty: medium. The OED names three areas: the east and north-east (mostly East Norse speakers, from what is now Denmark and Sweden), the north-west (mostly West Norse, from what is now Norway) and parts of Scotland. One pin with a soft area covers the first; the second route shows the north-west.
- spread (routes): Denmark to the Humber (East Norse); western Norway around the north of Scotland to north-west England (West Norse). Both schematic.

Claims:

1. Viking Age raids, settlement, conquests and take-overs ran through Anglo-Saxon history from the late 700s. Settlement was significant in the east and north-east of England (chiefly East Norse speakers), the north-west (chiefly West Norse) and parts of Scotland. Over generations the language died out in England. [oed-middle-english] FETCHED; raids from the late 8th century also in [oed-old-english] FETCHED
2. The settlers spoke Old Norse, a North Germanic language. Old English and Old Norse were close kin, so their speakers could probably understand each other to some extent. [nottingham-danelaw] FETCHED
3. English took everyday words from Old Norse, such as sky, skirt, window and egg. [nottingham-danelaw] FETCHED. The Ormulum (a long religious poem from about the middle of the 1100s, by a canon in south Lincolnshire) already has over a hundred Scandinavian words, including skin, take, want, wrong, law, die and ill. [oed-middle-english] FETCHED
4. English even borrowed the pronouns they, them and their. Borrowing pronouns is very rare; it probably reflects very close contact and the close similarity of the two languages. The new forms spread slowly: early London manuscripts of Chaucer still have native "hem" and "her" for "them" and "their". [oed-middle-english] FETCHED
5. Old English texts up to about 1100 have only about 100 Scandinavian loanwords, but many more appear in Middle English. Most probably entered some English dialects earlier. Scandinavian words are perhaps 2–3% of Middle English vocabulary, "to be treated with a good deal of caution", but many are very frequent. [oed-middle-english] FETCHED
6. Place names in the Danelaw mix English and Norse; Swarkestone in Derbyshire joins the Norse personal name Swerkir with Old English -tun, "farm". [nottingham-danelaw] FETCHED (not used in the copy)

Where scholars split: when most Norse words entered English (the OED says it is uncertain), and whether a given word is Norse or a rare Old English word, since the two languages were so similar. Not on the overall influence.

Dropped:

- Place names in -by and -thorpe as Norse: a well-known claim, but I didn't read a source for it. Swarkestone (claim 6) is the sourced example if the owner wants a place-name line.
- The Danelaw boundary and the treaty between Alfred and Guthrum: not checked in a source I could open.

Draft description (258 chars): "Scandinavians settled mostly in the east and north of England. Their Old Norse died out there, but English kept everyday words from it, such as sky, egg, skin, take and want. It even took the pronouns they, them and their, which languages very rarely borrow."

Sources on the page: oed-middle-english, nottingham-danelaw.

---

## French in England: the Norman Conquest

- id: `norman-french`
- name: "French in England"
- kind: language
- date shown: ~1066 CE (`{ ce: 1066 }`). A documented year: the Battle of Hastings, 14 October 1066.
- place: `[0.49, 50.91]`, no area. Battle, near Hastings, where the conquest was decided. It stands in for the arrival of a French-speaking ruling class, not for where French was spoken.
- where (draft): "near Hastings; French then spread with England's new rulers"
- location uncertainty: low for the battle; the pin is a symbol for a change that affected all of England.
- spread (routes): from Normandy to the Sussex coast at Pevensey, where William landed. The start point in Normandy is schematic.

Claims:

1. On 14 October 1066 William, Duke of Normandy, defeated King Harold at the Battle of Hastings, having landed at Pevensey in Sussex. He was crowned on Christmas Day 1066. [english-heritage-hastings] FETCHED
2. After the Conquest the ruling elite in England, in church and state, spoke French. English, which before 1066 had been used unusually widely in writing, was pushed out of written use almost entirely. Latin dominated writing, and new writing in a vernacular was in French. French competed with Latin in technical and official use until near the end of the Middle English period. [oed-middle-english] FETCHED
3. The OED dates Middle English 1150–1500, framed by the after-effects of the Norman Conquest and the arrival of printing in 1476. [oed-middle-english] FETCHED. The 1150 boundary is "very arbitrary": grammar and vocabulary changed gradually. [oed-old-english] FETCHED
4. In Middle English, words borrowed from French and Latin outnumber those surviving from Old English, though Old English words still top the frequency lists. Clear French borrowings include peace, marble, mercy, prison, pay, poor and rule; words such as animal, religion and remedy may come from French, Latin or both. [oed-middle-english] FETCHED
5. By 1500 more than 40% of all the words English has ever borrowed from French had appeared. The great peak of Latin borrowing came later, in the early modern period. [oed-middle-english] FETCHED
6. English also lost most of its word endings and its grammatical gender in this period and came to rely more on word order. [oed-middle-english] FETCHED (not used in the copy)

Where scholars split: what to call the French of medieval Britain ("Anglo-Norman" or "Anglo-French"); how much of the borrowing is from French and how much from Latin. Not on the main story.

Dropped:

- "French was the language of the English court for 300 years" and similar round figures: not in the sources read.
- A date for English returning to Parliament or the law courts: not checked.

Draft description (273 chars): "After 1066, England's rulers in church and state spoke French, and English almost disappeared from writing. When it came back, it was full of French words such as peace, mercy, prison and rule. By 1500 over 40% of all the words English has borrowed from French had arrived."

Sources on the page: english-heritage-hastings, oed-middle-english.

---

## London English and the printing press

- id: `printing`
- name: "Printing at Westminster"
- kind: language
- date shown: ~1476 CE (`{ ce: 1476 }`). Caxton's first documented rent for a shop in Westminster is dated 30 September 1476.
- place: `[-0.13, 51.5]`, no area. Westminster, then just outside London.
- where (draft): "at Westminster, beside London"
- location uncertainty: low. Caxton rented premises in the Abbey precincts.
- spread (routes): none.

Claims:

1. From the late 1300s English came back into books and into technical and official writing, above all in London. Major writers based around the capital, such as Geoffrey Chaucer, John Gower and William Langland, wrote in it. [oed-middle-english] FETCHED
2. London English of the late 1300s and 1400s took in many features from the central and east Midlands; it isn't a direct continuation of the West Saxon written standard of late Old English. [oed-middle-english] FETCHED
3. William Caxton, a merchant born in Kent, learned printing in Cologne in the early 1470s and around 1473, probably in Bruges, produced the first book printed in English. He returned to England late in 1475 or early in 1476, set up the first English press at Westminster, and printed books until his death in 1492. [bl-caxton-life] FETCHED. The first record of him in Westminster is his rent for a shop on 30 September 1476. [bl-caxton-westminster] FETCHED. Westminster Abbey's records show he rented a shop from the Abbey's sacrist from 1476 to 1491. [westminster-abbey-caxton] FETCHED
4. His first substantial book in England was in all probability Chaucer's Canterbury Tales. The edition is undated, but the type and paper point to 1476. [bl-caxton-canterbury] FETCHED. The De Montfort University census of Caxton's editions dates it "about 1476-77". [dmu-caxton-census] FETCHED
5. About 68% of Caxton's editions were in English, against about 70% of all surviving 15th-century editions being in Latin. His spelling varied widely within and between books. "At most, his English printed books helped consolidate a growing perception that the language used in the London region was a nationwide standard." [bl-caxton-english] FETCHED
6. Caxton wrote that English had changed since he was born. In the preface to the Eneydos, one of his last works, he told of merchants on the Thames who asked a woman in Kent for "egges"; she said she spoke no French, and understood only when another asked for "eyren". "What should a man in these days now write, eggs or eyren?" [bl-caxton-english] FETCHED. "Egg" is from Old Norse. [nottingham-danelaw] FETCHED
7. Printers from the late 1400s printed the London English that had already become a kind of standard in manuscripts. English spelling became gradually regular between 1475 and about 1630, and printed English looks largely modern after the mid-1600s. [oed-early-modern] FETCHED

Where scholars split: how standard written English formed. The OED says "Chancery English" (the usage of official documents) fed into printers' practice, "but this is only one aspect of a very complex story, which is still subject to considerable uncertainty and debate". The BL is cautious about Caxton's own part. The copy says printing "helped spread" London English and that spelling still varied.

Dropped:

- "Caxton's first press was in the Almonry": Westminster Abbey says that is often stated but wrong; his shop in the Almonry (the Red Pale) came about 1482–83.
- "The Canterbury Tales was printed in 1477": BL and DMU give 1476 and about 1476–77. The page shows ~1476.
- "Caxton created standard English spelling": the BL says the opposite.
- Chancery Standard as the origin of standard English: debated, per the OED.

Draft description (265 chars): "Caxton set up England's first printing press here in 1476. His books spread the English of the London area, though their spelling still varied. He saw English changing too: should he write \"egges\", a Norse word, or \"eyren\", the only word a woman in Kent understood?"

Sources on the page: bl-caxton-life, bl-caxton-english, westminster-abbey-caxton.

---

## The Great Vowel Shift

The most important step for Phonaria learners: it explains why English vowel letters don't match their sounds.

- id: `great-vowel-shift`
- name: "The Great Vowel Shift"
- kind: language. The types have no kind for a sound change; `language` is the nearest.
- date shown: ~1400–1700 CE (`{ ce: 1400, to: 1700 }`). Harvard's Chaucer site gives the 12th to the 18th century "but with its main effects in the fifteenth and early sixteenth centuries"; the OED shows spelling falling out of step with pronunciation "by the sixteenth century". The range shows the main period, not the earliest proposed start.
- place: `[-1.2, 52.3]`, `areaKm: 250`. England, with the soft area over the Midlands and south. It happened across England, unevenly.
- where (draft): "across England; northern dialects changed differently"
- location uncertainty: medium. This is a change in speech, not a movement of people, so the area just marks where it happened. The standard language followed the south and the London area; northern dialects had their own outcomes [stenbrenden-2015] [prichard-2014].
- spread (routes): none.

Claims:

1. The main difference between Chaucer's English and ours is in the long vowels; the consonants and short vowels are much the same. From the 12th to the 18th century, with the main effects in the 1400s and early 1500s, the long stressed vowels changed where in the mouth they are made. Nobody knows why. [harvard-gvs] FETCHED
2. The pattern: the front long vowels each moved up a step, except the highest, /iː/, which became a diphthong (a vowel that glides from one sound to another); the back vowels did the same, and the highest, /uː/, became another diphthong. Only long, stressed vowels were affected. [harvard-gvs] FETCHED. The OED gives the same picture with mite, meet and mate: in Middle English these were [iː], [eː] and [aː], and after the shift long i was a diphthong, long e had become [iː], and long a became a front vowel, later [eː]; "a parallel change affected the back vowels of mouth and moot". [oed-early-modern] FETCHED
3. Concrete before and after, from Harvard's guide to Chaucer's long vowels: Chaucer's "myne" (mine) and "sight" had the vowel of modern "meet"; "me" and "meet" had the vowel of modern "mate"; "mate" had the vowel of "father"; "hous" (house) had the vowel of "boot"; "boot" had the vowel of "oak". [harvard-gvs] FETCHED. The OED agrees for "fine" (said like modern "meet") and "meet" (closer to modern "make", but a pure vowel, not a diphthong). [oed-middle-english] FETCHED
4. Why spelling didn't follow: Middle English spelling used the vowel letters with roughly their Latin values, so it was close to phonetic. Printing was fixing spelling in its late Middle English form "just when various sound changes were having a far-reaching effect on pronunciation". Hence "the mismatch of the long vowel sounds of English with their counterparts in other European languages". [oed-early-modern] FETCHED; [harvard-gvs] FETCHED
5. Other changes in the same period widened the gap: several vowel sounds merged while keeping different spellings (mane and main, sloe and slow), and some consonants stopped being pronounced (the k in knight, the w in write, the gh in night). [oed-early-modern] FETCHED
6. People noticed at the time. In the 16th century the first proposals to reform English spelling appeared; in 1569 John Hart devised a new phonetic alphabet, and his work and other reformers' are the best evidence for the pronunciation of the time. [harvard-gvs] FETCHED
7. The shift wasn't perfectly neat: the vowel of "break" stopped halfway while "beak" went all the way to /iː/. [harvard-gvs] FETCHED

Where scholars split:

- Dating. Harvard gives a long span with the main effects in the 1400s and early 1500s. Stenbrenden, working from irregular spellings in localized Middle English texts, argues that the raising of long o began in the mid-to-late 1200s in the Midlands, overlapping with "Northern Fronting" in the far north, so "if there was any 'Great Vowel Shift', it must include Northern Fronting, as well as other presumed earlier changes". [stenbrenden-2015] ABSTRACT; her book makes the same case for all the long vowels. [stenbrenden-2016] ABSTRACT
- Was it one event? Some have taken the varied outcomes in English dialects as evidence that it was not a single shift. Prichard 2014 argues that dialect contact explains those outcomes, and that the dialect map supports a "push-chain": the mid vowels rose first and pushed the high vowels into diphthongs. [prichard-2014] ABSTRACT. The order (push or pull) stays out of the copy; it's too technical for the card.

Dropped:

- Exact phonetic stages (for example [əi] for "mine" in the 1500s). The OED gives these, but they are too detailed for the card. Keep them for a future pronunciation lesson.
- Popular causes (the Black Death, migration to London after the plague, prestige of French): I found no scholarly source I could read, and Harvard says "not why; no one knows".
- "name" as an example: the brief suggested bite, meet, name, house. The sources use mite/mine, meet, mate and house, so the copy uses those.

Draft description (255 chars): "Each long vowel moved up in the mouth, and the highest two, in \"mine\" and \"house\", became two-part sounds. Most of it happened in the 1400s and 1500s, but some scholars trace the first changes to the 1200s and argue it was several linked changes, not one."

Sources on the page: harvard-gvs, oed-early-modern, stenbrenden-2015, prichard-2014.

---

## American English

- id: `american-english`
- name: "American English"
- kind: language
- date shown: ~1607 CE (`{ ce: 1607 }`)
- place: `[-76.78, 37.21]`, no area. Jamestown, Virginia.
- where (draft): "at Jamestown, Virginia, the first lasting English settlement"
- location uncertainty: low for Jamestown. American English formed from many settlements over two centuries, so the pin marks the start, not a homeland.
- spread (routes): London to Jamestown across the Atlantic. Schematic.

Claims:

1. In 1607, 104 English men and boys arrived and chose Jamestown, Virginia, on 13 May. It became "the first permanent English settlement in North America". [nps-jamestown] FETCHED (re-read through the Wayback capture)
2. Noah Webster's American Dictionary of the English Language (1828) documented words, idioms and pronunciations unique to the United States, and "standardized the simplified spellings that still differentiate American English from British English, dropping the 'u' from 'colour'". [npg-webster] FETCHED. It was first published on 14 April 1828, and Webster's ideas on spelling "contributed to" differences such as colour/color and theatre/theater; many of his proposals (tung, lether) didn't catch on. [merriam-webster-1828] FETCHED. He already used "color" in his first dictionary, the Compendious Dictionary of 1806. [noah-webster-house] FETCHED
3. Accents that pronounce r after a vowel (in car, hard, more) are "rhotic". This was "at one time a feature of speech throughout the UK"; in England it is now mostly limited to the West Country and a small area of Lancashire, though most Scottish and Irish accents keep it. [bl-sounds-familiar] FETCHED
4. Rhotic Englishes are conservative: they haven't undergone the loss of r that non-rhotic ones did. Historians generally date the start of that loss in England to the 18th century. American English is predominantly rhotic. [trudgill-gordon-2006] ABSTRACT

Where scholars split: why American English stayed rhotic. The usual explanation is that English was taken to North America before the loss of r began in England. Trudgill and Gordon (2006) present evidence from Australia that "this obvious conclusion is incorrect" (the abstract doesn't say what they propose instead). The copy says that American English keeps the r and that southern England lost it, and avoids "because".

Dropped:

- "Americans speak like Shakespeare" and similar: popular, not sourced, and misleading.
- Webster "invented" American spelling: Merriam-Webster says he presented it as reasserting older rules, and the spellings were not all new. The copy says he made them standard.
- Numbers of entries in Webster's dictionaries (65,000 or 70,000): sources disagree, and the copy doesn't need them.
- The spread of r-pronunciation in the US after the Second World War: search summaries and Wikipedia only.

Draft description (259 chars): "Jamestown, founded in 1607, was the first lasting English settlement in North America. American English kept the r after vowels, in words like car, which southern England later lost. Noah Webster's 1828 dictionary made its own spellings, like color, standard."

Sources on the page: nps-jamestown, npg-webster, trudgill-gordon-2006, bl-sounds-familiar.

Phonaria's target accent (`en-us`) is rhotic, so this stop links straight to what learners practise. Whether the card should say so ("the accent this app teaches") is the owner's call.

---

## English in Australia

- id: `australian-english`
- name: "English in Australia"
- kind: language
- date shown: ~1788 CE (`{ ce: 1788 }`)
- place: `[151.21, -33.86]`, no area. Sydney Cove.
- where (draft): "at Sydney Cove, on Eora land"
- location uncertainty: low.
- spread (routes): London to Sydney by the Atlantic, the Cape and the Indian Ocean. Schematic; the waypoints follow the existing `empires` route.

Claims:

1. The First Fleet of 11 ships, commanded by Captain Arthur Phillip, set up a convict settlement at Sydney Cove (now Circular Quay) on 26 January 1788, the beginning of European colonisation of Australia. It "changed forever the lives of the Eora people, the traditional Aboriginal owners of the land in the Sydney area", and convict transportation lasted until 1868. [nma-first-fleet] FETCHED (now read through the Wayback capture; modern.md had it as SEARCH-CONFIRMED)
2. English is the largest language counting all speakers "due first to the colonial influence of the British Empire, and later to the spread of American culture". It is spoken in 188 countries, many of them in Africa. [ethnologue-most-spoken] FETCHED (Wayback capture of 2026-03-14)

Where scholars split: not on these facts.

Dropped:

- English in India and in West or East Africa with dates: as in modern.md, no dated source was found. The East India Company charter (1600) and Macaulay's Minute (1835) are still unread. The card covers this with Ethnologue's general statement and has no arrows to India or Africa.
- Southern Hemisphere English being non-rhotic because it left Britain later: Trudgill and Gordon (2006) dispute the simple version, and it isn't needed here.

Draft description (219 chars): "The First Fleet of 11 ships set up a convict settlement at Sydney Cove on 26 January 1788, the start of European colonisation of Australia. It changed forever the lives of the Eora people, the land's traditional owners."

Sources on the page: nma-first-fleet.

---

## Steps

Eleven steps. Copy lengths are card text only, both paragraphs together. Card placement assumes a 16:10 screen with the camera region centred; fractions are of screen width (x, from the left) and height (y, from the top), estimated from the bounds, which is approximate on a globe.

### 1. `intro`

- title: "The story of English"
- era: `{ bce: 4000 }` (matches the first content step)
- card copy (298 chars):
  > English is one language with a long family history. Its roots reach back thousands of years, to people who never wrote anything down.
  >
  > Follow it to the language about 1.5 billion people use today, and see why its spelling and sounds so often disagree. Pins mark approximate places, never exact spots.
- stops: none
- routes: none
- camera: WORLD `{ west: -170, south: -56, east: 190, north: 78 }`
- card: `center-left` (default; nothing to cover)
- sources: none needed; every claim is backed by a later step (1.5 billion: `today`).

### 2. `indo-european`

- title: "One ancestor, many languages"
- era: `{ bce: 4000 }`
- card copy (369 chars):
  > English belongs to the Indo-European family, with most languages of Europe and also Persian and Hindi. All of them come from one ancestor spoken before writing.
  >
  > Where it was spoken is still argued. Many archaeologists and geneticists favour the grasslands north of the Black Sea, about 6,000 years ago. Language-tree studies point others to an older start further south.
- stops: `indo-european`
- routes (west, towards the Germanic homeland; schematic):
  - `[[42, 47], [30, 49], [18, 52], [11, 55]]`
- camera: `{ west: -12, south: 30, east: 75, north: 65 }`
- card: `bottom-left`. The pin sits at about x 0.62, y 0.51 and the route's end at about x 0.26, y 0.29; the bottom-left quarter is Iberia and North Africa, which this step doesn't use.
- sources: oed-old-english (English as Indo-European), plus the stop's.

The old step had a second arrow east to the Urals. It is left out because this story follows the branch that leads to English. "Further south" shortens "south of the Caucasus or in Anatolia"; the pin's `where` keeps the full wording.

### 3. `germanic`

- title: "The Germanic branch"
- era: `{ bce: 500 }`
- card copy (264 chars):
  > By about 500 BCE, people in southern Scandinavia and northern Germany spoke a language of their own: Germanic.
  >
  > Its descendants include English, Frisian, Dutch, German and the Scandinavian languages. English sits in the western group, with Frisian, Dutch and German.
- stops: `germanic`
- routes: none. How Indo-European speech reached Scandinavia is disputed, and an arrow would pick a side.
- camera: `{ west: -12, south: 44, east: 30, north: 64 }`
- card: `bottom-left`. The pin is at about x 0.52, y 0.40; the bottom-left covers the Bay of Biscay and western France.
- sources: via its stop (faarlund-2008, oed-old-english).

### 4. `old-english`

- title: "Across the North Sea"
- era: `{ ce: 450 }`
- card copy (294 chars):
  > After Roman rule in Britain ended in the early 400s, settlers from what is now northern Germany and Denmark crossed the North Sea. Their speech became Old English.
  >
  > Most people in Britain then spoke Celtic languages, and what happened to them is still debated. English took very few Celtic words.
- stops: `old-english`
- routes (schematic):
  - `[[9.5, 55], [5, 54.5], [1.5, 52.8]]` (from Jutland)
  - `[[8, 53.6], [4, 53], [1.6, 52.3]]` (from the north German coast)
- camera: `{ west: -14, south: 47, east: 14, north: 60 }`
- card: `bottom-left`. The pin is at about x 0.52, y 0.58 and the route starts are at about x 0.80–0.84, y 0.38–0.49. The bottom-left is Ireland and the Atlantic.
- sources: via its stop (gretzinger-2022, oed-old-english).

### 5. `vikings`

- title: "Vikings and Old Norse"
- era: `{ ce: 800 }`
- card copy (310 chars):
  > From the late 700s, Viking raiders and settlers from Scandinavia came to England. Their Old Norse was a close cousin of English.
  >
  > English took words like sky, egg, skin and window from them, and even the pronouns they, them and their. Borrowing pronouns is very rare, a sign of how closely the two peoples lived.
- stops: `old-norse`
- routes (schematic):
  - `[[10, 56], [4, 55], [-0.3, 53.7]]` (East Norse, Denmark to the Humber)
  - `[[5.5, 60.5], [-2, 59.5], [-6, 57], [-3.2, 54.4]]` (West Norse, Norway around Scotland to Cumbria)
- camera: `{ west: -14, south: 48, east: 16, north: 63 }`
- card: `bottom-right`. The pin is at about x 0.43, y 0.61; Denmark at about x 0.80, y 0.47; the West Norse route stays on the left half and the top. The bottom-right is the Low Countries and northern Germany, which this step doesn't use.
- sources: via its stop (oed-middle-english, nottingham-danelaw).

### 6. `norman-conquest`

- title: "The Norman Conquest"
- era: `{ ce: 1066 }`
- card copy (327 chars):
  > In 1066 William, Duke of Normandy, defeated King Harold at Hastings and took the English throne. England's new rulers, in church and state, spoke French.
  >
  > English almost vanished from writing. When it came back it was full of French words like peace, mercy and rule. This stage, from about 1150 to 1500, is called Middle English.
- stops: `norman-french`
- routes (start schematic):
  - `[[-0.2, 49.3], [0.1, 50.2], [0.33, 50.8]]` (Normandy to Pevensey)
- camera: `{ west: -8, south: 46, east: 8, north: 56 }`
- card: `top-right`. The pin is at about x 0.53, y 0.51 and Normandy at about x 0.49, y 0.67. The top-right is the North Sea.
- sources: via its stop (english-heritage-hastings, oed-middle-english).

### 7. `printing`

- title: "London English and the printing press"
- era: `{ ce: 1476 }`
- card copy (328 chars):
  > By the late 1300s English was back in books and official records, above all in London, home to writers like Geoffrey Chaucer.
  >
  > In 1476 William Caxton set up England's first printing press at Westminster, and Chaucer's Canterbury Tales was among his first books. Printing helped spread London English, though spelling still varied.
- stops: `printing`
- routes: none
- camera: `{ west: -6, south: 49.5, east: 4, north: 55 }`
- card: `top-left`. The pin is at about x 0.59, y 0.64; the top-left is Wales, the Irish Sea and northern England.
- sources: oed-middle-english (London and Chaucer), plus the stop's.

### 8. `great-vowel-shift`

- title: "The Great Vowel Shift"
- era: `{ ce: 1400, to: 1700 }`
- card copy (338 chars):
  > Between about 1400 and 1700, the long vowels of English moved. Chaucer's "mine" sounded like "meen", his "meet" like "mate", and his "house" like "hoos".
  >
  > Printing was fixing spelling at the same time, so the letters kept their old values. That's why English vowel letters often don't match their sounds, or their sounds in other languages.
- stops: `great-vowel-shift`
- routes: none
- camera: `{ west: -10, south: 48, east: 10, north: 58 }`
- card: `center-right`. The soft area spans about x 0.25–0.62; the right side is the North Sea and the Low Countries.
- sources: via its stop (harvard-gvs, oed-early-modern, stenbrenden-2015, prichard-2014).

"meet like mate" uses Harvard's comparison: Chaucer's close e sounded like the vowel in modern "mate", but as a pure vowel, not today's glide. "Meen" and "hoos" are respellings for learners, not IPA. If the owner prefers IPA, the pairs are /miːn/ → /maɪn/, /meːt/ → /miːt/, /huːs/ → /haʊs/.

### 9. `america`

- title: "Across the Atlantic"
- era: `{ ce: 1607 }`
- card copy (311 chars):
  > In 1607, 104 English men and boys founded Jamestown, Virginia, the first lasting English settlement in North America.
  >
  > American English kept the r after vowels, in words like car and hard, that southern England later dropped. Noah Webster's 1828 dictionary made American spellings like color and theater standard.
- stops: `american-english`
- routes (schematic):
  - `[[-0.1, 51.5], [-40, 46], [-76.8, 37.2]]` (the existing Jamestown route)
- camera: `{ west: -90, south: 25, east: 5, north: 58 }`
- card: `bottom-right`. Jamestown is at about x 0.14, y 0.63 and London at about x 0.94, y 0.20; the bottom-right is the open Atlantic off Iberia and Morocco.
- sources: npg-webster, merriam-webster-1828 (Webster), plus the stop's.

### 10. `around-the-world`

- title: "Around the world"
- era: `{ ce: 1788 }`
- card copy (292 chars):
  > In January 1788 a fleet of 11 ships set up a British convict settlement at Sydney Cove, on the land of the Eora people. It began the colonisation of Australia.
  >
  > English spread with the British Empire, and later with American culture. Today it is spoken in 188 countries, many of them in Africa.
- stops: `australian-english`
- routes (schematic):
  - `[[-0.1, 51.5], [-20, 10], [18, -36], [80, -25], [151.2, -33.9]]` (the existing Sydney route)
- camera: `{ west: -20, south: -45, east: 160, north: 60 }`
- card: `top-right`. Sydney is at about x 0.95, y 0.75, London at about x 0.11, y 0.08, and the route bottoms out at the Cape (about x 0.21, y 0.92). The top-right is China and Japan, which this step doesn't use.
- sources: ethnologue-most-spoken, plus the stop's.

### 11. `today`

- title: "Today"
- era: `"today"`
- card copy (202 chars):
  > About 1.5 billion people speak English, more than any other language. Most of them learned it as an extra language.
  >
  > Counting only native speakers, English comes third, after Mandarin Chinese and Spanish.
- stops: none
- routes: none
- camera: WORLD
- card: `center-left`
- sources: statista-2026, ethnologue-most-spoken.

"Most learned it as an extra language" is an inference, not one quoted figure: Ethnologue ranks English third by native speakers, behind Spanish, which has about 520 million native speakers (Instituto Cervantes 2025, in modern.md). So at most about a third of 1.49 billion are native speakers. The secondhand Ethnologue table in modern.md gives about 372 million native speakers, which agrees. Ethnologue's own page also says "English has more non-native speakers".

---

## The sample sentence

Added on 2026-10-28 so a reader can see English change, not only read about it. One sentence is shown in every stage: the opening of the Lord's Prayer (Matthew 6:9). It was put into English again and again from Old English onward, so it is the usual way to compare the stages. Cook (1891) traces it this way, from the West Saxon Gospels through Wyclif, Tyndale and later Bibles. Each line is quoted as its edition prints it, and was checked by a research agent against the page scan, not OCR. Cook is used for the comparison only: his Wycliffite text uses modern v, and he dates Tyndale to 1534.

| Sample | Card | Line as printed | Edition and check |
| --- | --- | --- | --- |
| `old-english` | `old-english` | Fæder úre þu þe eart on heofonum; Si þin nama gehalgod | Skeat 1887, p. 54, col. 1 (Corpus Christi College Cambridge MS 140). Scan viewed. Skeat prints "heofonum ;" with a space and marks the expanded abbreviation in italics; the page drops both. The acute on úre is the manuscript's. Skeat gives no date; Cook puts the Old English versions "not earlier than 950 to 1000 A.D.", so the page says "about 1000 CE". |
| `middle-english` | `norman-conquest` | Oure fadir that art in heuenes, halewid be thi name | Forshall & Madden 1850, vol. 4, p. 14, the later version (the earlier version reads "halwid"). Scan viewed. The editors date the later version by its General Prologue, summer 1388, so the page says "about 1390". |
| `tyndale` | `printing` | O oure father which arte in heven/ halowed be thy name. | Fry's 1862 facsimile of Tyndale's 1526 New Testament, leaf "Fo. vij" verso. Scan viewed; Offor's 1836 reprint (Bagster) prints the same line. The slash is the original's virgule. Fry calls it "The first New Testament printed in the English language". |
| `king-james` | none, comparison only | Our father which art in heauen, hallowed be thy name. | King James Bible, 1611, Robert Barker (University of Pennsylvania copy, BS185 1611 .L65). Scan viewed. Caveat: a public upload to an Internet Archive community collection, not Penn's own; the He/She issue was not checked, and the verse is not expected to differ. |
| `today` | `today` | Our Father in heaven, may your name be kept holy. | The page's own plain-English meaning, not a quoted translation, so it has no source. |

Judgment calls:

- **A religious text.** It is the only text with versions in every stage, and it is the standard comparison. The section introduces it plainly as "a Christian prayer", without comment.
- **A caption and a comparison.** On its step, each version floats over the map as a caption under the era dial, on the side the card leaves free, with today's word under each old word. The camera frames the globe below it. All versions also appear together after the story, with a hint of a few words ("þ = th", "heuenes = heavens") and their sources. The King James line is shown only there, since no step covers 1611 in England. The design was chosen from prototypes: a separate card, a tilted folio page, a pull quote, an inverted word-by-word card and the caption, then the caption with three ways to show today's words.
- **Today's words are the page's own glosses**, one modern word per old word, in the old order (`fæder úre` over "father our"), so a reader sees both the old words and the old word order. They are not taken from a source: they are standard and checked against the meaning, and a test keeps one gloss per word. `thou`/`thy` forms are glossed "you"/"your", and "which" as "who".
- **Dates.** A version is written later than its step's date: the Old English step is ~450 CE but the line is from about 1000. The caption's label gives its own date.
- **Left out:** audio of the old lines (no sourced reconstructions), the Lindisfarne gloss and other Old English dialect versions, and the rest of the prayer.

---

## Claims dropped across the story

| Claim | Reason |
| --- | --- |
| Angles, Saxons and Jutes from three named homelands | Traditional account; not supported at that detail by the sources read |
| Celtic retreating to Wales, Cornwall and Scotland | Only the general OED picture was read |
| Place names in -by and -thorpe | No source read; Swarkestone is the sourced example |
| Danelaw boundary, Alfred and Guthrum | Not checked |
| "French at court for 300 years" and similar | Not in the sources read |
| Caxton's first press in the Almonry | Westminster Abbey says this is wrong |
| Canterbury Tales printed 1477 | BL and DMU give 1476 / about 1476–77 |
| Caxton or Chancery created standard English | BL and OED say it's more complex and debated |
| Causes of the Great Vowel Shift (plague, migration, French) | No scholarly source read; Harvard says nobody knows why |
| Detailed vowel stages and push-chain versus drag-chain | Sourced, but too technical for the card; kept in the notes |
| "Americans speak like Shakespeare" | Popular myth, unsourced |
| Webster "invented" American spelling | Merriam-Webster says otherwise |
| Webster entry counts | Sources disagree |
| r-pronunciation spreading in the US after 1945 | Wikipedia and search summaries only |
| English in India and Africa with dates | No dated source read (as in modern.md) |
| British Council's 1.75 billion | Search summary only; a different definition |
| An exact native-speaker number for English | Secondhand table only; the card uses "most" instead |

---

## Bibliography

Reused ids keep the citation and URL already in `story.ts`. New ids are marked "new".

- `oed-old-english` (new). Durkin, Philip. "Old English – an overview." Oxford English Dictionary. Read at https://web.archive.org/web/20240111083547/https://www.oed.com/discover/old-english-an-overview/ (the live page needs a login). FETCHED. Supports: English as West Germanic and Indo-European; Old English to about 1150; settlers after Roman Britain collapsed in the early 5th century; Celtic speakers before; the Britons' fate debated; very few Celtic loanwords; glossaries from about 700; Scandinavian raids from the late 8th century; 1150 as an arbitrary boundary.
- `oed-middle-english` (new). Durkin, Philip. "Middle English – an overview." Oxford English Dictionary. Read at https://web.archive.org/web/20260820012839/https://www.oed.com/discover/middle-english-an-overview/. FETCHED. Supports: Middle English 1150–1500, framed by the Conquest and printing in 1476; the French-speaking elite; English pushed out of writing; Viking settlement areas; about 100 Norse loanwords before 1100; the Ormulum words; they/them/their; Norse 2–3% of vocabulary; French loan examples; over 40% of French borrowings by 1500; London English, Chaucer, Gower, Langland; Chancery English debated; Middle English vowel values (fine like "meet").
- `oed-early-modern` (new). Weiner, Edmund. "Early modern English: grammar, pronunciation, and spelling." Oxford English Dictionary. Read at https://web.archive.org/web/20241225170417/https://www.oed.com/discover/early-modern-english-spelling-grammar-and-pronunciation/?tl=true. FETCHED. Supports: printers using London English; spelling regularized 1475 to about 1630; printing fixed spelling as sounds changed; the Great Vowel Shift with mite, meet, mate, mouth, moot; mergers and silent consonants; the mismatch with other European languages.
- `harvard-gvs` (new). Harvard's Geoffrey Chaucer Website. "The Great Vowel Shift." Harvard University. Read at https://web.archive.org/web/20251112091356/https://chaucer.fas.harvard.edu/pages/great-vowel-shift (the live page returned 403). FETCHED. Supports: dating (12th–18th century, main effects in the 15th and early 16th); the pattern of the shift; Chaucer's long vowels compared with modern words; nobody knows why; John Hart 1569; break and beak.
- `stenbrenden-2015` (new). Stenbrenden, Gjertrud Flermoen. 2015. "The development of early Middle English ō." In Historical Linguistics 2013 (Current Issues in Linguistic Theory 334), John Benjamins, pp. 41–52. https://doi.org/10.1075/cilt.334.03ste. ABSTRACT (via Crossref). Supports: raising of long o from the mid-to-late 13th century in the Midlands; overlap with Northern Fronting; the Great Vowel Shift, if one event, must include earlier changes.
- `stenbrenden-2016` (new). Stenbrenden, Gjertrud Flermoen. 2016. Long-Vowel Shifts in English, c. 1050–1700: Evidence from Spelling. Cambridge University Press. https://doi.org/10.1017/CBO9781107295469. ABSTRACT (publisher description via Crossref and Cambridge Core). Supports: the shift studied together with earlier long-vowel changes usually treated as separate. Notes only; the 2015 chapter carries the specific dates.
- `prichard-2014` (new). Prichard, Hilary. 2014. "Northern dialect evidence for the chronology of the Great Vowel Shift." Journal of Linguistic Geography 2(2): 87–102. https://doi.org/10.1017/jlg.2014.9. ABSTRACT (via Crossref). Supports: dialect outcomes once used against the shift's unity are explained by dialect contact; push-chain order.
- `nottingham-danelaw` (new). University of Nottingham Manuscripts and Special Collections. "Danelaw Saga: Language and Runes" (exhibition panel, PDF). https://www.nottingham.ac.uk/manuscriptsandspecialcollections/documents/exhibitions/danelaw-saga/ds-language-and-runes.pdf. FETCHED. Supports: Old Norse a North Germanic language; close kinship and possible mutual understanding; skirt, sky, window and egg from Old Norse; Swarkestone.
- `english-heritage-hastings` (new). English Heritage. "History of 1066 Battle of Hastings, Abbey and Battlefield." https://www.english-heritage.org.uk/visit/places/1066-battle-of-hastings-abbey-and-battlefield/history-and-stories/history/. FETCHED. Supports: 14 October 1066; William, Duke of Normandy; landing at Pevensey; crowned Christmas Day 1066.
- `bl-caxton-life` (new). British Library. "Caxton's Chaucer: Caxton's life." Read at https://web.archive.org/web/20201202183431/https://www.bl.uk/treasures/caxton/caxtonslife.html. FETCHED. Supports: born in Kent; Cologne; first book printed in English around 1473, probably in Bruges; returned late 1475 or early 1476; first English press at Westminster; Canterbury Tales probably his first substantial book in England; died 1492.
- `bl-caxton-westminster` (new). British Library. "Caxton's Chaucer: From Flanders to Westminster." Read at https://web.archive.org/web/20211206022303/https://www.bl.uk/treasures/caxton/flanderswest.html. FETCHED. Supports: first record of rent for a Westminster shop on 30 September 1476. Notes only; the page cites bl-caxton-life.
- `bl-caxton-canterbury` (new). British Library. "Caxton's Chaucer: The Canterbury Tales." Read at https://web.archive.org/web/20210126182155/https://www.bl.uk/treasures/caxton/canterbury.html. FETCHED. Supports: first edition undated, dated to 1476 from type and paper; second edition probably 1483. Notes only.
- `bl-caxton-english` (new). British Library. "Caxton's Chaucer: Caxton's English." Read at https://web.archive.org/web/20201114001854/https://www.bl.uk/treasures/caxton/english.html. FETCHED. Supports: about 68% of his editions in English; varied spelling; London-area English as a growing standard; English changing in his lifetime; "egges" or "eyren".
- `westminster-abbey-caxton` (new). Westminster Abbey. "William Caxton." https://www.westminster-abbey.org/abbey-commemorations/commemorations/william-caxton. FETCHED. Supports: rented a shop from the Abbey's sacrist 1476–1491; not first in the Almonry; the Red Pale about 1482–83.
- `dmu-caxton-census` (new). Caxton and Beyond, De Montfort University. "Chaucer's Canterbury Tales (Caxton): edition description." https://caxtonandbeyond.dmu.ac.uk/editions/11_Cha_Can.html. FETCHED. Supports: Westminster, first edition, about 1476–77. Notes only.
- `nps-jamestown` (reused). U.S. National Park Service. "A short history of Jamestown." https://www.nps.gov/jame/learn/historyculture/a-short-history-of-jamestown.htm; re-read at https://web.archive.org/web/20260101062407/https://www.nps.gov/jame/learn/historyculture/a-short-history-of-jamestown.htm. FETCHED. Supports: 104 men and boys, 1607, first permanent English settlement in North America.
- `npg-webster` (new). National Portrait Gallery, Smithsonian Institution. "Noah Webster" (object NPG.67.31, label text). https://npg.si.edu/object/npg_NPG.67.31; read at https://web.archive.org/web/20251201044513/https://npg.si.edu/object/npg_NPG.67.31. FETCHED. Supports: American Dictionary (1828); documented American words and pronunciations; standardized the simplified spellings, dropping the u from colour.
- `merriam-webster-1828` (new). Merriam-Webster. "Webster's 1828 American Dictionary of the English Language." Wordplay. https://www.merriam-webster.com/wordplay/noah-webster-dictionary; read at https://web.archive.org/web/20251231013637/https://www.merriam-webster.com/wordplay/noah-webster-dictionary. FETCHED. Supports: published 14 April 1828; contributed to colour/color, theatre/theater; failed proposals; presented as reasserting old rules.
- `noah-webster-house` (new). Noah Webster House & West Hartford Historical Society. "Noah Webster and Establishing a National Identity." https://noahwebsterhouse.org/websters-schoolhouse/noah-webster-and-establishing-a-national-identity/; read at https://web.archive.org/web/20251226065042/https://noahwebsterhouse.org/websters-schoolhouse/noah-webster-and-establishing-a-national-identity/. FETCHED. Supports: "color" already in the 1806 Compendious Dictionary. Notes only; a house museum, secondary.
- `trudgill-gordon-2006` (new). Trudgill, Peter and Gordon, Elizabeth. 2006. "Predicting the past." English World-Wide 27(3): 235–246. https://doi.org/10.1075/eww.27.3.02tru. ABSTRACT (via Crossref). Supports: rhotic Englishes are conservative; loss of r in England usually dated to the 18th century; American English predominantly rhotic; the usual export explanation challenged.
- `bl-sounds-familiar` (new). British Library. "Sounds Familiar? Phonological variation" (Rhoticity). Read at https://web.archive.org/web/20151224231447/http://www.bl.uk/learning/langlit/sounds/regional-voices/phonological-variation/. FETCHED. Supports: definition of rhotic; once a feature throughout the UK; now restricted in England to the West Country and part of Lancashire; kept in most Scottish and Irish accents.
- `nma-first-fleet` (reused). National Museum of Australia. "The First Fleet arrives at Sydney Cove." https://digital-classroom.nma.gov.au/defining-moments/first-fleet-arrives-sydney-cove; read at https://web.archive.org/web/20260103052530/https://digital-classroom.nma.gov.au/defining-moments/first-fleet-arrives-sydney-cove. FETCHED (upgraded from SEARCH-CONFIRMED in modern.md). Supports: 11 ships under Arthur Phillip; Sydney Cove on 26 January 1788; start of European colonisation; the Eora people; transportation until 1868.
- `ethnologue-most-spoken` (reused). Ethnologue. "What is the most spoken language?" https://www.ethnologue.com/insights/most-spoken-language/; read at https://web.archive.org/web/20260314040856/https://www.ethnologue.com/insights/most-spoken-language/. FETCHED. Supports: English largest counting non-native speakers, Mandarin by native speakers; by native speakers Mandarin, Spanish, English, Hindi; the British Empire and American culture; 188 countries, many in Africa; more non-native speakers.
- `statista-2026` (new). Statista Research Department. "The most spoken languages worldwide in 2026." https://www.statista.com/statistics/266808/the-most-spoken-languages-worldwide/; read at https://web.archive.org/web/20261009091746/https://www.statista.com/statistics/266808/the-most-spoken-languages-worldwide/. FETCHED. Supports: around 1.49 billion people speak English natively or as a second language in 2026. Statista repackages Ethnologue data; it is used because Ethnologue's figure is behind a paywall.
- `cervantes-2025` (reused, notes only). Instituto Cervantes 2025, as recorded in modern.md. Supports the "most learned it as an extra language" inference (about 520 million native Spanish speakers).
- `haak-2015`, `anthony-ringe-2015`, `bouckaert-2012`, `heggarty-2023`, `lazaridis-2025` (reused). See western-eurasia.md. ABSTRACT (Lazaridis full text). Support the `indo-european` stop unchanged.
- `faarlund-2008`, `ringe-taylor-2014`, `gretzinger-2022` (reused). See western-eurasia.md. ABSTRACT; Gretzinger re-read for this note. Support the `germanic` and `old-english` stops.

- `cook-1891` (new). Cook, Albert S. 1891. "The Evolution of the Lord's Prayer in English." American Journal of Philology 12(1): 59–66. Read at https://archive.org/details/jstor-287989 (JSTOR Early Journal Content). FETCHED (OCR full text). Supports: tracing the Lord's Prayer through the stages of English, from the West Saxon version (Corpus MS 140, as printed by Skeat) through Wyclif, Tyndale and later Bibles; Old English versions not earlier than 950 to 1000.
- `skeat-1887` (new). Skeat, Walter W., ed. 1887. The Gospel according to Saint Matthew in Anglo-Saxon, Northumbrian, and Old Mercian Versions. Cambridge University Press. Read at https://objects.library.uu.nl/reader/1874-374575 (Utrecht University Library, image 74, p. 54). SCAN VIEWED. Supports: the Old English sample line.
- `forshall-madden-1850` (new). Forshall, Josiah and Madden, Frederic, eds. 1850. The Holy Bible … in the Earliest English Versions made from the Latin Vulgate by John Wycliffe and his Followers, vol. 4. Oxford University Press. Read at https://archive.org/details/holybiblecontain04wycluoft/page/n21 (p. 14); dates from vol. 1, https://archive.org/details/holybiblecontain01wycluoft. SCAN VIEWED (vol. 4), OCR (vol. 1 preface). Supports: the Middle English sample line, later version, about 1388.
- `tyndale-1526` (new). Fry, Francis, ed. 1862. The First New Testament printed in the English Language (1525 or 1526) … Reproduced in Facsimile. Bristol. Read at https://archive.org/details/firstnewtestame00frygoog/page/n50. SCAN VIEWED; cross-checked with Offor's 1836 reprint, https://archive.org/details/newtestamentofou00tynd/page/n122. Supports: the Tyndale sample line and "the first printed English New Testament".
- `king-james-1611` (new). The Holy Bible, Conteyning the Old Testament, and the New. London: Robert Barker, 1611. University of Pennsylvania copy, read at https://archive.org/details/Bible1611/page/n1225. SCAN VIEWED; community upload, see the caveat above. Supports: the King James sample line.

Not used: `ethnologue-2026`, `owid-ethnologue-2026` and `ethnologue-how-many` (world language counts, which this story no longer needs), and `nma-first-fleet`'s companion "Convict cargo" page.
