// Loads everything the React app needs before it starts.
// This is the only place that knows WHERE the data comes from. When the
// JSON files get replaced by a backend later, only this file has to change.

import type { CaseInfo, Evidence, Location, Person, TimelineEvent } from "../types";

export type CaseData = {
  caseInfo: CaseInfo;
  evidence: Evidence[];
  people: Person[];
  locations: Location[];
  timeline: TimelineEvent[];
  bookmarks: string[];
};

async function fetchJson(fileName: string): Promise<unknown> {
  // BASE_URL so this also works under /mystery-road-awe-2026/ on GitHub Pages
  const response = await fetch(import.meta.env.BASE_URL + "data/" + fileName);
  if (!response.ok) {
    throw new Error("Could not load " + fileName);
  }
  return response.json();
}

// Same localStorage key the vanilla app writes to. Only read here, never written.
function readBookmarks(): string[] {
  try {
    const raw = localStorage.getItem("remotion_bookmarks");
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function loadCaseData(): Promise<CaseData> {
  // The "as" casts trust that the JSON files have the shapes from types.ts.
  // Nothing checks this at runtime.
  const caseInfo = (await fetchJson("case.json")) as CaseInfo;
  const evidence = (await fetchJson("evidence.json")) as Evidence[];
  const people = (await fetchJson("people.json")) as Person[];
  const locations = (await fetchJson("locations.json")) as Location[];
  const timeline = (await fetchJson("timeline.json")) as TimelineEvent[];

  return {
    caseInfo: caseInfo,
    evidence: evidence,
    people: people,
    locations: locations,
    timeline: timeline,
    bookmarks: readBookmarks(),
  };
}
