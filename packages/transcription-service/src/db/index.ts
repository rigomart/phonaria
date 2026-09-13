export {
	createDbClient,
	createDbClientFromEnv,
	getDefaultDbClient,
	resetDefaultDbClient,
	type DbClient,
	type DbConfig,
} from "./client";
export { words } from "./schema";
export { lookupWords, type WordLookupResult } from "./repository";
