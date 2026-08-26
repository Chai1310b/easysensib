import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/Card';
import { DateBlock } from '@/components/DateBlock';
import { IconButton } from '@/components/IconButton';
import { InfoItem } from '@/components/InfoItem';
import { StateIcon } from '@/components/StateIcon';
import { Stepper, type StepperStep } from '@/components/Stepper';
import { ValidityGauge } from '@/components/ValidityGauge';
import { ClockIcon, FileCheckIcon, LaptopIcon, MailIcon } from '@/components/icons';
import { formatLongDate } from '@/lib/format';
import type { SessionSlot, Training, TrainingState } from '@/lib/types';
import { getUpcomingSessions } from '@/services/sessions';
import { getTrainings } from '@/services/trainings';
import { getCurrentUser } from '@/services/user';

/** Home page: "Mes sensibilisations" (mockup: VarianteMix). */
export default async function HomePage() {
  const [t, tc, user, trainings, sessions] = await Promise.all([
    getTranslations('home'),
    getTranslations('common'),
    getCurrentUser(),
    getTrainings(),
    getUpcomingSessions(),
  ]);

  const activeTrainings = trainings.filter((training) => training.state !== 'valid');
  const validTrainings = trainings.filter((training) => training.state === 'valid');
  const actionCount = trainings.filter(
    (training) => training.state === 'overdue' || training.state === 'todo',
  ).length;
  const plannedCount = trainings.filter((training) => training.state === 'registered').length;

  // Next upcoming session of each training (sessions are already sorted by date).
  const nextSessionByTraining = new Map<string, SessionSlot>();
  for (const session of sessions) {
    if (!nextSessionByTraining.has(session.trainingId)) {
      nextSessionByTraining.set(session.trainingId, session);
    }
  }
  const sessionListRows = [...nextSessionByTraining.values()];

  const stepLabels = {
    registration: tc('stepper.registration'),
    session: tc('stepper.session'),
    validation: tc('stepper.validation'),
  };

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
        <div className="flex grow flex-col gap-3.5">
          {activeTrainings.map((training) => (
            <ActiveTrainingCard
              key={training.id}
              training={training}
              session={
                training.registration
                  ? (sessions.find((s) => s.id === training.registration?.sessionId) ?? null)
                  : (nextSessionByTraining.get(training.id) ?? null)
              }
              stepLabels={stepLabels}
              labels={{
                register: tc('actions.register'),
                seats: (count: number) => tc('session.seats', { count }),
                remote: tc('session.remote'),
                registered: tc('session.registered'),
                addToCalendar: tc('actions.addToCalendar'),
                cancelRegistration: tc('actions.cancelRegistration'),
                elearningHint: t('elearningHint'),
                gauge: tc(`validity.${training.validity.labelKey}`, {
                  count: training.validity.labelCount,
                }),
              }}
            />
          ))}

          {validTrainings.map((training) => (
            <ValidTrainingRow
              key={training.id}
              training={training}
              labels={{
                subtitle:
                  training.lastValidation?.kind === 'certificate'
                    ? t('validatedByCertificate', {
                        date: formatLongDate(training.lastValidation.date),
                      })
                    : t('validatedBySession', {
                        date: formatLongDate(training.lastValidation?.date ?? ''),
                      }),
                myCertificate: t('myCertificate'),
                gauge: tc(`validity.${training.validity.labelKey}`, {
                  count: training.validity.labelCount,
                }),
              }}
            />
          ))}
        </div>

        <div className="flex w-[400px] shrink-0 flex-col gap-7">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-semibold">{t('upcomingSessions')}</h2>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-ink px-3 py-[5px] text-xs font-medium text-page">
                  {user.site}
                </span>
                <span className="rounded-full border border-card-border px-3 py-[5px] text-xs font-medium text-ink-secondary">
                  {t('filterAll')}
                </span>
              </div>
            </div>
            <Card className="flex flex-col">
              {sessionListRows.map((session, index) => (
                <SessionListRow
                  key={session.id}
                  session={session}
                  isLast={index === sessionListRows.length - 1}
                  labels={{
                    register: tc('actions.register'),
                    remote: tc('session.remote'),
                    registered: tc('session.registered'),
                  }}
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
                <FileCheckIcon size={16} />
                {t('shortcutCertificates')}
              </Link>
              <a
                href="#"
                className="flex items-center gap-3 px-[18px] py-3.5 text-sm font-medium text-ink"
              >
                <MailIcon size={16} color="#5c6068" strokeWidth={1.7} />
                {t('shortcutContact')}
              </a>
            </Card>
            <div className="flex items-start gap-2.5 px-1 py-0.5">
              <MailIcon size={15} className="mt-[1px] shrink-0" />
              <span className="text-xs leading-normal text-ink-tertiary">{t('mailNote')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActiveCardLabels {
  register: string;
  seats: (count: number) => string;
  remote: string;
  registered: string;
  addToCalendar: string;
  cancelRegistration: string;
  elearningHint: string;
  gauge: string;
}

function buildSteps(
  state: TrainingState,
  labels: { registration: string; session: string; validation: string },
): StepperStep[] {
  const registered = state === 'registered';
  return [
    { label: labels.registration, icon: 'pencil', status: registered ? 'done' : 'current' },
    { label: labels.session, icon: 'calendar', status: registered ? 'current' : 'future' },
    { label: labels.validation, icon: 'check', status: 'future' },
  ];
}

function sessionPlace(session: SessionSlot, remoteLabel: string): string {
  return session.location ? `${session.location.building}, ${session.location.room}` : remoteLabel;
}

/** Card of a training that still needs an action (overdue, todo or registered). */
function ActiveTrainingCard({
  training,
  session,
  stepLabels,
  labels,
}: {
  training: Training;
  session: SessionSlot | null;
  stepLabels: { registration: string; session: string; validation: string };
  labels: ActiveCardLabels;
}) {
  const registered = training.state === 'registered';

  return (
    <Card className="flex flex-col gap-3.5 px-6 py-5">
      <div className="flex items-center justify-between gap-5">
        <div className="flex grow items-center gap-3">
          <StateIcon state={training.state} className="shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-base font-semibold">{training.name}</span>
            <span className="text-xs text-ink-tertiary">{training.category}</span>
          </div>
        </div>
        <ValidityGauge
          label={labels.gauge}
          tone={training.validity.tone}
          percent={training.validity.progressPercent}
          neutralTrack={registered}
        />
        <Stepper steps={buildSteps(training.state, stepLabels)} />
      </div>

      {session && (
        <div
          className={`flex items-center gap-4 rounded-[10px] border px-4 py-3 ${
            registered ? 'border-accent-border bg-accent-surface' : 'border-card-border'
          }`}
        >
          <DateBlock date={session.date} tone={registered ? 'accent' : 'default'} />
          <div className={`w-px self-stretch ${registered ? 'bg-accent-border' : 'bg-divider'}`} />
          <div className="flex grow items-center gap-4 whitespace-nowrap">
            <InfoItem icon="clock">
              {session.startTime} · {session.endTime}
            </InfoItem>
            <InfoItem icon={session.location ? 'pin' : 'video'}>
              {sessionPlace(session, labels.remote)}
            </InfoItem>
            {registered ? (
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#eaedfb" />
                  <path
                    d="M7.5 12L10.5 15L16.5 9"
                    stroke="#2b3fbf"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[13px] font-semibold text-accent">{labels.registered}</span>
              </div>
            ) : (
              session.seatsLeft !== null && (
                <InfoItem icon="people" tone="success">
                  {labels.seats(session.seatsLeft)}
                </InfoItem>
              )
            )}
          </div>
          {registered ? (
            <div className="flex shrink-0 gap-2">
              <IconButton icon="calendarPlus" label={labels.addToCalendar} accentBorder />
              <IconButton icon="cross" label={labels.cancelRegistration} accentBorder />
            </div>
          ) : (
            <Link
              href={`/trainings/${training.id}`}
              className="flex h-[42px] shrink-0 items-center rounded-lg bg-accent px-[18px] text-[13px] font-semibold text-white hover:bg-accent-hover hover:text-white"
            >
              {labels.register}
            </Link>
          )}
        </div>
      )}

      {training.mode === 'both' && !registered && (
        <Link
          href="/certificates"
          className="flex items-center gap-1.5 self-end text-xs font-medium text-accent hover:text-accent-hover"
        >
          <LaptopIcon size={12} />
          {labels.elearningHint}
        </Link>
      )}
    </Card>
  );
}

/** Collapsed row of an already validated training. */
function ValidTrainingRow({
  training,
  labels,
}: {
  training: Training;
  labels: { subtitle: string; myCertificate: string; gauge: string };
}) {
  return (
    <Card muted className="flex items-center gap-4 px-6 py-4">
      <StateIcon state="valid" size={22} className="shrink-0" />
      <div className="flex w-[280px] shrink-0 flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-ink-strong">{training.name}</span>
        <span className="text-xs text-ink-tertiary">{labels.subtitle}</span>
      </div>
      <ValidityGauge
        label={labels.gauge}
        tone={training.validity.tone}
        percent={training.validity.progressPercent}
      />
      <span className="grow" />
      {training.lastValidation?.kind === 'certificate' && (
        <Link
          href="/certificates"
          className="shrink-0 text-[13px] font-medium text-accent hover:text-accent-hover"
        >
          {labels.myCertificate}
        </Link>
      )}
    </Card>
  );
}

/** One row of the "Sessions à venir" side list. */
function SessionListRow({
  session,
  isLast,
  labels,
}: {
  session: SessionSlot;
  isLast: boolean;
  labels: { register: string; remote: string; registered: string };
}) {
  const place = sessionPlace(session, labels.remote);

  return (
    <div
      className={`flex items-center gap-3.5 px-[18px] py-4 ${
        isLast ? '' : 'border-b border-divider'
      } ${session.isRegistered ? 'rounded-b-xl bg-accent-surface' : ''}`}
    >
      <DateBlock
        date={session.date}
        daySize={20}
        tone={session.isRegistered ? 'accent' : 'default'}
      />
      <div className="flex grow flex-col gap-0.5">
        <span className="text-sm font-semibold">{session.trainingName}</span>
        {session.isRegistered ? (
          <span className="text-xs font-medium text-accent">
            {labels.registered} · {session.startTime} · {place}
          </span>
        ) : (
          <span className="text-xs text-ink-secondary">
            {session.startTime} · {place}
          </span>
        )}
      </div>
      {!session.isRegistered && (
        <Link
          href={`/trainings/${session.trainingId}`}
          className="shrink-0 text-[13px] font-semibold text-accent hover:text-accent-hover"
        >
          {labels.register}
        </Link>
      )}
    </div>
  );
}
