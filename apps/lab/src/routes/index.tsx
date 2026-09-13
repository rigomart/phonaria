import { createFileRoute } from "@tanstack/react-router";
import { notFound } from "@/platform/tanstack";

/**
 * Transcription is still served by the public Next.js Lab. This Start slice
 * only ships Credits; the index returns a real 404 until that route migrates.
 */
export const Route = createFileRoute("/")({
	beforeLoad: () => {
		notFound();
	},
});
