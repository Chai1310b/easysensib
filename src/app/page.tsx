/**
 * Home page of the end user: the upcoming sessions compatible with their
 * to-do trainings in the main column, their trainings (status + gauge) on
 * the right.
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/Card';
import { StateIcon } from '@/components/StateIcon';
import { ValidityGauge } from '@/components/ValidityGauge';
import { ClockIcon, FileCheckIcon, LaptopIcon, MailIcon } from '@/components/icons';
import { formatLongDate } from '@/lib/format';
import type { Training } from '@/lib/types';
import { getRegistrableSessions } from '@/services/registrationSessions';
import { getTrainings } from '@/services/trainings';
import { getCurrentUser } from '@/services/user';
import { HomeSessions, type HomeSessionRow } from './HomeSessions';

export default async function HomePage() {
  const [t, tc, user, trainings] = await Promise.all([
    getTranslations('home'),
    getTranslations('common'),
    getCurrentUser(),
    getTrainings(),
  ]);

  const activeTrainings = trainings.filter((training) => training.state !== 'valid');
  const actionCount = trainings.filter(
    (training) => training.state === 'overdue' || training.state === 'todo',
  ).length;
  const plannedCount = trainings.filter((training) => training.state === 'registered').length;

  // Sessions compatible with the user's to-do trainings, deduplicated by slot:
  // one row per session, carrying every to-do training it validates.
  const rowsBySlot = new Map<string, HomeSessionRow>();
  await Promise.all(
    activeTrainings.map(async (training) => {
      const slots = await getRegistrableSessions(training.id);
      for (const slot of slots) {
        if (slot.seatsLeft === null && !slot.isRegistered) continue; // full
        const row = rowsBySlot.get(slot.id) ?? { slot, covered: [] };
        row.covered.push({ id: training.id, name: training.name, state: training.state });
        rowsBySlot.set(slot.id, row);
      }
    }),
  );
  const sessionRows = [...rowsBySlot.values()].sort((a, b) =>
    a.slot.date.localeCompare(b.slot.date),
  );

  const orderedTrainings: Training[] = [
    ...activeTrainings,
    ...trainings.filter((training) => training.state === 'valid'),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col">
      <div className="flex flex-col gap-2 px-10 pt-10 pb-7">
        <h1 className="font-display text-3xl font-semibold">
          {t('greeting', { firstName: user.firstName })}
        </h1>
        <p className="text-[15px] text-ink-secondary">
          {t('subtitle', { actionCount, plannedCount })}
        </p>
      </div>

      <div className="flex items-start gap-8 px-10 pb-12">
        {/* Main: sessions for the user */}
        <div className="flex min-w-0 grow flex-col gap-4">
          <HomeSessions rows={sessionRows} userSite={user.site} />
          <div className="flex items-center gap-2.5 px-1">
            <MailIcon size={15} />
            <span className="text-xs text-ink-tertiary">{t('mailNote')}</span>
          </div>
        </div>

        {/* Right: the user's trainings + shortcuts */}
        <div className="flex w-[400px] shrink-0 flex-col gap-7">
          <div className="flex flex-col gap-3.5">
            <h2 className="font-display text-[17px] font-semibold">{t('myTrainings')}</h2>
            <Card className="flex flex-col">
              {orderedTrainings.map((training, index) => (
                <TrainingRow
                  key={training.id}
                  training={training}
                  isLast={index === orderedTrainings.length - 1}
                  subtitle={
                    training.state === 'valid' && training.lastValidation
                      ? training.lastValidation.kind === 'certificate'
                        ? t('validatedByCertificate', {
                            date: formatLongDate(training.lastValidation.date),
                          })
                        : t('validatedBySession', {
                            date: formatLongDate(training.lastValidation.date),
                          })
                      : training.category
                  }
                  gaugeLabel={tc(`validity.${training.validity.labelKey}`, {
                    count: training.validity.labelCount,
                  })}
                />
              ))}
            </Card>
          </div>

          <div className="flex flex-col gap-3.5">
            <h2 className="font-display text-[17px] font-semibold">{t('shortcuts')}</h2>
            <Card className="flex flex-col">
              <Link
                href="/history"
                className="flex items-center gap-3 border-b border-divider px-[18px] py-3.5 text-sm font-medium text-ink"
              >
                <ClockIcon size={16} color="#5c6068" />
                {t('shortcutHistory')}
              </Link>
              <Link
                href="/certificates"
                className="flex items-center gap-3 border-b border-divider px-[18px] py-3.5 text-sm font-medium text-ink"
              >
                <FileCheckIcon size={16} color="#5c6068" />
                {t('shortcutCertificates')}
              </Link>
              <a
                href="#"
                className="flex items-center gap-3 px-[18px] py-3.5 text-sm font-medium text-ink"
              >
                <MailIcon size={16} color="#5c6068" />
                {t('shortcutContact')}
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/** One training of the right column: state, name, gauge. */
function TrainingRow({
  training,
  subtitle,
  gaugeLabel,
  isLast,
}: {
  training: Training;
  subtitle: string;
  gaugeLabel: string;
  isLast: boolean;
}) {
  const canElearning = training.mode === 'elearning' || training.mode === 'both';

  return (
    <div
      className={`flex items-center gap-3 px-[18px] py-3.5 ${isLast ? '' : 'border-b border-divider'}`}
    >
      <StateIcon state={training.state} size={20} className="shrink-0" />
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <Link
            href={`/trainings/${training.id}`}
            className="truncate text-[13.5px] font-semibold text-ink! hover:text-accent!"
          >
            {training.name}
          </Link>
          {canElearning ? (
            <LaptopIcon size={12} color="var(--color-ink-tertiary)" className="shrink-0" />
          ) : null}
        </span>
        <span className="truncate text-[11.5px] text-ink-tertiary">{subtitle}</span>
      </div>
      <ValidityGauge
        label={gaugeLabel}
        tone={training.validity.tone}
        percent={training.validity.progressPercent}
        width={116}
        neutralTrack={training.state === 'registered'}
      />
    </div>
  );
}
