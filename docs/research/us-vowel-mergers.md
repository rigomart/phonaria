# US vowel mergers: cot–caught and marry–merry (issue #365)

The evidence behind the merger notes on the /ɔ/, /æ/ and /ɛ/ sound details, which say that many
US speakers merge these vowels. The Azure voice Jenny merges both in our recordings. The notes
live in `packages/phonetics-data/src/languages/en/merger-notes.ts`, and
[ADR 0003](../adr/0003-keep-o-with-a-voice-that-keeps-it.md) records what the app does about it.

Prepared on 2026-10-23.

**Bottom line.**

- The cot–caught merger covers a large share of North America, nearly all of Canada, and is
  spreading in the US. Both a merged and an unmerged vowel system are ordinary American speech.
- The Mary–marry–merry merger is more advanced still: ANAE says a majority of North American
  speakers have it. The three-way contrast survives mainly on the Northeast coast.
- Neither claim needs an exact percentage. No source that could be opened gives a clean US-only
  figure for either, and the figures that circulate are secondhand or self-reported.

## How to read the evidence

| Grade | Meaning |
| --- | --- |
| Established | Stated by the Atlas or a dictionary that was read, or repeated by several independent studies |
| Likely | One solid primary source, or secondary sources that agree, but the original could not be opened |
| Contested / unverified | Circulating figure with no source that could be checked, or sources disagree |

ANAE is Labov, Ash & Boberg 2006. Its data are from the Telsur telephone survey, collected
mostly in the 1990s from 762 speakers in urban areas across the US and Canada. It does not
measure the share of the whole population, and it is now about 30 years old. Only the
publisher's excerpt of the front matter and chapters 1–6 could be opened, not chapters 9 and 11,
where the merger is analysed. Statements about those chapters come from the excerpt's own table
of contents, from papers that cite them, or from Wikipedia, and are marked.

## 1. cot–caught (/ɑ/–/ɔ/, LOT–THOUGHT)

### How common

- **Established, but not a percentage:** ANAE calls the low back merger "one of the major changes
  taking place in North America", and says it "covers more than half of the North American
  territory" (ch. 6, §6.1). That counts area, not people, and includes Canada.
- **Likely:** A paper that quotes ANAE says the merger is "complete or nearly complete in a
  collection of regions amounting to nearly one-half the population of Anglophone North America"
  (Dinkin 2011, introduction, as shown in a search excerpt; the full text could not be opened).
  Again this includes Canada.
- **Established:** The Telsur interviewers' own script told subjects: "Most people in the West
  say those words the same, as do people in Canada and in a couple of other areas (Pittsburgh and
  Boston), whereas people in the South, the Midwest and the East mostly say them different"
  (ANAE ch. 4, Telsur interview script, "answers to closing questions").
- **Contested / unverified:** A US-only split of about 60% unmerged to 40% merged appears on
  Wikipedia, attributed to Labov's 1990s phone survey and the 2003 Harvard Dialect Survey. The
  sentence has no citation, and the page's other figures change between fetches (61/39, 58/41).
  The Harvard survey's cot–caught results could not be opened (the University of
  Wisconsin–Milwaukee host was unreachable). That survey is self-reported by volunteers, and
  Language Log notes that its popular map versions combine answers by a method nobody has
  published. Hedges (2017) found the survey data mostly agree with ANAE, but not on the merger:
  it gave the merger a low probability in the North, where ANAE sees resistance.
  Treat "roughly 40%" as a rough order of magnitude, not a number to print.

### Where

