import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import Providers from "./providers";
import "@phonaria/ui/globals.css";

const notoSans = Noto_Sans({
	variable: "--font-noto-sans",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
	preload: true,
});

const notoSansMono = Noto_Sans_Mono({
	variable: "--font-noto-sans-mono",
	subsets: ["latin"],
	fallback: ["system-ui", "monospace"],
});

export const metadata: Metadata = {
	title: "Phonaria Lab",
	description: "Phonaria experimental workspace",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${notoSans.variable} ${notoSansMono.variable}`}
		>
			<body className="antialiased">
				<Providers>
					<div className="min-h-screen flex flex-col">
						<main className="flex-1 flex min-h-0 flex-col">{children}</main>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
}
