import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties, ReactNode } from 'react';
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  CalendarGridIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { formatLongDate } from '@/lib/format';
import { ATTENTION_THRESHOLDS, getAttentionPoints } from '@/services/admin/attention';

type Tone = 'danger' | 'warning';

const COUNT_TONE: Record<Tone, string> = {
  danger: 'bg-danger-tint text-danger-text',
  warning: 'bg-warning-tint text-warning-text',
};

const PILL_TONE: Record<Tone, string> = {
  danger: 'bg-danger-tint text-danger-text',
  warning: 'bg-warning-tint text-warning-text',
};

/**
 * Three short lists a manager should clear first: certificates waiting too
 * long, imminent sessions still almost empty, users overdue for months.
 * Every row is a deep link into the matching section.
 */
export async function AttentionPanel() {
  const [t, tCommon, points] = await Promise.all([
    getTranslations('adminDashboard'),
    getTranslations('adminCommon'),
    getAttentionPoints(),
  ]);

  const seeAll = tCommon('actions.seeAll');

  return (
    <section className="flex flex-col rounded-xl border border-card-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-divider px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-warning-tint text-warning-text">
            <AlertCircleIcon size={14} />
          </span>
          <h2 className="font-display text-[15px] font-semibold text-ink">
            {t('attention.title')}
          </h2>
        </div>
        <p className="text-xs text-ink-tertiary">{t('attention.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 divide-y divide-divider lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AttentionGroup
          tone="warning"
          icon={<BadgeCheckIcon size={15} />}
          label={t('attention.certificates.label', {
            days: ATTENTION_THRESHOLDS.certificateWaitingDays,
          })}
          count={points.certificates.total}
          href="/admin/certificates"
          seeAll={seeAll}
          empty={t('attention.certificates.empty')}
          index={0}
        >
          {points.certificates.items.map((row, index) => (
            <AttentionRow
              key={row.id}
              href="/admin/certificates"
              title={row.userName}
              subtitle={row.trainingName}
              pill={t('attention.certificates.pill', { days: row.waitingDays })}
              tone="warning"
              index={index}
            />
          ))}
        </AttentionGroup>

        <AttentionGroup
          tone="danger"
          icon={<CalendarGridIcon size={15} />}
          label={t('attention.sessions.label', {
            days: ATTENTION_THRESHOLDS.sessionHorizonDays,
            fill: ATTENTION_THRESHOLDS.sessionFillPercent,
          })}
          count={points.sessions.total}
          href="/admin/sessions"
          seeAll={seeAll}
          empty={t('attention.sessions.empty')}
          index={1}
        >
          {points.sessions.items.map((row, index) => (
            <AttentionRow
              key={row.id}
              href={`/admin/sessions/${row.id}`}
              title={row.trainingNames.join(' · ')}
              subtitle={`${formatLongDate(row.date)} · ${row.site} · ${t(
                'attention.sessions.seats',
                {
                  registered: row.registered,
                  capacity: row.capacity,
                },
              )}`}
              pill={t('attention.sessions.pill', { percent: row.fillPercent })}
              tone="danger"
              index={index}
            />
          ))}
        </AttentionGroup>

        <AttentionGroup
          tone="danger"
          icon={<UsersIcon size={15} />}
          label={t('attention.users.label', { days: ATTENTION_THRESHOLDS.userOverdueDays })}
          count={points.users.total}
          href="/admin/users"
          seeAll={seeAll}
          empty={t('attention.users.empty')}
          index={2}
        >
          {points.users.items.map((row, index) => (
            <AttentionRow
              key={row.id}
              href={`/admin/users/${row.id}`}
              title={row.name}
              subtitle={`${row.trainingName} · ${row.site}`}
              pill={t('attention.users.pill', { days: row.overdueDays })}
              tone="danger"
              index={index}
            />
          ))}
        </AttentionGroup>
      </div>
    </section>
  );
}

function AttentionGroup({
  tone,
  icon,
  label,
  count,
  href,
  seeAll,
  empty,
  index,
  children,
}: {
  tone: Tone;
  icon: ReactNode;
  label: string;
  count: number;
  href: string;
  seeAll: string;
  empty: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <div
      className="ui-stagger flex flex-col gap-2.5 p-4"
      style={{ '--ui-index': index } as CSSProperties}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            count === 0 ? 'bg-card-muted text-ink-tertiary' : COUNT_TONE[tone]
          }`}
        >
          {icon}
        </span>
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="flex items-baseline gap-1.5">
            <span
              className={`font-display text-[19px] leading-none font-semibold ${
                count === 0
                  ? 'text-ink-tertiary'
                  : tone === 'danger'
                    ? 'text-danger-text'
                    : 'text-warning-text'
              }`}
            >
              {count}
            </span>
          </span>
          <span className="text-[12.5px] leading-snug text-ink-secondary">{label}</span>
        </span>
      </div>

      {count === 0 ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-success-tint px-2.5 py-2 text-xs text-success">
          <CheckCircleIcon size={13} />
          {empty}
        </p>
      ) : (
        <ul className="flex flex-col">{children}</ul>
      )}

      <Link
        href={href}
        className="mt-auto flex items-center gap-1 self-start pt-0.5 pl-2 text-[12.5px] font-medium text-accent! hover:text-accent-hover!"
      >
        {seeAll}
        <ChevronRightIcon size={12} />
      </Link>
    </div>
  );
}

function AttentionRow({
  href,
  title,
  subtitle,
  pill,
  tone,
  index,
}: {
  href: string;
  title: string;
  subtitle: string;
  pill: string;
  tone: Tone;
  index: number;
}) {
  return (
    <li className="ui-stagger" style={{ '--ui-index': index } as CSSProperties}>
      <Link
        href={href}
        className="ui-row flex items-center gap-2.5 rounded-lg px-2 py-2 text-ink! hover:bg-card-muted hover:text-ink!"
      >
        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="truncate text-[13px] font-medium">{title}</span>
          <span className="truncate text-[11.5px] text-ink-tertiary">{subtitle}</span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-display text-[11px] font-semibold tabular-nums ${PILL_TONE[tone]}`}
        >
          {pill}
        </span>
      </Link>
    </li>
  );
}
