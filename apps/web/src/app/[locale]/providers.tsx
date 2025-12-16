"use client";

import { AnchoredToastProvider, ToastProvider } from "@phonaria/ui/components/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";
import { getQueryClient } from "./_hooks/get-query-client";

export default function Providers({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				<ToastProvider position="top-center">
					<AnchoredToastProvider>
						<AudioManagerProvider>
							{children}
							<ReactQueryDevtools initialIsOpen={false} />
						</AudioManagerProvider>
					</AnchoredToastProvider>
				</ToastProvider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
