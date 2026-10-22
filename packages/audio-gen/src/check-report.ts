import type { ClipResult, Mark } from "./check-clips";
import { CLIP_CHECK_LIMITS, type CheckName, checkNames } from "./clip-checks";

export type CheckedSet = { readonly name: string; readonly clips: readonly ClipResult[] };

const count = (part: number, whole: number) =>
	whole ? `${part}/${whole} (${((100 * part) / whole).toFixed(1)}%)` : "0/0";
const md = (value: string) => value.replace(/\|/g, "\\|");
const failures = (clip: ClipResult, only?: readonly CheckName[]) =>
	(only ?? clip.failed)
		.map((name) => `${name}: ${md(clip.checks[name]?.detail ?? "")}`)
		.join("<br>");
const unscored = (clips: readonly ClipResult[]) =>
	clips.filter(({ scoring }) => scoring !== "scored").length;

/**
 * How the checks did on a batch and, once the dev has marked it by ear, how they
 * compare: rejected clips the checks caught or missed, and accepted clips they flagged.
 * Known-good sets (clips already reviewed by ear) count false alarms only.
 */
export function renderCheckReport({
	batch,
	marks,
	knownGood = [],
}: {
	readonly batch: CheckedSet;
	readonly marks: ReadonlyMap<string, Mark>;
	readonly knownGood?: readonly CheckedSet[];
}): string {
	const lines = [`# Clip checks: ${batch.name}`, ""];
	const sets = [batch, ...knownGood];
	for (const set of sets) {
		const missing = unscored(set.clips);
		if (missing)
			lines.push(
				`**${set.name}: ${missing} clips weren't scored, so Azure's checks didn't run on them.**`,
				"",
			);
	}
	lines.push(
		`Limits: word accuracy ≥ ${CLIP_CHECK_LIMITS.wordAccuracy}, speech ${CLIP_CHECK_LIMITS.speechRatio.min}–${CLIP_CHECK_LIMITS.speechRatio.max}× the expected length, ≥ ${CLIP_CHECK_LIMITS.leadingSilenceMs} ms before and ≥ ${CLIP_CHECK_LIMITS.trailingSilenceMs} ms after the word, loudness within ${CLIP_CHECK_LIMITS.loudnessRangeDb} dB of the batch median, fewer than ${CLIP_CHECK_LIMITS.clippedSamples} samples at full scale.`,
		"",
		"## Clips each check fails",
		"",
		`| Check | ${sets.map(({ name }) => md(name)).join(" | ")} |`,
		`| --- | ${sets.map(() => "---").join(" | ")} |`,
		...checkNames.map(
			(name) =>
				`| ${name} | ${sets.map(({ clips }) => count(clips.filter(({ failed }) => failed.includes(name)).length, clips.length)).join(" | ")} |`,
		),
		`| **any** | ${sets.map(({ clips }) => count(clips.filter(({ failed }) => failed.length).length, clips.length)).join(" | ")} |`,
		"",
	);

	const marked = batch.clips.flatMap((clip) => {
		const mark = marks.get(clip.file);
		return mark ? [{ clip, mark }] : [];
	});
	if (marked.length) {
		const rejected = marked.filter(({ mark }) => !mark.accepted);
		const accepted = marked.filter(({ mark }) => mark.accepted);
		const missed = rejected.filter(({ clip }) => !clip.failed.length);
		const falseAlarms = accepted.filter(({ clip }) => clip.failed.length);
		lines.push(
			"## Against the dev's marks",
			"",
			`${marked.length} of ${batch.clips.length} clips marked: ${accepted.length} accepted, ${rejected.length} rejected.`,
			"",
			"| Check | Rejected clips it fails | Accepted clips it fails (false alarms) |",
			"| --- | --- | --- |",
			...checkNames.map(
				(name) =>
					`| ${name} | ${count(rejected.filter(({ clip }) => clip.failed.includes(name)).length, rejected.length)} | ${count(accepted.filter(({ clip }) => clip.failed.includes(name)).length, accepted.length)} |`,
			),
			`| **any** | ${count(rejected.length - missed.length, rejected.length)} | ${count(falseAlarms.length, accepted.length)} |`,
			"",
			"### Missed: rejected by ear, passed every check",
			"",
			...(missed.length
				? [
						"| File | IPA | Picked for | Notes |",
						"| --- | --- | --- | --- |",
						...missed.map(
							({ clip, mark }) =>
								`| ${clip.file} | ${clip.ipa} | ${md((clip.pickedFor ?? []).join("; "))} | ${md(mark.notes)} |`,
						),
					]
				: ["None."]),
			"",
			"### Caught: rejected by ear and failed a check",
			"",
			...(rejected.length - missed.length
				? [
						"| File | Failed | Notes |",
						"| --- | --- | --- |",
						...rejected
							.filter(({ clip }) => clip.failed.length)
							.map(({ clip, mark }) => `| ${clip.file} | ${failures(clip)} | ${md(mark.notes)} |`),
					]
				: ["None."]),
			"",
			"### False alarms: accepted by ear, failed a check",
			"",
			...(falseAlarms.length
				? [
						"| File | Failed |",
						"| --- | --- |",
						...falseAlarms.map(({ clip }) => `| ${clip.file} | ${failures(clip)} |`),
					]
				: ["None."]),
			"",
		);
		const unmarked = batch.clips.length - marked.length;
		if (unmarked) lines.push(`${unmarked} clips aren't marked yet.`, "");
	}

	for (const set of sets) {
		const flagged = set.clips.filter(({ failed }) => failed.length);
		lines.push(`## Failed clips: ${set.name}`, "");
		if (!flagged.length) {
			lines.push("None.", "");
			continue;
		}
		lines.push(
			"| File | IPA | Failed |",
			"| --- | --- | --- |",
			...flagged.map((clip) => `| ${clip.file} | ${clip.ipa} | ${failures(clip)} |`),
			"",
		);
	}
	return `${lines.join("\n")}\n`;
}
