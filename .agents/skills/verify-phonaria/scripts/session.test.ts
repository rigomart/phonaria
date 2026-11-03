import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { observation } from "./feature";
import { features, getFeature } from "./features";
import {
	assessRun,
	commandFailureMessage,
	compareAtTarget,
	compareObservation,
	observationExpression,
	saveSnapshot,
	withoutExpectedResponses,
} from "./session";
import { transcription } from "./transcription";

test("a second feature requires its own checkpoints rather than transcription checks", () => {
	const theme = {
		title: "Theme",
		checkpoints: { toggled: observation(() => ({ dark: true }), { dark: true }) },
		coverageLimits: ["reload persistence unverified"],
	};
	const feature = getFeature("theme", { theme });
	assert.equal(
		assessRun(
			"passed",
			[{ name: "submitted", passed: true }],
			Object.keys(feature.checkpoints),
			clean,
		),
		"blocked",
	);
	assert.equal(
		assessRun(
			"passed",
			[{ name: "toggled", passed: true }],
			Object.keys(feature.checkpoints),
			clean,
		),
		"passed",
	);
});

test("missing or unknown features never silently select transcription", () => {
	assert.throws(() => getFeature(undefined), /Choose a feature/);
	assert.throws(() => getFeature("missing"), /Unknown feature/);
	assert.throws(() => getFeature("toString"), /Unknown feature/);
});

test("typed observations execute in an isolated browser context", () => {
	const actual = runInNewContext(observationExpression(transcription.checkpoints.empty.read), {
		location: { origin: "http://127.0.0.1:3000", href: "http://127.0.0.1:3000/" },
		URL,
		document: {
			querySelector: () => ({ value: "" }),
			querySelectorAll: (selector: string) =>
				selector === "button" ? [{ textContent: "Hello world", getClientRects: () => [{}] }] : [],
		},
	});
	assert.deepEqual(JSON.parse(JSON.stringify(actual)), {
		origin: "http://127.0.0.1:3000",
		state: { input: "", query: null, tokens: 0, example: true },
	});
});

test("every checkpoint reads only browser globals, since it runs in the page after serialization", () => {
	const fileName = "reads.js";
	const reads: { id: string; end: number }[] = [];
	let text = "";
	for (const [feature, { checkpoints }] of Object.entries(features)) {
		for (const [checkpoint, { read }] of Object.entries(checkpoints)) {
			text += `void (${read.toString()});\n`;
			reads.push({ id: `${feature}/${checkpoint}`, end: text.length });
		}
	}
	const options: ts.CompilerOptions = {
		allowJs: true,
		checkJs: true,
		noEmit: true,
		target: ts.ScriptTarget.ES2022,
		lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
		types: [],
	};
	const host = ts.createCompilerHost(options);
	const getSourceFile = host.getSourceFile;
	host.getSourceFile = (name, ...rest) =>
		name === fileName
			? ts.createSourceFile(name, text, ts.ScriptTarget.ES2022)
			: getSourceFile(name, ...rest);
	const program = ts.createProgram([fileName], options, host);
	const unresolved = program
		.getSemanticDiagnostics(program.getSourceFile(fileName))
		.map((diagnostic) => ({
			start: diagnostic.start ?? 0,
			message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
		}))
		.filter(({ message }) => /^(Cannot find name|No value exists in scope)/.test(message))
		.map(({ start, message }) => `${reads.find((read) => start < read.end)?.id}: ${message}`);
	assert.deepEqual(unresolved, []);
});

test("repeating a checkpoint keeps both snapshots", () => {
	const dir = mkdtempSync(join(tmpdir(), "phonaria-evidence-"));
	try {
		const first = saveSnapshot(dir, "submitted", { text: "wrong IPA" });
		const second = saveSnapshot(dir, "submitted", { text: "correct IPA" });
		assert.notEqual(first.snapshot, second.snapshot);
		assert.deepEqual(JSON.parse(readFileSync(first.snapshot, "utf8")), { text: "wrong IPA" });
		assert.deepEqual(JSON.parse(readFileSync(second.snapshot, "utf8")), { text: "correct IPA" });
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("correct UI values on another checkout's origin cannot pass", () => {
	const state = { input: "hello world", ipa: "hə·ˈloʊ" };
	assert.equal(
		compareAtTarget({ origin: "http://127.0.0.1:3000", state }, state, "http://127.0.0.1:3001"),
		false,
	);
	assert.equal(
		compareAtTarget({ origin: "http://127.0.0.1:3001", state }, state, "http://127.0.0.1:3001"),
		true,
	);
});

test("a CLI startup error remains readable through the wrapper", () => {
	assert.equal(
		commandFailureMessage({
			stdout:
				'{"success":false,"error":"Failed to create socket directory: Operation not permitted"}',
			stderr: "",
			message: "Command failed: agent-browser open",
		}),
		"Failed to create socket directory: Operation not permitted",
	);
});

test("wrong IPA fails even when words and controls are present", () => {
	const expected = { words: ["hello", "world"], ipa: "hə·ˈloʊˈwɝld", copyEnabled: true };
	assert.equal(compareObservation({ ...expected, ipa: "hello world" }, expected), false);
	assert.equal(compareObservation(expected, expected), true);
});

const required = ["submitted", "restored"];
const passed = required.map((name) => ({ name, passed: true }));
const clean = { errors: [], consoleErrors: [], failedRequests: [] };

test("complete observations and clean diagnostics permit a pass", () => {
	assert.equal(assessRun("passed", passed, required, clean), "passed");
});

test("missing observations cannot silently pass", () => {
	assert.equal(assessRun("passed", passed.slice(0, 1), required, clean), "blocked");
});

test("an expected error response does not fail a run, but any other does", () => {
	const notFound = {
		method: "GET",
		url: "http://127.0.0.1:3000/history",
		status: 404,
		error: null,
	};
	const elsewhere = { ...notFound, url: "http://127.0.0.1:3000/ipa-chart" };
	const expected = [{ path: "/history", status: 404 }];
	const diagnostics = { ...clean, failedRequests: [notFound] };
	assert.equal(assessRun("passed", passed, required, diagnostics), "failed");
	assert.equal(
		assessRun("passed", passed, required, withoutExpectedResponses(diagnostics, expected)),
		"passed",
	);
	const other = { ...clean, failedRequests: [notFound, elsewhere, { ...notFound, status: 500 }] };
	assert.equal(withoutExpectedResponses(other, expected).failedRequests.length, 2);
});

test("a journey without any required observations cannot pass", () => {
	assert.equal(assessRun("passed", [], [], clean), "blocked");
});

test("a later successful observation cannot erase an earlier failure", () => {
	assert.equal(
		assessRun("passed", [{ name: "submitted", passed: false }, ...passed], required, clean),
		"failed",
	);
});

test("missing diagnostics cannot silently pass", () => {
	assert.equal(assessRun("passed", passed, required, null), "blocked");
});

for (const category of ["errors", "consoleErrors", "failedRequests"]) {
	test(`${category} prevent a clean pass`, () => {
		assert.equal(
			assessRun("passed", passed, required, { ...clean, [category]: ["error"] }),
			"failed",
		);
	});
}

test("a blocked run remains blocked without fabricated success", () => {
	assert.equal(assessRun("blocked", [], required, null), "blocked");
});
