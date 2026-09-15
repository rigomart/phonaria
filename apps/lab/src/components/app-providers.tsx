"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

/** Client providers shared by the route tree. */
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<ToastProvider position="top-center">
				<AnchoredToastProvider>
					<AudioManagerProvider>{children}</AudioManagerProvider>
				</AnchoredToastProvider>
			</ToastProvider>
		</ThemeProvider>
	);
}
