/**
 * Training page for the end user: everything about one training (info, where
 * the user stands, e-learning path, past participations) with the session
 * choice as the main content.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ChevronLeftIcon, LaptopIcon, MailIcon, UploadIcon } from '@/components/icons';
import { ModeTag } from '@/components/ModeTag';
import { StateIcon } from '@/components/StateIcon';
import { StatusPill } from '@/components/StatusPill';
import { ValidityTimeline, timelineEdges } from '@/components/ValidityTimeline';
import { DateBlock } from '@/components/DateBlock';
import { formatLongDate } from '@/lib/format';
import { getTraining, getTrainings } from '@/services/trainings';
import { getRegistrableSessions } from '@/services/registrationSessions';
import { getParticipationHistory } from '@/services/history';
import { getCurrentUser } from '@/services/user';
import { SessionList } from './SessionList';

export async function generateStaticParams() {
  const trainings = await getTrainings();
  return trainings.map((training) => ({ id: training.id }));
}

interface TrainingPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainingPage({ params }: TrainingPageProps) {
  const { id } = await params;
  const [training, user] = await Promise.all([getTraining(id), getCurrentUser()]);

  if (!training) {
    notFound();
  }

  const [sessions, history, t, tCommon] = await Promise.all([
    getRegistrableSessions(training.id),
    getParticipationHistory(),
    getTranslations('training'),
    getTranslations('common'),
  ]);

  const pastRecords = history.filter((record) => record.trainingName === training.name);
  const registeredSession = training.registration
    ? sessions.find((s) => s.id === training.registration?.sessionId)
    : undefined;

  const edges = timelineEdges(training, (key, values) => t(key, values));
  const journeyLine = training.lastValidation
    ? t(
        training.lastValidation.kind === 'session'
          ? 'journey.lastValidatedSession'
          : 'journey.lastValidatedCertificate',
        { date: formatLongDate(training.lastValidation.date) },
      )
    : t('journey.neverValidated');

  const canElearning = training.mode === 'elearning' || training.mode === 'both';

  return (
    <div className="flex w-full max-w-[1080px] flex-col gap-6 self-center px-6 pt-8 pb-14">
      <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
        <ChevronLeftIcon size={14} color="#5c6068" strokeWidth={2} />
        {tCommon('actions.backToHome')}
      </Link>

      {/* Hero: the training itself */}
      <section className="flex flex-col gap-5 rounded-xl border border-card-border bg-card p-7">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <StateIcon state={training.state} size={30} className="mt-1 shrink-0" />
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[27px] leading-tight font-semibold">
                {training.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                {(training.mode === 'session' || training.mode === 'both') && (
                  <ModeTag mode="session" />
                )}
                {canElearning && <ModeTag mode="elearning" />}
                {training.validityYears !== undefined && (
                  <span className="text-xs text-ink-tertiary">
                    {t('meta', {
                      category: training.category,
                      years: training.validityYears,
                    })}
                  </span>
                )}
              </div>
              {training.description ? (
                <p className="max-w-[640px] text-[13.5px] leading-relaxed text-ink-secondary">
                  {training.description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="hidden shrink-0 flex-col items-end gap-1.5 text-right sm:flex">
            <span className="text-[13px] font-medium text-ink-secondary">{journeyLine}</span>
            {registeredSession ? (
              <span className="text-[13px] font-semibold text-accent">
                {t('journey.registered', { date: formatLongDate(registeredSession.date) })}
              </span>
            ) : null}
          </div>
        </div>

        <div className="border-t border-divider pt-5">
          <ValidityTimeline
            training={training}
            labels={{
              today: t('timeline.today'),
              plannedSession: registeredSession
                ? t('timeline.plannedSession', { date: formatLongDate(registeredSession.date) })
                : undefined,
              left: edges.left,
              right: edges.right,
              status: tCommon(`validity.${training.validity.labelKey}`, {
                count: training.validity.labelCount,
              }),
              legendValid: t('timeline.legendValid'),
              legendWarning: t('timeline.legendWarning'),
              legendOverdue: t('timeline.legendOverdue'),
            }}
          />
        </div>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main: choosing a session */}
        <div className="min-w-0 grow">
          <SessionList sessions={sessions} userSite={user.site} />
        </div>

        {/* Aside: e-learning + past participations */}
        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[300px]">
          {canElearning ? (
            <section className="flex flex-col gap-3 rounded-xl border border-accent-border bg-accent-surface p-5">
              <div className="flex items-center gap-2.5">
                <LaptopIcon size={17} color="var(--color-accent)" />
                <h2 className="font-display text-[15px] font-semibold text-ink">
                  {t('elearning.title')}
                </h2>
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-secondary">
                {t('elearning.hint')}
              </p>
              <Link
                href="/certificates"
                className="ui-pressable flex h-10 w-fit items-center gap-2 rounded-lg border-[1.5px] border-accent px-4 text-[13px] font-semibold text-accent! transition-colors duration-150 hover:bg-accent-tint"
              >
                <UploadIcon size={14} color="var(--color-accent)" />
                {t('elearning.action')}
              </Link>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-[15px] font-semibold">{t('pastTitle')}</h2>
            {pastRecords.length === 0 ? (
              <p className="rounded-xl border border-card-border bg-card-muted px-4 py-3.5 text-[12.5px] text-ink-tertiary">
                {t('pastEmpty')}
              </p>
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
                {pastRecords.map((record) => (
                  <li
                    key={record.id}
                    className="flex items-center gap-3 border-b border-divider px-4 py-3 last:border-b-0"
                  >
                    <DateBlock date={record.date} width={40} daySize={17} />
                    <span className="grow text-[12px] text-ink-secondary">
                      {record.location ?? formatLongDate(record.date)}
                    </span>
                    {record.status === 'attended' || record.status === 'certificate' ? (
                      <StatusPill tone="success" icon="check">
                        {t(`past.${record.status}`)}
                      </StatusPill>
                    ) : (
                      <StatusPill tone="danger" icon="cross">
                        {t('past.absent')}
                      </StatusPill>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex items-start gap-2.5 px-1">
            <MailIcon size={15} className="mt-0.5 shrink-0" />
            <span className="text-xs leading-relaxed text-ink-tertiary">{t('mailNote')}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
