import type { ConsonantPhoneme } from "shared-data";
import { phonixUtils } from "shared-data";
import { AudioButton } from "@/components/audio/AudioButton";

const { getExampleAudioUrl, toPhonemic } = phonixUtils;

type Props = {
  phoneme: ConsonantPhoneme;
  onOpen?: (p: ConsonantPhoneme) => void;
};

export function PhonemeTile({ phoneme, onOpen }: Props) {
  const first = phoneme.examples[0];
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-md border p-2 text-center">
      <button
        type="button"
        className="text-xl font-semibold"
        onClick={() => onOpen?.(phoneme)}
        aria-label={`Open details for ${toPhonemic(phoneme.symbol)}`}
      >
        {phoneme.symbol}
      </button>
      {first ? (
        <AudioButton src={getExampleAudioUrl(first.word)} label={`Play ${first.word}`} />
      ) : null}
    </div>
  );
}
