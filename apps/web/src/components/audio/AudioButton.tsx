import { useRef, useState } from "react";

type Props = {
  src: string;
  label?: string;
};

export function AudioButton({ src, label }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center rounded border px-2 py-1 text-xs hover:bg-accent"
      onClick={() => {
        const el = audioRef.current ?? new Audio(src);
        audioRef.current = el;
        el.currentTime = 0;
        el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        el.onended = () => setPlaying(false);
      }}
      aria-label={label ?? "Play audio"}
    >
      {playing ? "⏸" : "▶"}
      <span className="sr-only" aria-live="polite">
        {playing ? "Playing" : "Stopped"}
      </span>
    </button>
  );
}
