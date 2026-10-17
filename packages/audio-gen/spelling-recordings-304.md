# Spelling recordings for issue #304

Prepared on 2026-10-17. **Dry run only: no Azure calls, recordings, or uploads.**

The batch contains exactly the 56 spelling example words missing from the current 400-word Jenny manifest. The 88 unique spelling words and the 17 missing header examples were rechecked against the source patterns and manifest. The app manifest remains unchanged.

## Generate after pronunciation review

From the main checkout root, with its existing local `packages/audio-gen/.env`, run this command after these changes are available there. It creates a fresh output directory and exactly these 56 recordings with the catalog settings. The command below has **not** been run.

```bash
WORDS_LIMIT= AZURE_SPEECH_VOICE=en-US-JennyNeural \
  bun run --cwd packages/audio-gen generate \
  --source=spelling \
  --words=away,be,bigger,bird,boy,bread,bridge,cause,city,coffee,coin,dinner,dogs,father,food,happy,hello,her,home,house,jeep,jumped,ladder,lemon,let,letter,love,make,measure,mood,mother,my,nation,new,out,page,phone,put,rabbit,rained,ram,saw,sea,sofa,summer,talk,this,time,top,turn,vision,west,work,write,yoke,you \
  --limit=56 --rate=-10 --format=ogg --rpm=20 \
  --out=output/azure-spelling-304-jenny-slower-10-ogg
```

If interrupted, resume the same directory (no source, words, or limit options):

```bash
WORDS_LIMIT= AZURE_SPEECH_VOICE=en-US-JennyNeural \
  bun run --cwd packages/audio-gen generate --resume \
  --rate=-10 --format=ogg --rpm=20 \
  --out=output/azure-spelling-304-jenny-slower-10-ogg
```

Listen to and accept all clips before uploading. Only after upload, merge the batch with the manifest command documented in README.md. No unrecorded words have been added to the app manifest.

## Every pronunciation choice — owner review

**All ten words where alternatives were selected are listed here.** The spelling pattern takes priority, followed by an American citation form, then CMU order when both forms fit. The tokens below use standard CMU ARPAbet, including stress digits. The typed source table retains the equivalent Phonaria tokens and the reasons.

| Word | Selected CMU | Rejected CMU | Reason |
| --- | --- | --- | --- |
| be | `B IY1` | `B IY0` | Stressed citation form teaches e → /i/; reject reduced B I0. |
| cause | `K AO1 Z` | `K AA1 Z` | au teaches /ɔ/; reject the merged /ɑ/ form K A1 Z. |
| coffee | `K AA1 F IY0` | `K AO1 F IY0` | Both K A1 F I0 and K O1 F I0 teach ff → /f/; keep the first CMU American form. |
| dogs | `D AA1 G Z` | `D AO1 G Z` | Both D A1 G Z and D O1 G Z teach final s → /z/; keep the first CMU American form. |
| hello | `HH AH0 L OW1` | `HH EH0 L OW1` | Both H AX0 L OU1 and H E0 L OU1 teach h → /h/ and ll → /l/; keep the first CMU citation form, with final stress. |
| her | `HH ER1` | `HH ER0` | Stressed citation form teaches er → /ɝ/; reject reduced H ER0 (/ɚ/). |
| new | `N UW1` | `N Y UW1` | ew teaches /u/; first CMU American N U1 avoids the extra /j/ in N Y U1. |
| rabbit | `R AE1 B AH0 T` | `R AE1 B IH0 T` | Both R AE1 B AX0 T and R AE1 B IX0 T teach bb → /b/; keep the first CMU citation form, with initial stress. |
| this | `DH IH1 S` | `DH IH0 S` | Stressed citation form teaches th → /ð/; reject unstressed DH IX0 S. |
| top | `T AA1 P` | `T AO1 P` | Both T A1 P and T O1 P teach t → /t/; keep the first CMU American form, matching the example's /ɑ/. |

Coffee /ɑ/, dogs /ɑ/, hello /ə/, and rabbit /ə/ differ from the spelling table’s illustrative whole-word IPA. Both alternatives preserve the consonants being taught (`ff`, final `s`, `h`/`ll`, and `bb`); the first CMU form therefore wins under the stated rule. These are phonemic inputs: `t` and `d` remain explicit in city, letter, and ladder. The eventual voice still needs human listening review.

### Reviewed full-CMU entries

