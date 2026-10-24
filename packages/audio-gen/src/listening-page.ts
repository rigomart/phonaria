import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { REVIEW_SHEET_FILE, readReviewSheet, type SheetRow } from "./review-sheet";

type PageSample = {
	word: string;
	form?: { label: string };
	ipa: string;
	file: string;
	status: string;
	pickedFor?: readonly string[];
};

const escapeHtml = (value: string) =>
	value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);

/**
 * A page for marking clips by ear: play each, mark it yes or no with a note, then
 * download the review sheet with `accepted` and `notes` filled. Marks stay in the
 * browser until downloaded. It never shows check results, so marks stay blind to them.
 */
export function listeningPage(
	title: string,
	samples: readonly PageSample[],
	reviewTsv: string,
): string {
	const rows = samples
		.filter(({ status }) => status === "generated")
		.map(
			(sample) => `<tr data-file="${escapeHtml(sample.file)}">
<td><audio controls preload="none" src="${escapeHtml(sample.file)}"></audio></td>
<td><strong>${escapeHtml(sample.word)}</strong>${sample.form ? `<br><small>${escapeHtml(sample.form.label)}</small>` : ""}</td>
<td>/${escapeHtml(sample.ipa)}/</td>
<td><small>${escapeHtml((sample.pickedFor ?? []).join("; "))}</small></td>
<td><label><input type="radio" name="${escapeHtml(sample.file)}" value="yes"> yes</label>
<label><input type="radio" name="${escapeHtml(sample.file)}" value="no"> no</label></td>
<td><input type="text" class="notes" size="30"></td>
</tr>`,
		)
		.join("\n");
	return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
body { font-family: system-ui, sans-serif; margin: 2rem; }
table { border-collapse: collapse; }
td, th { padding: 0.4rem 0.6rem; border-bottom: 1px solid #ddd; text-align: left; vertical-align: middle; }
tr.yes { background: #eefaf0; } tr.no { background: #fdeeee; }
</style>
<h1>${escapeHtml(title)}</h1>
<p>Listen to each clip and mark it <strong>yes</strong> if it is the word, said as the IPA shows, cleanly. Marks are saved in this browser. When done, download the sheet and save it over <code>review.tsv</code> in this folder.</p>
<p><button id="download">Download review.tsv</button> <span id="progress"></span></p>
<table>
<tr><th>Clip</th><th>Word</th><th>IPA</th><th>Picked for</th><th>Accepted</th><th>Notes</th></tr>
${rows}
</table>
<script>
const review = ${JSON.stringify(reviewTsv).replace(/</g, "\\u003c")};
const key = "audio-gen-marks:" + ${JSON.stringify(title).replace(/</g, "\\u003c")};
const marks = JSON.parse(localStorage.getItem(key) || "{}");
const rows = [...document.querySelectorAll("tr[data-file]")];
const save = () => {
	localStorage.setItem(key, JSON.stringify(marks));
	const done = rows.filter((row) => marks[row.dataset.file]?.accepted).length;
	document.getElementById("progress").textContent = done + " of " + rows.length + " marked";
	for (const row of rows) row.className = marks[row.dataset.file]?.accepted || "";
};
for (const row of rows) {
	const mark = (marks[row.dataset.file] ??= { accepted: "", notes: "" });
	for (const radio of row.querySelectorAll("input[type=radio]")) {
		radio.checked = radio.value === mark.accepted;
		radio.addEventListener("change", () => { mark.accepted = radio.value; save(); });
	}
	const notes = row.querySelector(".notes");
	notes.value = mark.notes;
	notes.addEventListener("input", () => { mark.notes = notes.value.replace(/[\\t\\n]/g, " "); save(); });
	row.querySelector("audio").addEventListener("play", (event) => {
		for (const audio of document.querySelectorAll("audio")) if (audio !== event.target) audio.pause();
	});
}
document.getElementById("download").addEventListener("click", () => {
	const [header, ...lines] = review.replace(/\\n+$/, "").split("\\n");
	const columns = header.split("\\t");
	const file = columns.indexOf("file"), accepted = columns.indexOf("accepted"), notes = columns.indexOf("notes");
	const out = [header, ...lines.map((line) => {
		const cells = line.split("\\t");
		const mark = marks[cells[file]];
		if (mark?.accepted) cells[accepted] = mark.accepted;
		if (mark?.notes) cells[notes] = mark.notes;
		return cells.join("\\t");
	})].join("\\n") + "\\n";
	const link = document.createElement("a");
	link.href = URL.createObjectURL(new Blob([out], { type: "text/tab-separated-values" }));
	link.download = "review.tsv";
	link.click();
});
save();
</script>
</html>
`;
}

/**
 * The clips to list: the batch's sheet, in its order and with its reasons, when it has one;
 * otherwise every clip in the plan.
 */
export function pageSamples(
	samples: readonly PageSample[],
	sheet: readonly SheetRow[] | undefined,
): PageSample[] {
	if (!sheet) return [...samples];
	const byFile = new Map(samples.map((sample) => [sample.file, sample]));
	return sheet.map(({ file, reason }) => {
		const sample = byFile.get(file);
		if (!sample) throw new Error(`${REVIEW_SHEET_FILE} lists ${file}, which isn't in the plan`);
		return { ...sample, pickedFor: [reason] };
	});
}

/** Writes `listen.html` beside an output directory's plan and review sheet. */
export async function writeListeningPage(
	dir: string,
): Promise<{ file: string; clips: number; fromSheet: boolean }> {
	const plan = JSON.parse(await readFile(path.join(dir, "plan.json"), "utf8")) as {
		samples: PageSample[];
	};
	const sheet = await readReviewSheet(dir);
	const samples = pageSamples(plan.samples, sheet);
	const review = await readFile(path.join(dir, "review.tsv"), "utf8");
	const file = path.join(dir, "listen.html");
	await writeFile(file, listeningPage(path.basename(dir), samples, review));
	return {
		file,
		clips: samples.filter(({ status }) => status === "generated").length,
		fromSheet: Boolean(sheet),
	};
}
