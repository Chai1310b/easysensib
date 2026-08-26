/**
 * One room of the referential: identity, occupancy indicators and every
 * session booked in it.
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb, EmptyState, StatTile } from '@/components/admin';
import { ProgressRing } from '@/components/admin/charts';
import { CalendarGridIcon } from '@/components/admin/adminIcons';
import { DateBlock } from '@/components/DateBlock';
import { BuildingIcon, PeopleIcon, PinIcon } from '@/components/icons';
import { formatLongDate } from '@/lib/format';
import { getRoom, getRoomSessions, getRooms } from '@/services/admin/settings';

export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room) => ({ id: room.id }));
}

const TODAY = '2026-08-26';

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params;
  const [t, tCommon, tSessions, room, sessions] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getTranslations('adminSessions'),
    getRoom(id),
    getRoomSessions(id),
  ]);

  const crumbs = (
    <Breadcrumb
      ariaLabel={tCommon('breadcrumb.ariaLabel')}
      items={[
        { label: tCommon('breadcrumb.root'), href: '/admin' },
        { label: tCommon('nav.settingsMenu.title'), href: '/admin/settings' },
        { label: t('roomPage.backToRooms'), href: '/admin/settings/rooms' },
        { label: room ? room.room : t('roomPage.notFound') },
      ]}
    />
  );

  if (!room) {
    return (
      <div className="flex flex-col gap-6">
        {crumbs}
        <EmptyState title={t('roomPage.notFound')} description={t('roomPage.notFoundHint')} />
      </div>
    );
  }

  const upcoming = sessions
    .filter((session) => session.status === 'planned' && session.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = sessions
    .filter((session) => session.status !== 'planned' || session.date < TODAY)
    .sort((a, b) => b.date.localeCompare(a.date));

  const occupancyPercent =
    upcoming.length > 0
      ? Math.round(
          (upcoming.reduce((sum, s) => sum + s.registered, 0) /
            Math.max(
              1,
              upcoming.reduce((sum, s) => sum + s.capacity, 0),
            )) *
            100,
        )
      : 0;
  const nextSession = upcoming[0];

  const orderedSessions = [...upcoming, ...past];

  return (
    <div className="flex flex-col gap-7">
      {crumbs}

      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-tint text-accent">
            <PinIcon size={22} color="currentColor" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[26px] leading-none font-semibold">{room.room}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-secondary">
              <span className="inline-flex items-center gap-1.5">
                <PinIcon size={13} color="currentColor" />
                {room.site}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BuildingIcon size={13} color="currentColor" />
                {room.building}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PeopleIcon size={13} color="currentColor" />
                {t('roomPage.capacity', { count: room.capacity })}
              </span>
            </div>
          </div>
        </div>
        <ProgressRing
          percent={occupancyPercent}
          label={t('roomPage.stats.occupancy')}
          color={occupancyPercent > 80 ? 'var(--color-warning)' : 'var(--color-accent)'}
          size={86}
        />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          value={upcoming.length}
          label={t('roomPage.stats.upcoming')}
          hint={t('roomPage.stats.upcomingHint')}
          tone="accent"
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={past.length}
          label={t('roomPage.stats.done')}
          hint={t('roomPage.stats.doneHint')}
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={nextSession ? formatLongDate(nextSession.date) : t('roomPage.stats.none')}
          label={t('roomPage.stats.nextSession')}
          hint={t('roomPage.stats.nextSessionHint')}
          tone="success"
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[16px] font-semibold">{t('roomPage.sessionsTitle')}</h2>
        {orderedSessions.length === 0 ? (
          <EmptyState title={t('roomPage.empty')} />
        ) : (
          <ul className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
            {orderedSessions.map((session, index) => {
              const isUpcoming = session.status === 'planned' && session.date >= TODAY;
              return (
                <li
                  key={session.id}
                  style={{ ['--ui-index' as string]: Math.min(index, 10) }}
                  className="ui-row ui-stagger border-b border-divider last:border-b-0"
                >
                  <Link
                    href={`/admin/sessions/${session.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 text-ink! hover:bg-card-muted"
                  >
                    <DateBlock
                      date={session.date}
                      width={46}
                      daySize={18}
                      tone={isUpcoming ? 'accent' : 'muted'}
                    />
                    <span className="flex min-w-0 grow flex-col gap-0.5">
                      <span className="truncate text-[13.5px] font-medium">
                        {session.trainingNames.join(', ')}
                      </span>
                      <span className="text-[11.5px] text-ink-tertiary">
                        {formatLongDate(session.date)} · {session.startTime} · {session.endTime}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gauge-neutral-track">
                        <span
                          className="rounded-full bg-accent"
                          style={{
                            width: `${Math.round((session.registered / session.capacity) * 100)}%`,
                          }}
                        />
                      </span>
                      <span className="font-display text-[12px] tabular-nums text-ink-secondary">
                        {session.registered}/{session.capacity}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
                        session.status === 'cancelled'
                          ? 'bg-danger-tint text-danger-text'
                          : isUpcoming
                            ? 'bg-accent-tint text-accent'
                            : 'bg-card-muted text-ink-secondary'
                      }`}
                    >
                      {session.status === 'cancelled'
                        ? tSessions('list.periodCancelled')
                        : isUpcoming
                          ? tSessions('list.periodUpcoming')
                          : tSessions('list.periodPast')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
