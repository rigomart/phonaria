export interface Observation<State> {
	read: () => State;
	expected: State;
}

export interface Feature {
	title: string;
	checkpoints: Record<string, Observation<unknown>>;
	coverageLimits: readonly string[];
}

export function observation<State>(
	read: () => State,
	expected: NoInfer<State>,
): Observation<State> {
	return { read, expected };
}
