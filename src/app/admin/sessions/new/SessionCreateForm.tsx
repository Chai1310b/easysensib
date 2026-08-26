'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button, EmptyState, FilterChips, SearchInput, useToast } from '@/components/admin';
import type { AdminTraining, SessionFormat, Site, TrainingCategory } from '@/lib/admin-types';
import { formatLongDate } from '@/lib/format';
import {
  Field,
  FormSection,
  NumberInput,
  SegmentedControl,
  SelectInput,
  Switch,
  TextInput,
} from '../formFields';
import {
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  GroupIcon,
  HybridIcon,
  PinIcon,
  PlusIcon,
  RepeatIcon,
  ScreenIcon,
  TagIcon,
  XIcon,
} from '../sessionIcons';
import { Chip, DateBadge } from '../sessionUi';
import { repeatDates, toDisplayTime, type RepeatFrequency } from '../sessionUtils';

const FORMATS: SessionFormat[] = ['onsite', 'remote', 'hybrid'];
const FREQUENCIES: RepeatFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly'];

interface SessionCreateFormProps {
  trainings: AdminTraining[];
  categories: TrainingCategory[];
  sites: Site[];
  commonTags: string[];
  /** ISO date used as the default first occurrence. */
  defaultDate: string;
}

/**
 * Creation screen of a session.
 * Nothing is persisted: the submit action only raises a simulated toast.
 */
