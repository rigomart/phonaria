import { DM_Mono, Inter, Noto_Serif } from "next/font/google";
import { Header } from "@/components/header";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	fallback: ["system-ui", "sans-serif"],
});

const notoSerif = Noto_Serif({
	variable: "--font-noto-serif",
	subsets: ["latin"],
	fallback: ["system-ui", "serif"],
});

const dmMono = DM_Mono({
	variable: "--font-dm-mono",
	subsets: ["latin"],
	weight: ["400"],
	fallback: ["system-ui", "monospace"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${dmMono.variable} ${notoSerif.variable}`}
		>
			<body className={`antialiased`}>
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
