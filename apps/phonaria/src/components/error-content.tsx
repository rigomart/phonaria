import { Button } from "@phonaria/ui/components/button";
import { RotateCw } from "lucide-react";
import { BackHomeLink, StatusPage } from "./not-found-content";

/**
 * Shown when a page fails to render or its code fails to load. A route chunk
 * lost to a newer deploy has already had TanStack Router's one reload by the
 * time it lands here, so this page doesn't reload by itself.
 */
export function ErrorContent() {
	return (
		<StatusPage
			label="Error"
			title="This page didn't load"
			description="Something on it stopped working. Reloading usually fixes it."
		>
			<Button size="lg" onClick={() => window.location.reload()}>
				<RotateCw />
				Reload
			</Button>
			<BackHomeLink />
		</StatusPage>
	);
}
