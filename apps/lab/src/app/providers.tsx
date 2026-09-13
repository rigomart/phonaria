"use client";

import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import { NextPlatformProvider } from "@/platform/next";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<NextPlatformProvider>
			<AppProviders>{children}</AppProviders>
		</NextPlatformProvider>
	);
}
