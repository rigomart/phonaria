import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Words table schema for CMUdict pronunciations.
 */
export const words = sqliteTable("words", {
	id: integer().primaryKey({ autoIncrement: true }),
	word: text().notNull().unique(),
	pronunciations: text().notNull(),
});
