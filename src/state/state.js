// Everything in here is state that more than one module needs to read or
// write. It's one object exported as the default, so every module that
// imports it points at the same thing - when one module does
// state.allEvidence = data, all the others see it too.
//
// State that only one module ever touches does NOT live here. That stuff
// stays local to the module that uses it.

export default {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},

  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false
  },

  notesStore: {}
};
