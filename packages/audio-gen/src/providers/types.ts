export type TtsInput = { id: string; text: string };

export type TtsOutput = { id: string; audio: Buffer };

export interface TtsProvider {
	synthesize(requests: TtsInput[]): Promise<TtsOutput[]>;
}
