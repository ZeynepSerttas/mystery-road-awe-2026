// URL-hash routing. navigateTo just sets the hash; handleHashChange is
// the hashchange listener that actually swaps the visible view and
// renders it the first time it's shown.

import state from "../state/state.js";
import { renderDashboard } from "../views/dashboard.js";
import { renderEvidenceList } from "../views/evidence.js";
import { renderPeople, renderLocations } from "../views/people.js";
import { renderTimeline } from "../views/timeline.js";
import { renderWorkspace } from "../views/workspace.js";
import type { ViewName } from "../types.js";

export function navigateTo(viewName: ViewName) {
  window.location.hash = viewName;
  // handleHashChange() will pick this up via the hashchange listener
}

export function handleHashChange() {
  const rawHash = window.location.hash.replace("#", "");
  const validViews: ViewName[] = ["dashboard", "evidence", "people", "timeline", "workspace"];
  const hash: ViewName = (validViews as string[]).includes(rawHash)
    ? (rawHash as ViewName)
    : "dashboard";
  state.currentPage = hash;

  const sections = document.querySelectorAll(".view");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }
  // getElementById can genuinely return null (typo, missing element), so
  // unlike the static-id lookups elsewhere in this file this one gets a
  // real check instead of a "!" assertion - the compiler was right to flag
  // this, "view-" + hash isn't a literal the way "dashboardContent" is.
  const targetSection = document.getElementById("view-" + hash);
  if (targetSection) targetSection.classList.add("active");

  const navButtons = document.querySelectorAll(".nav-btn");
  for (let n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

  if (hash === "dashboard" && !state.viewRendered.dashboard) {
    renderDashboard();
    state.viewRendered.dashboard = true;
  } else if (hash === "evidence" && !state.viewRendered.evidence) {
    renderEvidenceList();
    state.viewRendered.evidence = true;
  } else if (hash === "people" && !state.viewRendered.people) {
    renderPeople();
    renderLocations();
    state.viewRendered.people = true;
  } else if (hash === "timeline" && !state.viewRendered.timeline) {
    renderTimeline();
    state.viewRendered.timeline = true;
  } else if (hash === "workspace") {
    // workspace is cheap enough that it always re-renders
    renderWorkspace();
  }
}
