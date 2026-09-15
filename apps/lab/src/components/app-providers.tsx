"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import type { ReactNode } from "react";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

/**
 * Client providers shared by the TanStack Start route tree. Theme and Link
 * adapters wrap this at the route root.
 */
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ToastProvider position="top-center">
			<AnchoredToastProvider>
				<AudioManagerProvider>{children}</AudioManagerProvider>
			</AnchoredToastProvider>
		</ToastProvider>
	);
}