These three words have no curated entry and exactly one bundled full-CMU pronunciation; there was no choice between alternatives.

| Word | Full-CMU key | Internal tokens | CMU ARPAbet |
| --- | --- | --- | --- |
| jeep | `JEEP` | `J I1 P` | `JH IY1 P` |
| rained | `RAINED` | `R EI1 N D` | `R EY1 N D` |
| yoke | `YOKE` | `Y OU1 K` | `Y OW1 K` |

## All 56 planned words

IPA is the exact Azure `ph` value, with checked syllable boundaries and stress. CMU and syllables use standard ARPAbet; `AH0` renders as /ə/ and `ER0` as /ɚ/. A dash means a single syllable. “Full CMU” is an explicit reviewed fallback, not a choice between alternatives.

| Word | Sound and marked spelling | IPA used | CMU tokens used | Checked syllables | Choice made? |
| --- | --- | --- | --- | --- | --- |
| away | /w/ `a[w]ay` | ə.ˈweɪ | `AH0 W EY1` | `AH0` · `W EY1` | No |
| be | /i/ `b[e]` | bi | `B IY1` | — | Yes |
| bigger | /ɡ/ `bi[gg]er` | ˈbɪ.ɡɚ | `B IH1 G ER0` | `B IH1` · `G ER0` | No |
| bird | /ɝ/ `b[ir]d` | bɝd | `B ER1 D` | — | No |
| boy | /ɔɪ/ `b[oy]` | bɔɪ | `B OY1` | — | No |
| bread | /ɛ/ `br[ea]d` | bɹɛd | `B R EH1 D` | — | No |
| bridge | /dʒ/ `bri[dge]` | bɹɪdʒ | `B R IH1 JH` | — | No |
| cause | /ɔ/ `c[au]se` | kɔz | `K AO1 Z` | — | Yes |
| city | /s/ `[c]ity` | ˈsɪ.ti | `S IH1 T IY0` | `S IH1` · `T IY0` | No |
| coffee | /f/ `co[ff]ee` | ˈkɑ.fi | `K AA1 F IY0` | `K AA1` · `F IY0` | Yes |
| coin | /ɔɪ/ `c[oi]n` | kɔɪn | `K OY1 N` | — | No |
| dinner | /n/ `di[nn]er` | ˈdɪ.nɚ | `D IH1 N ER0` | `D IH1` · `N ER0` | No |
| dogs | /z/ `dog[s]` | dɑɡz | `D AA1 G Z` | — | Yes |
| father | /ɑ/ `f[a]ther` | ˈfɑ.ðɚ | `F AA1 DH ER0` | `F AA1` · `DH ER0` | No |
| food | /u/ `f[oo]d` | fud | `F UW1 D` | — | No |
| happy | /p/ `ha[pp]y`; /i/ `happ[y]` | ˈhæ.pi | `HH AE1 P IY0` | `HH AE1` · `P IY0` | No |
| hello | /l/ `he[ll]o`; /h/ `[h]ello` | hə.ˈloʊ | `HH AH0 L OW1` | `HH AH0` · `L OW1` | Yes |
| her | /ɝ/ `h[er]` | hɝ | `HH ER1` | — | Yes |
| home | /oʊ/ `h[o]m[e]` | hoʊm | `HH OW1 M` | — | No |
| house | /h/ `[h]ouse` | haʊs | `HH AW1 S` | — | No |
| jeep | /dʒ/ `[j]eep` | dʒip | `JH IY1 P` | — | No (full CMU) |
| jumped | /t/ `jump[ed]` | dʒʌmpt | `JH AH1 M P T` | — | No |
| ladder | /d/ `la[dd]er` | ˈlæ.dɚ | `L AE1 D ER0` | `L AE1` · `D ER0` | No |
| lemon | /ə/ `lem[o]n` | ˈlɛ.mən | `L EH1 M AH0 N` | `L EH1` · `M AH0 N` | No |
| let | /l/ `[l]et` | lɛt | `L EH1 T` | — | No |
| letter | /t/ `le[tt]er` | ˈlɛ.tɚ | `L EH1 T ER0` | `L EH1` · `T ER0` | No |
| love | /ʌ/ `l[o]ve` | lʌv | `L AH1 V` | — | No |
| make | /eɪ/ `m[a]k[e]` | meɪk | `M EY1 K` | — | No |
| measure | /ʒ/ `mea[s]ure` | ˈmɛ.ʒɚ | `M EH1 ZH ER0` | `M EH1` · `ZH ER0` | No |
| mood | /u/ `m[oo]d` | mud | `M UW1 D` | — | No |
| mother | /ð/ `mo[th]er` | ˈmʌ.ðɚ | `M AH1 DH ER0` | `M AH1` · `DH ER0` | No |
| my | /aɪ/ `m[y]` | maɪ | `M AY1` | — | No |
| nation | /ʃ/ `na[ti]on` | ˈneɪ.ʃən | `N EY1 SH AH0 N` | `N EY1` · `SH AH0 N` | No |
| new | /u/ `n[ew]` | nu | `N UW1` | — | Yes |
| out | /aʊ/ `[ou]t` | aʊt | `AW1 T` | — | No |
| page | /dʒ/ `pa[ge]` | peɪdʒ | `P EY1 JH` | — | No |
| phone | /f/ `[ph]one` | foʊn | `F OW1 N` | — | No |
| put | /ʊ/ `p[u]t` | pʊt | `P UH1 T` | — | No |
| rabbit | /b/ `ra[bb]it` | ˈɹæ.bət | `R AE1 B AH0 T` | `R AE1` · `B AH0 T` | Yes |
| rained | /d/ `rain[ed]` | ɹeɪnd | `R EY1 N D` | — | No (full CMU) |
| ram | /m/ `ra[m]` | ɹæm | `R AE1 M` | — | No |
| saw | /ɔ/ `s[aw]` | sɔ | `S AO1` | — | No |
| sea | /i/ `s[ea]` | si | `S IY1` | — | No |
| sofa | /ə/ `sof[a]` | ˈsoʊ.fə | `S OW1 F AH0` | `S OW1` · `F AH0` | No |
| summer | /m/ `su[mm]er` | ˈsʌ.mɚ | `S AH1 M ER0` | `S AH1` · `M ER0` | No |
| talk | /ɔ/ `t[al]k` | tɔk | `T AO1 K` | — | No |
| this | /ð/ `[th]is` | ðɪs | `DH IH1 S` | — | Yes |
| time | /aɪ/ `t[i]m[e]` | taɪm | `T AY1 M` | — | No |
| top | /t/ `[t]op` | tɑp | `T AA1 P` | — | Yes |
| turn | /ɝ/ `t[ur]n` | tɝn | `T ER1 N` | — | No |
| vision | /ʒ/ `vi[si]on` | ˈvɪ.ʒən | `V IH1 ZH AH0 N` | `V IH1` · `ZH AH0 N` | No |
| west | /w/ `[w]est` | wɛst | `W EH1 S T` | — | No |
| work | /ɝ/ `w[or]k` | wɝk | `W ER1 K` | — | No |
| write | /ɹ/ `[wr]ite` | ɹaɪt | `R AY1 T` | — | No |
| yoke | /j/ `[y]oke` | joʊk | `Y OW1 K` | — | No (full CMU) |
| you | /j/ `[y]ou` | ju | `Y UW1` | — | No |

