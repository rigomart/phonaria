"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import type { ReactNode } from "react";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { ThemeProvider } from "@/platform/next/theme";

export default function Providers({ children }: { children: ReactNode }) {
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
