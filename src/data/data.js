// Loads the JSON files and drops the results into state, then kicks off
// the first renders. Still loads the four files one after another rather
// than in parallel - that's on purpose for now, a later exercise deals
// with it.

import state from "../state/state.js";
import { renderDashboard } from "../views/dashboard.js";
import { populateEvidenceDropdowns, renderEvidenceList, applyStoredBookmarkFlags, markEvidenceLoaded } from "../views/evidence.js";
import { populateTimelineDropdowns, renderTimeline } from "../views/timeline.js";
import { populateHypothesisDropdowns } from "../views/workspace.js";

// Only the loaders touch this, so it stays here.
var loadingStepsRemaining = 2;

// This calls into three of the view modules. It's a deliberate small
// shortcut - the alternative was some event-bus thing and that's overkill
// for a demo.
function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function showLoadingOverlay(msg) {
  var overlay = document.getElementById("loadingOverlay");
  var text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

function hideLoadingStep() {
  loadingStepsRemaining--;
  if (loadingStepsRemaining <= 0) {
    var overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

async function loadCorePeopleAndLocations() {
  const caseRes = await fetch("data/case.json");
  const caseJson = await caseRes.json();
  state.caseData = caseJson;

  const peopleRes = await fetch("data/people.json");
  const peopleJson = await peopleRes.json();
  state.allPeople = peopleJson;

  const locationsRes = await fetch("data/locations.json");
  const locationsJson = await locationsRes.json();
  state.allLocations = locationsJson;

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

function loadEvidenceData() {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allEvidence = data;
      applyStoredBookmarkFlags();
      state.filteredEvidence = state.allEvidence.slice();
      markEvidenceLoaded();
      renderDashboard();
      populateAllDropdowns();
      if (state.currentPage === "evidence") renderEvidenceList();
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

async function loadTimelineData() {
  try {
    const res = await fetch("data/timeline.json");
    const data = await res.json();
    state.allTimeline = data;
    renderDashboard();
    if (state.currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export function loadAllData() {
  showLoadingOverlay("Loading case file…");
  loadingStepsRemaining = 2;
  return loadCorePeopleAndLocations().then(function () {
    loadEvidenceData();
    loadTimelineData();
  });
}