- **Established:** The merger is typical of the West, nearly all of Canada, western Pennsylvania
  (Pittsburgh) and eastern New England including Boston. ANAE chapter 11 groups Canada, Eastern
  New England and Western Pennsylvania as "three dialects in the low back merger area" (Map 11.7,
  from the excerpt's table of contents). Gordon (2005) for PBS says it is "very widespread across
  Canada and is also heard throughout the western U.S."
- **Likely:** Canada is nearly universal. A chapter by Boberg, as summarized in a search excerpt,
  says virtually all native speakers treat cot/caught as homophones, and cites a 1972 survey where
  about 85% said they rhyme. The chapter was not opened.
- **Established:** ANAE finds three regions that resist, each with a mechanism that works against
  the merger (Map 11.2 title in the excerpt: "Three mechanisms for avoiding the low back merger").
  Wikipedia summarizes the detail from ANAE ch. 11 as: fronting of the *cot* vowel in the Inland
  North; raising of the *caught* vowel on the Northeast coast (Baltimore to Providence, with Boston
  an exception); and vowel breaking in the South (Texas and Florida excepted). This is the
  Wikipedia summary, not a reading of chapter 11.
- **Likely, on NYC and Philadelphia:** New York's traditionally high *thought* vowel is a named
  source of resistance in ANAE (as cited in Haddican et al. 2016). No source turned up that opens
  on Philadelphia and cot–caught specifically beyond the Northeast-coast grouping.

### Is it spreading

Yes, with several lines of evidence. This is the best-supported trend in the note.

- **ANAE, 1990s:** the interview script says "the area where people say hot and caught the same
  may be slowly expanding". The atlas devotes Map 9.4 to the merger's development "from the 1930s
  to the end of the twentieth century" (table of contents only).
- **Midwest:** Gordon (2005) reports the merger among people under about 40 in Kansas, Nebraska
  and the Dakotas, heard across much of Minnesota, Iowa and Missouri, and spreading east, calling
  it "a fairly recent development in the Midwest".
- **Upstate New York, the Inland North:** Dinkin (2011) found the region "indeed trending toward
  the merger in apparent time", both in vowel distance and in what speakers say is the same
  (abstract). He argues fronting of *cot* is reversible and so gives weak resistance; a search
  excerpt puts his sample at 146 speakers and says he calls the Inland North's resistance
  "largely an illusion".
- **New York City:** Haddican, Johnson, Newman & Kim (2016) collected 792 same-or-different
  judgments for six cot–caught pairs from New Yorkers aged 17–91. They found a clear decline of the
  distinction with younger age in all five boroughs, strongest in Queens and Manhattan, and
  strongest among Latino, East Asian and South Asian respondents. White and Black respondents
  mostly kept the distinction. Self-judgments, not recordings.
- **Wisconsin:** Fox (2016) found both Northern Cities and merger patterns in one community, with
  overlap beginning in the 1980s.
- **The Northern Cities Shift itself is receding.** Thiel & Dinkin (2020/21) compared 2008 and
  2016 recordings in Ogdensburg, NY: no speaker in the 2016 data raised trap past the authors'
  threshold, though young speakers in 2008 did. Trap-raising is the shift's signature feature.
  That is one town, but it fits Wikipedia's account of the Low-Back-Merger Shift, a chain shift
  that follows the merger (lowering and backing of TRAP, DRESS and KIT), first described in
  California and Canada and now reported in Lansing, Columbus and elsewhere (Becker 2019;
  Thomas 2019, as listed on Wikipedia; not read).
- **Other, from search excerpts only:** Charleston, SC, where younger speakers merge (Baranowski
  2013); Cooperstown, NY, where merger judgments appear from the Millennial generation (Dinkin);
  Northfield, MN, where the shift is moving east "with younger speakers spearheading the change"
  (2025 paper). These were not opened.
- **History:** Kenyon & Knott (1944; 1949 printing, §93) already noted that in New England "many
  speakers" have one vowel for *cot* and *caught*, and reported "a similar variation from Canada".
  The merger is not new; its spread across the US is.

No nationwide study (by Grieve, or by Stanford and Penn teams) turned up in the searches, and
no recent nationwide survey that updates ANAE's picture. The trend evidence is regional studies
plus the atlas.

### Quality of the merged vowel

- **Established, for the US:** The merged vowel is usually unrounded and low back, like /ɑ/.
  MW's guide says "In U.S. speech \ä\ is pronounced with little or no rounding of the lips" and
  that many speakers merge "usually because they lack or have less lip rounding in the words
  transcribed with \ȯ\". Gordon (2005), a merged Nebraskan, describes his vowel as "low, back and
  unrounded". So showing /ɑ/ is right for the US merger.
- **Likely, outside it:** Wikipedia lists the merged vowel as [ɑ] or [ä] in the West and Upper
  Midwest, [ɑ~ɒ] across New England, [ɒ] in Boston and northeastern New England, [ɒ~ɔ] in
  Pittsburgh. Standard Canadian English is toward [ɒ] in the west and centre, and [ɑ] in the
  Maritimes (Boberg, as summarized in a search excerpt). Hence "usually like /ɑ/" is safe for the
  US as a whole; do not claim it for Canada or Boston.

## 2. Mary–marry–merry (/eɪɹ/–/æɹ/–/ɛɹ/)

- **Established:** ANAE ch. 2 says "for the majority of North American speakers, there is
  complete merger of /ey/, /æ/, and /e/ in Mary, marry, merry", with Philadelphia keeping the
  distinctions but merging *merry* and *Murray* (a near-merger). So the merger is the majority
  pattern, unlike cot–caught, where it is closer to half.
- **Established, as to the merged vowel:** Kenyon & Knott (1949, §94) say the *carry/marry*
  vowel is heard with ɛ in the North and Canada, "especially from the younger generations", and
  "many of these speakers pronounce marry, merry, and Mary all alike". In the South it was "rare"
  and in New England the 1930s atlas showed only a small percentage with ɛ. The merged vowel is
  /ɛ/-like.
- **Likely, where the contrast survives:** Philadelphia, New Jersey, New York City, Rhode Island
  and Boston (Wikipedia, "Mary–marry–merry merger", citing the Harvard Dialect Survey and Labov
  2006 on NYC). Mary–merry merged with *marry* distinct is concentrated in the South and
  southern Mid-Atlantic. That page reports 2003 survey shares of about 57% three-way merger, 17%
  three-way contrast, 16% Mary–marry merger and 9% Mary–merry merger. These come from the same
  self-reported survey and could not be checked against the original, so they should not be
  published.
- **Trend, weak:** The Northeast looks to be moving toward the merger. Wikipedia's summary says
  "recent studies" show an "emerging tendency" in Boston to merge them. The underlying study
  could not be found. Baxter (2010) shows a century-old, lexically gradual merger in Montreal
  English, so the change has been around a long time. No apparent-time study of NYC or
  Philadelphia turned up.
- MW's Collegiate guide and Kenyon & Knott record the merger without treating it as an error
  (K&K list it as a "variant").

## 3. Dictionaries and teaching materials

| Source | /ɔ/ in *caught*, *law* | Note on merger |
| --- | --- | --- |
| Merriam-Webster Collegiate guide to pronunciation (PDF) | Separate symbols \ä\ and \ȯ\ | "Many U.S. speakers do not distinguish between cot — caught, cod — cawed, and collar — caller" |
| American Heritage Dictionary (ahdictionary.com) | *caught* (kôt), *law* (lô), a distinct ô | Not checked |
| LDOCE online | *caught* /kɔːt/ UK, "$ kɒːt" US; *cot* /kɒt/, US /kɑːt/. A separate US symbol for *caught* | None seen |
| Cambridge Advanced Learner's (US transcription) | *caught* /kɑːt/, *law* /lɑː/, *dawn* /dɑːn/, *fall* /fɑːl/ | Merged. Same-site Cambridge Academic Content Dictionary lists /kɔt/, /lɔ/ |
| Kenyon & Knott (1944; 1949) | Keeps ɔ | §93: in New England many speakers have "only one phoneme" in *cot* and *caught* |
| Wells, Accents of English (1982) | Keeps THOUGHT separate from PALM/LOT (Table 2.4 in ANAE shows this) | Not read directly |

- **Established:** The big mainstream US dictionaries, M-W and American Heritage, keep ɔ as a
  separate symbol, with M-W adding the note quoted above. The learner dictionary from Cambridge
  transcribes the US as merged, while LDOCE keeps the sounds distinct. So references split, and a
  learner who looks up *caught* gets different answers by dictionary.
- **Not verified:** the Longman Pronunciation Dictionary, Oxford Advanced American (the IPA did
  not load), and the Cambridge American pronunciation guide. Wells' wording on LOT–THOUGHT in GA
  was not found in either source; Wells was read only through ANAE's Table 2.4.
- **ESL/EFL materials:** thin. Rachel's English teaches "AW" as a separate vowel with lip
  flare and notes that "in some American accents, speakers even replace the AW sound with AH", and
  advises learners not to make AW identical to AH "unless your target accent uses that
  pronunciation" (fetched summary of the page, not a verbatim read). An Iowa State open textbook
  (*Basics of Teaching Pronunciation*) tabulates /ɔ/ and /ɑ/ with the other as an alternate and
  says at least half of the US has no difference (via search excerpt; the page was blocked).
  Two sources are not enough to say what "mainstream" ESL materials do. The likely picture: they
  teach both vowels and mention the merger, but textbooks were not surveyed.

## 4. Is "General American" with or without the merger

- **Established:** Wells's 1982 General American (a reference model, not a real dialect) keeps
  THOUGHT separate from LOT, and merges LOT with PALM (ANAE Table 2.4 reproduces this).
  ANAE itself sets GA aside: Kurath "replaced the traditional North/South/General American view
  of American dialects", and ANAE calls Wells's GA notation "an odd extension of the British
  system". ANAE treats the merger as a regional feature, not a part of a national standard.
- **Established:** MW's guide says "there can be no objective standard for correct pronunciation
  other than the usage of thoughtful and, in particular, educated speakers of English",
  and itself records that many such speakers merge *cot* and *caught*. Gordon (2005) says the
  merger "seems not to attract any [...] stigmatization" and that people are largely unaware of
  it, though it causes occasional mix-ups (*Don* heard as *Dawn*; *copy* as *coffee*).
- **Judgment, resting on the above:** It is fair to say both are ordinary American speech.
  Avoid the word "standard", which implies an official norm, and avoid "General American with
  the merger" as a label, because the sources use GA for the unmerged model.

## 5. Other mergers a learner may meet

Prevalence only. All from Wikipedia's summaries of ANAE unless noted; the chapters were not
read.

- **pin–pen (/ɪ/–/ɛ/ before nasals):** Near-universal in the South; consistent in southern
  Virginia, most of the South Midland and much of Texas. Rare in most other regions. Rose from
  very rare before 1860 to about 90% in the South by the mid-20th century, from written
  responses and atlas data (Brown 1990, 1991). Charleston younger speakers also merge
  (Baranowski 2013).
- **horse–hoarse (/ɔɹ/–/oɹ/):** Nearly complete. Areas that kept the contrast in the 1930s
  (Kurath & McDavid 1961) had mostly merged by the 1990s. ANAE found most white speakers still
  holding it in only three cities (Wilmington NC, Mobile AL, Portland ME), and a 2013 study found
  Portland merged "at all age levels". MW's guide: "the number of speakers that make such a
  distinction is currently very small".
- **cure–force (/ʊɹ/–/ɔɹ/):** Many speakers have merged *cure* with *force* or *nurse*,
  depending on the word. MW's guide says many speakers do not have the *sure/cure* diphthong
  and have merged it with the *nurse* vowel or the *force* vowel. No prevalence figure found.
- **fill–feel (/ɪl/–/il/):** Concentrated in the South: NC, east Tennessee, north Alabama,
  Mississippi, north and central Louisiana, west-central Texas; also in African American English
  (ANAE pp. 69–73, via Wikipedia).
- **pull–pool (/ʊl/–/ul/):** Main concentration in Western Pennsylvania, spotty in the Midland
  and some Western cities (Utah, California, New Mexico). Few speakers have both this and fill–feel
  (ANAE Maps 5–6, via Wikipedia).

## 6. What this means for the app

- A note that says "many Americans merge /ɑ/ and /ɔ/, and both are normal" is supported. So
  is "unmerged speakers say /ɔ/ with rounded lips, merged speakers don't".
- Do not state a US percentage. If a number is needed, "about half of North America by area"
  (ANAE) is the only one that holds up, and it includes Canada.
- Mary–marry–merry: "most North Americans merge them, and the three-way contrast is mainly a
  Northeast coast feature" is supported. That is a stronger claim than for cot–caught, and it is
  from ANAE ch. 2 directly.
- Jenny merging marry and merry puts her with the majority pattern. The note should say that,
  rather than treat it as an error. Whether *Mary* is also merged by Jenny was not tested here.
- If the note says "this voice keeps /ɔ/" that is a product statement and rests on our own
  recordings, not on these sources.

## What could not be verified

- Harvard Dialect Survey results for cot–caught and Mary–marry–merry (original host unreachable).
- ANAE chapters 9 and 11 text. Penn's Phonological Atlas host returns 403 to automated fetches.
- Wells (1982), the Longman Pronunciation Dictionary and the Oxford Advanced American entries.
- The "nearly one-half the population" sentence in full context, Boberg's Canadian figures,
  and the Charleston, Cooperstown and Northfield studies (search excerpts only).
- A nationwide post-2010 study of either merger.

## Sources

Primary or academic:

- Labov, William, Sharon Ash & Charles Boberg (2006). *The Atlas of North American English:
  Phonetics, Phonology and Sound Change.* Mouton de Gruyter. https://doi.org/10.1515/9783110206838
  (excerpt read: front matter and ch. 1–6, https://images10.newegg.com/UploadFilesForNewegg/itemintelligence/Antec/AtlasofNorthAmericanEnglish_WdG_PartA1470967896980.pdf ;
  book listing https://books.google.com/books?id=qa4-dFqi6iMC)
- Kenyon, John S. & Thomas A. Knott (1944; 1949 printing). *A Pronouncing Dictionary of American
  English.* G. & C. Merriam. §§93–94. https://archive.org/details/pronouncingdicti00unse
- Dinkin, Aaron J. (2011). Weakening resistance: Progress toward the low back merger in New York
  State. *Language Variation and Change* 23(3): 315–345. https://doi.org/10.1017/S0954394511000147
- Haddican, Bill, Daniel Ezra Johnson, Michael Newman & Faith Kim (2016). The diffusion of the
  low back merger in New York City. NWAV 45 abstract.
  https://ling-webapps.fass.sfu.ca/nwav45/wp-content/uploads/2016/09/257-Haddican-Johnson-Newman-Kim.pdf
- Fox, Michael (2016). The structural antagonism and apparent-time change of the Northern Cities
  Shift and the Low Back Vowel Merger in northwestern Wisconsin English. NWAV 45 abstract.
  https://ling-webapps.fass.sfu.ca/nwav45/wp-content/uploads/2016/09/28-Fox.pdf
- Thiel, Anja & Aaron J. Dinkin (2020/21). Escaping the TRAP: Losing the Northern Cities Shift in
  real time. *Language Variation and Change* 32(3): 373–398.
  https://www.cambridge.org/core/journals/language-variation-and-change/article/abs/escaping-the-trap-losing-the-northern-cities-shift-in-real-time/C62D519D813560095D0EB9936A96F77C
- Gordon, Matthew J. (2005). The Midwest accent. In *Do You Speak American?*, PBS.
  https://www.pbs.org/speak/seatosea/americanvarieties/midwest/
- Hedges, Stephanie N. (2017). *A latent class analysis of American English dialects* (BYU thesis,
  on Harvard Dialect Survey data). https://scholarsarchive.byu.edu/etd/6480
- Baxter, Laura (2010). Lexical diffusion in the early stages of the merry–marry merger. *Penn
  Working Papers in Linguistics* 16(2). https://repository.upenn.edu/pwpl/vol16/iss2/3
- Dinkin, Aaron J. (2005). Mary, darling, make me merry; say you'll marry me: Tense-lax
  neutralization in the Linguistic Atlas of New England. *Penn Working Papers in Linguistics*
  11(2). https://repository.upenn.edu/pwpl/vol11/iss2/5 (not read; blocked)
- Baranowski, Maciej (2013). Ethnicity and sound change: African American English in
  Charleston, SC. https://repository.upenn.edu/handle/20.500.14332/44925 (search excerpt only)
- Harvard Dialect Survey (Vaux & Golder, 2003), as described by Mark Liberman, "Interactive
  dialect map", Language Log. https://languagelog.ldc.upenn.edu/nll/?p=9252

Dictionaries and teaching references:

- Merriam-Webster, *Guide to Pronunciation* (Collegiate 11th edition users' guide, PDF).
  https://www.merriam-webster.com/assets/mw/static/pdf/help/guide-to-pronunciation.pdf
- American Heritage Dictionary: https://ahdictionary.com/word/search.html?q=law and
  https://ahdictionary.com/word/search.html?q=caught
- Longman Dictionary of Contemporary English online: https://www.ldoceonline.com/dictionary/caught ,
  https://www.ldoceonline.com/dictionary/cot , https://www.ldoceonline.com/dictionary/law
- Cambridge Advanced Learner's Dictionary (US transcription) and Cambridge Academic Content
  Dictionary: https://dictionary.cambridge.org/us/dictionary/english/caught ,
  https://dictionary.cambridge.org/us/dictionary/english/law ,
  https://dictionary.cambridge.org/us/dictionary/english/dawn
- Rachel's English, "How to pronounce the AW vowel". https://rachelsenglish.com/english-pronounce-aw-vowel/
- Iowa State University, *Basics of Teaching Pronunciation*, ch. 1.
  https://iastate.pressbooks.pub/teachingpronunciation/chapter/chapter-1-basics/ (search excerpt only)

Secondary (used for region lists and to find primary sources, not as the basis of any claim
in the learner copy):

- Wikipedia, Cot–caught merger. https://en.wikipedia.org/wiki/Cot%E2%80%93caught_merger
- Wikipedia, Low-back-merger shift. https://en.wikipedia.org/wiki/Low-back-merger_shift
- Wikipedia, Mary–marry–merry merger. https://en.wikipedia.org/wiki/Mary%E2%80%93marry%E2%80%93merry_merger
- Wikipedia, Pin–pen merger. https://en.wikipedia.org/wiki/Pin%E2%80%93pen_merger
- Wikipedia, English-language vowel changes before historical /l/.
  https://en.wikipedia.org/wiki/English-language_vowel_changes_before_historical_/l/
- Wikipedia, Horse–hoarse merger. https://en.wikipedia.org/wiki/Horse%E2%80%93hoarse_merger
