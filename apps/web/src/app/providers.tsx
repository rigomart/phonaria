"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { getQueryClient } from "./_hooks/get-query-client";

export default function Providers({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				{children}
				<Toaster richColors position="top-center" />
				<ReactQueryDevtools initialIsOpen={false} />
			</ThemeProvider>
		</QueryClientProvider>
	);
}
