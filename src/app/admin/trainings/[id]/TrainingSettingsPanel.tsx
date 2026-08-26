'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button, useToast } from '@/components/admin';
import type { AdminTraining, TrainingCategory } from '@/lib/admin-types';
import { TrainingForm, type TrainingOwnerOption } from '../TrainingForm';

interface TrainingSettingsPanelProps {
  training: AdminTraining;
  categories: TrainingCategory[];
  owners: TrainingOwnerOption[];
}

/** Pre-filled record of the training. Saving is simulated through a toast. */
export function TrainingSettingsPanel({
  training,
  categories,
  owners,
}: TrainingSettingsPanelProps) {
  const t = useTranslations('adminTrainings');
  const { showToast } = useToast();
  // Bumping this remounts the form, which restores the fixture values.
  const [run, setRun] = useState(0);

  return (
    <section className="rounded-xl border border-card-border bg-card">
      <header className="flex flex-col gap-1 border-b border-divider px-5 py-4">
        <h2 className="font-display text-[15px] font-semibold text-ink">{t('settings.title')}</h2>
        <p className="text-[12.5px] text-ink-secondary">{t('settings.subtitle')}</p>
      </header>

      <div className="max-w-[560px] px-5 py-5">
        <TrainingForm key={run} training={training} categories={categories} owners={owners} />
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-divider px-5 py-3.5">
        <Button variant="secondary" onClick={() => setRun((current) => current + 1)}>
          {t('settings.reset')}
        </Button>
        <Button onClick={() => showToast(t('form.saved'))}>{t('form.submit')}</Button>
      </footer>
    </section>
  );
}
