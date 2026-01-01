import { index, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const words = pgTable(
	"words",
	{
		id: serial("id").primaryKey(),
		word: text("word").notNull().unique(),
		phonemeKey: text("phoneme_key").notNull(),
		cmuVariants: text("cmu_variants").array().notNull(),
		syllableCount: integer("syllable_count").notNull(),
	},
	(table) => [
		index("words_word_idx").on(table.word),
		index("words_phoneme_key_idx").on(table.phonemeKey),
	],
);

export const dictionaryStats = pgTable(
	"dictionary_stats",
	{
		id: serial("id").primaryKey(),
		statType: text("stat_type").notNull(),
		statKey: text("stat_key").notNull(),
		data: jsonb("data").notNull(),
		computedAt: timestamp("computed_at").notNull().defaultNow(),
	},
	(table) => [
		index("dictionary_stats_stat_type_idx").on(table.statType),
		index("dictionary_stats_stat_key_idx").on(table.statKey),
	],
);
