// Hand-written shadow declaration for the still-.js state.js (converting it
// for real is Demo 7's job). This exists only so data.ts's typed loads have
// somewhere real to land instead of widening straight back to `any`.
import type { CaseInfo, Person, Location, Evidence, TimelineEvent } from "../types.js";

interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: string;
  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  caseData: CaseInfo;
  viewRendered: Record<string, boolean>;
  notesStore: Record<string, string>;
}

declare const state: AppState;
export default state;
