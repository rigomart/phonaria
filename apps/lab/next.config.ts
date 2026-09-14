import type { NextConfig } from "next";
import { getContentSecurityPolicy } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
	// Articulation diagrams use the portable <Image> renderer. remotePatterns
	// stay so any remaining next/image usage can still load the asset bucket.
	images: {
		remotePatterns: [{ protocol: "https", hostname: "assets.rigos.dev" }],
	},
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [{ key: "Content-Security-Policy", value: getContentSecurityPolicy() }],
			},
		];
	},
	transpilePackages: ["@phonaria/ui", "@phonaria/phonetics-data", "@phonaria/flags"],
};

export default nextConfig;
