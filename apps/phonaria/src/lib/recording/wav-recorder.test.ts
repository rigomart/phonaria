import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CaptureMessage } from "./capture-protocol";
import { MAX_RECORDING_SECONDS, TRAILING_SILENCE_SECONDS } from "./voice-activity";
import { WAV_HEADER_BYTES } from "./wav";
import { createWavRecorder, TIME_LIMIT_GRACE_SECONDS, type WavRecorder } from "./wav-recorder";

const CONTEXT_RATE = 48_000;
const QUANTUM = 128;

class FakeTrack {
	stop = vi.fn();
	onended: (() => void) | null = null;
}

class FakeStream {
	tracks = [new FakeTrack()];
	getTracks() {
		return this.tracks;
	}
}

class FakeAudioContext {
	static instances: FakeAudioContext[] = [];
	sampleRate = CONTEXT_RATE;
	state = "running";
	onstatechange: (() => void) | null = null;
	destination = {};
	audioWorklet = { addModule: vi.fn(async (_url: string) => {}) };
	close = vi.fn(async () => {});
	resume = vi.fn(async () => {});
	createMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
	constructor() {
		FakeAudioContext.instances.push(this);
	}
}

class FakeWorkletNode {
	static instances: FakeWorkletNode[] = [];
	port: { onmessage: ((event: { data: CaptureMessage }) => void) | null } = { onmessage: null };
	connect = vi.fn();
	disconnect = vi.fn();
	constructor(
		readonly context: FakeAudioContext,
		readonly name: string,
	) {
		FakeWorkletNode.instances.push(this);
	}

	send(seconds: number, level: number) {
		const quanta = Math.ceil((seconds * CONTEXT_RATE) / QUANTUM);
		for (let i = 0; i < quanta; i++) {
			this.port.onmessage?.({ data: [new Float32Array(QUANTUM).fill(level)] });
		}
	}
}

let getUserMedia: ReturnType<
	typeof vi.fn<(constraints: MediaStreamConstraints) => Promise<FakeStream>>
>;

function context() {
	const instance = FakeAudioContext.instances.at(-1);
	if (!instance) throw new Error("no AudioContext was created");
	return instance;
}

function node() {
	const instance = FakeWorkletNode.instances.at(-1);
	if (!instance) throw new Error("no AudioWorkletNode was created");
	return instance;
}

function expectMicrophoneReleased(stream: FakeStream) {
	for (const track of stream.tracks) expect(track.stop).toHaveBeenCalled();
	expect(context().close).toHaveBeenCalledTimes(1);
}

async function startRecording(): Promise<{ recorder: WavRecorder; stream: FakeStream }> {
	const stream = new FakeStream();
	getUserMedia.mockResolvedValueOnce(stream);
	const recorder = createWavRecorder();
	await recorder.start();
	expect(recorder.getState()).toEqual({ status: "recording" });
	return { recorder, stream };
}

