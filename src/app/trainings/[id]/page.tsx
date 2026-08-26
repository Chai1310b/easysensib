/**
 * Session registration page for one training (mockup: InscriptionEcran).
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ChevronLeftIcon } from '@/components/icons';
import { ModeTag } from '@/components/ModeTag';
import { StateIcon } from '@/components/StateIcon';
import { ValidityGauge } from '@/components/ValidityGauge';
import { getTraining, getTrainings } from '@/services/trainings';
import { getRegistrableSessions } from '@/services/registrationSessions';
import { getCurrentUser } from '@/services/user';
import { SessionList } from './SessionList';

export async function generateStaticParams() {
  const trainings = await getTrainings();
  return trainings.map((training) => ({ id: training.id }));
}

/** "3" -> "3h", "2.5" -> "2h30" */
function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes > 0 ? `${wholeHours}h${String(minutes).padStart(2, '0')}` : `${wholeHours}h`;
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

  const [sessions, t, tCommon] = await Promise.all([
    getRegistrableSessions(training.id),
    getTranslations('training'),
    getTranslations('common'),
  ]);

  return (
    <div className="flex w-full max-w-[980px] flex-col gap-6 self-center px-6 pt-8 pb-14">
      <Link href="/" className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
        <ChevronLeftIcon size={14} color="#5c6068" strokeWidth={2} />
        {tCommon('actions.backToHome')}
      </Link>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <StateIcon state={training.state} size={28} className="shrink-0" />
          <div className="flex flex-col gap-[3px]">
            <h1 className="font-display text-[26px] font-semibold">{training.name}</h1>
            <div className="flex items-center gap-2">
              {(training.mode === 'session' || training.mode === 'both') && (
                <ModeTag mode="session" />
              )}
              {(training.mode === 'elearning' || training.mode === 'both') && (
                <ModeTag mode="elearning" />
              )}
              {training.durationHours !== undefined && training.validityYears !== undefined && (
                <span className="text-xs text-ink-tertiary">
                  {t('meta', {
                    category: training.category,
                    duration: formatDuration(training.durationHours),
                    years: training.validityYears,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <ValidityGauge
          label={tCommon(`validity.${training.validity.labelKey}`, {
            count: training.validity.labelCount,
          })}
          tone={training.validity.tone}
          percent={training.validity.progressPercent}
          width={170}
        />
      </div>

      <SessionList sessions={sessions} userSite={user.site} />
    </div>
  );
}
