import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "./storage/storage.js";
import { loadAllData } from "./data/data.js";
import { navigateTo, handleHashChange } from "./navigation/navigation.js";
import { switchPeopleTab } from "./views/people.js";
import { renderTimeline } from "./views/timeline.js";
import { saveHypothesis } from "./views/workspace.js";
import {
  renderEvidenceList,
  handleSortChange,
  clearFilters,
  handleSearchInput,
  closeEvidenceDetail,
  saveCurrentNote,
} from "./views/evidence.js";

// ---------------------------------------------------------------------
// EVENT LISTENER SETUP
// ---------------------------------------------------------------------

function setupEventListeners() {
  const navButtons = document.querySelectorAll(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  document.getElementById("evidenceSearch")!.addEventListener("input", handleSearchInput);

  document.getElementById("filterType")!.addEventListener("change", renderEvidenceList);
  document.getElementById("filterPerson")!.addEventListener("change", renderEvidenceList);
  document.getElementById("filterLocation")!.addEventListener("change", renderEvidenceList);

  document.getElementById("filterStatus")!.addEventListener("change", renderEvidenceList);

  document.getElementById("filterRelevance")!.addEventListener("change", renderEvidenceList);

  document.getElementById("clearFiltersBtn")!.addEventListener("click", clearFilters);

  document.getElementById("timelineOrder")!.addEventListener("change", renderTimeline);
  document.getElementById("timelinePersonFilter")!.addEventListener("change", renderTimeline);
  document.getElementById("timelineLocationFilter")!.addEventListener("change", renderTimeline);
  document.getElementById("timelineTypeFilter")!.addEventListener("change", renderTimeline);

  document.getElementById("hypConfidence")!.addEventListener("input", (e) => {
    document.getElementById("hypConfidenceValue")!.textContent = (
      e.target as HTMLInputElement
    ).value;
  });
}

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    loadNoteAsync("E01").then(function (firstNote) {
      console.log("First note preview:", firstNote);
    });
  });
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);

// These functions get put on window because index.html still calls them
// directly from onclick attributes and modules don't expose functions
// globally like the old plain script did. The Window type doesn't know
// about them by default, so this needs a global augmentation - the
// alternative would be casting every assignment to `window as any`, which
// would also silence typos in these exact property names.
declare global {
  interface Window {
    navigateTo: typeof navigateTo;
    handleSortChange: typeof handleSortChange;
    switchPeopleTab: typeof switchPeopleTab;
    saveHypothesis: typeof saveHypothesis;
    closeEvidenceDetail: typeof closeEvidenceDetail;
    saveCurrentNote: typeof saveCurrentNote;
  }
}

window.navigateTo = navigateTo;
window.handleSortChange = handleSortChange;
window.switchPeopleTab = switchPeopleTab;
window.saveHypothesis = saveHypothesis;
window.closeEvidenceDetail = closeEvidenceDetail;
window.saveCurrentNote = saveCurrentNote;
