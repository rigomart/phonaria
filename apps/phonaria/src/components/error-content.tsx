import { Button } from "@phonaria/ui/components/button";
import { RotateCw } from "lucide-react";
import { BackHomeLink, StatusPage } from "./not-found-content";

/**
 * Shown when a page fails to render or its code fails to load. The error
 * itself stays out of the copy: it means nothing to a learner. A chunk lost
 * to a newer deploy has already had its one reload by the time it lands here
 * (see `src/lib/stale-deploy-reload.ts`), so this page doesn't reload again.
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
