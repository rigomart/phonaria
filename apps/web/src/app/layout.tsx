import { Archivo, Geist, Geist_Mono, Inter, Noto_Sans, Rubik } from "next/font/google";
import { Header } from "@/components/header";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const archivo = Archivo({
	variable: "--font-archivo",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const rubik = Rubik({
	variable: "--font-rubik",
	subsets: ["latin"],
});

const notoSans = Noto_Sans({
	variable: "--font-noto-sans",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${inter.variable} ${rubik.variable} ${notoSans.variable} antialiased`}
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
