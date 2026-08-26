'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/admin';
import { useToast } from '@/components/admin';
import type { RelanceSettings } from '@/lib/admin-types';
import { SettingsRow, SettingsSection } from './SettingsSection';
import { SendIcon } from './settingsIcons';

interface RelanceSettingsCardProps {
  settings: RelanceSettings;
  /** Free seats over the upcoming sessions, used by the live estimate. */
  freeSeats: number;
  index?: number;
}

/** Editable form of the relance engine parameters. Saving is simulated. */
export function RelanceSettingsCard({ settings, freeSeats, index }: RelanceSettingsCardProps) {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [draft, setDraft] = useState<RelanceSettings>(settings);
  const [saved, setSaved] = useState<RelanceSettings>(settings);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const estimatedInvitations = Math.round(freeSeats * draft.seatMargin);

  function update<K extends keyof RelanceSettings>(key: K, value: RelanceSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function onSave() {
    setSaved(draft);
    showToast(t('relance.savedToast'), 'success');
  }

  function onReset() {
    setDraft(saved);
  }

  return (
    <SettingsSection
      title={t('relance.title')}
      description={t('relance.description')}
      icon={<SendIcon size={16} />}
      index={index}
      action={
        <span
          className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-colors duration-200 ${
            draft.autoRunEnabled
              ? 'bg-success-tint text-success'
              : 'bg-card-muted text-ink-tertiary'
          }`}
        >
          {draft.autoRunEnabled
            ? t('relance.autoOn', { time: draft.autoRunTime })
            : t('relance.autoOff')}
        </span>
      }
    >
      <div className="flex flex-col">
        <SettingsRow label={t('relance.seatMargin')} hint={t('relance.seatMarginHint')}>
          <NumberField
            value={draft.seatMargin}
            step={0.1}
            min={1}
            max={3}
            suffix={t('relance.seatMarginUnit')}
            onChange={(value) => update('seatMargin', value)}
            label={t('relance.seatMargin')}
          />
        </SettingsRow>

        <SettingsRow label={t('relance.daysBetween')} hint={t('relance.daysBetweenHint')}>
          <NumberField
            value={draft.daysBetweenMails}
            step={1}
            min={1}
            max={90}
            suffix={t('units.days')}
            onChange={(value) => update('daysBetweenMails', value)}
            label={t('relance.daysBetween')}
          />
        </SettingsRow>

        <SettingsRow label={t('relance.expiringSoon')} hint={t('relance.expiringSoonHint')}>
          <NumberField
            value={draft.expiringSoonDays}
            step={5}
            min={15}
            max={365}
            suffix={t('units.days')}
            onChange={(value) => update('expiringSoonDays', value)}
            label={t('relance.expiringSoon')}
          />
        </SettingsRow>

        <SettingsRow label={t('relance.sessionsPerMail')} hint={t('relance.sessionsPerMailHint')}>
          <NumberField
            value={draft.sessionsPerMail}
            step={1}
            min={1}
            max={8}
            suffix={t('units.sessions')}
            onChange={(value) => update('sessionsPerMail', value)}
            label={t('relance.sessionsPerMail')}
          />
        </SettingsRow>

        <SettingsRow label={t('relance.autoRunTime')} hint={t('relance.autoRunTimeHint')}>
          <div className="flex items-center justify-end gap-2">
            <input
              type="time"
              aria-label={t('relance.autoRunTime')}
              value={draft.autoRunTime}
              onChange={(event) => update('autoRunTime', event.target.value)}
              className={`${FIELD_CLASS} w-[130px] font-display tabular-nums`}
            />
            <span className={UNIT_SLOT} aria-hidden="true" />
          </div>
        </SettingsRow>

        <SettingsRow label={t('relance.autoRun')} hint={t('relance.autoRunHint')}>
          <Toggle
            checked={draft.autoRunEnabled}
            onChange={(value) => update('autoRunEnabled', value)}
            label={t('relance.autoRun')}
            onLabel={t('toggle.on')}
            offLabel={t('toggle.off')}
          />
        </SettingsRow>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-divider bg-card-muted px-5 py-3.5">
        <p className="text-[12.5px] text-ink-secondary">
          {t.rich('relance.estimate', {
            seats: freeSeats,
            invitations: estimatedInvitations,
            b: (chunks: ReactNode) => (
              <span className="font-display font-semibold tabular-nums text-ink">{chunks}</span>
            ),
          })}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={!dirty}>
            {tCommon('actions.reset')}
          </Button>
          <Button size="sm" onClick={onSave} disabled={!dirty}>
            {tCommon('actions.save')}
          </Button>
        </div>
      </footer>
    </SettingsSection>
  );
}

const FIELD_CLASS =
  'h-10 rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]';

/** Fixed slot holding the unit after a control, so every field shares one right edge. */
const UNIT_SLOT = 'block w-[124px] shrink-0';

interface NumberFieldProps {
  value: number;
  step: number;
  min: number;
  max: number;
  suffix: string;
  label: string;
  onChange: (value: number) => void;
}

/** Numeric input with its unit, Space Grotesk digits. */
function NumberField({ value, step, min, max, suffix, label, onChange }: NumberFieldProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="number"
        aria-label={label}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isNaN(next)) onChange(next);
        }}
        className={`${FIELD_CLASS} w-[96px] font-display font-medium tabular-nums`}
      />
      <span className={`${UNIT_SLOT} text-[12.5px] text-ink-tertiary`}>{suffix}</span>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  onLabel: string;
  offLabel: string;
}

/** Switch styled with the accent token. */
function Toggle({ checked, onChange, label, onLabel, offLabel }: ToggleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-[12.5px] ${checked ? 'text-ink-secondary' : 'text-ink-tertiary'}`}>
        {checked ? onLabel : offLabel}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`ui-pressable relative h-6 w-11 cursor-pointer rounded-full border transition-colors duration-200 ${
          checked ? 'border-accent bg-accent' : 'border-card-border bg-btn-secondary'
        }`}
      >
        <span
          className={`absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-card shadow-[0_1px_3px_rgba(22,24,28,0.2)] transition-[left] duration-200 ${
            checked ? 'left-[22px]' : 'left-[2px]'
          }`}
        />
      </button>
    </div>
  );
}
