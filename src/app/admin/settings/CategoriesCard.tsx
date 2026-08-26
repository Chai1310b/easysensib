'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Drawer, Table, Td, Th, Tr, useToast } from '@/components/admin';
import type { CategoryReference } from '@/services/admin/settings';
import { SettingsSection, staggerClass } from './SettingsSection';
import { LayersIcon, PencilIcon, PlusIcon } from './settingsIcons';

interface CategoriesCardProps {
  categories: CategoryReference[];
  index?: number;
}

interface CategoryRow extends CategoryReference {
  /** Local id, the original name never changes on the server side here. */
  key: string;
}

/** Business line referential: a line is a category carried by a training. */
export function CategoriesCard({ categories, index }: CategoriesCardProps) {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [rows, setRows] = useState<CategoryRow[]>(() =>
    categories.map((category) => ({ ...category, key: category.category })),
  );
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const duplicate = rows.some(
    (row) => row.category.toLowerCase() === trimmed.toLowerCase() && row.key !== editing?.key,
  );
  const canSubmit = trimmed.length > 1 && !duplicate;

  function openCreate() {
    setEditing(null);
    setName('');
    setCreating(true);
  }

  function openEdit(row: CategoryRow) {
    setCreating(false);
    setEditing(row);
    setName(row.category);
  }

  function closeDrawer() {
    setCreating(false);
    setEditing(null);
    setName('');
  }

  function onSubmit() {
    if (!canSubmit) return;

    if (editing) {
      setRows((current) =>
        current.map((row) =>
          row.key === editing.key ? { ...row, category: trimmed as CategoryRow['category'] } : row,
        ),
      );
      showToast(t('categories.renamedToast', { name: trimmed }), 'success');
    } else {
      setRows((current) => [
        ...current,
        {
          key: `new-${current.length}-${trimmed}`,
          category: trimmed as CategoryRow['category'],
          trainings: 0,
          sessionsPlanned: 0,
          usersConcerned: 0,
        },
      ]);
      showToast(t('categories.createdToast', { name: trimmed }), 'success');
    }

    closeDrawer();
  }

  return (
    <SettingsSection
      title={t('categories.title')}
      description={t('categories.description')}
      icon={<LayersIcon size={16} />}
      index={index}
      action={
        <Button variant="outline" size="sm" onClick={openCreate}>
          <PlusIcon size={13} />
          {t('categories.add')}
        </Button>
      }
    >
      <div className="p-4">
        <Table
          className="border-0!"
          head={
            <tr>
              <Th>{tCommon('labels.category')}</Th>
              <Th align="right">{t('categories.columns.trainings')}</Th>
              <Th align="right">{t('categories.columns.sessions')}</Th>
              <Th align="right">{t('categories.columns.users')}</Th>
              <Th align="right">{t('columns.actions')}</Th>
            </tr>
          }
        >
          {rows.map((row, rowIndex) => (
            <Tr key={row.key} className={staggerClass(rowIndex)}>
              <Td>
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dotColor(rowIndex) }}
                  />
                  <span className="font-medium">{row.category}</span>
                </span>
              </Td>
              <Td align="right" numeric>
                {row.trainings}
              </Td>
              <Td align="right" numeric>
                {row.sessionsPlanned}
              </Td>
              <Td align="right" numeric>
                {row.usersConcerned}
              </Td>
              <Td align="right">
                <button
                  type="button"
                  aria-label={t('categories.rename', { name: row.category })}
                  onClick={() => openEdit(row)}
                  className="ui-pressable inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-card-border text-ink-secondary transition-colors duration-200 hover:bg-card-muted hover:text-accent"
                >
                  <PencilIcon size={14} />
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>

      <Drawer
        open={creating || editing !== null}
        onClose={closeDrawer}
        title={editing ? t('categories.drawerEditTitle') : t('categories.drawerCreateTitle')}
        subtitle={t('categories.drawerSubtitle')}
        closeLabel={tCommon('actions.close')}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeDrawer}>
              {tCommon('actions.cancel')}
            </Button>
            <Button size="sm" onClick={onSubmit} disabled={!canSubmit}>
              {tCommon('actions.save')}
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">{t('categories.nameLabel')}</span>
          <input
            type="text"
            value={name}
            autoFocus
            placeholder={t('categories.namePlaceholder')}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSubmit();
            }}
            className="h-11 rounded-lg border border-card-border bg-card px-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
          />
          <span className="text-[12px] text-ink-tertiary">
            {duplicate ? t('categories.duplicate') : t('categories.nameHint')}
          </span>
        </label>

        {editing && editing.trainings > 0 ? (
          <p className="mt-4 rounded-lg border border-warning/25 bg-warning-tint px-3.5 py-2.5 text-[12.5px] text-warning-text">
            {t('categories.renameWarning', { count: editing.trainings })}
          </p>
        ) : null}
      </Drawer>
    </SettingsSection>
  );
}

/** Neutral dot colours borrowed from the gauge tokens, cycled over the rows. */
const DOT_COLORS = ['var(--color-accent)', 'var(--color-gauge-warning)', 'var(--color-success)'];

function dotColor(index: number): string {
  return DOT_COLORS[index % DOT_COLORS.length];
}
