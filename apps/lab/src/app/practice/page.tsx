import { redirect } from "next/navigation";
import { listTopics } from "@/lib/practice/topics";

/** Slug comes from the registry, so adding topic #2 needs no change here. */
export default function PracticePage() {
	redirect(`/practice/${listTopics()[0].id}`);
}
