/**
 * Topic registry — the only wiring point for Practice topics. Adding a topic
 * means one folder exporting a TopicDefinition plus one entry here; the
 * engine, scoreboard, and review UI never change.
 */
import { SchwaTopic } from "./schwa";
import type { TopicDefinition } from "./types";

const topics: readonly TopicDefinition[] = [SchwaTopic];

export function getTopic(slug: string): TopicDefinition | undefined {
	return topics.find((topic) => topic.id === slug);
}

export function listTopics(): readonly TopicDefinition[] {
	return topics;
}
