'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { AdminTraining, TrainingCategory } from '@/lib/admin-types';
import { NumberField, SelectField, TextField, ToggleField } from './FormFields';

export interface TrainingOwnerOption {
  id: string;
  name: string;
}

interface TrainingFormProps {
  categories: TrainingCategory[];
  owners: TrainingOwnerOption[];
  /** Pre-fills the fields; omitted on the creation form. */
  training?: AdminTraining;
}

/**
 * Visual form of a training record. The admin space has no backend, so the
 * state stays local: the caller owns the save button and the confirmation
 * toast. Remount the component (via `key`) to reset it.
 */
export function TrainingForm({ categories, owners, training }: TrainingFormProps) {
  const t = useTranslations('adminTrainings');

  const [name, setName] = useState(training?.name ?? '');
  const [category, setCategory] = useState<string>(training?.category ?? categories[0] ?? '');
  const [validityMonths, setValidityMonths] = useState(String(training?.validityMonths ?? 24));
  const [ownerId, setOwnerId] = useState(training?.ownerId ?? '');
  const [elearning, setElearning] = useState(training?.elearningEnabled ?? false);

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label={t('form.name')}
        placeholder={t('form.namePlaceholder')}
        value={name}
        onChange={setName}
      />

      <SelectField
        label={t('form.category')}
        value={category}
        onChange={setCategory}
        options={categories.map((item) => ({ value: item, label: item }))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label={t('form.validity')}
          hint={t('form.validityHint')}
          value={validityMonths}
          onChange={setValidityMonths}
          suffix="mois"
          step="1"
          min={1}
        />
      </div>

      <SelectField
        label={t('form.owner')}
        value={ownerId}
        onChange={setOwnerId}
        options={[
          { value: '', label: t('form.ownerNone') },
          ...owners.map((owner) => ({ value: owner.id, label: owner.name })),
        ]}
      />

      <ToggleField
        label={t('form.elearning')}
        hint={t('form.elearningHint')}
        checked={elearning}
        onChange={setElearning}
      />
    </div>
  );
}
