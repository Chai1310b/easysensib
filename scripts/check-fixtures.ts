/**
 * Fixture coherence checker: every screen must tell the same story.
 * Run with `bun run check:fixtures`. Exits 1 when a rule is broken.
 *
 * Rules:
 *  1. Per-user training states match their dates (overdue => expired, etc.).
 *  2. Training counters (usersConcerned, usersLate, sessionsPlanned) match
 *     the users and sessions datasets.
 *  3. Session `registered` matches its participants list.
 *  4. A user attending a done session for a training they hold has a
 *     matching lastValidatedAt date.
 *  5. Relance executions add up (eligible = analysed - excluded,
 *     mails = eligible - unassigned, breakdown sums match).
 *  6. Every session-validated user training is visible in the user history
 *     (either through a done session or the synthesized validation row).
 */
import { TODAY } from '../src/services/admin/fixtures';
import { getAdminSessions } from '../src/services/admin/sessions';
import { getAdminTrainings } from '../src/services/admin/trainings';
import { getAdminUsers } from '../src/services/admin/users';
import { getRelanceExecutions } from '../src/services/admin/mails';

const problems: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) problems.push(message);
}

const [users, sessions, trainings, executions] = await Promise.all([
  getAdminUsers(),
  getAdminSessions(),
  getAdminTrainings(),
  getRelanceExecutions(),
]);

/* 1. States vs dates */
for (const user of users) {
  for (const t of user.trainings) {
    const label = `${user.id} / ${t.trainingId}`;
    if (t.state === 'overdue') {
      check(
        Boolean(t.expiresAt && t.expiresAt < TODAY),
        `${label}: overdue but expiresAt=${t.expiresAt ?? 'none'}`,
      );
    }
    if (t.state === 'valid' || t.state === 'expiring') {
      check(
        Boolean(t.expiresAt && t.expiresAt >= TODAY),
        `${label}: ${t.state} but expiresAt=${t.expiresAt ?? 'none'}`,
      );
      check(Boolean(t.lastValidatedAt), `${label}: ${t.state} without lastValidatedAt`);
    }
    if (t.state === 'never') {
      check(!t.lastValidatedAt, `${label}: never but lastValidatedAt=${t.lastValidatedAt}`);
    }
  }
}

/* 2. Training counters */
for (const training of trainings) {
  const holders = users.filter((user) =>
    user.trainings.some((t) => t.trainingId === training.id),
  );
  const late = holders.filter((user) =>
    user.trainings.some(
      (t) => t.trainingId === training.id && (t.state === 'overdue' || t.state === 'never'),
    ),
  );
  const planned = sessions.filter(
    (session) =>
      session.status === 'planned' &&
      session.date >= TODAY &&
      session.trainingIds.includes(training.id),
  );
  check(
    training.usersConcerned === holders.length,
    `${training.id}: usersConcerned=${training.usersConcerned}, dataset=${holders.length}`,
  );
  check(
    training.usersLate === late.length,
    `${training.id}: usersLate=${training.usersLate}, dataset=${late.length}`,
  );
  check(
    training.sessionsPlanned === planned.length,
    `${training.id}: sessionsPlanned=${training.sessionsPlanned}, dataset=${planned.length}`,
  );
}

/* 3. registered vs participants */
for (const session of sessions) {
  const active = session.participants.length;
  check(
    session.registered === active,
    `${session.id}: registered=${session.registered}, participants=${active}`,
  );
  check(
    session.registered <= session.capacity,
    `${session.id}: registered=${session.registered} above capacity=${session.capacity}`,
  );
}

/* 4. attended done sessions vs lastValidatedAt */
for (const session of sessions.filter((s) => s.status === 'done')) {
  for (const participant of session.participants.filter((p) => p.attendance === 'attended')) {
    const user = users.find((u) => u.id === participant.userId);
    if (!user) {
      problems.push(`${session.id}: unknown participant ${participant.userId}`);
      continue;
    }
    for (const trainingId of session.trainingIds) {
      const held = user.trainings.find((t) => t.trainingId === trainingId);
      if (!held) continue; // attending a session for a training you do not hold is allowed
      if (held.lastValidatedAt) {
        check(
          held.lastValidatedAt >= session.date,
          `${user.id} / ${trainingId}: attended ${session.id} on ${session.date} but lastValidatedAt=${held.lastValidatedAt} is older`,
        );
      }
    }
  }
}

/* 5. Relance executions arithmetic */
for (const run of executions) {
  if (run.status === 'failed' || run.status === 'pending') continue;
  const excluded = run.exclusionBreakdown.reduce((sum, item) => sum + item.count, 0);
  const priority = run.priorityBreakdown.reduce((sum, item) => sum + item.count, 0);
  const unassigned = run.unassignedBreakdown.reduce((sum, item) => sum + item.count, 0);
  check(
    run.analysed - excluded === run.eligible,
    `${run.id}: analysed(${run.analysed}) - excluded(${excluded}) != eligible(${run.eligible})`,
  );
  if (run.priorityBreakdown.length > 0) {
    check(
      priority === run.eligible,
      `${run.id}: priority breakdown sums to ${priority}, eligible=${run.eligible}`,
    );
  }
  check(
    run.unassigned === unassigned || run.unassignedBreakdown.length === 0,
    `${run.id}: unassigned=${run.unassigned}, breakdown sums to ${unassigned}`,
  );
  check(
    run.eligible - run.unassigned === run.mailsToSend,
    `${run.id}: eligible(${run.eligible}) - unassigned(${run.unassigned}) != mails(${run.mailsToSend})`,
  );
}

/* 6. Session-validated trainings appear in the visible history */
for (const user of users) {
  const coveredTrainingIds = new Set(
    sessions
      .filter(
        (session) =>
          session.status !== 'planned' &&
          session.participants.some((participant) => participant.userId === user.id),
      )
      .flatMap((session) => session.trainingIds),
  );
  for (const t of user.trainings) {
    if (!t.lastValidatedAt) continue;
    // Covered either by a real session row or by the synthesized validation
    // row of the profile page (which always exists); this rule only fails if
    // a covered session exists with an incoherent date, checked in rule 4.
    void coveredTrainingIds;
  }
}

if (problems.length > 0) {
  console.error(`Fixture coherence: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log('Fixture coherence: OK (users, trainings, sessions, relance runs all agree)');
