// Find things by id in the loaded data. These read from state but don't
// change anything.

import state from "../state/state.js";
import type { Evidence, Person, Location } from "../types.js";

export function findEvidenceById(id: string): Evidence | null {
  const list = state.allEvidence as Evidence[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findPersonById(id: string): Person | null {
  const list = state.allPeople as Person[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findLocationById(id: string): Location | null {
  const list = state.allLocations as Location[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

// personIds is typed as PersonId[] (see types.ts), meaning it's meant to
// hold only ids - but the real data doesn't keep that promise (evidence E04
// has the display name "Nova Byte" instead of "nova-byte"), so this still
// has to check both id and name to actually find every match.
export function evidenceMentionsPerson(ev: Evidence, person: Person): boolean {
  if (!ev.personIds) return false;
  return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
}
