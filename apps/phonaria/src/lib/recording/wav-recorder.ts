import type { WavAudio } from "@phonaria/pronunciation";
import { CAPTURE_PROCESSOR_NAME, type CaptureMessage } from "./capture-protocol";
// Vite compiles the worklet and exports its URL; the linter can't resolve the query.
// oxlint-disable-next-line import/default
import captureWorkletUrl from "./capture-worklet?worker&url";
import { mixToMono, resampleTo16k, SCORER_SAMPLE_RATE } from "./resample";
import {
	MAX_RECORDING_SECONDS,
	rootMeanSquare,
	SILENT_START,
	shouldStopRecording,
	trackVoiceActivity,
	type VoiceActivity,
} from "./voice-activity";
import { encodeWav } from "./wav";

export type WavRecorderState =
	| { readonly status: "idle" }
	| { readonly status: "requesting-permission" }
	| { readonly status: "denied" }
	| { readonly status: "unsupported" }
	| { readonly status: "recording" }
	| { readonly status: "done"; readonly audio: WavAudio; readonly durationSeconds: number };

export type WavRecorder = {
	getState(): WavRecorderState;
	subscribe(listener: () => void): () => void;
	/** Asks for the microphone and records until the time limit, trailing silence or `stop()`. Never rejects. */
	start(): Promise<void>;
	/** Ends the recording early and keeps what was said. */
	stop(): void;
	/** Releases the microphone, discards any recording and returns to idle. */
	cancel(): void;
	/**
	 * How far the current recording has got, read on demand (e.g. once per frame)
	 * so audio chunks don't notify subscribers. Zero when not recording.
	 */
	getMeter(): RecordingMeter;
};

export type RecordingMeter = {
	readonly elapsedSeconds: number;
	/** Root-mean-square level of the latest audio chunk, on a -1..1 signal. */
	readonly level: number;
};

const SILENT_METER: RecordingMeter = { elapsedSeconds: 0, level: 0 };

type Session = {
	readonly context: AudioContext;
	stream: MediaStream | null;
	source: MediaStreamAudioSourceNode | null;
	node: AudioWorkletNode | null;
	chunks: Float32Array[];
	activity: VoiceActivity;
	level: number;
	closed: boolean;
	timer: ReturnType<typeof setTimeout> | null;
};

const IDLE: WavRecorderState = { status: "idle" };

/**
 * Slack past the time limit before the wall clock ends a recording, so the
 * limit counted in samples normally wins and the audio runs the full limit.
 */
export const TIME_LIMIT_GRACE_SECONDS = 0.5;

/** Touches no browser globals until `start()`, so it is safe to create during a server render. */
export function createWavRecorder(): WavRecorder {
	let state = IDLE;
	let session: Session | null = null;
	const listeners = new Set<() => void>();

	function setState(next: WavRecorderState) {
		if (next === state) return;
		state = next;
		for (const listener of listeners) listener();
	}

	async function start() {
		if (session) return;
		// Created before the permission prompt, while the click still counts as a
		// user gesture, so autoplay policies let it run.
		const context = isRecordingSupported() ? createAudioContext() : null;
		if (!context) {
			setState({ status: "unsupported" });
			return;
		}

		const current: Session = {
			context,
			stream: null,
			source: null,
			node: null,
			chunks: [],
			activity: SILENT_START,
			level: 0,
			closed: false,
			timer: null,
		};
		session = current;
		setState({ status: "requesting-permission" });

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
			current.stream = stream;
			if (session !== current) {
				release(current);
				return;
			}

			await current.context.audioWorklet.addModule(captureWorkletUrl);
			if (session !== current) return;

			const source = current.context.createMediaStreamSource(stream);
			const node = new AudioWorkletNode(current.context, CAPTURE_PROCESSOR_NAME);
			current.source = source;
			current.node = node;
			node.port.onmessage = (event: MessageEvent<CaptureMessage>) => {
				if (session !== current) return;
				const samples = mixToMono(event.data);
				current.chunks.push(samples);
				current.level = rootMeanSquare(samples);
				current.activity = trackVoiceActivity(
					current.activity,
					samples,
					current.context.sampleRate,
				);
				if (shouldStopRecording(current.activity)) finish(current);
			};
			source.connect(node);
			// The node writes silence; the path to the destination keeps every
			// browser pulling audio through it.
			node.connect(current.context.destination);
			await current.context.resume();
			if (session !== current) return;

			// A suspended or interrupted context stops calling the worklet, and an
			// ended track sends no more audio, so neither would reach the limit in samples.
			current.timer = setTimeout(
				() => finishIfCurrent(current),
				(MAX_RECORDING_SECONDS + TIME_LIMIT_GRACE_SECONDS) * 1000,
			);
			current.context.onstatechange = () => {
				if (current.context.state !== "running") finishIfCurrent(current);
			};
			for (const track of stream.getTracks()) {
				track.onended = () => finishIfCurrent(current);
			}
			setState({ status: "recording" });
		} catch (error) {
			if (session !== current) return;
			release(current);
			session = null;
			setState({ status: isPermissionError(error) ? "denied" : "unsupported" });
		}
	}

	function finish(current: Session) {
		release(current);
		session = null;
		const samples = resampleTo16k(
			joinChunks(current.chunks, MAX_RECORDING_SECONDS * current.context.sampleRate),
			current.context.sampleRate,
		);
		setState({
			status: "done",
			audio: encodeWav(samples),
			durationSeconds: samples.length / SCORER_SAMPLE_RATE,
		});
	}

	function finishIfCurrent(current: Session) {
		if (session === current) finish(current);
	}

	function cancel() {
		if (session) release(session);
		session = null;
		setState(IDLE);
	}

	return {
		getState: () => state,
		subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
		start,
		stop() {
			if (!session) return;
			if (state.status === "recording") finish(session);
			else cancel();
		},
		cancel,
		getMeter() {
			if (!session || state.status !== "recording") return SILENT_METER;
			return { elapsedSeconds: session.activity.elapsedSeconds, level: session.level };
		},
	};
}

function isRecordingSupported(): boolean {
	return (
		typeof navigator !== "undefined" &&
		typeof navigator.mediaDevices?.getUserMedia === "function" &&
		typeof AudioContext !== "undefined" &&
		typeof AudioWorkletNode !== "undefined"
	);
}

function createAudioContext(): AudioContext | null {
	try {
		return new AudioContext();
	} catch {
		return null;
	}
}

/** `SecurityError` is what browsers throw when a permissions policy blocks the microphone. */
function isPermissionError(error: unknown): boolean {
	return (
		error instanceof Error && (error.name === "NotAllowedError" || error.name === "SecurityError")
	);
}

function release(current: Session) {
	if (current.timer !== null) {
		clearTimeout(current.timer);
		current.timer = null;
	}
	current.context.onstatechange = null;
	if (current.node) {
		current.node.port.onmessage = null;
		current.node.disconnect();
	}
	current.source?.disconnect();
	for (const track of current.stream?.getTracks() ?? []) {
		track.onended = null;
		track.stop();
	}
	if (!current.closed) {
		current.closed = true;
		void current.context.close();
	}
}

function joinChunks(chunks: readonly Float32Array[], maxLength: number): Float32Array {
	const length = Math.min(
		maxLength,
		chunks.reduce((total, chunk) => total + chunk.length, 0),
	);
	const joined = new Float32Array(length);
	let offset = 0;
	for (const chunk of chunks) {
		if (offset >= length) break;
		const part = chunk.subarray(0, length - offset);
		joined.set(part, offset);
		offset += part.length;
	}
	return joined;
}
