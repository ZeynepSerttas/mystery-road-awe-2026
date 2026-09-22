// Everything in here is state that more than one module needs to read or
// write. It's one object exported as the default, so every module that
// imports it points at the same thing - when one module does
// state.allEvidence = data, all the others see it too.
//
// State that only one module ever touches does NOT live here. That stuff
// stays local to the module that uses it.

import type { CaseInfo, Person, Location, Evidence, TimelineEvent, ViewName } from "../types.js";

interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: ViewName;

  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  caseData: CaseInfo;

  viewRendered: Record<ViewName, boolean>;

  notesStore: Record<string, string>;
}

const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  // Not loaded yet at startup - loadAllData() fills this in. Every read
  // site already falls back gracefully (e.g. caseData.title || "Case"),
  // so an intentionally-incomplete starting value is safe here.
  caseData: {} as CaseInfo,

  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false,
  },

  notesStore: {},
};

export default state;
