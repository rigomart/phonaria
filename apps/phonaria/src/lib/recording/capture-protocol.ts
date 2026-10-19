/** Shared by the capture worklet and the recorder, which run in different global scopes. */
export const CAPTURE_PROCESSOR_NAME = "phonaria-capture";

/** One render quantum of microphone input, one array per channel. */
export type CaptureMessage = Float32Array[];
