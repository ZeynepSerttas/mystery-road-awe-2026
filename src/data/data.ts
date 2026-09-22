// Loads the JSON files and drops the results into state, then kicks off
// the first renders. Still loads the four files one after another rather
// than in parallel - that's on purpose for now, a later exercise deals
// with it.

import state from "../state/state.js";
import { renderDashboard } from "../views/dashboard.js";
import {
  populateEvidenceDropdowns,
  renderEvidenceList,
  applyStoredBookmarkFlags,
  markEvidenceLoaded,
} from "../views/evidence.js";
import { populateTimelineDropdowns, renderTimeline } from "../views/timeline.js";
import { populateHypothesisDropdowns } from "../views/workspace.js";
import type { CaseInfo, Person, Location, Evidence, TimelineEvent } from "../types.js";

// Only the loaders touch this, so it stays here.
let loadingStepsRemaining = 2;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

function populateAllDropdowns() {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function showLoadingOverlay(msg: string) {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

function hideLoadingStep() {
  loadingStepsRemaining--;
  if (loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

async function loadCorePeopleAndLocations() {
  state.caseData = await getJson<CaseInfo>("data/case.json");
  state.allPeople = await getJson<Person[]>("data/people.json");
  state.allLocations = await getJson<Location[]>("data/locations.json");

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

function loadEvidenceData() {
  getJson<Evidence[]>("data/evidence.json")
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
    state.allTimeline = await getJson<TimelineEvent[]>("data/timeline.json");
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
