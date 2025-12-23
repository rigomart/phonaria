import { routing } from "@/i18n/routing";

export const SITE_NAME = "Phonaria";

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "localhost:3000";
const protocol = host === "localhost:3000" ? "http" : "https";

export const SITE_URL = `${protocol}://${host}`;

const normalizePath = (path?: string) => {
	if (!path || path === "/") {
		return "";
	}

	return path.startsWith("/") ? path : `/${path}`;
};

export const getLocalePath = (locale: string, path?: string) => {
	return `/${locale}${normalizePath(path)}`;
};

export const getLanguageAlternates = (path?: string) => {
	return routing.locales.reduce<Record<string, string>>((acc, locale) => {
		acc[locale] = getLocalePath(locale, path);
		return acc;
	}, {});
};
