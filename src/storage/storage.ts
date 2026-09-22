// Everything that talks to localStorage lives here: the bookmark list,
// the notes, and reading the saved hypothesis draft back out.

import state from "../state/state.js";

export interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
const STORAGE_KEY_NOTES = "remotion_notes";
// saveHypothesis (in the workspace view) still writes with this key, so it
// has to be exported.
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

export function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    // JSON.parse's return type is genuinely `any` - it can't know the shape
    // of whatever string it's given. Asserting it here (rather than
    // upgrading it to a real type) is honest about that: this is a trust
    // boundary with data this same app wrote, not a validated shape.
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    state.bookmarks = Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

export function saveNoteForEvidence(evidenceId: string, text: string) {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId: string) {
  return state.notesStore[evidenceId] || "";
}

export function loadNotesFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }

  state.notesStore = JSON.parse(raw) as Record<string, string>;
}

export function loadNoteAsync(evidenceId: string): Promise<string> {
  return new Promise(function (resolve) {
    resolve(state.notesStore[evidenceId] || "");
  });
}

// Just the read + parse. Filling in the form fields with the result is the
// workspace view's job, not this file's.
export function readHypothesisFromStorage(): HypothesisDraft | undefined {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return undefined;
  return JSON.parse(raw) as HypothesisDraft;
}
