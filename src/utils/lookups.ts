// Find things by id in the loaded data. These read from state but don't
// change anything.

import state from "../state/state.js";

// Narrow local shapes for just the fields these lookups touch. Demo 6 gives
// the case's data model real, shared types - this is a deliberately small
// first pass so this file doesn't have to guess at that work early.
interface WithId {
  id: string;
}

interface EvidenceLike extends WithId {
  personIds?: string[];
}

interface PersonLike extends WithId {
  name: string;
}

export function findEvidenceById(id: string): EvidenceLike | null {
  const list = state.allEvidence as EvidenceLike[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findPersonById(id: string): PersonLike | null {
  const list = state.allPeople as PersonLike[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function findLocationById(id: string): WithId | null {
  const list = state.allLocations as WithId[];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

export function evidenceMentionsPerson(ev: EvidenceLike, person: PersonLike): boolean {
  if (!ev.personIds) return false;
  return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
}
