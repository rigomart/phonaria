import { DM_Mono, IBM_Plex_Sans, Inter, Noto_Serif } from "next/font/google";
import { Header } from "@/components/header";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
	variable: "--font-ibm-plex-sans",
	subsets: ["latin"],
});

const notoSerif = Noto_Serif({
	variable: "--font-noto-serif",
	subsets: ["latin"],
});

const dmMono = DM_Mono({
	variable: "--font-dm-mono",
	subsets: ["latin"],
	weight: ["400"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${ibmPlexSans.variable} ${dmMono.variable} ${notoSerif.variable} antialiased`}
			>
				<Providers>
					<div className="h-screen flex flex-col">
						<Header />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
