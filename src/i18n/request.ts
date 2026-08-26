import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, namespaces } from './config';

/**
 * next-intl request configuration without locale routing.
 * The app is served in French by default; switching to 'en' only requires
 * changing the resolved locale here (the English message files are ready).
 */
export default getRequestConfig(async () => {
  const locale = defaultLocale;

  const loaded = await Promise.all(
    namespaces.map(async (ns) => {
      const mod = await import(`../../messages/${locale}/${ns}.json`);
      return [ns, mod.default] as const;
    }),
  );

  return {
    locale,
    messages: Object.fromEntries(loaded),
  };
});
