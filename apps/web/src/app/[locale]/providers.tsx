"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/query-provider";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryProvider>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				<ToastProvider position="top-center">
					<AnchoredToastProvider>
						<AudioManagerProvider>{children}</AudioManagerProvider>
					</AnchoredToastProvider>
				</ToastProvider>
			</ThemeProvider>
		</QueryProvider>
	);
}
