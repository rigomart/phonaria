import { CAPTURE_PROCESSOR_NAME, type CaptureMessage } from "./capture-protocol";

// AudioWorkletGlobalScope is not part of TypeScript's DOM lib.
declare const AudioWorkletProcessor: {
	prototype: object;
	new (): { readonly port: MessagePort };
};
declare function registerProcessor(name: string, processor: typeof CaptureProcessor): void;

class CaptureProcessor extends AudioWorkletProcessor {
	process(inputs: Float32Array[][]): boolean {
		const channels = inputs[0];
		if (channels && channels.length > 0) {
			// The engine reuses its input buffers on the next render quantum.
			const message: CaptureMessage = channels.map((channel) => channel.slice());
			this.port.postMessage(
				message,
				message.map((channel) => channel.buffer),
			);
		}
		return true;
	}
}

registerProcessor(CAPTURE_PROCESSOR_NAME, CaptureProcessor);