beforeEach(() => {
	FakeAudioContext.instances = [];
	FakeWorkletNode.instances = [];
	getUserMedia = vi.fn();
	vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
	vi.stubGlobal("AudioContext", FakeAudioContext);
	vi.stubGlobal("AudioWorkletNode", FakeWorkletNode);
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("createWavRecorder", () => {
	it("starts idle and touches no browser API until started", () => {
		vi.unstubAllGlobals();
		const recorder = createWavRecorder();
		expect(recorder.getState()).toEqual({ status: "idle" });
	});

	it("is unsupported without getUserMedia", async () => {
		vi.stubGlobal("navigator", {});
		const recorder = createWavRecorder();
		await recorder.start();
		expect(recorder.getState()).toEqual({ status: "unsupported" });
		expect(FakeAudioContext.instances).toHaveLength(0);
	});

	it("is unsupported without AudioWorklet", async () => {
		vi.stubGlobal("AudioWorkletNode", undefined);
		const recorder = createWavRecorder();
		await recorder.start();
		expect(recorder.getState()).toEqual({ status: "unsupported" });
		expect(getUserMedia).not.toHaveBeenCalled();
	});

	it("asks for the microphone, then reports denied permission and closes the audio context", async () => {
		let deny: (error: unknown) => void = () => {};
		getUserMedia.mockReturnValueOnce(new Promise((_, reject) => (deny = reject)));
		const recorder = createWavRecorder();
		const states: string[] = [];
		recorder.subscribe(() => states.push(recorder.getState().status));

		const started = recorder.start();
		expect(recorder.getState()).toEqual({ status: "requesting-permission" });
		deny(new DOMException("Permission denied", "NotAllowedError"));
		await started;

		expect(states).toEqual(["requesting-permission", "denied"]);
		expect(getUserMedia).toHaveBeenCalledWith({ audio: { channelCount: 1 } });
		expect(context().close).toHaveBeenCalledTimes(1);
		expect(FakeWorkletNode.instances).toHaveLength(0);
	});

	it("is unsupported when there is no microphone", async () => {
		getUserMedia.mockRejectedValueOnce(new DOMException("No device", "NotFoundError"));
		const recorder = createWavRecorder();
		await recorder.start();
		expect(recorder.getState()).toEqual({ status: "unsupported" });
		expect(context().close).toHaveBeenCalledTimes(1);
	});

	it("releases the microphone when the worklet fails to load", async () => {
		const stream = new FakeStream();
		getUserMedia.mockResolvedValueOnce(stream);
		const recorder = createWavRecorder();
		const started = recorder.start();
		context().audioWorklet.addModule.mockRejectedValueOnce(new Error("load failed"));
		await started;

		expect(recorder.getState()).toEqual({ status: "unsupported" });
		expectMicrophoneReleased(stream);
	});

	it("loads the capture worklet and routes the microphone through it", async () => {
		await startRecording();
		expect(context().audioWorklet.addModule).toHaveBeenCalledTimes(1);
		expect(node().name).toBe("phonaria-capture");
		const source = context().createMediaStreamSource.mock.results[0]?.value;
		expect(source.connect).toHaveBeenCalledWith(node());
		expect(node().connect).toHaveBeenCalledWith(context().destination);
	});

	it("stops after trailing silence and returns 16 kHz WAV", async () => {
		const { recorder, stream } = await startRecording();
		node().send(0.3, 0);
		node().send(0.5, 0.3);
		expect(recorder.getState().status).toBe("recording");
		node().send(TRAILING_SILENCE_SECONDS, 0);

		const state = recorder.getState();
		if (state.status !== "done") throw new Error(`expected done, got ${state.status}`);
		expect(state.durationSeconds).toBeCloseTo(0.3 + 0.5 + TRAILING_SILENCE_SECONDS, 1);
		expect(state.audio).toHaveLength(
			WAV_HEADER_BYTES + Math.round(state.durationSeconds * 16_000) * 2,
		);
		expectMicrophoneReleased(stream);
		expect(node().port.onmessage).toBeNull();
		expect(node().disconnect).toHaveBeenCalled();
	});

	it("reports elapsed time and the latest level while recording, and zero otherwise", async () => {
		const recorder = createWavRecorder();
		expect(recorder.getMeter()).toEqual({ elapsedSeconds: 0, level: 0 });

		getUserMedia.mockResolvedValueOnce(new FakeStream());
		await recorder.start();
		node().send(0.5, 0.25);
		const meter = recorder.getMeter();
		expect(meter.elapsedSeconds).toBeCloseTo(0.5, 2);
		expect(meter.level).toBeCloseTo(0.25, 5);

		node().send(0.2, 0);
		expect(recorder.getMeter().level).toBe(0);

		recorder.stop();
		expect(recorder.getMeter()).toEqual({ elapsedSeconds: 0, level: 0 });
	});

	it("stops at the time limit", async () => {
		const { recorder, stream } = await startRecording();
		node().send(MAX_RECORDING_SECONDS + 1, 0.3);

		const state = recorder.getState();
		if (state.status !== "done") throw new Error(`expected done, got ${state.status}`);
		expect(state.durationSeconds).toBe(MAX_RECORDING_SECONDS);
		expect(state.audio).toHaveLength(WAV_HEADER_BYTES + MAX_RECORDING_SECONDS * 16_000 * 2);
		expectMicrophoneReleased(stream);
	});

	it("keeps what was said when stopped early", async () => {
		const { recorder, stream } = await startRecording();
		node().send(1, 0.3);
		recorder.stop();

		const state = recorder.getState();
		if (state.status !== "done") throw new Error(`expected done, got ${state.status}`);
		expect(state.durationSeconds).toBeCloseTo(1, 2);
		expectMicrophoneReleased(stream);
	});

	it("releases the microphone and discards the recording when cancelled", async () => {
		const { recorder, stream } = await startRecording();
		node().send(1, 0.3);
		recorder.cancel();

		expect(recorder.getState()).toEqual({ status: "idle" });
		expectMicrophoneReleased(stream);
		expect(node().port.onmessage).toBeNull();
	});

	it("releases a microphone granted after it was cancelled", async () => {
		let grant: (stream: FakeStream) => void = () => {};
		getUserMedia.mockReturnValueOnce(new Promise((resolve) => (grant = resolve)));
		const recorder = createWavRecorder();
		const started = recorder.start();
		recorder.cancel();
		expect(recorder.getState()).toEqual({ status: "idle" });

		const stream = new FakeStream();
		grant(stream);
		await started;

		expect(recorder.getState()).toEqual({ status: "idle" });
		expectMicrophoneReleased(stream);
		expect(FakeWorkletNode.instances).toHaveLength(0);
	});

	it("records again after a finished recording", async () => {
		const { recorder } = await startRecording();
		recorder.stop();
		expect(recorder.getState().status).toBe("done");

		getUserMedia.mockResolvedValueOnce(new FakeStream());
		await recorder.start();
		expect(recorder.getState()).toEqual({ status: "recording" });
		expect(FakeAudioContext.instances).toHaveLength(2);
	});

	it("ignores a second start while recording", async () => {
		const { recorder } = await startRecording();
		await recorder.start();
		expect(getUserMedia).toHaveBeenCalledTimes(1);
		expect(FakeAudioContext.instances).toHaveLength(1);
	});

	describe("when the audio stops arriving", () => {
		const LIMIT_MS = (MAX_RECORDING_SECONDS + TIME_LIMIT_GRACE_SECONDS) * 1000;

		beforeEach(() => {
			vi.useFakeTimers();
		});

		it("ends at the time limit by the clock and releases the microphone", async () => {
			const { recorder, stream } = await startRecording();
			node().send(1, 0.3);

			vi.advanceTimersByTime(LIMIT_MS - 1);
			expect(recorder.getState().status).toBe("recording");
			vi.advanceTimersByTime(1);

			const state = recorder.getState();
			if (state.status !== "done") throw new Error(`expected done, got ${state.status}`);
			expect(state.durationSeconds).toBeCloseTo(1, 2);
			expectMicrophoneReleased(stream);
		});

		it("ends with no audio at all when no samples ever arrive", async () => {
			const { recorder, stream } = await startRecording();
			vi.advanceTimersByTime(LIMIT_MS);

			expect(recorder.getState()).toMatchObject({ status: "done", durationSeconds: 0 });
			expectMicrophoneReleased(stream);
		});

		it("ends and keeps the audio when the context is suspended or interrupted", async () => {
			const { recorder, stream } = await startRecording();
			node().send(1, 0.3);
			context().state = "interrupted";
			context().onstatechange?.();

			expect(recorder.getState()).toMatchObject({ status: "done" });
			expect(recorder.getState()).not.toMatchObject({ durationSeconds: 0 });
			expectMicrophoneReleased(stream);
			expect(vi.getTimerCount()).toBe(0);
		});

		it("ends and keeps the audio when the microphone track ends", async () => {
			const { recorder, stream } = await startRecording();
			node().send(1, 0.3);
			stream.tracks[0]?.onended?.();

			expect(recorder.getState()).toMatchObject({ status: "done" });
			expectMicrophoneReleased(stream);
			expect(vi.getTimerCount()).toBe(0);
		});

		it.each([
			["stop", (recorder: WavRecorder) => recorder.stop()],
			["cancel", (recorder: WavRecorder) => recorder.cancel()],
			["auto-stop", () => node().send(MAX_RECORDING_SECONDS + 0.1, 0.3)],
		])("clears the clock on %s so the recording ends once", async (_, end) => {
			const { recorder } = await startRecording();
			end(recorder);
			const ended = recorder.getState();
			expect(vi.getTimerCount()).toBe(0);

			const listener = vi.fn();
			recorder.subscribe(listener);
			vi.advanceTimersByTime(LIMIT_MS * 2);
			expect(recorder.getState()).toBe(ended);
			expect(listener).not.toHaveBeenCalled();
			expect(context().close).toHaveBeenCalledTimes(1);
		});
	});
});
