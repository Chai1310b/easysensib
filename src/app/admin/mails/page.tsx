/**
 * Mail relance console: aggregated stats over the recorded runs, the engine
 * principle reminder, and the interactive run table.
 */
import { getTranslations } from 'next-intl/server';
import { Breadcrumb, StatTile } from '@/components/admin';
import { InfoCircleIcon, MailStackIcon, UsersIcon } from '@/components/admin/adminIcons';
import { getRelanceExecutions, getRelanceSettings } from '@/services/admin/mails';
import { MailsConsole } from './MailsConsole';
import { ClockIcon, SeatsIcon } from './mailIcons';

export default async function AdminMailsPage() {
  const [t, tCommon, executions, settings] = await Promise.all([
    getTranslations('adminMails'),
    getTranslations('adminCommon'),
    getRelanceExecutions(),
    getRelanceSettings(),
  ]);

  const simulations = executions.filter((run) => run.type === 'simulation').length;
  const latest = executions[0];
  const averageDuration = executions.length
    ? Math.round(
        executions.reduce((total, run) => total + run.durationSeconds, 0) / executions.length,
      )
    : 0;
  const marginPercent = Math.round(settings.seatMargin * 100);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <Breadcrumb
          items={[{ label: tCommon('breadcrumb.root'), href: '/admin' }, { label: t('title') }]}
          ariaLabel={tCommon('breadcrumb.ariaLabel')}
        />
        <h1 className="font-display text-[26px] font-semibold">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={executions.length}
          label={t('stats.executions')}
          hint={t('stats.executionsHint', { count: simulations })}
          tone="neutral"
          icon={<MailStackIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={latest ? latest.mailsToSend : 0}
          label={t('stats.mails')}
          hint={latest ? t('stats.mailsHint', { number: latest.number }) : t('empty.noRun')}
          tone="accent"
          icon={<UsersIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={`${latest ? latest.fillRatePercent : 0} %`}
          label={t('stats.fillRate')}
          hint={t('stats.fillRateHint')}
          tone="success"
          icon={<SeatsIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={t('metrics.seconds', { seconds: averageDuration })}
          label={t('stats.duration')}
          hint={t('stats.durationHint')}
          tone="warning"
          icon={<ClockIcon size={16} />}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-card-border bg-card-muted px-4 py-3.5">
        <span className="mt-px shrink-0 text-accent">
          <InfoCircleIcon size={16} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-semibold text-ink">{t('principle.title')}</p>
          <p className="text-[12.5px] leading-relaxed text-ink-secondary">
            {t('principle.body', { margin: marginPercent, days: settings.daysBetweenMails })}
          </p>
        </div>
      </section>

      <MailsConsole executions={executions} settings={settings} />
    </div>
  );
}