## Verification

- Dry run: `/tmp/phonaria-304-dryrun/plan.json` and `review.tsv`: 56 unique entries, 56 single explicit phoneme tags, all planned, zero errors, zero audio files.
- Baseline comparison: `/tmp/phonaria-304-catalog-before/plan.json` and `/tmp/phonaria-304-catalog-after/plan.json` are byte-identical after replacing only `createdAt` with the same value. Their 400 sample entries are byte-identical without normalization.
- Saved catalog comparison: all 400 pronunciation/request identities and plan settings match `/Users/rigos/projects/phonaria/packages/audio-gen/output/azure-catalog-jenny-slower-10-ogg/plan.json`. Only run metadata (`createdAt`, sample status, and recording checksums) differs; the saved plan was read only.
- Comparison evidence: `/tmp/phonaria-304-dryrun/verification.json`. Saved plan SHA-256: `6faa01074a2909e4baf24e00630495c273e3e14f77393b0ffd02ae6be0c53898`.
- `bun run --cwd packages/audio-gen test`: 121 tests passed.
- `bun run test`: all five workspace test tasks passed (1,679 tests, including 829 phonetics-data tests). The live Wiktionary smoke test initially failed in the network-restricted sandbox and passed on rerun with network access.
- `bun run check-types`: all seven workspace packages passed.
- `bun lint`: passed. An independent comment checker reviewed the diff; three comments were tightened and one kept.
