import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { EmptyState } from '@/components/admin/EmptyState';
import { ButtonLink } from '@/components/admin/Button';
import { CalendarGridIcon, KeyIcon, UsersIcon } from '@/components/admin/adminIcons';
import { ProgressRing } from '@/components/admin/charts';
import { StatusPill } from '@/components/StatusPill';
import { DateBlock } from '@/components/DateBlock';
import { MailIcon, PinIcon } from '@/components/icons';
import { formatLongDate } from '@/lib/format';
import { getAdminTrainings } from '@/services/admin/trainings';
import { getAdminSessions, getUpcomingSessions } from '@/services/admin/sessions';
import { getAdminUser, getAdminUsers } from '@/services/admin/users';
import { Avatar, FieldBlock, InactiveBadge, Tag, VipBadge } from '../UserBits';
import { initialsOf, todayIso, validityOf } from '../userDisplay';
import { UserProfile, type RequeueSession, type UserTrainingRow } from './UserProfile';

export async function generateStaticParams() {
  const users = await getAdminUsers();
  return users.map((user) => ({ id: user.id }));
}

interface UserPageProps {
  params: Promise<{ id: string }>;
}

/** Profile of one user: identity, obligations, rights perimeter. */
export default async function AdminUserPage({ params }: UserPageProps) {
  const { id } = await params;
  const [t, tCommon, user, trainings] = await Promise.all([
    getTranslations('adminUsers'),
    getTranslations('adminCommon'),
    getAdminUser(id),
    getAdminTrainings(),
  ]);

  const crumbs = (
    <Breadcrumb
      ariaLabel={tCommon('breadcrumb.ariaLabel')}
      items={[
        { label: tCommon('breadcrumb.root'), href: '/admin' },
        { label: t('detail.backToList'), href: '/admin/users' },
        { label: user?.name ?? t('detail.notFound') },
      ]}
    />
  );

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        {crumbs}
        <EmptyState
          title={t('detail.notFound')}
          description={t('detail.notFoundHint')}
          icon={<UsersIcon size={26} />}
          action={
            <ButtonLink href="/admin/users" variant="outline" size="sm">
              {t('detail.backToList')}
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const today = todayIso();
  const trainingById = new Map(trainings.map((training) => [training.id, training]));

  const rows: UserTrainingRow[] = user.trainings.map((entry) => {
    const referential = trainingById.get(entry.trainingId);
    const validity = validityOf(entry, referential?.validityMonths ?? 24, today);
    return {
      trainingId: entry.trainingId,
      trainingName: entry.trainingName,
      category: referential?.category ?? '',
      state: entry.state,
      validatedBy: entry.validatedBy,
      percent: validity.percent,
      tone: validity.tone,
      labelKey: validity.label.key,
      labelCount: validity.label.count,
      expiresLabel: validity.expiresAt ? formatLongDate(validity.expiresAt) : undefined,
      lastValidatedLabel: validity.lastValidatedAt
        ? formatLongDate(validity.lastValidatedAt)
        : undefined,
    };
  });

  const upcoming = await getUpcomingSessions();
  const requeueSessions: RequeueSession[] = upcoming
    .filter((session) => session.registered < session.capacity)
    .map((session) => ({
      id: session.id,
      trainingIds: session.trainingIds,
      dateLabel: formatLongDate(session.date),
      site: session.site,
      time: session.startTime,
    }));

  const allSessions = await getAdminSessions();
  const myUpcoming = allSessions.filter(
    (session) =>
      session.status === 'planned' &&
      session.participants.some((participant) => participant.userId === user.id),
  );
  const myPast = allSessions
    .filter(
      (session) =>
        session.status !== 'planned' &&
        session.participants.some((participant) => participant.userId === user.id),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  // Validations that no session fixture covers (older sessions, e-learning):
  // shown in the history too, so "validated" and "participated" always agree.
  const coveredTrainingIds = new Set(myPast.flatMap((session) => session.trainingIds));
  const extraValidations = user.trainings
    .filter((entry) => entry.lastValidatedAt && !coveredTrainingIds.has(entry.trainingId))
    .map((entry) => ({
      id: `v-${entry.trainingId}`,
      date: entry.lastValidatedAt as string,
      trainingId: entry.trainingId,
      trainingName: entry.trainingName,
      kind: entry.validatedBy ?? 'session',
    }));

  const historyEntries = [
    ...myPast.map((session) => ({
      id: session.id,
      date: session.date,
      href: `/admin/sessions/${session.id}`,
      title: session.trainingNames.join(', '),
      subtitle: `${formatLongDate(session.date)} · ${session.site}`,
      attendance:
        session.participants.find((participant) => participant.userId === user.id)?.attendance ??
        ('registered' as const),
    })),
    ...extraValidations.map((entry) => ({
      id: entry.id,
      date: entry.date,
      href: `/admin/trainings/${entry.trainingId}`,
      title: entry.trainingName,
      subtitle: formatLongDate(entry.date),
      attendance: (entry.kind === 'certificate' ? 'certificate' : 'attended') as
        | 'certificate'
        | 'attended',
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const attendedCount = myPast.filter(
    (session) => session.participants.find((p) => p.userId === user.id)?.attendance === 'attended',
  ).length;
  const absentCount = myPast.filter(
    (session) => session.participants.find((p) => p.userId === user.id)?.attendance === 'absent',
  ).length;
  const assiduityPercent =
    attendedCount + absentCount > 0
      ? Math.round((attendedCount / (attendedCount + absentCount)) * 100)
      : 100;

  const isManager = user.role !== 'user';
  const managedTrainingNames = (user.managedTrainingIds ?? []).map(
    (trainingId) => trainingById.get(trainingId)?.name ?? trainingId,
  );

  return (
    <div className="flex flex-col gap-6">
      {crumbs}

      <UserProfile
        userName={user.name}
        rows={rows}
        sessions={requeueSessions}
        obligationsTitle={t('sections.obligations')}
        asideCards={
          <>
        <div className="ui-card flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-ink">{t('sections.assiduity')}</h2>
          <div className="flex grow items-center justify-center">
            <ProgressRing
              percent={assiduityPercent}
              label={t('sections.assiduity')}
              color={assiduityPercent >= 80 ? 'var(--color-success)' : 'var(--color-warning)'}
              size={100}
            />
          </div>
        </div>

        <div className="ui-card flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <CalendarGridIcon size={15} />
            {t('sections.upcoming')}
          </h2>
          {myUpcoming.length === 0 ? (
            <p className="text-[12.5px] text-ink-tertiary">{t('sections.noUpcoming')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {myUpcoming.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/admin/sessions/${session.id}`}
                    className="ui-row flex items-center gap-3 rounded-lg border border-card-border px-3 py-2 text-ink! hover:bg-card-muted"
                  >
                    <DateBlock date={session.date} width={38} daySize={16} tone="accent" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[13px] font-medium">
                        {session.trainingNames.join(', ')}
                      </span>
                      <span className="text-[11.5px] text-ink-tertiary">
                        {session.startTime} · {session.site}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
          </>
        }
        identity={
          <div className="flex items-center gap-4">
            <Avatar
              initials={initialsOf(user)}
              size="lg"
              tone={user.isVip ? 'accent' : 'neutral'}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[24px] leading-none font-semibold">{user.name}</h1>
                <span className="rounded-md border border-card-border bg-card-muted px-2 py-0.5 text-[12px] font-medium text-ink-secondary">
                  {tCommon(`roles.${user.role}`)}
                </span>
                {user.isVip ? (
                  <VipBadge label={tCommon('labels.vip')} title={t('list.vipTitle')} />
                ) : null}
                {!user.isActive ? (
                  <InactiveBadge
                    label={tCommon('status.inactive')}
                    title={t('list.inactiveTitle')}
                  />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <PinIcon size={13} />
                  {user.site}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MailIcon size={13} />
                  {user.email || t('detail.noEmail')}
                </span>
                <span className="text-ink-tertiary">
                  {t('detail.lastActivity', { date: formatLongDate(user.lastActivity) })}
                </span>
              </div>
            </div>
          </div>
        }
        notes={
          user.isVip || !user.isActive || !user.email ? (
            <ul className="flex flex-col gap-1.5 border-t border-divider pt-4 text-[12.5px] text-ink-secondary">
              {user.isVip ? <NoteRow>{t('detail.vipNote')}</NoteRow> : null}
              {!user.isActive ? <NoteRow>{t('detail.inactiveNote')}</NoteRow> : null}
              {!user.email ? <NoteRow>{t('detail.noEmailNote')}</NoteRow> : null}
            </ul>
          ) : null
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[16px] font-semibold">{t('sections.history')}</h2>
        {historyEntries.length === 0 ? (
          <p className="rounded-xl border border-card-border bg-card-muted px-4 py-3.5 text-[12.5px] text-ink-tertiary">
            {t('sections.noHistory')}
          </p>
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
            {historyEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-4 border-b border-divider px-5 py-3.5 last:border-b-0"
              >
                <DateBlock date={entry.date} width={44} daySize={17} />
                <span className="flex min-w-0 grow flex-col gap-0.5">
                  <Link
                    href={entry.href}
                    className="truncate text-[13.5px] font-medium text-ink! hover:text-accent!"
                  >
                    {entry.title}
                  </Link>
                  <span className="text-[11.5px] text-ink-tertiary">{entry.subtitle}</span>
                </span>
                {entry.attendance === 'attended' || entry.attendance === 'certificate' ? (
                  <StatusPill tone="success" icon="check">
                    {t(`attendance.${entry.attendance}`)}
                  </StatusPill>
                ) : entry.attendance === 'absent' ? (
                  <StatusPill tone="danger" icon="cross">
                    {t('attendance.absent')}
                  </StatusPill>
                ) : (
                  <StatusPill tone="warning" icon="clock">
                    {t(`attendance.${entry.attendance}`)}
                  </StatusPill>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isManager ? (
        <section className="ui-stagger [--ui-index:2] flex flex-col gap-4 rounded-xl border border-card-border bg-card-muted p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent">
              <KeyIcon size={16} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[16px] font-semibold">
                {t('detail.perimeterTitle')}
              </h2>
              <p className="max-w-[640px] text-[13px] text-ink-secondary">
                {t('detail.perimeterSubtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-divider pt-4 sm:grid-cols-2">
            <FieldBlock label={t('detail.managedSites')}>
              {user.role === 'admin' ? (
                <Tag tone="accent">{t('detail.allSites')}</Tag>
              ) : user.managedSites && user.managedSites.length > 0 ? (
                user.managedSites.map((site) => <Tag key={site}>{site}</Tag>)
              ) : (
                <span className="text-ink-tertiary">{t('detail.none')}</span>
              )}
            </FieldBlock>

            <FieldBlock label={t('detail.managedTrainings')}>
              {user.role === 'admin' ? (
                <Tag tone="accent">{t('detail.allTrainings')}</Tag>
              ) : managedTrainingNames.length > 0 ? (
                managedTrainingNames.map((name) => <Tag key={name}>{name}</Tag>)
              ) : (
                <span className="text-ink-tertiary">{t('detail.none')}</span>
              )}
            </FieldBlock>
          </div>

          <Link
            href="/admin/users/privileged"
            className="text-[12.5px] font-medium text-accent hover:text-accent-hover"
          >
            {t('privileged.title')}
          </Link>
        </section>
      ) : null}
    </div>
  );
}

function NoteRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-disabled" />
      {children}
    </li>
  );
}
