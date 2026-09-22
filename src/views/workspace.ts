// The Workspace tab: the bookmarked-evidence list, the notes list, and
// the hypothesis draft form (its dropdowns, saving, and re-filling the
// fields from a previously saved draft).

import state from "../state/state.js";
import { navigateTo } from "../navigation/navigation.js";
import { openEvidenceDetail } from "./evidence.js";
import {
  readHypothesisFromStorage,
  STORAGE_KEY_HYPOTHESIS,
  type HypothesisDraft,
} from "../storage/storage.js";

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList() {
  const container = document.getElementById("bookmarksList");
  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll("[data-open-evidence]");
  for (let b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e) {
      navigateTo("evidence");
      const id = (e.target as HTMLElement).getAttribute("data-open-evidence");
      setTimeout(function () {
        if (id) openEvidenceDetail(id);
      }, 0);
    });
  }
}

interface NoteEntry {
  index: number;
  evidenceId: string;
  title: string;
  text: string;
}

function renderNotesList() {
  const container = document.getElementById("notesList");
  if (!container) return;

  const noteEntries: NoteEntry[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>"; // unsafe innerHTML rendering, same as the note preview
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns() {
  const suspectSelect = document.getElementById("hypSuspect") as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement | null;
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  let suspectHtml = '<option value="">Select a person…</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    suspectHtml +=
      '<option value="' + state.allPeople[p].id + '">' + state.allPeople[p].name + "</option>";
  }
  suspectSelect.innerHTML = suspectHtml;
  suspectSelect.value = currentSuspect;

  let evidenceHtml = "";
  for (let i = 0; i < state.allEvidence.length; i++) {
    evidenceHtml +=
      '<option value="' +
      state.allEvidence[i].id +
      '">' +
      state.allEvidence[i].id +
      " - " +
      state.allEvidence[i].title +
      "</option>";
  }
  evidenceSelect.innerHTML = evidenceHtml;
}

export function saveHypothesis() {
  const draft: HypothesisDraft = {
    suspectId: (document.getElementById("hypSuspect") as HTMLSelectElement).value,
    nature: (document.getElementById("hypNature") as HTMLSelectElement).value,
    evidenceIds: getSelectedOptions(document.getElementById("hypEvidence") as HTMLSelectElement),
    confidence: (document.getElementById("hypConfidence") as HTMLInputElement).value,
    explanation: (document.getElementById("hypExplanation") as HTMLTextAreaElement).value,
    alternative: (document.getElementById("hypAlternative") as HTMLTextAreaElement).value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg")!;
  msg.classList.remove("hidden");
  setTimeout(function () {
    msg.classList.add("hidden");
  }, 2000);
}

function getSelectedOptions(selectEl: HTMLSelectElement): string[] {
  const result: string[] = [];
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

// The read + parse is in storage.js. This half takes the draft it returns
// and drops the values back into the five form fields.
function loadHypothesisFromStorage() {
  const draft = readHypothesisFromStorage();
  if (draft === undefined) return;

  (document.getElementById("hypSuspect") as HTMLSelectElement).value = draft.suspectId || "";
  (document.getElementById("hypNature") as HTMLSelectElement).value = draft.nature || "";
  // confidence is a string (see HypothesisDraft) - the fallback used to be
  // the number 50, which happened to work at runtime (the DOM coerces it to
  // "50" when assigned to .value/.textContent) but is a real type mismatch
  // TS correctly flags. Using the string "50" is the same value, honestly
  // typed.
  (document.getElementById("hypConfidence") as HTMLInputElement).value = draft.confidence || "50";
  document.getElementById("hypConfidenceValue")!.textContent = draft.confidence || "50";
  (document.getElementById("hypExplanation") as HTMLTextAreaElement).value =
    draft.explanation || "";
  (document.getElementById("hypAlternative") as HTMLTextAreaElement).value =
    draft.alternative || "";

  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement;
  const savedIds = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected = savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
  }
}
