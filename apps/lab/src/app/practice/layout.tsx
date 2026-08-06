import { notFound } from "next/navigation";
import { isFlagEnabled } from "@/lib/flags";

/** Gates every /practice route behind the flag, including future subroutes. */
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
	if (!isFlagEnabled("practice")) notFound();
	return children;
}
