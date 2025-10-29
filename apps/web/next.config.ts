import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    media-src 'self' https://api.dictionaryapi.dev https://assets.rigos.dev;
`;

const nextConfig: NextConfig = {
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [{ key: "Content-Security-Policy", value: cspHeader.replace(/\n/g, "") }],
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
