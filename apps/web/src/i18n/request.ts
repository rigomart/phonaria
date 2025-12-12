import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const locales = ["en", "es"] as const;

export const formats = {
	// Add any custom formats here if needed
};

export default getRequestConfig(async ({ requestLocale }) => {
	// This typically varies based on local storage, cookie, or headers
	let locale = await requestLocale;

	// Validate that the incoming `locale` parameter is valid
	if (!locale || !locales.includes(locale as any)) {
		locale = "en"; // Default fallback
	}

	return {
		locale: locale as "en" | "es",
		messages: (await import(`../../messages/${locale}.json`)).default,
		formats,
	};
});
