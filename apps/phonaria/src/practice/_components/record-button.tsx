/**
 * The record control. A red dot says "record" before anything starts; while
 * recording, a ring fills toward the time limit around a pulsing stop square,
 * and three bars show the microphone is hearing the learner. The label and the
 * shapes change too, so the state never rests on color alone.
 */
import { Button } from "@phonaria/ui/components/button";
import { Spinner } from "@phonaria/ui/components/spinner";
import { useEffect, useState } from "react";
import type { RecordingMeter } from "@/lib/recording/wav-recorder";
import { cn } from "@/lib/utils";
import { LEVEL_BARS, litBars, recordingProgress } from "../_lib/record-meter";
import type { SpeakingView } from "../_lib/speaking-attempt";

const SILENT: RecordingMeter = { elapsedSeconds: 0, level: 0 };
const RING_RADIUS = 10;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const BAR_HEIGHTS = ["h-1.5", "h-2.5", "h-3.5"] as const;

/** Reads the meter once per frame while `active`, so audio chunks never re-render the page. */
function useMeter(active: boolean, getMeter: () => RecordingMeter): RecordingMeter {
	const [meter, setMeter] = useState(SILENT);
	useEffect(() => {
		if (!active) return;
		let frame = requestAnimationFrame(function tick() {
			setMeter(getMeter());
			frame = requestAnimationFrame(tick);
		});
		return () => cancelAnimationFrame(frame);
	}, [active, getMeter]);
	return active ? meter : SILENT;
}

function RecordDot() {
	return <span aria-hidden="true" className="size-3 rounded-full bg-record" />;
}

function ProgressRing({ progress }: { progress: number }) {
	return (
		<span aria-hidden="true" className="relative flex size-6 items-center justify-center">
			<svg className="-rotate-90 absolute inset-0 size-6" viewBox="0 0 24 24">
				<circle
					className="fill-none stroke-border"
					cx="12"
					cy="12"
					r={RING_RADIUS}
					strokeWidth="2"
				/>
				<circle
					className="fill-none stroke-record"
					cx="12"
					cy="12"
					r={RING_RADIUS}
					strokeDasharray={RING_LENGTH}
					strokeDashoffset={RING_LENGTH * (1 - progress)}
					strokeLinecap="round"
					strokeWidth="2"
				/>
			</svg>
			<span className="size-2.5 animate-pulse rounded-xs bg-record motion-reduce:animate-none" />
		</span>
	);
}

function LevelBars({ level }: { level: number }) {
	const lit = litBars(level);
	return (
		<span aria-hidden="true" className="flex h-3.5 items-end gap-0.5" data-lit-bars={lit}>
			{BAR_HEIGHTS.slice(0, LEVEL_BARS).map((height, index) => (
				<span
					className={cn("w-1 rounded-full", height, index < lit ? "bg-record" : "bg-border")}
					key={height}
				/>
			))}
		</span>
	);
}

const shell =
	"min-w-32 border-border bg-background-strong text-foreground hover:bg-muted dark:bg-background-strong dark:hover:bg-muted";

export function RecordButton({
	view,
	onRecord,
	onStop,
	getMeter,
}: {
	view: SpeakingView;
	onRecord: () => void;
	onStop: () => void;
	getMeter: () => RecordingMeter;
}) {
	const recording = view.phase === "recording";
	const meter = useMeter(recording, getMeter);

	switch (view.phase) {
		case "recording":
			return (
				<Button
					aria-label="Stop recording"
					className={cn(shell, "border-record")}
					data-recording=""
					onClick={onStop}
					size="lg"
					variant="outline"
				>
					<ProgressRing progress={recordingProgress(meter.elapsedSeconds)} />
					Stop
					<LevelBars level={meter.level} />
				</Button>
			);
		case "requesting-permission":
			return (
				<Button aria-busy="true" className={shell} disabled size="lg" variant="outline">
					<Spinner />
					Record
				</Button>
			);
		case "scoring":
			// The status line under the button carries the spinner.
			return (
				<Button aria-busy="true" className={shell} disabled size="lg" variant="outline">
					Checking…
				</Button>
			);
		case "outcome":
		case "failure":
			return (
				<Button className={shell} onClick={onRecord} size="lg" variant="outline">
					<RecordDot />
					Try again
				</Button>
			);
		case "ready":
			return (
				<Button className={shell} onClick={onRecord} size="lg" variant="outline">
					<RecordDot />
					Record
				</Button>
			);
	}
}
