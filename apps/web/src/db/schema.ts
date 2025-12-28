import { index, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const words = pgTable(
	"words",
	{
		id: serial().primaryKey(),
		word: text().notNull().unique(),
		phonemeKey: text().notNull(),
		cmuVariants: text().array().notNull(),
		syllableCount: serial().notNull(),
	},
	(table) => [
		index("words_word_idx").on(table.word),
		index("words_phoneme_key_idx").on(table.phonemeKey),
	],
);

export const dictionaryStats = pgTable(
	"dictionary_stats",
	{
		id: serial().primaryKey(),
		statType: text().notNull(),
		statKey: text().notNull(),
		data: jsonb().notNull(),
		computedAt: timestamp().notNull().defaultNow(),
	},
	(table) => [
		index("dictionary_stats_stat_type_idx").on(table.statType),
		index("dictionary_stats_stat_key_idx").on(table.statKey),
	],
);