export function SessionCreateForm({
  trainings,
  categories,
  sites,
  commonTags,
  defaultDate,
}: SessionCreateFormProps) {
  const t = useTranslations('adminSessions');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [trainingSearch, setTrainingSearch] = useState('');
  const [category, setCategory] = useState('');

  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');

  const [site, setSite] = useState<string>(sites[0] ?? '');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [format, setFormat] = useState<SessionFormat>('onsite');
  const [capacity, setCapacity] = useState(16);
  const [trainer, setTrainer] = useState('');

  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');

  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [frequency, setFrequency] = useState<RepeatFrequency>('weekly');
  const [occurrences, setOccurrences] = useState(4);

  const needsRoom = format !== 'remote';

  const visibleTrainings = useMemo(() => {
    const needle = trainingSearch.trim().toLowerCase();
    return trainings.filter((training) => {
      if (category && training.category !== category) return false;
      if (needle && !training.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [trainings, trainingSearch, category]);

  const selectedTrainings = useMemo(
    () => trainings.filter((training) => selectedIds.includes(training.id)),
    [trainings, selectedIds],
  );

  const previewDates = useMemo(
    () => (repeatEnabled ? repeatDates(date, frequency, occurrences) : [date]),
    [repeatEnabled, date, frequency, occurrences],
  );

  function toggleTraining(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  function addTag(value: string) {
    const clean = value.trim();
    if (!clean || tags.includes(clean)) {
      setTagDraft('');
      return;
    }
    setTags((current) => [...current, clean]);
    setTagDraft('');
  }

  function submit() {
    if (selectedIds.length === 0) {
      showToast(t('create.missingTrainings'), 'error');
      return;
    }
    const count = previewDates.length;
    showToast(count > 1 ? t('create.createdMultiple', { count }) : t('create.created'), 'success');
    router.push('/admin/sessions');
  }

  const suggestions = commonTags.filter((tag) => !tags.includes(tag));

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-5">
        {/* Trainings carried by the session */}
        <FormSection
          index={0}
          title={t('create.steps.trainings')}
          hint={t('create.steps.trainingsHint')}
          icon={<CheckIcon size={16} />}
          aside={
            selectedIds.length > 0 ? (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="ui-pressable cursor-pointer text-[12.5px] font-medium text-accent transition-colors duration-200 hover:text-accent-hover"
              >
                {t('create.trainings.clear')}
              </button>
            ) : null
          }
        >
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SearchInput
                placeholder={t('create.trainings.searchPlaceholder')}
                value={trainingSearch}
                onChange={(event) => setTrainingSearch(event.target.value)}
                className="w-full max-w-[300px]"
              />
              <span className="font-display text-[12.5px] tabular-nums text-ink-tertiary">
                {t('create.trainings.selected', { count: selectedIds.length })}
              </span>
            </div>

            <FilterChips
              ariaLabel={tCommon('labels.category')}
              value={category}
              onChange={setCategory}
              options={[
                { value: '', label: t('create.trainings.allCategories'), count: trainings.length },
                ...categories.map((value) => ({
                  value,
                  label: value,
                  count: trainings.filter((training) => training.category === value).length,
                })),
              ]}
            />

            {visibleTrainings.length === 0 ? (
              <EmptyState
                title={t('create.trainings.empty')}
                description={t('create.trainings.emptyHint')}
              />
            ) : (
              <div className="relative">
                <ul className="flex max-h-[360px] flex-col gap-1.5 overflow-y-auto pr-1 pb-1">
                  {visibleTrainings.map((training) => {
                    const selected = selectedIds.includes(training.id);
                    return (
                      <li key={training.id}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleTraining(training.id)}
                          className={`ui-pressable flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                            selected
                              ? 'border-accent-border bg-accent-surface'
                              : 'border-card-border bg-card hover:bg-card-muted'
                          }`}
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-200 ${
                              selected
                                ? 'border-accent bg-accent text-white'
                                : 'border-btn-outline bg-card text-transparent'
                            }`}
                          >
                            <CheckIcon size={11} strokeWidth={2.4} />
                          </span>

                          <span className="flex min-w-0 grow flex-col gap-0.5">
                            <span className="truncate text-[13.5px] font-medium text-ink">
                              {training.name}
                            </span>
                            <span className="text-[11.5px] text-ink-tertiary">
                              {t('create.trainings.duration', { hours: training.durationHours })} ·{' '}
                              {t('create.trainings.validity', { months: training.validityMonths })}{' '}
                              ·{' '}
                              {t('create.trainings.concerned', { count: training.usersConcerned })}
                            </span>
                          </span>

                          <Chip>{training.category}</Chip>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {/* Fade telling the reader the list keeps going below the fold. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-lg bg-gradient-to-t from-card to-transparent"
                />
              </div>
            )}
          </div>
        </FormSection>

        {/* Slot */}
        <FormSection
          index={1}
          title={t('create.steps.slot')}
          hint={t('create.steps.slotHint')}
          icon={<ClockIcon size={16} />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={t('create.fields.date')} htmlFor="session-date">
              <TextInput id="session-date" type="date" value={date} onChange={setDate} />
            </Field>
            <Field label={t('create.fields.startTime')} htmlFor="session-start">
              <TextInput id="session-start" type="time" value={startTime} onChange={setStartTime} />
            </Field>
            <Field label={t('create.fields.endTime')} htmlFor="session-end">
              <TextInput id="session-end" type="time" value={endTime} onChange={setEndTime} />
            </Field>
          </div>
        </FormSection>

        {/* Place and format */}
        <FormSection
          index={2}
          title={t('create.steps.place')}
          hint={t('create.steps.placeHint')}
          icon={<PinIcon size={16} />}
        >
          <div className="flex flex-col gap-4">
            <Field label={t('create.fields.format')}>
              <SegmentedControl
                ariaLabel={t('create.fields.format')}
                value={format}
                onChange={(value) => setFormat(value as SessionFormat)}
                options={FORMATS.map((value) => ({
                  value,
                  label: tCommon(`format.${value}`),
                  icon:
                    value === 'onsite' ? (
                      <BuildingIcon size={14} />
                    ) : value === 'remote' ? (
                      <ScreenIcon size={14} />
                    ) : (
                      <HybridIcon size={14} />
                    ),
                }))}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Field label={tCommon('labels.site')} htmlFor="session-site">
                <SelectInput
                  id="session-site"
                  value={site}
                  onChange={setSite}
                  options={sites.map((value) => ({ value, label: value }))}
                />
              </Field>
              <Field label={t('create.fields.building')} htmlFor="session-building">
                <TextInput
                  id="session-building"
                  value={building}
                  onChange={setBuilding}
                  disabled={!needsRoom}
                  placeholder={t('create.fields.buildingPlaceholder')}
                />
              </Field>
              <Field label={t('create.fields.room')} htmlFor="session-room">
                <TextInput
                  id="session-room"
                  value={room}
                  onChange={setRoom}
                  disabled={!needsRoom}
                  placeholder={t('create.fields.roomPlaceholder')}
                />
              </Field>
              <Field
                label={t('create.fields.capacity')}
                htmlFor="session-capacity"
                hint={t('create.fields.capacityHint')}
              >
                <NumberInput id="session-capacity" value={capacity} onChange={setCapacity} />
              </Field>
            </div>

            <Field
              label={t('create.fields.trainer')}
              htmlFor="session-trainer"
              className="max-w-[280px]"
            >
              <TextInput
                id="session-trainer"
                value={trainer}
                onChange={setTrainer}
                placeholder={t('create.fields.trainerPlaceholder')}
              />
            </Field>
          </div>
        </FormSection>

        {/* Free tags */}
        <FormSection
          index={3}
          title={t('create.steps.tags')}
          hint={t('create.steps.tagsHint')}
          icon={<TagIcon size={16} />}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <Field
                label={tCommon('labels.tags')}
                htmlFor="session-tag"
                className="w-full max-w-[300px]"
              >
                <input
                  id="session-tag"
                  type="text"
                  value={tagDraft}
                  placeholder={t('create.fields.tagInputPlaceholder')}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addTag(tagDraft);
                    }
                  }}
                  className="h-10 w-full rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
                />
              </Field>
              <Button variant="secondary" onClick={() => addTag(tagDraft)} className="mb-0">
                <PlusIcon size={14} />
                {t('create.fields.addTag')}
              </Button>
            </div>

            {tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag}>
                    <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-accent-border bg-accent-tint px-2.5 text-[12px] font-medium text-accent">
                      {tag}
                      <button
                        type="button"
                        aria-label={t('create.fields.removeTag', { tag })}
                        onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                        className="cursor-pointer opacity-70 transition-opacity duration-200 hover:opacity-100"
                      >
                        <XIcon size={11} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {suggestions.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
                  {t('create.fields.suggestions')}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {suggestions.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => addTag(tag)}
                        className="ui-pressable inline-flex h-[26px] cursor-pointer items-center gap-1 rounded-full border border-card-border bg-card px-2.5 text-[12px] text-ink-secondary transition-colors duration-200 hover:border-accent-border hover:bg-accent-surface hover:text-accent"
                      >
                        <PlusIcon size={11} />
                        {tag}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </FormSection>

        {/* Multiple creation shortcut */}
        <FormSection
          index={4}
          title={t('create.steps.repeat')}
          hint={t('create.steps.repeatHint')}
          icon={<RepeatIcon size={16} />}
          aside={
            <Switch
              id="session-repeat"
              checked={repeatEnabled}
              onChange={setRepeatEnabled}
              label={t('create.repeat.enable')}
            />
          }
        >
          {repeatEnabled ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[520px]">
                <Field label={t('create.repeat.frequency')} htmlFor="session-frequency">
                  <SelectInput
                    id="session-frequency"
                    value={frequency}
                    onChange={(value) => setFrequency(value as RepeatFrequency)}
                    options={FREQUENCIES.map((value) => ({
                      value,
                      label: t(`create.repeat.${value}`),
                    }))}
                  />
                </Field>
                <Field label={t('create.repeat.occurrences')} htmlFor="session-occurrences">
                  <NumberInput
                    id="session-occurrences"
                    value={occurrences}
                    min={1}
                    max={24}
                    onChange={(value) => setOccurrences(Math.max(1, Math.min(24, value || 1)))}
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-card-border bg-card-muted">
                <header className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
                  <h3 className="font-display text-[13.5px] font-semibold text-ink">
                    {t('create.repeat.previewTitle')}
                  </h3>
                  <span className="font-display text-[12.5px] tabular-nums text-accent">
                    {previewDates.length}
                  </span>
                </header>
                <ul className="flex max-h-[260px] flex-col overflow-y-auto p-2">
                  {previewDates.map((previewDate, index) => (
                    <li
                      key={`${previewDate}-${index}`}
                      className="ui-stagger flex items-center gap-3 rounded-lg px-2 py-2"
                      style={{ '--ui-index': Math.min(index, 10) } as React.CSSProperties}
                    >
                      <DateBadge date={previewDate} />
                      <span className="flex min-w-0 grow flex-col gap-0.5">
                        <span className="truncate text-[13px] font-medium text-ink">
                          {formatLongDate(previewDate)}
                        </span>
                        <span className="truncate text-[11.5px] text-ink-tertiary">
                          {toDisplayTime(startTime)} · {toDisplayTime(endTime)} · {site}
                          {needsRoom && room ? ` · ${room}` : ''}
                        </span>
                      </span>
                      <Chip>{t('create.repeat.previewIndex', { index: index + 1 })}</Chip>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-divider px-4 py-3 text-[11.5px] text-ink-tertiary">
                  {t('create.repeat.previewNote')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-ink-tertiary">{t('create.repeat.previewNote')}</p>
          )}
        </FormSection>
      </div>

      {/* Sticky summary */}
      <aside className="ui-stagger flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5 lg:sticky lg:top-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">{t('create.title')}</h2>

        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            {t('detail.info.trainings')}
          </p>
          {selectedTrainings.length === 0 ? (
            <p className="text-[12.5px] text-ink-disabled">{t('create.trainings.none')}</p>
          ) : (
            <ul className="flex flex-wrap gap-1">
              {selectedTrainings.map((training) => (
                <li key={training.id}>
                  <Chip tone="accent">{training.name}</Chip>
                </li>
              ))}
            </ul>
          )}
        </div>

        <dl className="flex flex-col gap-2 border-t border-divider pt-3 text-[12.5px]">
          <SummaryRow
            icon={<ClockIcon size={14} />}
            label={t('detail.info.slot')}
            value={`${date ? formatLongDate(date) : '·'} · ${toDisplayTime(startTime)}`}
          />
          <SummaryRow
            icon={<PinIcon size={14} />}
            label={t('detail.info.place')}
            value={
              needsRoom
                ? [site, building, room].filter(Boolean).join(' · ')
                : `${site} · ${t('row.remotePlace')}`
            }
          />
          <SummaryRow
            icon={<GroupIcon size={14} />}
            label={t('detail.info.capacity')}
            value={`${capacity}`}
          />
          <SummaryRow
            icon={<TagIcon size={14} />}
            label={t('detail.info.tags')}
            value={tags.length > 0 ? tags.join(' · ') : t('detail.info.noTags')}
          />
        </dl>

        <div className="flex flex-col gap-2 border-t border-divider pt-3">
          <Button onClick={submit} className="w-full">
            <PlusIcon size={15} />
            {previewDates.length > 1
              ? t('create.submitMultiple', { count: previewDates.length })
              : t('create.submit')}
          </Button>
          <Button variant="ghost" onClick={() => router.push('/admin/sessions')} className="w-full">
            {tCommon('actions.cancel')}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-[3px] shrink-0 text-ink-tertiary">{icon}</span>
      <div className="flex min-w-0 grow flex-col">
        <dt className="text-[11.5px] text-ink-tertiary">{label}</dt>
        <dd className="truncate text-[12.5px] font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}
