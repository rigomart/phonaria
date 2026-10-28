import { Toaster } from "@phonaria/ui/components/sonner";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "@/components/theme";
import { AudioManagerProvider } from "@/hooks/use-audio-manager";

function ThemedToaster() {
	const { theme } = useTheme();
	return <Toaster theme={theme} position="top-center" />;
}

/** Client providers shared by the route tree. */
export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<AudioManagerProvider>{children}</AudioManagerProvider>
			<ThemedToaster />
		</ThemeProvider>
	);
}
