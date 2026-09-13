export {
	createDbClient,
	createDbClientFromEnv,
	type DbClient,
	type DbConfig,
	getDefaultDbClient,
	resetDefaultDbClient,
} from "./client";
export { lookupWords, type WordLookupResult } from "./repository";
export { words } from "./schema";
