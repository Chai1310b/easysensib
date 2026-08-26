/**
 * Administration settings service (referentials of the manager space).
 *
 * Backend switch point: only the function bodies change once the API exists.
 * Counters are DERIVED from the shared fixtures so every screen agrees:
 * a business line knows how many trainings and future sessions it carries,
 * a room knows how many future sessions are booked in it, a session tag
 * knows how many sessions already use it.
 *
 * The room referential is the only raw data owned by this service: rooms are
 * an open point of the target model (see docs/open-questions.md), so it stays
 * deliberately simple, site + building + room + capacity.
 */
import type { Site, TrainingCategory } from '@/lib/admin-types';
import { getAdminSessions, getCommonTags, getUpcomingSessions } from './sessions';
import { getAdminTrainings, getTrainingCategories } from './trainings';

/* ------------------------------------------------------------------ */
/* Business lines ("filieres")                                         */
/* ------------------------------------------------------------------ */

export interface CategoryReference {
  category: TrainingCategory;
  /** Trainings carrying this business line. */
  trainings: number;
  /** Future sessions validating at least one training of this line. */
  sessionsPlanned: number;
  /** Users concerned by at least one training of this line. */
  usersConcerned: number;
}

/** Business lines with the volume they carry, ordered by the closed list. */
export async function getCategoryReferences(): Promise<CategoryReference[]> {
  const [categories, trainings, upcoming] = await Promise.all([
    getTrainingCategories(),
    getAdminTrainings(),
    getUpcomingSessions(),
  ]);

  return categories.map((category) => {
    const ofCategory = trainings.filter((training) => training.category === category);
    const ids = new Set(ofCategory.map((training) => training.id));

    return {
      category,
      trainings: ofCategory.length,
      sessionsPlanned: upcoming.filter((session) => session.trainingIds.some((id) => ids.has(id)))
        .length,
      usersConcerned: ofCategory.reduce((sum, training) => sum + training.usersConcerned, 0),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Session tags                                                        */
/* ------------------------------------------------------------------ */

export interface SessionTagReference {
  tag: string;
  /** Sessions already carrying this tag, all statuses. */
  sessions: number;
}

/** Common tag referential, with how many sessions already use each tag. */
export async function getSessionTagReferences(): Promise<SessionTagReference[]> {
  const [tags, sessions] = await Promise.all([getCommonTags(), getAdminSessions()]);

  return tags.map((tag) => ({
    tag,
    sessions: sessions.filter((session) => session.tags.includes(tag)).length,
  }));
}

/* ------------------------------------------------------------------ */
/* Sites and rooms                                                     */
/* ------------------------------------------------------------------ */

export interface Room {
  id: string;
  site: Site;
  building: string;
  room: string;
  /** Seats available in the room. */
  capacity: number;
}

export interface RoomReference extends Room {
  /** Future sessions booked in this room. */
  sessionsPlanned: number;
}

export interface SiteRooms {
  site: Site;
  rooms: RoomReference[];
  /** Sum of the room capacities of the site. */
  totalCapacity: number;
}

/** Raw room referential. Rooms used by the session fixtures are listed first. */
const ROOMS: Room[] = [
  { id: 'r-cholet-a12', site: 'Cholet', building: 'Bât. A', room: 'Salle 12', capacity: 18 },
  {
    id: 'r-cholet-apoly',
    site: 'Cholet',
    building: 'Bât. A',
    room: 'Salle polyvalente',
    capacity: 24,
  },
  { id: 'r-cholet-c3', site: 'Cholet', building: 'Bât. C', room: 'Salle 3', capacity: 30 },
  { id: 'r-cholet-feu', site: 'Cholet', building: 'Extérieur', room: 'Aire de feu', capacity: 20 },
  {
    id: 'r-genn-s105',
    site: 'Gennevilliers',
    building: 'Bât. Seine',
    room: 'Salle 105',
    capacity: 20,
  },
  {
    id: 'r-genn-s210',
    site: 'Gennevilliers',
    building: 'Bât. Seine',
    room: 'Salle 210',
    capacity: 12,
  },
  {
    id: 'r-genn-ouest',
    site: 'Gennevilliers',
    building: 'Bât. Ouest',
    room: 'Salle de formation',
    capacity: 24,
  },
  { id: 'r-meri-n7', site: 'Mérignac', building: 'Bât. Nord', room: 'Salle 7', capacity: 16 },
  { id: 'r-meri-audi', site: 'Mérignac', building: 'Bât. Nord', room: 'Auditorium', capacity: 60 },
];

/** Rooms grouped by site, with the number of future sessions booked in each. */
export async function getSiteRooms(): Promise<SiteRooms[]> {
  const upcoming = await getUpcomingSessions();

  const references: RoomReference[] = ROOMS.map((room) => ({
    ...room,
    sessionsPlanned: upcoming.filter(
      (session) =>
        session.site === room.site &&
        session.location?.building === room.building &&
        session.location?.room === room.room,
    ).length,
  }));

  const sites = [...new Set(ROOMS.map((room) => room.site))];

  return sites.map((site) => {
    const rooms = references.filter((room) => room.site === site);
    return {
      site,
      rooms,
      totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
    };
  });
}
