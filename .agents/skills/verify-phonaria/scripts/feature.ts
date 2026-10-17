export interface Observation<State> {
	read: () => State;
	expected: State;
}

/** An error response the journey expects, such as a flagged page's 404. */
export interface ExpectedResponse {
	path: string;
	status: number;
}

export interface Feature {
	title: string;
	checkpoints: Record<string, Observation<unknown>>;
	coverageLimits: readonly string[];
	/**
	 * Evidence screenshots capture the full page unless set to "viewport", for
	 * pages with pinned layers that a full-page capture would stretch to the
	 * whole document height.
	 */
	screenshot?: "viewport";
	/**
	 * A pass requires a saved DevTools trace unless the journey declares
	 * "skip", for pages that tracing itself stalls. Say why in coverageLimits.
	 */
	trace?: "skip";
	/** Error responses that are the behaviour under test, so they don't fail the run. */
	expectedResponses?: readonly ExpectedResponse[];
}

export function observation<State>(
	read: () => State,
	expected: NoInfer<State>,
): Observation<State> {
	return { read, expected };
}
