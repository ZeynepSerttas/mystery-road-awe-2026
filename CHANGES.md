DEMO 1

For demo 1 i split app.js into separate js modules using type="module", no bundler or build step, just plain files loaded directly by the browser. its a pure refactor, not fixing any bugs or adding anything, the app has to work exactly the same before and after, i checked this in live server after every phase.

i split it into: main.js as the entry point (wires up the event listeners and starts everything), state.js which holds all the state that more than one file needs to know about, navigation.js for the url routing, data.js for the fetch calls, storage.js for everything that touches localStorage, two small utils files for pure helper functions, and one file per page (dashboard, evidence, people, timeline, workspace) for their rendering code. stuff that was only used by one file i just kept local to that file instead of putting it in state.js.

index.html still has old inline onclick attributes and since modules dont expose their functions globally anymore, i had to manually put the ones it needs onto window inside main.js so they still work without touching the html.

theres also a few things i noticed are actually broken (the evidence list gets stuck loading forever, filteredEvidence being literally the same array as allEvidence, hashchange getting registered twice and the json files loading one after another instead of together) that im intentionally not fixing right now because i think i need at least some of these for the later demos.

one thing i did out of the planned order: navigateTo was meant to move into navigation.js at the end together with handleHashChange, but the people, timeline and workspace views all call navigateTo, and i didnt want those view files importing from main.js even temporarily just to get it. so i moved navigateTo into navigation.js first, on its own commit, and left handleHashChange in main.js until the navigation phase like planned.


DEMO 9

for demo 9 i converted two of the loader functions in data.js from .then() chains to async/await. this is just a syntax change, the behaviour stays exactly the same.

loadCorePeopleAndLocations was the worst one, a pyramid of nested .then() callbacks going about six levels deep - fetch case.json, then parse it, then fetch people.json, then parse it, then fetch locations.json, then parse it and each step only started after the one before it finished. 


function loadCorePeopleAndLocations() {
  return fetch("data/case.json").then(function (caseRes) {           // 1. fetch case
    return caseRes.json().then(function (caseJson) {.                // 2. parse it
      caseData = caseJson;

      return fetch("data/people.json").then(function (peopleRes) {   // 3. fetch people
        return peopleRes.json().then(function (peopleJson) {.        // 4. parse it
          allPeople = peopleJson;

          return fetch("data/locations.json").then(function (locationsRes) { // 5. fetch locations
            return locationsRes.json().then(function (locationsJson) {      // 6. parse it
              allLocations = locationsJson;

              hideLoadingStep();
              renderDashboard();
              populateAllDropdowns();
            });
          });
        });
      });
    });
  });
}

now its flat: one await per line, same order. i also did not add a try/catch here, because the original had no error handling at this spot and i need that gap left as it is for a presentation question.

loadTimelineData was a .then().then().catch().finally() chain. now its a try/catch/finally that does the same thing in the same order - the two awaits (fetch, then .json()) and the three calls after go in the try, the catch keeps the same console.log("timeline load error", err) and still does not rethrow so the error is still swallowed, and the finally still calls hideLoadingStep().

the new local variables (caseRes, caseJson, peopleRes, peopleJson, locationsRes, locationsJson, res, data) are const, not var, since none of them ever get reassigned.


DEMO 3

demo 3 is an async bug: the evidence list is stuck on the loading spinner forever and never shows anything.

theres a flag called evidenceViewLoading that starts as true. renderEvidenceList checks it at the very top and returns early while its still true, showing the spinner and nothing else. the problem is nothing ever sets it back to false. loadEvidenceData does the fetch, saves the data into state, but never tells the evidence view that loading is finished, so that early return at the top of renderEvidenceList triggers every single time and the list never renders.

the fix: evidence.js now exports a small function markEvidenceLoaded() that sets the flag to false, and loadEvidenceData calls it in its .then callback right after it saves the data. so the flag gets cleared the moment the data actually arrives.

its an async bug because the thing that was supposed to happen once the fetch resolved - turning the loading flag off - was just never put in the callback.


DEMO 2

demo 2 is a reference vs copy bug. in loadEvidenceData theres a line state.filteredEvidence = state.allEvidence. that does not copy the array, it just makes filteredEvidence point at the exact same array object as allEvidence. so they are not two independent lists, they are one list with two names.

handleSortChange then does state.filteredEvidence.sort(...), which sorts the array in place. because filteredEvidence and allEvidence are the same array, sorting the "filtered view" also reorders the master list allEvidence. anything that reads allEvidence expecting its original load order (the dashboard "recent evidence" panel slices the end of allEvidence) is now wrong, and nothing ever puts the order back.

