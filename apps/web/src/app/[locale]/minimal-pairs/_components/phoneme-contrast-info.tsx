import type { ConsonantPhoneme, VowelPhoneme } from "shared-data";
import { consonants, vowels } from "shared-data";

function parseContrastSymbols(contrast: string): { a: string; b: string } | null {
  // Expect formats like "/ɪ/ vs /i/" or "/p/ vs /b/"
  const match = contrast.match(/\/(.+?)\/\s*vs\s*\/(.+?)\//i);
  if (!match) return null;
  return { a: match[1], b: match[2] };
}

function findPhoneme(symbol: string, category: "vowel" | "consonant"): ConsonantPhoneme | VowelPhoneme | null {
  if (category === "vowel") {
    return (vowels as VowelPhoneme[]).find((v) => v.symbol === symbol) ?? null;
  }
  return (consonants as ConsonantPhoneme[]).find((c) => c.symbol === symbol) ?? null;
}

export function PhonemeContrastInfo({ contrast, category }: { contrast: string; category: "vowel" | "consonant" }) {
  const parsed = parseContrastSymbols(contrast);
  if (!parsed) return null;
  const left = findPhoneme(parsed.a, category);
  const right = findPhoneme(parsed.b, category);
  if (!left || !right) return null;

  if (category === "consonant") {
    const l = left as ConsonantPhoneme;
    const r = right as ConsonantPhoneme;
    return (
      <div className="text-xs text-muted-foreground">
        <div>Voicing: <span className="capitalize text-foreground">{l.articulation.voicing}</span> vs <span className="capitalize text-foreground">{r.articulation.voicing}</span></div>
        <div>Place: <span className="capitalize text-foreground">{l.articulation.place}</span> vs <span className="capitalize text-foreground">{r.articulation.place}</span></div>
        <div>Manner: <span className="capitalize text-foreground">{l.articulation.manner}</span> vs <span className="capitalize text-foreground">{r.articulation.manner}</span></div>
      </div>
    );
  }

  const l = left as VowelPhoneme;
  const r = right as VowelPhoneme;
  return (
    <div className="text-xs text-muted-foreground">
      <div>Height: <span className="capitalize text-foreground">{l.articulation.height}</span> vs <span className="capitalize text-foreground">{r.articulation.height}</span></div>
      <div>Frontness: <span className="capitalize text-foreground">{l.articulation.frontness}</span> vs <span className="capitalize text-foreground">{r.articulation.frontness}</span></div>
      <div>Rounding: <span className="capitalize text-foreground">{l.articulation.roundness}</span> vs <span className="capitalize text-foreground">{r.articulation.roundness}</span></div>
      <div>Tenseness: <span className="capitalize text-foreground">{l.articulation.tenseness}</span> vs <span className="capitalize text-foreground">{r.articulation.tenseness}</span></div>
    </div>
  );
}

