import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireFlag } from "@/lib/require-flag";

/**
 * Layout for every /practice route. The flag gate lives here so unknown
 * topic URLs 404 the same way as the index when Practice is disabled.
 */
export const Route = createFileRoute("/practice")({
	beforeLoad: () => {
		requireFlag("practice");
	},
	component: PracticeLayout,
});

function PracticeLayout() {
	return <Outlet />;
}
