'use client';

/**
 * Main column of the home page: the upcoming sessions compatible with the
 * trainings the user still has to validate, each one showing exactly which
 * of those trainings it will validate.
 */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SessionSlot, TrainingState } from '@/lib/types';
import { DateBlock } from '@/components/DateBlock';
import { IconButton } from '@/components/IconButton';
import { InfoItem } from '@/components/InfoItem';

export interface CoveredTraining {
  id: string;
  name: string;
  state: TrainingState;
}

export interface HomeSessionRow {
  slot: SessionSlot;
  /** The user's to-do trainings this session validates. */
  covered: CoveredTraining[];
}

const CHIP_BY_STATE: Record<TrainingState, string> = {
  overdue: 'bg-danger-tint text-danger-text',
  todo: 'bg-warning-tint text-warning-text',
  registered: 'bg-accent-tint text-accent',
  valid: 'bg-success-tint text-success',
};

/** Colored fill bar showing how full a slot is. */
function SeatsGauge({ slot, label }: { slot: SessionSlot; label: string }) {
  const capacity = slot.capacity ?? 12;
  const left = slot.seatsLeft ?? 0;
  const percent = Math.min(100, Math.round(((capacity - left) / capacity) * 100));
  const lowSeats = left > 0 && left <= Math.ceil(capacity * 0.25);
  return (
    <div className="flex w-[120px] shrink-0 flex-col gap-1.5">
      <span
        className={`text-[11.5px] font-semibold ${lowSeats ? 'text-warning-text' : 'text-success'}`}
      >
        {label}
      </span>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-gauge-neutral-track">
        <div
          className="rounded-full"
          style={{
            width: `${percent}%`,
            background: lowSeats ? 'var(--color-gauge-warning)' : 'var(--color-gauge-success)',
          }}
        />
      </div>
    </div>
  );
}

export function HomeSessions({ rows, userSite }: { rows: HomeSessionRow[]; userSite: string }) {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const [siteFilter, setSiteFilter] = useState<'site' | 'all'>('site');

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.slot.isRegistered ||
          siteFilter === 'all' ||
          row.slot.site === userSite ||
          row.slot.format === 'remote',
      ),
    [rows, siteFilter, userSite],
  );

  const pill = (active: boolean) =>
    `ui-pressable cursor-pointer rounded-full px-3 py-[5px] text-xs font-medium transition-colors duration-150 ${
      active ? 'bg-ink text-page' : 'border border-card-border text-ink-secondary hover:bg-card'
    }`;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold">{t('sessionsForYou')}</h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSiteFilter('site')}
            className={pill(siteFilter === 'site')}
          >
            {userSite}
          </button>
          <button
            type="button"
            onClick={() => setSiteFilter('all')}
            className={pill(siteFilter === 'all')}
          >
            {t('filterAll')}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-card-border bg-card-muted px-5 py-4 text-[13px] text-ink-tertiary">
          {t('sessionsForYouEmpty')}
        </p>
      ) : (
        visible.map(({ slot, covered }, index) => {
          const registered = slot.isRegistered;
          const mainTrainingId = covered[0]?.id;
          return (
            <div
              key={slot.id}
              style={{ ['--ui-index' as string]: Math.min(index, 8) }}
              className={`ui-card ui-stagger flex items-center gap-4 rounded-xl border px-5 py-4 ${
                registered ? 'border-accent-border bg-accent-surface' : 'border-card-border bg-card'
              }`}
            >
              <DateBlock
                date={slot.date}
                width={52}
                daySize={24}
                tone={registered ? 'accent' : 'default'}
              />
              <div
                className={`w-px self-stretch ${registered ? 'bg-accent-border' : 'bg-divider'}`}
              />
              <div className="flex min-w-0 grow flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold tracking-[0.05em] text-ink-tertiary uppercase">
                    {t('validates')}
                  </span>
                  {covered.map((training) => (
                    <Link
                      key={training.id}
                      href={`/trainings/${training.id}`}
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold hover:brightness-95 ${CHIP_BY_STATE[training.state]}`}
                    >
                      {training.name}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 whitespace-nowrap">
                  <InfoItem icon="clock">
                    {slot.startTime} · {slot.endTime}
                  </InfoItem>
                  <InfoItem icon={slot.format === 'onsite' ? 'building' : 'video'}>
                    {tc(slot.format === 'onsite' ? 'session.onsite' : 'session.remote')}
                  </InfoItem>
                  <InfoItem icon="pin">
                    {slot.location ? `${slot.site} · ${slot.location.room}` : slot.site}
                  </InfoItem>
                </div>
              </div>

              {registered ? (
                <>
                  <span className="shrink-0 text-[13px] font-semibold text-accent">
                    {tc('session.registered')}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <IconButton
                      icon="calendarPlus"
                      label={tc('actions.addToCalendar')}
                      accentBorder
                    />
                    <IconButton
                      icon="cross"
                      label={tc('actions.cancelRegistration')}
                      accentBorder
                    />
                  </div>
                </>
              ) : (
                <>
                  <SeatsGauge
                    slot={slot}
                    label={tc('session.seats', { count: slot.seatsLeft ?? 0 })}
                  />
                  <Link
                    href={mainTrainingId ? `/trainings/${mainTrainingId}` : '/'}
                    className="flex h-[42px] shrink-0 items-center rounded-lg bg-accent px-[18px] text-[13px] font-semibold text-white hover:bg-accent-hover hover:text-white"
                  >
                    {tc('actions.register')}
                  </Link>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
