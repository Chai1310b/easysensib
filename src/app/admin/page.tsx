import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties, ReactNode } from 'react';
import { StatTile } from '@/components/admin/StatTile';
import {
  BadgeCheckIcon,
  CalendarGridIcon,
  ChevronRightIcon,
  KeyIcon,
  ListIcon,
  MailStackIcon,
  SlidersIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { EmptyState } from '@/components/admin/EmptyState';
import { formatDayNumber, formatLongDate, formatMonthAbbr } from '@/lib/format';
import type { AdminSession, RelanceExecution } from '@/lib/admin-types';
import { getAdminDashboardStats } from '@/services/admin/dashboard';
import { getRecentRelanceExecutions } from '@/services/admin/mails';
import { getUpcomingSessions } from '@/services/admin/sessions';
import { AttentionPanel } from './AttentionPanel';

/**
 * Landing page of the manager space: four KPIs, the attention points, two
 * short lists and a quick-link strip covering every section of the space.
 */
export default async function AdminDashboardPage() {
  const [t, tCommon, stats, upcoming, executions] = await Promise.all([
    getTranslations('adminDashboard'),
    getTranslations('adminCommon'),
    getAdminDashboardStats(),
    getUpcomingSessions(4),
    getRecentRelanceExecutions(4),
  ]);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={stats.usersLate}
          label={t('stats.usersLate')}
          hint={t('stats.usersLateHint')}
          tone="danger"
          icon={<UsersIcon size={16} />}
          href="/admin/users"
          className="ui-stagger"
        />
        <StatTile
          value={stats.upcomingSessions}
          label={t('stats.upcomingSessions')}
          hint={t('stats.upcomingSessionsHint')}
          tone="accent"
          icon={<CalendarGridIcon size={16} />}
          href="/admin/sessions"
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={`${stats.fillRatePercent} %`}
          label={t('stats.fillRate')}
          hint={t('stats.fillRateHint')}
          tone="success"
          icon={<CalendarGridIcon size={16} />}
          href="/admin/sessions"
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={stats.certificatesToReview}
          label={t('stats.certificates')}
          hint={t('stats.certificatesHint')}
          tone="warning"
          icon={<BadgeCheckIcon size={16} />}
          href="/admin/certificates"
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <AttentionPanel />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PanelCard
          title={t('upcoming.title')}
          href="/admin/sessions"
          seeAllLabel={tCommon('actions.seeAll')}
        >
          {upcoming.length === 0 ? (
            <EmptyState title={t('upcoming.empty')} description={t('upcoming.emptyHint')} />
          ) : (
            <ul className="flex flex-col">
              {upcoming.map((session, index) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  index={index}
                  seatsLabel={t('upcoming.seats', {
                    registered: session.registered,
                    capacity: session.capacity,
                  })}
                  formatLabel={tCommon(`format.${session.format}`)}
                />
              ))}
            </ul>
          )}
        </PanelCard>

        <PanelCard
          title={t('relances.title')}
          href="/admin/mails"
          seeAllLabel={tCommon('actions.seeAll')}
        >
          {executions.length === 0 ? (
            <EmptyState title={t('relances.empty')} description={t('relances.emptyHint')} />
          ) : (
            <ul className="flex flex-col">
              {executions.map((execution, index) => (
                <ExecutionRow
                  key={execution.id}
                  execution={execution}
                  index={index}
                  typeLabel={t(`types.${execution.type}`)}
                  statusLabel={tCommon(`status.${execution.status}`)}
                  metricsLabel={t('relances.metrics', {
                    eligible: execution.eligible,
                    mails: execution.mailsToSend,
                  })}
                />
              ))}
            </ul>
          )}
        </PanelCard>
      </div>

      <QuickLinks title={t('quickLinks.title')} labels={t.raw('quickLinks') as QuickLinkLabels} />
    </div>
  );
}

interface QuickLinkLabels {
  trainings: string;
  sessions: string;
  certificates: string;
  users: string;
  privileged: string;
  mails: string;
  settings: string;
}

