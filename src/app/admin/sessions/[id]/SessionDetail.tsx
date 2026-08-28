'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Button,
  EmptyState,
  Modal,
  SearchInput,
  Table,
  TableEmptyRow,
  Td,
  Th,
  useToast,
} from '@/components/admin';
import type {
  AdminSession,
  AdminSessionParticipant,
  AdminUser,
  AttendanceStatus,
  SessionFormat,
  Site,
} from '@/lib/admin-types';
import { formatLongDate } from '@/lib/format';
import { Field, NumberInput, SegmentedControl, SelectInput, TextInput } from '../formFields';
import {
  BanIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  GroupIcon,
  HybridIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  ScreenIcon,
  TagIcon,
  UserPlusIcon,
  XIcon,
} from '../sessionIcons';
import { Portal } from '../Portal';
import { Chip, DateBadge, FormatBadge, SeatsCell, SessionStatusPill } from '../sessionUi';
import { seatsLeft, toDisplayTime, toInputTime } from '../sessionUtils';

const FORMATS: SessionFormat[] = ['onsite', 'remote', 'hybrid'];
const ATTENDANCES: AttendanceStatus[] = ['registered', 'attended', 'absent', 'excused'];

/** Editable fields of one session. Every session is independent. */
interface Draft {
  date: string;
  startTime: string;
  endTime: string;
  site: string;
  room: string;
  format: SessionFormat;
  capacity: number;
  trainerName: string;
  tags: string[];
}

/** Keys of `adminSessions.detail.errors` describing why a draft cannot be saved. */
type DraftErrorKey = 'date' | 'startTime' | 'endTime' | 'timeOrder' | 'capacity';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** True when the string is a real calendar date, e.g. "2026-02-30" is not. */
function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return `${date.getFullYear()}`.padStart(4, '0') === value.slice(0, 4);
}

/** "09:30" -> 570, or null when the value is not a time of day. */
function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * First reason the draft cannot be saved, or null when it is sound.
 * Guards the detail page against empty or inconsistent inputs.
 */
function findDraftError(draft: Draft, registered: number): DraftErrorKey | null {
  if (!isValidIsoDate(draft.date)) return 'date';
  const start = toMinutes(draft.startTime);
  const end = toMinutes(draft.endTime);
  if (start === null) return 'startTime';
  if (end === null) return 'endTime';
  if (end <= start) return 'timeOrder';
  if (!Number.isFinite(draft.capacity) || draft.capacity < 1 || draft.capacity < registered) {
    return 'capacity';
  }
  return null;
}

function toDraft(session: AdminSession): Draft {
  return {
    date: session.date,
    startTime: toInputTime(session.startTime),
    endTime: toInputTime(session.endTime),
    site: session.site,
    room: session.location?.room ?? '',
    format: session.format,
    capacity: session.capacity,
    trainerName: session.trainerName,
    tags: session.tags,
  };
}

interface SessionDetailProps {
  session: AdminSession;
  sites: Site[];
  /** Users that may be added to the session. */
  candidates: Pick<AdminUser, 'id' | 'name' | 'email' | 'site'>[];
  commonTags: string[];
}

