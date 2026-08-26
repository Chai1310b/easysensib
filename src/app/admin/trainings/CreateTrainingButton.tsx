'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button, Drawer, useToast } from '@/components/admin';
import { PencilIcon } from '@/components/icons';
import type { TrainingCategory } from '@/lib/admin-types';
import { TrainingForm, type TrainingOwnerOption } from './TrainingForm';

interface CreateTrainingButtonProps {
  categories: TrainingCategory[];
  owners: TrainingOwnerOption[];
}

/** Header action of the catalogue: opens the creation drawer. */
export function CreateTrainingButton({ categories, owners }: CreateTrainingButtonProps) {
  const t = useTranslations('adminTrainings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  // Bumping this remounts the form, which resets every field on reopen.
  const [run, setRun] = useState(0);

  return (
    <>
      <Button
        onClick={() => {
          setRun((current) => current + 1);
          setOpen(true);
        }}
      >
        <PencilIcon size={14} color="currentColor" />
        {t('list.create')}
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={t('form.createTitle')}
        subtitle={t('form.createSubtitle')}
        closeLabel={tCommon('actions.close')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('form.cancel')}
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                showToast(t('form.created'));
              }}
            >
              {t('form.submit')}
            </Button>
          </>
        }
      >
        <TrainingForm key={run} categories={categories} owners={owners} />
      </Drawer>
    </>
  );
}