you can see it directly with a breakpoint: right after loadEvidenceData saves the data, state.filteredEvidence === state.allEvidence is true.

the fix is basically one word: state.filteredEvidence = state.allEvidence.slice() makes a real copy, so filtering or sorting the view can never touch the master list.

reference vs copy: assigning an array or object just copies the pointer to it - both variables end up referring to the same thing in memory, so a change made through one name is visible through the other. slice() with no arguments builds a brand new array with the same items in it, a separate object, so changes to it do not affect the original.


DEMO 4

demo 4 is a silent bug - nothing on the page looks wrong, you only see it in the console. after the app loads the console prints:

First note preview: Promise {<pending>}

instead of the actual note text. its in initApp. loadNoteAsync("E01") returns a promise, and the code does var firstNote = loadNoteAsync("E01") and then console.log("First note preview:", firstNote). so it logs the promise object itself, not the value inside it. the note string is in there, it just never gets unwrapped.

fix: call .then() on loadNoteAsync("E01") and do the console.log inside that callback, so it logs the resolved value.

nothing looked broken because this log line has no effect on the ui at all, its just a leftover debug line. but "a promise where you expected a string" is exactly the kind of thing that becomes a real bug the second someone actually uses that value for something.


DEMO 5

went through every view and used everything a few times, misused inputs, reloaded at odd points. found more bugs beyond demos 2-4. the one im presenting live is the timeline location one.

bug A - timeline shows "Location: [object Object]" (this is the one i present)
steps: open the timeline tab, look at any event that has a location.
expected: something like "L2 - Rehab Lab B".
actual: "Location: [object Object]".
root cause: in renderTimeline it calls findLocationById(...), which returns the whole location object, and then pushes that object straight into an array that later gets .join(", ")'d into the html. joining an array that contains an object turns the object into the string "[object Object]". the evidence detail view does this correctly (loc.id + " - " + loc.name), the timeline just forgot to pull the fields out.
fix: push evtLoc.id + " - " + evtLoc.name instead of evtLoc, same as the detail view. fall back to the raw id if the location isnt found.
verified: reload, timeline events now show the real location id and name.

bug B - the sort dropdown does nothing
steps: evidence tab, change the sort dropdown to Title A-Z or anything else.
expected: the cards reorder.
actual: order never changes.
root cause: handleSortChange sorts state.filteredEvidence, then immediately calls renderEvidenceList, which calls getFilteredEvidence, which rebuilds state.filteredEvidence from scratch by walking allEvidence in its original order. so the sort that just happened gets thrown away before anything is drawn.
fix: pull the sorting into its own function that sorts the freshly filtered results, and call it inside renderEvidenceList right after getFilteredEvidence. handleSortChange just calls renderEvidenceList now. side effect: the default "Newest first" option now actually gets applied on first render, so the initial order is by date instead of file order - which is what the dropdown said all along.
verified: change the dropdown, list reorders. change a filter, the sort sticks.

bug C - openEvidenceModal leaks a click listener every time it opens
steps: timeline tab, click a "View E.." button, close the modal, open another one. watch the console.
expected: one close handler on the modal.
actual: the console line "modal opened, active close listeners: N" keeps counting up, and the click handler runs once per previous open.
root cause: the modal element is created once and reused, but openEvidenceModal calls modal.addEventListener("click", function...) with a brand new function every time its opened. old listeners are never removed, so they stack.
fix: attach the click listener once, in the block that creates the modal. removed the modalCloseListenerCount counter and its console.log since they only existed to measure the leak.
verified: open/close the modal several times, console stays quiet, close and "open full evidence" each fire once.

bug E - #filterStatus triggers a double render
the status filter has both addEventListener("change", renderEvidenceList) and setAttribute("onchange", "renderEvidenceList()"), so changing it runs renderEvidenceList twice. not visibly broken because the render is idempotent, just wasteful. fix: drop the setAttribute line, keep the addEventListener. that also made window.renderEvidenceList dead (it only existed for that inline string), so that got removed too.

bug F - hashchange listener registered twice
setupEventListeners adds window.addEventListener("hashchange", handleHashChange) and main.js does the same again at the bottom. the browser dedupes identical listeners so it doesnt actually fire twice, but its confusing. fix: keep only the one at the bottom of main.js, remove the one in setupEventListeners.

