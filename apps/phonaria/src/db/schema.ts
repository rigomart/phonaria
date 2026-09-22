import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const words = sqliteTable("words", {
	id: integer().primaryKey({ autoIncrement: true }),
	word: text().notNull().unique(),
	pronunciations: text().notNull(),
});
