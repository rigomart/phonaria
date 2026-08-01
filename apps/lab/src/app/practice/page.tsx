import { redirect } from "next/navigation";
import { listTopics } from "@/lib/practice/topics";

/**
 * Practice has one topic today, so /practice lands on the first registered
 * one. The slug comes from the registry, not a literal, so adding topic #2
 * needs no change here (#140).
 */
export default function PracticePage() {
	redirect(`/practice/${listTopics()[0].id}`);
}