/** Detail of one session: editable information, attendance and actions. */
export function SessionDetail({ session, sites, candidates, commonTags }: SessionDetailProps) {
  const t = useTranslations('adminSessions');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [current, setCurrent] = useState<AdminSession>(session);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(session));
  const [tagDraft, setTagDraft] = useState('');
  const [participants, setParticipants] = useState<AdminSessionParticipant[]>(session.participants);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [enrollSearch, setEnrollSearch] = useState('');

  const cancelled = current.status === 'cancelled';
  const needsRoom = draft.format !== 'remote';
  const registered = participants.length;
  const left = seatsLeft(registered, current.capacity);

  const enrollCandidates = useMemo(() => {
    const taken = new Set(participants.map((participant) => participant.userId));
    const needle = enrollSearch.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (taken.has(candidate.id)) return false;
      if (!needle) return true;
      return `${candidate.name} ${candidate.email}`.toLowerCase().includes(needle);
    });
  }, [candidates, participants, enrollSearch]);

  const tagSuggestions = commonTags.filter((tag) => !draft.tags.includes(tag));
  const draftError = editing ? findDraftError(draft, registered) : null;

  function startEdit() {
    setDraft(toDraft(current));
    setTagDraft('');
    setEditing(true);
  }

  function save() {
    const error = findDraftError(draft, registered);
    if (error) {
      showToast(t(`detail.errors.${error}`, { count: registered }), 'error');
      return;
    }
    setCurrent((session_) => ({
      ...session_,
      date: draft.date,
      startTime: toDisplayTime(draft.startTime),
      endTime: toDisplayTime(draft.endTime),
      site: draft.site as Site,
      ...(draft.format !== 'remote' && draft.room
        ? { location: { room: draft.room } }
        : { location: undefined }),
      format: draft.format,
      capacity: draft.capacity,
      trainerName: draft.trainerName,
      tags: draft.tags,
    }));
    setEditing(false);
    showToast(t('detail.saved'), 'success');
  }

  function addTag(value: string) {
    const clean = value.trim();
    setTagDraft('');
    if (!clean || draft.tags.includes(clean)) return;
    setDraft((current_) => ({ ...current_, tags: [...current_.tags, clean] }));
  }

  function setAttendance(userId: string, attendance: AttendanceStatus) {
    setParticipants((list) =>
      list.map((participant) =>
        participant.userId === userId ? { ...participant, attendance } : participant,
      ),
    );
    showToast(t('detail.participants.attendanceSaved'), 'success');
  }

  function markAllPresent() {
    setParticipants((list) =>
      list.map((participant) => ({ ...participant, attendance: 'attended' })),
    );
    showToast(t('detail.participants.allPresent'), 'success');
  }

  function enroll(candidate: Pick<AdminUser, 'id' | 'name' | 'email' | 'site'>) {
    setParticipants((list) => [
      ...list,
      {
        userId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        site: candidate.site,
        attendance: 'registered',
      },
    ]);
    setEnrollOpen(false);
    setEnrollSearch('');
    showToast(t('detail.enroll.added', { name: candidate.name }), 'success');
  }

  function removeParticipant(participant: AdminSessionParticipant) {
    setParticipants((list) => list.filter((item) => item.userId !== participant.userId));
    showToast(t('detail.participants.removed', { name: participant.name }), 'info');
  }

  function cancelSession() {
    setCurrent((session_) => ({ ...session_, status: 'cancelled' }));
    setCancelOpen(false);
    showToast(t('detail.cancelSession.done'), 'info');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <DateBadge date={current.date} size="lg" tone={cancelled ? 'muted' : 'accent'} />
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[24px] leading-tight font-semibold">
              {current.trainingNames.join(' · ')}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-ink-secondary">
              <span>{formatLongDate(current.date)}</span>
              <span className="text-ink-disabled">·</span>
              <span>
                {current.startTime} · {current.endTime}
              </span>
              <span className="text-ink-disabled">·</span>
              <span>{current.site}</span>
              <SessionStatusPill
                status={current.status}
                label={tCommon(`status.${current.status}`)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setCancelOpen(true)}
            disabled={cancelled}
          >
            <BanIcon size={14} />
            {t('detail.cancelSession.action')}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* Editable information */}
        <section className="ui-card flex flex-col rounded-xl border border-card-border bg-card transition-[border-color,box-shadow] duration-200">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-divider px-5 py-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                {t('detail.editTitle')}
              </h2>
              <p className="max-w-[520px] text-[12.5px] text-ink-tertiary">
                {t('detail.independent')}
              </p>
            </div>
            {editing ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  {t('detail.cancelEdit')}
                </Button>
                <Button size="sm" onClick={save} disabled={draftError !== null}>
                  <CheckIcon size={14} />
                  {t('detail.save')}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={startEdit} disabled={cancelled}>
                <PencilIcon size={14} />
                {t('detail.edit')}
              </Button>
            )}
          </div>

          <div className="px-5 py-5">
            {editing ? (
              <div className="flex flex-col gap-4">
                {draftError ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-danger/25 bg-danger-tint px-3 py-2 text-[12.5px] text-danger-text"
                  >
                    {t(`detail.errors.${draftError}`, { count: registered })}
                  </p>
                ) : null}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label={t('create.fields.date')} htmlFor="detail-date">
                    <TextInput
                      id="detail-date"
                      type="date"
                      value={draft.date}
                      onChange={(value) => setDraft((d) => ({ ...d, date: value }))}
                    />
                  </Field>
                  <Field label={t('create.fields.startTime')} htmlFor="detail-start">
                    <TextInput
                      id="detail-start"
                      type="time"
                      value={draft.startTime}
                      onChange={(value) => setDraft((d) => ({ ...d, startTime: value }))}
                    />
                  </Field>
                  <Field label={t('create.fields.endTime')} htmlFor="detail-end">
                    <TextInput
                      id="detail-end"
                      type="time"
                      value={draft.endTime}
                      onChange={(value) => setDraft((d) => ({ ...d, endTime: value }))}
                    />
                  </Field>
                </div>

                <Field label={t('create.fields.format')}>
                  <SegmentedControl
                    ariaLabel={t('create.fields.format')}
                    value={draft.format}
                    onChange={(value) =>
                      setDraft((d) => ({ ...d, format: value as SessionFormat }))
                    }
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
                  <Field label={tCommon('labels.site')} htmlFor="detail-site">
                    <SelectInput
                      id="detail-site"
                      value={draft.site}
                      onChange={(value) => setDraft((d) => ({ ...d, site: value }))}
                      options={sites.map((value) => ({ value, label: value }))}
                    />
                  </Field>
                  <Field label={t('create.fields.room')} htmlFor="detail-room">
                    <TextInput
                      id="detail-room"
                      value={draft.room}
                      disabled={!needsRoom}
                      placeholder={t('create.fields.roomPlaceholder')}
                      onChange={(value) => setDraft((d) => ({ ...d, room: value }))}
                    />
                  </Field>
                  <Field label={t('create.fields.capacity')} htmlFor="detail-capacity">
                    <NumberInput
                      id="detail-capacity"
                      value={draft.capacity}
                      onChange={(value) => setDraft((d) => ({ ...d, capacity: value }))}
                    />
                  </Field>
                </div>

                <Field
                  label={t('create.fields.trainer')}
                  htmlFor="detail-trainer"
                  className="max-w-[280px]"
                >
                  <TextInput
                    id="detail-trainer"
                    value={draft.trainerName}
                    placeholder={t('create.fields.trainerPlaceholder')}
                    onChange={(value) => setDraft((d) => ({ ...d, trainerName: value }))}
                  />
                </Field>

                <Field label={tCommon('labels.tags')} htmlFor="detail-tag">
                  <div className="flex flex-col gap-2.5">
                    <input
                      id="detail-tag"
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
                      className="h-10 w-full max-w-[300px] rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
                    />
                    {draft.tags.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {draft.tags.map((tag) => (
                          <li key={tag}>
                            <span className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-accent-border bg-accent-tint px-2.5 text-[12px] font-medium text-accent">
                              {tag}
                              <button
                                type="button"
                                aria-label={t('create.fields.removeTag', { tag })}
                                onClick={() =>
                                  setDraft((d) => ({
                                    ...d,
                                    tags: d.tags.filter((item) => item !== tag),
                                  }))
                                }
                                className="cursor-pointer opacity-70 transition-opacity duration-200 hover:opacity-100"
                              >
                                <XIcon size={11} />
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {tagSuggestions.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {tagSuggestions.map((tag) => (
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
                    ) : null}
                  </div>
                </Field>
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={<ClockIcon size={15} />}
                  label={t('detail.info.slot')}
                  value={`${current.startTime} · ${current.endTime}`}
                />
                <InfoItem
                  icon={<PinIcon size={15} />}
                  label={t('detail.info.place')}
                  value={
                    current.location
                      ? `${current.site} · ${current.location.room}`
                      : `${current.site} · ${t('row.remotePlace')}`
                  }
                />
                <InfoItem
                  icon={<BuildingIcon size={15} />}
                  label={t('detail.info.format')}
                  value={
                    <FormatBadge
                      format={current.format}
                      label={tCommon(`format.${current.format}`)}
                    />
                  }
                />
                <InfoItem
                  icon={<GroupIcon size={15} />}
                  label={t('detail.info.trainer')}
                  value={current.trainerName}
                />
                <InfoItem
                  icon={<CheckIcon size={15} />}
                  label={t('detail.info.trainings')}
                  value={
                    <span className="flex flex-wrap gap-1">
                      {current.trainingNames.map((name) => (
                        <Chip key={name} tone="accent">
                          {name}
                        </Chip>
                      ))}
                    </span>
                  }
                />
                <InfoItem
                  icon={<TagIcon size={15} />}
                  label={t('detail.info.tags')}
                  value={
                    current.tags.length === 0 ? (
                      <span className="text-ink-disabled">{t('detail.info.noTags')}</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {current.tags.map((tag) => (
                          <Chip key={tag}>{tag}</Chip>
                        ))}
                      </span>
                    )
                  }
                />
              </dl>
            )}
          </div>
        </section>

        {/* Seats */}
        <aside className="flex flex-col gap-3 rounded-xl border border-card-border bg-card p-5">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            {t('detail.info.seats')}
          </p>
          <SeatsCell
            registered={registered}
            capacity={current.capacity}
            width={200}
            label={t('row.seats', { registered, capacity: current.capacity })}
            hint={t('row.seatsLeft', { count: left })}
          />
          <p className="border-t border-divider pt-3 text-[12.5px] text-ink-secondary">
            {t('detail.participants.count', { registered, capacity: current.capacity })}
          </p>
        </aside>
      </div>

      {/* Participants */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[16px] font-semibold text-ink">
              {t('detail.participants.title')}
            </h2>
            <p className="text-[12.5px] text-ink-tertiary">
              {t('detail.participants.attendanceHint')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllPresent}
              disabled={participants.length === 0 || cancelled}
            >
              <CheckIcon size={14} />
              {t('detail.participants.markAllPresent')}
            </Button>
            <Button size="sm" onClick={() => setEnrollOpen(true)} disabled={cancelled}>
              <UserPlusIcon size={14} />
              {t('detail.enroll.action')}
            </Button>
          </div>
        </div>

        {participants.length === 0 ? (
          <EmptyState
            title={t('detail.participants.empty')}
            description={t('detail.participants.emptyHint')}
            action={
              <Button size="sm" onClick={() => setEnrollOpen(true)} disabled={cancelled}>
                <UserPlusIcon size={14} />
                {t('detail.enroll.action')}
              </Button>
            }
          />
        ) : (
          <Table
            head={
              <tr>
                <Th>{t('detail.participants.columnName')}</Th>
                <Th>{t('detail.participants.columnSite')}</Th>
                <Th>{t('detail.participants.columnEmail')}</Th>
                <Th>{t('detail.participants.columnAttendance')}</Th>
                <Th align="right">
                  <span className="sr-only">{tCommon('actions.delete')}</span>
                </Th>
              </tr>
            }
          >
            {participants.map((participant, index) => (
              <tr
                key={participant.userId}
                style={{ '--ui-index': Math.min(index, 12) } as CSSProperties}
                className="ui-row ui-stagger transition-colors duration-150 hover:bg-card-muted"
              >
                <Td>
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint font-display text-[11px] font-semibold text-accent">
                      {initials(participant.name)}
                    </span>
                    <Link
                      href={`/admin/users/${participant.userId}`}
                      className="text-[13px] font-medium text-ink! underline-offset-2 hover:text-accent! hover:underline"
                    >
                      {participant.name}
                    </Link>
                  </span>
                </Td>
                <Td>{participant.site}</Td>
                <Td>
                  {participant.email ? (
                    <span className="text-ink-secondary">{participant.email}</span>
                  ) : (
                    <span className="text-ink-disabled">{tCommon('labels.noEmail')}</span>
                  )}
                </Td>
                <Td>
                  <AttendanceToggle
                    value={participant.attendance}
                    disabled={cancelled}
                    labels={{
                      registered: t('detail.participants.registered'),
                      attended: t('detail.participants.present'),
                      absent: t('detail.participants.absent'),
                      excused: t('detail.participants.excused'),
                    }}
                    onChange={(value) => setAttendance(participant.userId, value)}
                  />
                </Td>
                <Td align="right">
                  <button
                    type="button"
                    aria-label={t('detail.participants.remove', { name: participant.name })}
                    onClick={() => removeParticipant(participant)}
                    disabled={cancelled}
                    className="ui-pressable inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-card-border text-ink-tertiary transition-colors duration-200 hover:border-danger/30 hover:bg-danger-tint hover:text-danger-text disabled:cursor-default disabled:opacity-40"
                  >
                    <XIcon size={13} />
                  </button>
                </Td>
              </tr>
            ))}
            {participants.length === 0 ? (
              <TableEmptyRow colSpan={5}>{t('detail.participants.empty')}</TableEmptyRow>
            ) : null}
          </Table>
        )}
      </section>

      {/* Enrolment modal */}
      {enrollOpen ? (
        <Portal>
          <Modal
            open={enrollOpen}
            onClose={() => setEnrollOpen(false)}
            title={t('detail.enroll.title')}
            subtitle={t('detail.enroll.subtitle')}
            closeLabel={tCommon('actions.close')}
            width={520}
          >
            <div className="flex flex-col gap-3">
              {left === 0 ? (
                <p className="rounded-lg border border-warning/25 bg-warning-tint px-3 py-2 text-[12.5px] text-warning-text">
                  {t('detail.enroll.full')}
                </p>
              ) : null}

              <SearchInput
                placeholder={t('detail.enroll.searchPlaceholder')}
                value={enrollSearch}
                onChange={(event) => setEnrollSearch(event.target.value)}
                className="w-full"
              />

              {enrollCandidates.length === 0 ? (
                <EmptyState
                  title={t('detail.enroll.empty')}
                  description={t('detail.enroll.emptyHint')}
                />
              ) : (
                <ul className="flex max-h-[320px] flex-col gap-1 overflow-y-auto pr-1">
                  {enrollCandidates.map((candidate) => (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        onClick={() => enroll(candidate)}
                        className="ui-pressable flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors duration-200 hover:border-card-border hover:bg-card-muted"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint font-display text-[11px] font-semibold text-accent">
                          {initials(candidate.name)}
                        </span>
                        <span className="flex min-w-0 grow flex-col">
                          <span className="truncate text-[13px] font-medium text-ink">
                            {candidate.name}
                          </span>
                          <span className="truncate text-[11.5px] text-ink-tertiary">
                            {candidate.email || t('detail.enroll.noEmail')} · {candidate.site}
                          </span>
                        </span>
                        <span className="shrink-0 text-[12.5px] font-medium text-accent">
                          {t('detail.enroll.add')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Modal>
        </Portal>
      ) : null}

      {/* Cancellation modal */}
      {cancelOpen ? (
        <Portal>
          <Modal
            open={cancelOpen}
            onClose={() => setCancelOpen(false)}
            title={t('detail.cancelSession.title')}
            closeLabel={tCommon('actions.close')}
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setCancelOpen(false)}>
                  {t('detail.cancelSession.keep')}
                </Button>
                <Button variant="danger" size="sm" onClick={cancelSession}>
                  <BanIcon size={14} />
                  {t('detail.cancelSession.confirm')}
                </Button>
              </>
            }
          >
            {registered === 0
              ? t('detail.cancelSession.bodyEmpty')
              : t('detail.cancelSession.body', { count: registered })}
          </Modal>
        </Portal>
      ) : null}
    </div>
  );
}

/** Two-letter avatar fallback, e.g. "Marie Lefebvre" -> "ML". */
function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-ink-tertiary">{icon}</span>
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
          {label}
        </dt>
        <dd className="text-[13px] text-ink">{value}</dd>
      </div>
    </div>
  );
}

const ATTENDANCE_STYLE: Record<AttendanceStatus, string> = {
  registered: 'bg-card text-ink',
  attended: 'bg-success-tint text-success',
  absent: 'bg-danger-tint text-danger-text',
  excused: 'bg-warning-tint text-warning-text',
};

/** Attendance control of one participant: registered, present, absent, excused. */
function AttendanceToggle({
  value,
  onChange,
  labels,
  disabled = false,
}: {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
  labels: Record<AttendanceStatus, string>;
  disabled?: boolean;
}) {
  return (
    <span
      role="group"
      aria-label={labels.registered}
      className="inline-flex items-center gap-1 rounded-lg border border-card-border bg-card-muted p-1"
    >
      {ATTENDANCES.map((status) => {
        const active = status === value;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={`ui-pressable h-7 cursor-pointer rounded-md px-2.5 text-[11.5px] font-medium whitespace-nowrap transition-colors duration-200 disabled:cursor-default disabled:opacity-50 ${
              active
                ? `${ATTENDANCE_STYLE[status]} shadow-[0_1px_2px_rgba(22,24,28,0.08)]`
                : 'text-ink-tertiary hover:text-ink-secondary'
            }`}
          >
            {labels[status]}
          </button>
        );
      })}
    </span>
  );
}
