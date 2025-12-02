import * as fs from "node:fs";
import * as path from "node:path";

export function ensureDirectoryForFile(filePath: string): void {
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`Created output directory: ${dir}`);
	}
}

export function writeJsonFile(filePath: string, payload: unknown): number {
	const json = JSON.stringify(payload, null, 0);
	fs.writeFileSync(filePath, json, "utf-8");
	return fs.statSync(filePath).size;
}
