// Domain types for the case data in public/data/*.json. Shapes are taken
// directly from the actual JSON, not from what the app "should" contain -
// see the personIds note on Evidence for a field the real data doesn't
// keep consistent.

export type PersonId = string;
export type LocationId = string;
export type EvidenceId = string;

export interface CaseInfo {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}

export interface Person {
  id: PersonId;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  contains: string[];
}

export interface Evidence {
  id: EvidenceId;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  content: string;
  // Meant to hold Person ids, but the real data isn't consistent about it -
  // e.g. evidence E04 uses the display name "Nova Byte" while E05 uses the
  // id "nova-byte" for the same person. Typed as PersonId (= string) since
  // that's the intent, but this alone can't stop that inconsistency; see
  // the Demo 6 write-up in CHANGES.md.
  personIds: PersonId[];
  locationIds: LocationId[];
  tags: string[];
  // Real values include both "unreviewed"/"Reviewed" and
  // "unknown"/"Unknown" - casing isn't consistent in the source data, so
  // this stays a plain string rather than a strict literal union that the
  // actual JSON would violate. Case-insensitive comparisons are done at the
  // call site (see utils/format.ts).
  status: string;
  relevance: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: string;
  personIds: PersonId[];
  locationIds: LocationId[];
  evidenceIds: EvidenceId[];
}