bug D (found, being fixed in demo 8) - the nav button loop in setupEventListeners uses var i, and the click handler reads navButtons[i] after the loop has finished, so i is past the end of the array and navButtons[i] is undefined -> TypeError in the console on every nav click. the nav still works because the real navigation is the inline onclick. this is the var scoping example for demo 8.

bug G (documented, not fixed) - clearFilters resets the six filter fields but not the sort dropdown. and revisiting the workspace tab re-runs loadHypothesisFromStorage every time, so if you type something in the hypothesis form without saving and navigate away and back, your unsaved text is replaced with the last saved version.


DEMO 8

top level vars in the original app.js: allEvidence, filteredEvidence, selectedEvidence, bookmarks, currentPage, allPeople, allLocations, allTimeline, caseData, currentPeopleTab, loadingStepsRemaining, evidenceViewLoading, viewRendered, notesStore, modalCloseListenerCount, and the three STORAGE_KEY_ constants. plus latestSearchRequestId declared partway down the file.

three of them where a name clash would bite:
- allEvidence: it was a plain global, any function anywhere could read or write it. if two unrelated bits of code both used a variable called allEvidence theyd silently stomp on each other. the module split fixes this - its now a property on the state object in state.js, and a file only sees it if it imports state. nothing can touch it by accident from another file.
- currentPage: used by the router and also checked inside the data loaders (if currentPage === "evidence"). as a global, any stray assignment to a variable named currentPage would break routing. now its state.currentPage and only the files that import state can reach it.
- loadingStepsRemaining: a counter the loaders decrement. as a global it was one shared number with no owner. after the split it lives inside data.js as a module local (now a let), so nothing outside that file can even name it.

what the module split does NOT fully fix: files that import state still share one mutable object, so two functions in different files can still both write state.allEvidence and interfere. modules stop accidental clashes by name, they dont stop deliberate shared mutable state.

var -> const/let: went through every js file. loop counters (for (var i...)) became for (let i...). anything reassigned later became let - html strings that get built with +=, the hash variable in the router that falls back to "dashboard", counters like reviewedCount and count and loadingStepsRemaining, the flags evidenceViewLoading and latestSearchRequestId and currentPeopleTab, the events array in renderTimeline that gets replaced with a sorted copy, and modal which is reassigned if it doesnt exist yet. everything else - dom lookups, arrays that are only pushed into, single use locals - became const.

this also fixed a real bug (bug D from demo 5): setupEventListeners looped with for (var i...) and each click handler closed over i. by the time you clicked, the loop was done and i was navButtons.length, so navButtons[i] was undefined and .getAttribute threw a TypeError in the console on every nav click. with for (let i...) each iteration gets its own i, so each handler closes over the right one. this is exactly the kind of bug vars function scoping makes possible and let prevents.

code smells fixed:
1. building select options with innerHTML += inside a loop (populateEvidenceDropdowns, populateTimelineDropdowns, populateHypothesisDropdowns). every += re-serializes and re-parses the entire select. changed to building one string and assigning innerHTML once at the end.
2. handleSearchInput had .then(function (resolvedTerm) {...}) but never used resolvedTerm - the callback just re-reads the search box through renderEvidenceList. dropped the dead parameter.


DEMO 10

converted a few things to arrow functions.

statCardHTML in dashboard.js - it was function statCardHTML(value, label) { return '...' }. its a pure one-liner that just builds a string, no this, no arguments, so its a clean arrow with an implicit return: const statCardHTML = (value, label) => '...'.

statusOptionHTML in evidence.js - same idea, pure, builds an <option> string, three args in and a string out. became const statusOptionHTML = (current, value, label) => { ... }.

the hypConfidence slider listener in setupEventListeners - it was addEventListener("input", function (e) {...}), now (e) => {...}. it only ever uses e, never this, so nothing changes.

one i deliberately did NOT convert: handleHashChange in navigation.js. its an exported function declaration, and navigation.js sits in an import cycle with the view files (people, timeline and workspace all import navigateTo from it, and it imports their render functions). a function declaration is hoisted, so its binding exists the moment the module starts evaluating, even if another file in the cycle reaches for it early. a const arrow does not exist until its own line runs (temporal dead zone), so in a circular import it could be undefined at the wrong moment. keeping it a declaration is the safe choice, and it also just reads better as a named top-level function.

about this: a normal function gets its own this depending on how its called. an arrow has no this of its own, it uses the this from wherever it was written. thats why arrows are risky as object methods (this wont point at the object) but great as callbacks (this stays whatever it was in the surrounding code, no need to bind). none of the functions i converted touch this, so this was purely a style change, no behaviour difference at runtime.