/** Flat strip covering every section of the manager space. */
function QuickLinks({ title, labels }: { title: string; labels: QuickLinkLabels }) {
  const links: { href: string; label: string; icon: ReactNode }[] = [
    { href: '/admin/trainings', label: labels.trainings, icon: <ListIcon size={14} /> },
    { href: '/admin/sessions', label: labels.sessions, icon: <CalendarGridIcon size={14} /> },
    { href: '/admin/certificates', label: labels.certificates, icon: <BadgeCheckIcon size={14} /> },
    { href: '/admin/users', label: labels.users, icon: <UsersIcon size={14} /> },
    { href: '/admin/users/privileged', label: labels.privileged, icon: <KeyIcon size={14} /> },
    { href: '/admin/mails', label: labels.mails, icon: <MailStackIcon size={14} /> },
    { href: '/admin/settings', label: labels.settings, icon: <SlidersIcon size={14} /> },
  ];

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-xl border border-card-border bg-card-muted px-4 py-3.5">
      <span className="mr-1 text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
        {title}
      </span>
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          style={{ '--ui-index': index } as CSSProperties}
          className="ui-stagger ui-pressable flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-[12.5px] font-medium text-ink-secondary! transition-colors duration-200 hover:border-accent-border hover:bg-accent-tint hover:text-accent!"
        >
          <span className="text-ink-tertiary">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </section>
  );
}

function PanelCard({
  title,
  href,
  seeAllLabel,
  children,
}: {
  title: string;
  href: string;
  seeAllLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-card-border bg-card">
      <header className="flex items-center justify-between border-b border-divider px-5 py-3.5">
        <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-[12.5px] font-medium text-accent! hover:text-accent-hover!"
        >
          {seeAllLabel}
          <ChevronRightIcon size={12} />
        </Link>
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function SessionRow({
  session,
  index,
  seatsLabel,
  formatLabel,
}: {
  session: AdminSession;
  index: number;
  seatsLabel: string;
  formatLabel: string;
}) {
  return (
    <li className="ui-stagger" style={{ '--ui-index': index } as CSSProperties}>
      <Link
        href="/admin/sessions"
        className="ui-row flex items-center gap-3.5 rounded-lg px-2 py-2.5 text-ink! hover:bg-card-muted hover:text-ink!"
      >
        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-tint">
          <span className="font-display text-[15px] leading-none font-semibold text-accent">
            {formatDayNumber(session.date)}
          </span>
          <span className="mt-0.5 text-[9px] font-semibold tracking-[0.06em] text-accent">
            {formatMonthAbbr(session.date)}
          </span>
        </span>

        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="truncate text-[13.5px] font-medium">
            {session.trainingNames.join(' · ')}
          </span>
          <span className="truncate text-xs text-ink-tertiary">
            {session.startTime} · {session.site} · {formatLabel}
          </span>
        </span>

        <span className="shrink-0 font-display text-[12.5px] font-medium tabular-nums text-ink-secondary">
          {seatsLabel}
        </span>
      </Link>
    </li>
  );
}

const TYPE_TONE: Record<RelanceExecution['type'], string> = {
  auto: 'bg-success-tint text-success',
  simulation: 'bg-accent-tint text-accent',
  manual: 'bg-warning-tint text-warning-text',
};

function ExecutionRow({
  execution,
  index,
  typeLabel,
  statusLabel,
  metricsLabel,
}: {
  execution: RelanceExecution;
  index: number;
  typeLabel: string;
  statusLabel: string;
  metricsLabel: string;
}) {
  return (
    <li className="ui-stagger" style={{ '--ui-index': index } as CSSProperties}>
      <Link
        href="/admin/mails"
        className="ui-row flex items-center gap-3.5 rounded-lg px-2 py-2.5 text-ink! hover:bg-card-muted hover:text-ink!"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card-muted text-ink-tertiary">
          <MailStackIcon size={17} />
        </span>

        <span className="flex min-w-0 grow flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="font-display text-[13.5px] font-medium">#{execution.number}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TYPE_TONE[execution.type]}`}
            >
              {typeLabel}
            </span>
          </span>
          <span className="truncate text-xs text-ink-tertiary">
            {formatLongDate(execution.date.slice(0, 10))} · {execution.launchedBy} · {statusLabel}
          </span>
        </span>

        <span className="shrink-0 font-display text-[12.5px] font-medium tabular-nums text-ink-secondary">
          {metricsLabel}
        </span>
      </Link>
    </li>
  );
}
