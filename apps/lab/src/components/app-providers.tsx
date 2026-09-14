"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import type { ReactNode } from "react";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

/**
 * Framework-neutral client providers. Theme and Link adapters wrap this at
 * each route root so Next.js and TanStack Start can inject their own.
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
