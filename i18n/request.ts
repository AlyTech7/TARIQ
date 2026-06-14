import { getRequestConfig } from "next-intl/server";

export const locales = ["ar", "es", "fr"] as const;
export const defaultLocale = "ar";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }

  const messages = (await import(`../public/locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
