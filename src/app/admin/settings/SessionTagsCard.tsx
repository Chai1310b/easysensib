'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, EmptyState, Modal, useToast } from '@/components/admin';
import type { SessionTagReference } from '@/services/admin/settings';
import { SettingsSection, staggerClass } from './SettingsSection';
import { PlusIcon, TagIcon, TrashIcon } from './settingsIcons';

interface SessionTagsCardProps {
  tags: SessionTagReference[];
  index?: number;
}

/** Common referential of the free session tags: list, add, remove. */
export function SessionTagsCard({ tags, index }: SessionTagsCardProps) {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [rows, setRows] = useState<SessionTagReference[]>(tags);
  const [draft, setDraft] = useState('');
  const [pendingRemoval, setPendingRemoval] = useState<SessionTagReference | null>(null);

  const trimmed = draft.trim();
  const duplicate = rows.some((row) => row.tag.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length > 1 && !duplicate;

  function onAdd() {
    if (!canAdd) return;
    setRows((current) => [...current, { tag: trimmed, sessions: 0 }]);
    setDraft('');
    showToast(t('tags.addedToast', { name: trimmed }), 'success');
  }

  function onConfirmRemoval() {
    if (!pendingRemoval) return;
    const removed = pendingRemoval.tag;
    setRows((current) => current.filter((row) => row.tag !== removed));
    setPendingRemoval(null);
    showToast(t('tags.removedToast', { name: removed }), 'info');
  }

  return (
    <SettingsSection
      title={t('tags.title')}
      description={t('tags.description')}
      icon={<TagIcon size={16} />}
      index={index}
      action={
        <span className="font-display text-[12.5px] font-medium tabular-nums text-ink-tertiary">
          {t('tags.count', { count: rows.length })}
        </span>
      }
    >
      <div className="flex flex-col gap-4 p-5">
        {rows.length === 0 ? (
          <EmptyState
            title={t('tags.emptyTitle')}
            description={t('tags.emptyHint')}
            icon={<TagIcon size={24} />}
          />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {rows.map((row, rowIndex) => (
              <li
                key={row.tag}
                className={`${staggerClass(rowIndex)} group flex h-9 items-center gap-2 rounded-full border border-card-border bg-card-muted pr-1.5 pl-3 transition-colors duration-200 hover:border-accent-border hover:bg-accent-surface`}
              >
                <span className="text-[12.5px] font-medium text-ink">{row.tag}</span>
                <span
                  className="font-display text-[11px] tabular-nums text-ink-tertiary"
                  title={t('tags.usage', { count: row.sessions })}
                >
                  {row.sessions}
                </span>
                <button
                  type="button"
                  aria-label={t('tags.remove', { name: row.tag })}
                  onClick={() => setPendingRemoval(row)}
                  className="ui-pressable flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-ink-disabled transition-colors duration-200 hover:bg-danger-tint hover:text-danger-text"
                >
                  <TrashIcon size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-start gap-2 border-t border-divider pt-4">
          <div className="flex min-w-[220px] grow flex-col gap-1">
            <input
              type="text"
              value={draft}
              aria-label={t('tags.addLabel')}
              placeholder={t('tags.addPlaceholder')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onAdd();
              }}
              className="h-11 w-full max-w-[360px] rounded-lg border border-card-border bg-card px-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
            />
            <span className="text-[12px] text-ink-tertiary">
              {duplicate ? t('tags.duplicate') : t('tags.addHint')}
            </span>
          </div>
          <Button onClick={onAdd} disabled={!canAdd}>
            <PlusIcon size={14} />
            {t('tags.add')}
          </Button>
        </div>
      </div>

      <Modal
        open={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        title={t('tags.removeTitle')}
        closeLabel={tCommon('actions.close')}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPendingRemoval(null)}>
              {tCommon('actions.cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirmRemoval}>
              {tCommon('actions.delete')}
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-ink-secondary">
          {pendingRemoval && pendingRemoval.sessions > 0
            ? t('tags.removeUsed', {
                name: pendingRemoval.tag,
                count: pendingRemoval.sessions,
              })
            : t('tags.removeUnused', { name: pendingRemoval?.tag ?? '' })}
        </p>
      </Modal>
    </SettingsSection>
  );
}
