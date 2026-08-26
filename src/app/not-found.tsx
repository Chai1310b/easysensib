import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/** Not-found page rendered for any unknown route (and for explicit notFound() calls). */
export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <div className="mx-auto flex w-full max-w-[980px] grow flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="font-display text-[56px] leading-none font-semibold text-ink-disabled">
        404
      </span>
      <h1 className="font-display text-[26px] font-semibold">{t('notFound.title')}</h1>
      <p className="max-w-[420px] text-sm text-ink-secondary">{t('notFound.description')}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        {t('actions.backToHome')}
      </Link>
    </div>
  );
}
