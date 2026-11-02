# Changelog

## [0.7.0](https://github.com/rigomart/phonaria/compare/phonaria-v0.6.0...phonaria-v0.7.0) (2026-11-02)


### Features

* **app:** add a beta label and notes on output that can be wrong ([#442](https://github.com/rigomart/phonaria/issues/442)) ([0eb2690](https://github.com/rigomart/phonaria/commit/0eb2690cfdd2c1dc0e6b2e3b0557c9bdf7866713))
* **app:** merge the IPA chart into a Sounds menu in the header ([#444](https://github.com/rigomart/phonaria/issues/444)) ([79549ae](https://github.com/rigomart/phonaria/commit/79549aeb4cc6aa422657620aa1a8b49affe2872d))
* **app:** say what each Credits source is used for and where Phonaria differs ([#441](https://github.com/rigomart/phonaria/issues/441)) ([3e87a4e](https://github.com/rigomart/phonaria/commit/3e87a4e385e17f3ab48677943bc0445f730a0ed7))
* **app:** turn on sound search everywhere and say it covers the 10,000 most common words ([#439](https://github.com/rigomart/phonaria/issues/439)) ([0526e1e](https://github.com/rigomart/phonaria/commit/0526e1ecce9a13529d758ef9a170f27b0598f370))


### Bug Fixes

* **app:** draw the History globe's meridians as curves, not straight chords ([#445](https://github.com/rigomart/phonaria/issues/445)) ([5ef9e3b](https://github.com/rigomart/phonaria/commit/5ef9e3b0fb4e050104ecc89084be384bf41f5fa9))
* **app:** rewrite the beta popover and disclaimer copy in plain words ([#443](https://github.com/rigomart/phonaria/issues/443)) ([13d6955](https://github.com/rigomart/phonaria/commit/13d695540453a85c5d954832876dde8574d90f6a))
* **app:** write the app's copy without "we" ([#446](https://github.com/rigomart/phonaria/issues/446)) ([f37e548](https://github.com/rigomart/phonaria/commit/f37e5483c296610d521c14f15f66dd92243c8d58))

## [0.6.0](https://github.com/rigomart/phonaria/compare/phonaria-v0.5.0...phonaria-v0.6.0) (2026-11-01)


### Features

* **app:** find a word by its sounds, behind FLAG_SOUND_SEARCH ([#438](https://github.com/rigomart/phonaria/issues/438)) ([4cc0e50](https://github.com/rigomart/phonaria/commit/4cc0e5042e2a8015af1a9d24862ca043f4751caf)), closes [#307](https://github.com/rigomart/phonaria/issues/307)
* **app:** open transcription results on their own page, /search ([#437](https://github.com/rigomart/phonaria/issues/437)) ([c7e6c21](https://github.com/rigomart/phonaria/commit/c7e6c218ee23f3c9720e0d18b21ff352b8b43ce5))
* **app:** redesign sound pages as pages of their own ([#436](https://github.com/rigomart/phonaria/issues/436)) ([d870bb3](https://github.com/rigomart/phonaria/commit/d870bb3cd77b1449487405d3213c19815ab20481))


### Bug Fixes

* **app:** head the frequency chart page with what it shows ([#431](https://github.com/rigomart/phonaria/issues/431)) ([233c11a](https://github.com/rigomart/phonaria/commit/233c11a86e1f0d8f108ab55590a36d8446cbcd4a)), closes [#426](https://github.com/rigomart/phonaria/issues/426)
* **app:** keep canonical, og:url and JSON-LD in step with in-app navigation ([#434](https://github.com/rigomart/phonaria/issues/434)) ([7560a20](https://github.com/rigomart/phonaria/commit/7560a205a208a063a9a398867526794f09b10877)), closes [#425](https://github.com/rigomart/phonaria/issues/425)
* **app:** show each contrast's headline pair on the minimal-pairs index ([#432](https://github.com/rigomart/phonaria/issues/432)) ([0c4118a](https://github.com/rigomart/phonaria/commit/0c4118a7b8e7befb3e5dae4cf7bc1b92765fb0d7)), closes [#427](https://github.com/rigomart/phonaria/issues/427)

## [0.5.0](https://github.com/rigomart/phonaria/compare/phonaria-v0.4.0...phonaria-v0.5.0) (2026-11-01)


### ⚠ BREAKING CHANGES

* PhonemeContrastPair and contrastType are removed; PhonemeContrastCatalog is now EnglishPhonemeContrasts.
* Dictionary lookup, find-by-sound, Insights, the legacy overview page, and the Spanish UI and G2P are removed along with the Next.js application. Neon PostgreSQL and Upstash Redis leave the architecture.

### Features

* **agents:** add executable browser verification skill ([#288](https://github.com/rigomart/phonaria/issues/288)) ([f66901e](https://github.com/rigomart/phonaria/commit/f66901e9ca0d99a96820cb2803222321ffe3c877))
* **app:** add a frequency page and card details ([#292](https://github.com/rigomart/phonaria/issues/292)) ([bba5557](https://github.com/rigomart/phonaria/commit/bba55575b4aca55e86c67d1c93c629cdba2b58d4))
* **app:** add an About page ([#264](https://github.com/rigomart/phonaria/issues/264)) ([#419](https://github.com/rigomart/phonaria/issues/419)) ([c5514da](https://github.com/rigomart/phonaria/commit/c5514da7e4e19a11d0f92bff4263cebaac1c76db))
* **app:** add FLAG_SPEECH and a rate-limited pronunciation scoring route ([#343](https://github.com/rigomart/phonaria/issues/343)) ([15a8b7d](https://github.com/rigomart/phonaria/commit/15a8b7db2b06728e68271e1bebcd1fdd20e723d2)), closes [#329](https://github.com/rigomart/phonaria/issues/329)
* **app:** add the opt-in evidence log endpoint with 90-day retention ([#347](https://github.com/rigomart/phonaria/issues/347)) ([059253d](https://github.com/rigomart/phonaria/commit/059253dbe9e2cb54bee62922cfb07ed367c3a375))
* **app:** add the story of English on a globe ([#320](https://github.com/rigomart/phonaria/issues/320)) ([f743ef6](https://github.com/rigomart/phonaria/commit/f743ef69a626af75d6a59c26f28064728dd1a80d))
* **app:** choose spelling suggestions with sentence context ([#262](https://github.com/rigomart/phonaria/issues/262)) ([#263](https://github.com/rigomart/phonaria/issues/263)) ([2b20cb6](https://github.com/rigomart/phonaria/commit/2b20cb6bb9c5f99cfa31318a82f65daa1dc29dab))
* **app:** draw a bar under a sound on hover ([#388](https://github.com/rigomart/phonaria/issues/388)) ([44e2954](https://github.com/rigomart/phonaria/commit/44e2954fe2ed594e716ba07859c3af5c23c80550))
* **app:** explain how to read the vowel chart ([#308](https://github.com/rigomart/phonaria/issues/308)) ([c784846](https://github.com/rigomart/phonaria/commit/c7848468817cd4eb65101a8eed34e7af6f3770bb))
* **app:** explain the cot–caught and marry–merry mergers on sound details ([#366](https://github.com/rigomart/phonaria/issues/366)) ([3c50ff3](https://github.com/rigomart/phonaria/commit/3c50ff3f22f1dc81c7c07b107e8c7b8db53a0d58))
* **app:** fill sound pages from data the project already has ([#428](https://github.com/rigomart/phonaria/issues/428)) ([9dd56d1](https://github.com/rigomart/phonaria/commit/9dd56d14c386ddd21f842f6e1292eab3c69500c0)), closes [#418](https://github.com/rigomart/phonaria/issues/418)
* **app:** give each en-us sound a slug, a page layout and a page head ([#399](https://github.com/rigomart/phonaria/issues/399)) ([32af1e2](https://github.com/rigomart/phonaria/commit/32af1e2b06ceb0710b2e776140f7ecce6921ecbb)), closes [#392](https://github.com/rigomart/phonaria/issues/392)
* **app:** give each minimal-pair contrast its own page ([#400](https://github.com/rigomart/phonaria/issues/400)) ([a93a2e0](https://github.com/rigomart/phonaria/commit/a93a2e0237e935322eb0b04eeb847858cd2e88fc)), closes [#395](https://github.com/rigomart/phonaria/issues/395)
* **app:** keep a local history of recent transcriptions ([#271](https://github.com/rigomart/phonaria/issues/271)) ([703960b](https://github.com/rigomart/phonaria/commit/703960bfbb9414ade993a1a404e18a049e24bb2f))
* **app:** let learners opt in to sharing scoring evidence ([#351](https://github.com/rigomart/phonaria/issues/351)) ([d7d651a](https://github.com/rigomart/phonaria/commit/d7d651acd63cecea0d04420b44a26b36b9b53d74)), closes [#336](https://github.com/rigomart/phonaria/issues/336)
* **app:** link chart tiles and the sound details to sound pages ([#405](https://github.com/rigomart/phonaria/issues/405)) ([4702a9b](https://github.com/rigomart/phonaria/commit/4702a9b4a7bcf2ff011e3f82a943b40f85d1d122)), closes [#394](https://github.com/rigomart/phonaria/issues/394)
* **app:** link sound pages and minimal-pair contrast pages to each other ([#406](https://github.com/rigomart/phonaria/issues/406)) ([cb269ac](https://github.com/rigomart/phonaria/commit/cb269acd72d702499987f0fffaa5837ba9abcf4a)), closes [#396](https://github.com/rigomart/phonaria/issues/396)
* **app:** load the word-audio manifest only when a play button needs it ([#375](https://github.com/rigomart/phonaria/issues/375)) ([4074ca1](https://github.com/rigomart/phonaria/commit/4074ca128b34643388eb8ce50d720f4a0ca18071))
* **app:** make the phoneme details playable and restyle its sections ([#305](https://github.com/rigomart/phonaria/issues/305)) ([dbfb193](https://github.com/rigomart/phonaria/commit/dbfb193af4cf0eb11a5969896df9cdbf80ab56c9)), closes [#304](https://github.com/rigomart/phonaria/issues/304)
* **app:** offer two-edit spelling candidates to Jev ([#272](https://github.com/rigomart/phonaria/issues/272)) ([c826bb5](https://github.com/rigomart/phonaria/commit/c826bb5239f09fcf1ed760dd2d4850cb6ac07f12))
* **app:** open the home page with Phonaria turning into its IPA ([#289](https://github.com/rigomart/phonaria/issues/289)) ([169d073](https://github.com/rigomart/phonaria/commit/169d07308f0d3c7579cddf35f6f59ec6ad564d55))
* **app:** play recorded word audio in Practice instead of speech synthesis ([#318](https://github.com/rigomart/phonaria/issues/318)) ([f7006dd](https://github.com/rigomart/phonaria/commit/f7006ddbaeaca877fdc964b36435d6a32b9595c4)), closes [#166](https://github.com/rigomart/phonaria/issues/166)
* **app:** play the phoneme details sound at normal speed only ([#312](https://github.com/rigomart/phonaria/issues/312)) ([daeec65](https://github.com/rigomart/phonaria/commit/daeec6565fc1d3e09b5633b08f1d36e8259890c5))
* **app:** practise minimal pairs by voice and reject recordings of other words ([#345](https://github.com/rigomart/phonaria/issues/345)) ([8bd0466](https://github.com/rigomart/phonaria/commit/8bd04666e96f009a92d6e5d6c0f6992011de21b4)), closes [#332](https://github.com/rigomart/phonaria/issues/332) [#344](https://github.com/rigomart/phonaria/issues/344)
* **app:** put a minimal pair and the sound's rank on the compact sound card ([#398](https://github.com/rigomart/phonaria/issues/398)) ([e9ee13e](https://github.com/rigomart/phonaria/commit/e9ee13edfda1708bbb3edfa4719621b028230e41))
* **app:** put Sounds and Minimal pairs in the header nav in every build ([#420](https://github.com/rigomart/phonaria/issues/420)) ([c47a6b3](https://github.com/rigomart/phonaria/commit/c47a6b3bb6861baca0b4a1471a58a09fc5974a87)), closes [#416](https://github.com/rigomart/phonaria/issues/416)
* **app:** record learner audio as 16 kHz WAV in the browser ([#339](https://github.com/rigomart/phonaria/issues/339)) ([43970ec](https://github.com/rigomart/phonaria/commit/43970ec1434ad3e01150bc82cf2494ad466f1f31)), closes [#331](https://github.com/rigomart/phonaria/issues/331)
* **app:** redesign the header and footer ([#297](https://github.com/rigomart/phonaria/issues/297)) ([5d63164](https://github.com/rigomart/phonaria/commit/5d631641714826462afc2367bbe6316d45d977b9))
* **app:** redesign the history panel ([#299](https://github.com/rigomart/phonaria/issues/299)) ([041f841](https://github.com/rigomart/phonaria/commit/041f841002e37a776788cf6d7cab9b25f7e53c1e))
* **app:** redesign the phoneme details ([#301](https://github.com/rigomart/phonaria/issues/301)) ([4a45cb7](https://github.com/rigomart/phonaria/commit/4a45cb74c10e2de75b47120838c8b81fb11a09f2))
* **app:** refine the phoneme details header ([#302](https://github.com/rigomart/phonaria/issues/302)) ([855cdea](https://github.com/rigomart/phonaria/commit/855cdeae50d3eefcf585989353dd8bf082e4d49f))
* **app:** rename Language Spread to History ([#397](https://github.com/rigomart/phonaria/issues/397)) ([fc0ccaa](https://github.com/rigomart/phonaria/commit/fc0ccaae42b056c37e5616840281e9231c029084))
* **app:** replace frequency categories with continuous shading ([#306](https://github.com/rigomart/phonaria/issues/306)) ([8386f61](https://github.com/rigomart/phonaria/commit/8386f61fb3e30c190e97845eb51122ada19952f8))
* **app:** replace the logo with the Cut mark and ship square favicons ([#413](https://github.com/rigomart/phonaria/issues/413)) ([c46a13c](https://github.com/rigomart/phonaria/commit/c46a13cf1ccef28adeaa0773c0e246b632b99dea))
* **app:** reveal pages in reading order with shared entrance motion ([#313](https://github.com/rigomart/phonaria/issues/313)) ([10fb05d](https://github.com/rigomart/phonaria/commit/10fb05dd4dd61a85086e5eb550e394262d3e6da3))
* **app:** say that word recordings use a synthetic voice ([#379](https://github.com/rigomart/phonaria/issues/379)) ([5250e48](https://github.com/rigomart/phonaria/commit/5250e48117dd97b390b73e4413e800ab9b12787c))
* **app:** serve a page for each en-us sound at /sounds/&lt;slug&gt; ([#401](https://github.com/rigomart/phonaria/issues/401)) ([83e780c](https://github.com/rigomart/phonaria/commit/83e780c30a1567599315e10cf270a25072f6c432)), closes [#393](https://github.com/rigomart/phonaria/issues/393)
* **app:** show a result on every sound in minimal-pair practice ([#349](https://github.com/rigomart/phonaria/issues/349)) ([1ce72f7](https://github.com/rigomart/phonaria/commit/1ce72f778a27991056224428950b189f6e5046d7)), closes [#334](https://github.com/rigomart/phonaria/issues/334)
* **app:** show transcription history in the input ([#311](https://github.com/rigomart/phonaria/issues/311)) ([dc05d00](https://github.com/rigomart/phonaria/commit/dc05d000be40c7c4b2410cf758e34d99d7594e0d))
* **app:** stack pronunciation variants and morph between them ([#281](https://github.com/rigomart/phonaria/issues/281)) ([869e096](https://github.com/rigomart/phonaria/commit/869e09662ec1221b28fc6fa6063fe53a0f623058))
* **app:** use the words people search for in titles, sound names and headings ([#422](https://github.com/rigomart/phonaria/issues/422)) ([18ddf69](https://github.com/rigomart/phonaria/commit/18ddf692223b99b2d69c3e440962e5ee97edd4df)), closes [#417](https://github.com/rigomart/phonaria/issues/417)
* **audio-gen:** add the batch review sheet and the upload guard for checked recordings ([#373](https://github.com/rigomart/phonaria/issues/373)) ([55b3a23](https://github.com/rigomart/phonaria/commit/55b3a236e813f40b48ce27d79c2e176c13d4bfeb)), closes [#359](https://github.com/rigomart/phonaria/issues/359)
* **audio-gen:** check clips automatically and probe the top-10k rules ([#357](https://github.com/rigomart/phonaria/issues/357)) ([e1614e1](https://github.com/rigomart/phonaria/commit/e1614e1ecf407ca4cde41d3d2e43aa6febd1532e))
* **audio-gen:** leave fragments and abbreviations out of the curated tiers ([#372](https://github.com/rigomart/phonaria/issues/372)) ([9e7b5de](https://github.com/rigomart/phonaria/commit/9e7b5de921ea41858072e80ad20fad0885e4af6c))
* **audio-gen:** list uploaded clips and labelled word forms in the word-audio manifest ([#374](https://github.com/rigomart/phonaria/issues/374)) ([91db11b](https://github.com/rigomart/phonaria/commit/91db11b2e9812b1bbbf996aac8d066aafff3705b))
* **audio-gen:** plan spelling words and publish with a verified upload command ([#316](https://github.com/rigomart/phonaria/issues/316)) ([4bda3db](https://github.com/rigomart/phonaria/commit/4bda3db67c739226540277d13b50f71103781524))
* **audio-gen:** plan the curated top-10k words with rule inputs and labelled forms ([#356](https://github.com/rigomart/phonaria/issues/356)) ([b824912](https://github.com/rigomart/phonaria/commit/b824912df475e1b2064e45dc83e9a0f243e53d7a)), closes [#355](https://github.com/rigomart/phonaria/issues/355)
* **audio-gen:** retry network failures and skip clips another batch generated ([#361](https://github.com/rigomart/phonaria/issues/361)) ([e657220](https://github.com/rigomart/phonaria/commit/e6572209a9c42cc2508c8455a8324da5d03dbaed))
* **audio:** replace ElevenLabs with Azure word generation ([#276](https://github.com/rigomart/phonaria/issues/276)) ([7f2c850](https://github.com/rigomart/phonaria/commit/7f2c8503033df61ff77070959d2bd0481bc04100))
* **lab:** harden public transcription ([#235](https://github.com/rigomart/phonaria/issues/235)) ([45ae2fb](https://github.com/rigomart/phonaria/commit/45ae2fb1dc2299606ece56543c7fd3ac1eaf6868))
* **lab:** prepare main domain handover ([#236](https://github.com/rigomart/phonaria/issues/236)) ([5dbd6b1](https://github.com/rigomart/phonaria/commit/5dbd6b1b23543b4f04813e7ac79245dca113b85e))
* **language-spread:** plain-English copy and one sentence through every stage of English ([#387](https://github.com/rigomart/phonaria/issues/387)) ([9cfa24d](https://github.com/rigomart/phonaria/commit/9cfa24d813fc8c2317d621170f9ff2283b5c432c))
* **minimal-pairs:** give minimal pairs its own tool with the pair on stage ([#386](https://github.com/rigomart/phonaria/issues/386)) ([5cbfd9b](https://github.com/rigomart/phonaria/commit/5cbfd9b1010af4a6e5f6adf458e271a8ddb7b055))
* **phonetics-data:** add the top-1k and top-10k recordings to the word-audio manifest ([#377](https://github.com/rigomart/phonaria/issues/377)) ([8d4ba74](https://github.com/rigomart/phonaria/commit/8d4ba74c7641cf66ded5bae85bde6cc884928ec1))
* **phonetics-data:** play chosen words from a second voice ([#364](https://github.com/rigomart/phonaria/issues/364)) ([44c43d0](https://github.com/rigomart/phonaria/commit/44c43d0fb06975064a4c5fda7a6cbd4d29784efe))
* **phonetics-data:** play the recorded spelling example words ([#317](https://github.com/rigomart/phonaria/issues/317)) ([9ad0a66](https://github.com/rigomart/phonaria/commit/9ad0a66d2a012aeae662324a58ab8c48c638b11f)), closes [#304](https://github.com/rigomart/phonaria/issues/304)
* **phonetics-data:** prefer the /ɔ/ form of THOUGHT and CLOTH words ([#368](https://github.com/rigomart/phonaria/issues/368)) ([24964f6](https://github.com/rigomart/phonaria/commit/24964f643c9c9f8ade6a920055c253294f46b223))
* play minimal-pair words from uploaded recordings ([#303](https://github.com/rigomart/phonaria/issues/303)) ([fe661bb](https://github.com/rigomart/phonaria/commit/fe661bb8e6b4e822d08de79e22fe676d34082394))
* **practice:** add strut and r-colored vowel topics ([#381](https://github.com/rigomart/phonaria/issues/381)) ([3d99e28](https://github.com/rigomart/phonaria/commit/3d99e289cc65eb3101bf68b653fa8b7fd9c2cfe5)), closes [#167](https://github.com/rigomart/phonaria/issues/167)
* **practice:** curate the schwa pool and record every word ([#321](https://github.com/rigomart/phonaria/issues/321)) ([bf1927c](https://github.com/rigomart/phonaria/commit/bf1927cbe4b431ed21375433300c98810306c4aa)), closes [#166](https://github.com/rigomart/phonaria/issues/166)
* **pronunciation:** add the scoring contract and a first judge ([#337](https://github.com/rigomart/phonaria/issues/337)) ([a2083ae](https://github.com/rigomart/phonaria/commit/a2083ae851ef24a16d0bcdcffe77190b99a20c71)), closes [#325](https://github.com/rigomart/phonaria/issues/325)
* **pronunciation:** build the eval harness and record the Azure baseline ([#342](https://github.com/rigomart/phonaria/issues/342)) ([5d24217](https://github.com/rigomart/phonaria/commit/5d24217546a332f4f006a4002dd4545bb2aec2b5)), closes [#328](https://github.com/rigomart/phonaria/issues/328)
* **pronunciation:** judge every sound in the word and allow en-us variants ([#346](https://github.com/rigomart/phonaria/issues/346)) ([4a629e6](https://github.com/rigomart/phonaria/commit/4a629e61670fb9a8affc73aff22cf9958b27b098)), closes [#333](https://github.com/rigomart/phonaria/issues/333)
* **pronunciation:** score pronunciation with Azure behind the scoring contract ([#340](https://github.com/rigomart/phonaria/issues/340)) ([033c78a](https://github.com/rigomart/phonaria/commit/033c78a7a9dce4d35f7d23b067c94f5cdde5ee70)), closes [#326](https://github.com/rigomart/phonaria/issues/326)
* **pronunciation:** tune judge thresholds per sound on the harness ([#348](https://github.com/rigomart/phonaria/issues/348)) ([a340b78](https://github.com/rigomart/phonaria/commit/a340b78b481dad5009a04a8d3c56bfa64e9ff6e1)), closes [#335](https://github.com/rigomart/phonaria/issues/335)
* remove the legacy Next.js application ([#237](https://github.com/rigomart/phonaria/issues/237)) ([609b005](https://github.com/rigomart/phonaria/commit/609b00584cf13b1b26ec7f161e8c87d5faeb0073))
* **ui:** rebuild components on shadcn base-luma ([#294](https://github.com/rigomart/phonaria/issues/294)) ([8a91419](https://github.com/rigomart/phonaria/commit/8a9141988aeda09839ca93aab0ebf4bf514e45fd))
* validated minimal-pair catalog and pairs in the phoneme popover ([#275](https://github.com/rigomart/phonaria/issues/275)) ([5e7c848](https://github.com/rigomart/phonaria/commit/5e7c84845d1f17ed1f02f9ad791072c78c61c059)), closes [#168](https://github.com/rigomart/phonaria/issues/168)


### Bug Fixes

* align local and staging configuration ([#270](https://github.com/rigomart/phonaria/issues/270)) ([b1603b2](https://github.com/rigomart/phonaria/commit/b1603b258ad2c2f88f0486914d7b710e4ab743a8))
* **app:** make /ipa-chart redirect permanent, title the 404 page, and send HSTS ([#421](https://github.com/rigomart/phonaria/issues/421)) ([c05c803](https://github.com/rigomart/phonaria/commit/c05c8033f43d5a600d916d72e05bc9cdee93c923)), closes [#415](https://github.com/rigomart/phonaria/issues/415)
* **app:** submit the transcription on click before hydration ([#314](https://github.com/rigomart/phonaria/issues/314)) ([3eda79e](https://github.com/rigomart/phonaria/commit/3eda79e9ff4a13c9098d021a12e4c2a399d00d98)), closes [#310](https://github.com/rigomart/phonaria/issues/310)
* **audio-gen:** stress eat and i, and drop the second form of because ([#363](https://github.com/rigomart/phonaria/issues/363)) ([137e69d](https://github.com/rigomart/phonaria/commit/137e69de76932604df347f1137c78d025e4353e3))
* cache hashed Lab assets immutably on Workers ([#222](https://github.com/rigomart/phonaria/issues/222)) ([e22d83f](https://github.com/rigomart/phonaria/commit/e22d83f87995dcada6450282a02cf8feecdf2757)), closes [#205](https://github.com/rigomart/phonaria/issues/205)
* **ci:** check Worker startup time from the real staging and production deploys ([#404](https://github.com/rigomart/phonaria/issues/404)) ([bff7339](https://github.com/rigomart/phonaria/commit/bff7339d343b1c4cfc0954d63a185d07ba2dfcbe)), closes [#403](https://github.com/rigomart/phonaria/issues/403)
* keep Lab workers.dev origin during cutover ([#228](https://github.com/rigomart/phonaria/issues/228)) ([65f4552](https://github.com/rigomart/phonaria/commit/65f45525688cc5e28931bf15224452e512783f10))
* **lab:** publish favicon for TanStack Start ([#231](https://github.com/rigomart/phonaria/issues/231)) ([2114cf8](https://github.com/rigomart/phonaria/commit/2114cf89d89db4ed43103ccf7bf810f329b3fdd4))
* **lab:** require plausibility evidence for spelling suggestions ([#253](https://github.com/rigomart/phonaria/issues/253)) ([46a82cf](https://github.com/rigomart/phonaria/commit/46a82cfabc82b1cf5802a86b5711e72835c0f46a)), closes [#247](https://github.com/rigomart/phonaria/issues/247)
* **language-spread:** match the English story's copy to its sources ([#389](https://github.com/rigomart/phonaria/issues/389)) ([c78b976](https://github.com/rigomart/phonaria/commit/c78b976756f444b3b058866c423889cf155c5a70))
* **phonetics-data:** play the selected variant's recording first in the word popover ([#380](https://github.com/rigomart/phonaria/issues/380)) ([6fbf12d](https://github.com/rigomart/phonaria/commit/6fbf12db96712d095abfe1d41e358a2e849c9aa4)), closes [#378](https://github.com/rigomart/phonaria/issues/378)
* **phonetics-data:** protect shared data from mutation ([#280](https://github.com/rigomart/phonaria/issues/280)) ([99b40c2](https://github.com/rigomart/phonaria/commit/99b40c2a2a1b63a4b3960dcea0491d9cf5bc02a0))
* **phonetics-data:** reject inherited properties in token validation ([#278](https://github.com/rigomart/phonaria/issues/278)) ([836a5fe](https://github.com/rigomart/phonaria/commit/836a5fe3b51d64027ff453fea97b74eb14fab397))
* **phonetics-data:** standardize pronunciation parsing ([#279](https://github.com/rigomart/phonaria/issues/279)) ([765c7c9](https://github.com/rigomart/phonaria/commit/765c7c9cdbc9bf890c205a0460f1d9547e0d8091))
* **pronunciation:** judge a word the assessment heard when recognition returns an empty transcript ([#409](https://github.com/rigomart/phonaria/issues/409)) ([313e3d7](https://github.com/rigomart/phonaria/commit/313e3d73f846739da6c2dac55aca994ae64f890e)), closes [#384](https://github.com/rigomart/phonaria/issues/384)
* **pronunciation:** type the scorer's fetch and audio for the app's DOM types ([#341](https://github.com/rigomart/phonaria/issues/341)) ([8574df7](https://github.com/rigomart/phonaria/commit/8574df7577eef3cd2175cdaab3290928a0ddfe18))
* **ui:** remove background banding on external displays ([#293](https://github.com/rigomart/phonaria/issues/293)) ([5b74002](https://github.com/rigomart/phonaria/commit/5b74002eee4f5ed40a249d179c6c2fd4728e4634))


### Reverts

* play chosen words from a second voice ([#364](https://github.com/rigomart/phonaria/issues/364)) ([#367](https://github.com/rigomart/phonaria/issues/367)) ([2cd2ce1](https://github.com/rigomart/phonaria/commit/2cd2ce14b250f33892f7e176f039e3dc3d9cdb62))
