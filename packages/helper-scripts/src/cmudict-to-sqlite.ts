/// <reference types="bun" />
/**
 * Converts cmudict.json into a SQLite .db file for Turso import.
 *
 * Usage:
 *   bun --cwd packages/helper-scripts cmudict-to-sqlite          # all words
 *   bun --cwd packages/helper-scripts cmudict-to-sqlite -- --max 10
 */
import { Database } from "bun:sqlite";
import { resolve } from "node:path";

const CMUDICT_PATH = resolve(import.meta.dirname, "../../phonetics-data/data/en/dict/cmudict.json");

const maxIdx = process.argv.indexOf("--max");
const maxWords = maxIdx !== -1 ? Number.parseInt(process.argv[maxIdx + 1], 10) : undefined;

if (maxWords !== undefined && (Number.isNaN(maxWords) || maxWords < 1)) {
	console.error("--max must be a positive integer");
	process.exit(1);
}

interface CmudictJson {
	meta: Record<string, unknown>;
	data: Record<string, string[]>;
}

const cmudict: CmudictJson = await Bun.file(CMUDICT_PATH).json();
const entries = Object.entries(cmudict.data);
const selected = maxWords ? entries.slice(0, maxWords) : entries;

const suffix = maxWords ? `-${maxWords}` : "";
const outPath = resolve(
	import.meta.dirname,
	`../../phonetics-data/data/en/dict/cmudict${suffix}.db`,
);

const db = new Database(outPath, { create: true });

db.run("PRAGMA journal_mode=WAL");

db.run("DROP TABLE IF EXISTS words");
db.run(`
  CREATE TABLE words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    pronunciations TEXT NOT NULL
  )
`);

const insert = db.prepare("INSERT INTO words (word, pronunciations) VALUES (?, ?)");

const batchInsert = db.transaction((rows: [string, string][]) => {
	for (const [word, pronunciations] of rows) {
		insert.run(word, pronunciations);
	}
});

const BATCH_SIZE = 1000;
let batch: [string, string][] = [];

for (const [word, variants] of selected) {
	batch.push([word, JSON.stringify(variants)]);
	if (batch.length >= BATCH_SIZE) {
		batchInsert(batch);
		batch = [];
	}
}
if (batch.length > 0) {
	batchInsert(batch);
}

const count = db.query("SELECT COUNT(*) as count FROM words").get() as {
	count: number;
};
db.close();

console.log(`Wrote ${count.count} words to ${outPath}`);
