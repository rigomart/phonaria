export type PlaybackSpeed = "slow" | "normal" | "fast" | number;

export type PlaybackStatus = "idle" | "loading" | "playing" | "error";

export type PlayOptions = {
	speed?: PlaybackSpeed;
	startAt?: number;
	exclusive?: boolean;
	reset?: boolean;
};

export type AudioDeck = {
	play: (src: string, options?: PlaybackSpeed | PlayOptions) => Promise<void>;
	stop: (src: string) => void;
	stopAll: () => void;
	preload: (src: string) => void;
	getStatus: (src: string) => PlaybackStatus;
	isLoading: (src: string) => boolean;
	isPlaying: (src: string) => boolean;
	isError: (src: string) => boolean;
	currentSource: () => string | null;
	hasActiveSource: () => boolean;
};
