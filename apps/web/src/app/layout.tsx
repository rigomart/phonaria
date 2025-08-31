import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Phonix - English Phoneme Learning",
	description: "Interactive tool for learning English phonemes with IPA transcription",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/* Navigation */}
					<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<div className="container mx-auto px-4 py-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-6">
									<Link
										href="/"
										className="text-lg font-medium hover:text-primary transition-colors"
									>
										Phonix
									</Link>
									<nav className="hidden md:flex items-center gap-4">
										<Link href="/" className="text-sm hover:text-primary transition-colors">
											G2P Tool
										</Link>
										<Link
											href="/ipa-chart"
											className="text-sm hover:text-primary transition-colors"
										>
											IPA Chart
										</Link>
									</nav>
								</div>
								<ModeToggle />
							</div>
						</div>
					</header>

					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
