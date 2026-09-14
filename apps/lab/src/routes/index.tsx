import { createFileRoute } from "@tanstack/react-router";
import { notFound } from "@/platform/tanstack";

/**
 * Transcription is still served by the public Next.js Lab. This Start slice
 * ships Credits and flag-gated Practice; the index returns a real 404 until
 * transcription migrates.
 */
export const Route = createFileRoute("/")({
	beforeLoad: () => {
		notFound();
	},
});
