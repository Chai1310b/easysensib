'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Drawer, EmptyState, useToast } from '@/components/admin';
import type { Site } from '@/lib/admin-types';
import type { RoomReference, SiteRooms } from '@/services/admin/settings';
import { SettingsSection, staggerClass } from './SettingsSection';
import { BuildingIcon, ChevronDownIcon, PlusIcon } from './settingsIcons';

interface SitesRoomsCardProps {
  siteRooms: SiteRooms[];
  index?: number;
}

/**
 * Site and room referential.
 * Rooms are an open point of the target model, so the shape stays minimal:
 * building, room, capacity, plus the future sessions already booked there.
 */
export function SitesRoomsCard({ siteRooms, index }: SitesRoomsCardProps) {
  const t = useTranslations('adminSettings');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [sites, setSites] = useState<SiteRooms[]>(siteRooms);
  const [openSite, setOpenSite] = useState<Site | null>(siteRooms[0]?.site ?? null);
  const [drawerSite, setDrawerSite] = useState<Site | null>(null);
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [capacity, setCapacity] = useState('12');

  const buildings = useMemo(() => {
    const target = sites.find((entry) => entry.site === drawerSite);
    return [...new Set((target?.rooms ?? []).map((entry) => entry.building))];
  }, [sites, drawerSite]);

  const trimmedBuilding = building.trim();
  const trimmedRoom = room.trim();
  const capacityValue = Number(capacity);
  const canSubmit =
    trimmedBuilding.length > 1 &&
    trimmedRoom.length > 1 &&
    Number.isFinite(capacityValue) &&
    capacityValue > 0;

  function openDrawer(site: Site) {
    setDrawerSite(site);
    setBuilding('');
    setRoom('');
    setCapacity('12');
  }

  function closeDrawer() {
    setDrawerSite(null);
  }

  function onSubmit() {
    if (!canSubmit || !drawerSite) return;

    const created: RoomReference = {
      id: `r-new-${Date.now()}`,
      site: drawerSite,
      building: trimmedBuilding,
      room: trimmedRoom,
      capacity: capacityValue,
      sessionsPlanned: 0,
    };

    setSites((current) =>
      current.map((entry) =>
        entry.site === drawerSite
          ? {
              ...entry,
              rooms: [...entry.rooms, created],
              totalCapacity: entry.totalCapacity + capacityValue,
            }
          : entry,
      ),
    );
    setOpenSite(drawerSite);
    showToast(t('rooms.addedToast', { name: trimmedRoom, site: drawerSite }), 'success');
    closeDrawer();
  }

  return (
    <SettingsSection
      title={t('rooms.title')}
      description={t('rooms.description')}
      icon={<BuildingIcon size={16} />}
      index={index}
    >
      <div className="flex flex-col">
        {sites.map((entry, entryIndex) => {
          const expanded = openSite === entry.site;
          return (
            <div
              key={entry.site}
              className={`${staggerClass(entryIndex)} border-b border-divider last:border-b-0`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenSite(expanded ? null : entry.site)}
                  className="flex min-w-0 cursor-pointer items-center gap-2.5 text-left"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-200 ${
                      expanded ? 'bg-accent-tint text-accent' : 'bg-card-muted text-ink-tertiary'
                    }`}
                  >
                    <ChevronDownIcon
                      size={12}
                      className={`transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`}
                    />
                  </span>
                  <span className="font-display text-[14px] font-semibold text-ink">
                    {entry.site}
                  </span>
                  <span className="text-[12.5px] text-ink-tertiary">
                    {t('rooms.siteSummary', {
                      rooms: entry.rooms.length,
                      capacity: entry.totalCapacity,
                    })}
                  </span>
                </button>

                <Button variant="outline" size="sm" onClick={() => openDrawer(entry.site)}>
                  <PlusIcon size={13} />
                  {t('rooms.add')}
                </Button>
              </div>

              {expanded ? (
                <div className="px-5 pb-4">
                  {entry.rooms.length === 0 ? (
                    <EmptyState
                      title={t('rooms.emptyTitle')}
                      description={t('rooms.emptyHint')}
                      icon={<BuildingIcon size={24} />}
                    />
                  ) : (
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {entry.rooms.map((entryRoom, roomIndex) => (
                        <li
                          key={entryRoom.id}
                          className={`${staggerClass(roomIndex)} ui-card flex flex-col gap-2 rounded-lg border border-card-border bg-card-muted px-3.5 py-3`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-[13.5px] font-medium text-ink">
                                {entryRoom.room}
                              </span>
                              <span className="truncate text-[12px] text-ink-tertiary">
                                {entryRoom.building}
                              </span>
                            </div>
                            <span className="flex shrink-0 flex-col items-end">
                              <span className="font-display text-[15px] leading-none font-semibold tabular-nums text-ink">
                                {entryRoom.capacity}
                              </span>
                              <span className="mt-0.5 text-[10.5px] text-ink-tertiary">
                                {t('rooms.seats')}
                              </span>
                            </span>
                          </div>
                          <span
                            className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              entryRoom.sessionsPlanned > 0
                                ? 'bg-accent-tint text-accent'
                                : 'bg-card text-ink-tertiary'
                            }`}
                          >
                            {t('rooms.booked', { count: entryRoom.sessionsPlanned })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <Drawer
        open={drawerSite !== null}
        onClose={closeDrawer}
        title={t('rooms.drawerTitle')}
        subtitle={drawerSite ? t('rooms.drawerSubtitle', { site: drawerSite }) : undefined}
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
        <div className="flex flex-col gap-4">
          <Field label={t('rooms.buildingLabel')} hint={t('rooms.buildingHint')}>
            <input
              type="text"
              list="settings-buildings"
              value={building}
              autoFocus
              placeholder={t('rooms.buildingPlaceholder')}
              onChange={(event) => setBuilding(event.target.value)}
              className={INPUT_CLASS}
            />
            <datalist id="settings-buildings">
              {buildings.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>

          <Field label={t('rooms.roomLabel')}>
            <input
              type="text"
              value={room}
              placeholder={t('rooms.roomPlaceholder')}
              onChange={(event) => setRoom(event.target.value)}
              className={INPUT_CLASS}
            />
          </Field>

          <Field label={tCommon('labels.capacity')} hint={t('rooms.capacityHint')}>
            <input
              type="number"
              min={1}
              max={300}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              className={`${INPUT_CLASS} font-display font-medium tabular-nums`}
            />
          </Field>
        </div>
      </Drawer>
    </SettingsSection>
  );
}

const INPUT_CLASS =
  'h-11 w-full rounded-lg border border-card-border bg-card px-3 text-[13.5px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-[12px] text-ink-tertiary">{hint}</span> : null}
    </label>
  );
}
