'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  Button,
  FilterChips,
  Modal,
  SearchInput,
  Table,
  TableEmptyRow,
  Td,
  Th,
  useToast,
} from '@/components/admin';
import { formatLongDate } from '@/lib/format';
import type { AdminTrainingState, Site } from '@/lib/admin-types';
import { StateChip } from '../TrainingBadges';
import { SelectField, TextAreaField, ToggleField } from '../FormFields';

/** One row of the "covered users" table, flattened for the client boundary. */
export interface TrainingUserRow {
  userId: string;
  name: string;
  email: string;
  site: Site;
  isVip: boolean;
  state: AdminTrainingState;
  lastValidatedAt?: string;
  expiresAt?: string;
  validatedBy?: 'session' | 'certificate';
}

/** Only a validated obligation can be cancelled. */
const CANCELLABLE: AdminTrainingState[] = ['valid', 'expiring'];

const STATE_ORDER: AdminTrainingState[] = ['overdue', 'never', 'registered', 'expiring', 'valid'];

const REASON_KEYS = [
  'trainerNotQualified',
  'sessionInvalid',
  'attendanceError',
  'certificateInvalid',
  'other',
] as const;

interface TrainingUsersPanelProps {
  trainingName: string;
  users: TrainingUserRow[];
}

/** Covered users with their per-user state, plus the cancellation flow. */
export function TrainingUsersPanel({ trainingName, users }: TrainingUsersPanelProps) {
  const t = useTranslations('adminTrainings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [target, setTarget] = useState<TrainingUserRow | null>(null);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [relance, setRelance] = useState(true);
  const [touched, setTouched] = useState(false);

  const chips = useMemo(
    () => [
      { value: '', label: t('users.allStates'), count: users.length },
      ...STATE_ORDER.filter((item) => users.some((user) => user.state === item)).map((item) => ({
        value: item,
        label: tCommon(`status.${item}`),
        count: users.filter((user) => user.state === item).length,
      })),
    ],
    [t, tCommon, users],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return users
      .filter((user) => {
        if (state && user.state !== state) return false;
        if (needle && !`${user.name} ${user.email}`.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) ||
          a.name.localeCompare(b.name, 'fr'),
      );
  }, [search, state, users]);

  function openCancel(user: TrainingUserRow) {
    setTarget(user);
    setReason('');
    setComment('');
    setRelance(true);
    setTouched(false);
  }

  function confirmCancel() {
    if (!reason) {
      setTouched(true);
      return;
    }
    setTarget(null);
    showToast(t('cancelModal.done'));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder={t('users.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className="font-display text-[12.5px] tabular-nums text-ink-tertiary">
          {rows.length} / {users.length}
        </span>
      </div>

      <FilterChips
        options={chips}
        value={state}
        onChange={setState}
        ariaLabel={t('users.stateAria')}
      />

      <Table
        head={
          <tr>
            <Th>{t('users.columns.user')}</Th>
            <Th>{t('users.columns.site')}</Th>
            <Th>{t('users.columns.state')}</Th>
            <Th>{t('users.columns.lastValidated')}</Th>
            <Th>{t('users.columns.expires')}</Th>
            <Th align="right">{t('users.columns.actions')}</Th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <TableEmptyRow colSpan={6}>
            <span className="flex flex-col items-center gap-1.5">
              <span className="font-display text-[14px] font-semibold text-ink">
                {t('users.empty')}
              </span>
              <span>{t('users.emptyHint')}</span>
            </span>
          </TableEmptyRow>
        ) : (
          rows.map((user, index) => (
            <tr
              key={user.userId}
              style={{ '--ui-index': Math.min(index, 12) } as CSSProperties}
              className="ui-row ui-stagger transition-colors duration-150 hover:bg-card-muted"
            >
              <Td>
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/users/${user.userId}`}
                      className="font-medium text-ink! underline-offset-2 hover:text-accent! hover:underline"
                    >
                      {user.name}
                    </Link>
                    {user.isVip ? (
                      <span className="rounded bg-warning-tint px-1.5 py-px text-[10px] font-semibold tracking-[0.04em] text-warning-text">
                        {t('users.vip')}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11.5px] text-ink-tertiary">
                    {user.email || tCommon('labels.noEmail')}
                  </span>
                </span>
              </Td>
              <Td className="whitespace-nowrap text-ink-secondary">{user.site}</Td>
              <Td>
                <StateChip state={user.state} />
              </Td>
              <Td className="whitespace-nowrap">
                {user.lastValidatedAt ? (
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-[12.5px] tabular-nums">
                      {formatLongDate(user.lastValidatedAt)}
                    </span>
                    {user.validatedBy ? (
                      <span className="text-[11.5px] text-ink-tertiary">
                        {t(`users.validatedBy.${user.validatedBy}`)}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-ink-disabled">{t('users.never')}</span>
                )}
              </Td>
              <Td className="whitespace-nowrap font-display text-[12.5px] tabular-nums text-ink-secondary">
                {user.expiresAt ? (
                  formatLongDate(user.expiresAt)
                ) : (
                  <span className="text-ink-disabled">·</span>
                )}
              </Td>
              <Td align="right">
                {CANCELLABLE.includes(user.state) ? (
                  <Button variant="danger" size="sm" onClick={() => openCancel(user)}>
                    {t('users.cancelValidation')}
                  </Button>
                ) : (
                  <span className="text-ink-disabled">·</span>
                )}
              </Td>
            </tr>
          ))
        )}
      </Table>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={t('cancelModal.title')}
        subtitle={t('cancelModal.subtitle', {
          name: target?.name ?? '',
          training: trainingName,
        })}
        closeLabel={tCommon('actions.close')}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              {t('cancelModal.keep')}
            </Button>
            <Button variant="danger" onClick={confirmCancel}>
              {t('cancelModal.confirm')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="rounded-lg bg-danger-tint px-3.5 py-2.5 text-[12.5px] text-danger-text">
            {t('cancelModal.intro')}
          </p>

          <div className="flex flex-col gap-1.5">
            <SelectField
              label={t('cancelModal.reasonLabel')}
              value={reason}
              onChange={(value) => {
                setReason(value);
                setTouched(false);
              }}
              options={[
                { value: '', label: t('cancelModal.reasonPlaceholder') },
                ...REASON_KEYS.map((key) => ({
                  value: key,
                  label: t(`cancelModal.reasons.${key}`),
                })),
              ]}
            />
            {touched && !reason ? (
              <p className="text-[11.5px] font-medium text-danger-text">
                {t('cancelModal.missingReason')}
              </p>
            ) : null}
          </div>

          <TextAreaField
            label={t('cancelModal.commentLabel')}
            placeholder={t('cancelModal.commentPlaceholder')}
            value={comment}
            onChange={setComment}
          />

          <ToggleField
            label={t('cancelModal.relanceLabel')}
            hint={t('cancelModal.relanceHint')}
            checked={relance}
            onChange={setRelance}
          />
        </div>
      </Modal>
    </div>
  );
}
