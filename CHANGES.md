EXERCISE 1

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


EXERCISE 2

DEMO 1

a package manager is a tool that installs libraries/tools a project needs
and keeps track of exactly which version of each one is being used - so
everyone working on the project gets the identical setup, not just
"whatever i happened to download".

picked npm over pnpm because npm is already installed, nothing extra to set
up, and this exercise has a hard time limit. didnt want to burn time
installing a second package manager just to use it once.

ran npm init. filled in a real name/description/repo url instead of the
placeholder values it gives you by default. set "type": "module" since the
app already runs as es modules. set "private": true so this can never
accidentally get published to the npm registry - its just course work.

added node_modules/ and dist/ to .gitignore. dist/ doesnt exist yet (thats
demo 3) but no reason to wait.

installed vite as the one real dependency, as a devDependency since its a
build tool, not something the live app needs at runtime. this also covers
demo 2s first task since i need vite there anyway. npm install created
package-lock.json, committed that alongside package.json.

how i tested this myself:
ran npm install and checked git status right after - package-lock.json
showed up as a new file ready to commit, but node_modules/ never showed up
at all, which confirms .gitignore is actually working and not just sitting
there unused. also opened package.json in vscode to confirm the real
name/description actually ended up there instead of npm inits placeholder
text.

q: what problem does a package manager actually solve that just downloading
a library yourself doesnt?
if i download a library myself, i dont know what version im on, i dont get
its own dependencies automatically, and a teammate might end up with a
different copy with no way to compare. npm handles all of that: it installs
the right versions of everything (including dependencies of dependencies),
and makes sure everyone gets the exact same install with one command.
updating a version later is also just one line instead of manually
redownloading files.

q: whats the difference between dependencies and devDependencies? which one
do vite/linter/typescript belong in?
dependencies are things the app actually needs when its running, in the
browser. devDependencies are tools only needed while building or developing
- they never get shipped. vite, the linter, and typescript are all
devDependencies: vite turns everything into plain js/css/html before it
ships, typescript gets removed at build time, and the linter never touches
the browser at all. right now this project has zero real dependencies -
its just plain js/html/css.

q: what is a lockfile for, and what could go wrong without it?
package.json usually allows a range of versions, not one exact version. the
lockfile (package-lock.json) saves the exact version of everything that got
installed, so running npm install always gives the same result on every
machine. without committing it, a teammate could later install a newer
version of something that behaves differently - and now it "works on my
machine" but breaks somewhere else, for a reason nobody can see just by
reading package.json.

q: if you chose pnpm, whats different about node_modules/disk usage? if
npm, what would you gain/lose switching to pnpm later?
i chose npm. what i would gain with pnpm on a bigger project: pnpm stores
one copy of each package version on disk and every project just links to
it, instead of duplicating it everywhere - saves disk space and makes
installs faster. it also stops a project from secretly using a package it
never actually listed as a dependency, which npm allows. what i would lose:
one more tool everyone (and ci) has to install, and some projects can break
the first time they switch, since pnpm organizes node_modules differently.


DEMO 2

vite is a tool that runs your app while youre working on it, and later
builds the finished version. its not something users ever see - its just
for development and building.

before changing anything, checked if vite needs any files moved. index.html
is already in the root folder, and every path in the code (like
"data/case.json") is written as a relative path, not something like
"/data/case.json". since everything was already relative, no files needed
to move.

added "dev": "vite" to package.json. ran npm run dev, it started a local
server (localhost:5173). opened that in the browser and clicked through all
5 views - dashboard, evidence (search and sort), people and locations tabs,
timeline, workspace (saved a hypothesis). everything worked exactly like
before, no errors in the console.

hmr means "hot module replacement" - vite can update part of the page live,
without reloading the whole thing.

how i tested this myself:
1. opened the app in the browser, left it running
2. edited styles.css - changed a background color
3. saved the file
4. watched the browser: the color changed immediately, no page reload
   happened (no white flash, page didnt reset)
5. reverted the css change back to original

i did not personally test what happens when a plain .js file changes - i
only tested the css case myself, everything else about js hmr falling back
to a full reload i know from the docs/from claude, not from testing it
myself.

q: whats the difference between the old way i ran this app and running it
through vite? name one thing vite does that a plain server doesnt.
a plain server just returns the file as-is. vite actually reads and
rewrites the file before sending it - it turned my import
"./data/data.js" into "/src/data/data.js" so the browser could load it.
vite also adds a small script to the page so it can push live updates
without me hitting refresh, which a plain server cant do at all.

q: what is hmr, and what did i actually see happen?
hmr means vite updates just the one file that changed, instead of reloading
the whole page. what i saw: i changed a color in the css file, and it
updated instantly with zero reload. i didnt personally test the js case,
but the general idea is that without extra setup, a plain js file change
causes a full reload instead, same as pressing f5.

q: why does this app (already split into modules from exercise 1) work so
easily with vite compared to the old single-script version?
vite works by following import statements - it needs to know which file
imports which other file. since exercise 1 already split everything into
separate files with import/export, vite could immediately see how they all
connect, without me setting anything up. the old version was one single
script with no imports at all, so there wouldve been nothing for vite to
follow or understand.


DEMO 3

dist/ (short for "distribution") is the folder vite build creates - its the
finished, ready-to-ship version of the app, meant for real users, not for
me to edit.

before building, i had to decide something: vite build only copies a
public/ folder into dist/ automatically, it doesnt know about other
top-level folders. so data/ and assets/ became public/data/ and
public/assets/ (used git mv so the file history stays). since every path in
the code was already relative, nothing else needed to change - those paths
work exactly the same in dev and in the build.

added "build" and "preview" scripts. ran the build - vite turns the whole
app into 3 files inside dist/: index.html, one js file with all the app
logic bundled together, one css file with all the styles bundled together.
data/ and assets/ get copied over unchanged. before, the browser had to
load 16+ separate files - now its just these 3.

compared source vs build: the 12 separate js files under src/ (46.9kb
total) become one single 23.4kb file - about half the size, because
comments and extra whitespace get removed and variable names get
shortened. css went from 14.5kb to 11.4kb the same way. filenames also
change - dashboard.js and the others disappear and get replaced by one file
like index-DtxdhrP5.js, with a hash added to the name.

how i tested this myself:
ran npm run build myself, then ls dist/ - saw index.html, an assets folder,
and data/. then ls dist/assets/ - saw the two actual bundled files,
index-DtxdhrP5.js and index-ZAWMSz9M.css, exactly matching what the build
output said it created. ran npm run preview myself (a different command
from the dev server - it serves exactly whats inside dist/, nothing else),
opened the url it gave me, and clicked through the app - everything worked
exactly like in dev mode, confirming the bundled version behaves
identically, just packaged differently.

q: name at least three things vite does when building for production.
1. bundling - 12 separate files become 1 file, so the browser loads one
script instead of many. 2. minification - the file is about half the size,
comments and spacing removed, variable names shortened. 3. hashed filenames
- files get a name like index-DtxdhrP5.js instead of their normal name,
with a hash based on the file content.

q: why do production filenames usually include a content hash?
if every deploy used the same filename, browsers (or caches) that already
saved the old file might keep using it and never notice a new version
exists - so users could keep running old, broken code after a fix ships. a
content hash means the filename changes whenever the file changes, so its
always a new url that was never cached before. this way the hashed files
can be cached forever (they never change), while index.html always points
to whatever the current hash is, so users always get the latest version.

q: why would you never deploy the dev server itself to real users?
the dev server transforms files live, on every request, instead of doing it
once ahead of time - so every real visitor would pay that cost. it also
ships things a real deployment shouldnt: readable, unminified code with
real variable names, plus dev-only extras like the hmr connection and
detailed error messages, none of which a public site should expose or
need.


DEMO 4

a linter is a tool that reads your code and warns you about things that
look like mistakes - like a variable you created but never actually use
anywhere. it doesnt run the code, it just reads it and looks for patterns
that usually mean something is wrong.

a formatter only changes how the code looks - spacing, quotes, line breaks
- without changing what it does. pure cosmetics.

used eslint as the linter, prettier as the formatter. both go in
devDependencies since neither one ships to the user, theyre only tools i
use while working.

added the required scripts to package.json:
- npm run lint -> checks the code, reports problems, doesnt change anything
- npm run lint:fix -> checks and fixes what it safely can
- npm run format -> rewrites formatting across the project

ran npm run lint first and it found a real problem right away:
currentPeopleTab in src/views/people.js was set but never used anywhere
else in the file. deleted it. ran npm run lint again, no more errors.

ran npm run format next, it rewrote 11 files - just quotes, spacing, line
wrapping. nothing about how the code works changed. clicked through all 5
views again after, same as before, no console errors.

how i tested this myself:
1. added a fake line to a file: const testUnused = 123;
2. ran npm run lint in the terminal
3. it printed exactly this: "'testUnused' is assigned a value but never
   used  no-unused-vars" - so i saw live how the linter reports a real
   problem
4. deleted that line, ran lint again, back to no errors
5. added another fake line with messy formatting:
   const   testFormat="hello";
6. ran npm run format
7. the file came back as: const testFormat = "hello"; - spacing and quotes
   auto-fixed
8. deleted that line too

this showed me the actual difference: lint only reports, it never touches
my files by itself. format actually rewrites the file on disk.

q: whats the difference between what a linter checks and what a formatter
checks? give one real example of each.
linter = looks for actual mistakes in the code, understands what the code
does. formatter = only cares about how it looks, doesnt understand the
code at all. example from this project: eslint found currentPeopleTab
being unused (a real issue). prettier found messy quotes and spacing
everywhere (just style, not a bug).

q: why are lint and lint:fix separate scripts instead of one that always
auto-fixes? when would i want the version that doesnt fix anything?
because eslint cant always know the right fix. with an unused variable, it
doesnt know if i forgot to use it, or if i should just delete it - thats a
decision a person has to make. plain lint only reports problems and never
touches files, so its safe to use in ci to block a bad pull request without
changing anyones code. lint:fix actually rewrites files, so thats for my
own terminal when im fine with it editing things right away.

q: what does npm run lint actually do, and would it still work if eslint
was only installed on my computer globally, not in this project?
npm run lint looks up "lint" in package.jsons scripts, finds "eslint .",
and runs it using this projects own installed eslint (not some other
version on my system). it would technically still work with only a global
eslint, but then every teammate and ci machine would need to install the
exact same version themselves by hand, and different versions could give
different results on the same code. installing it as a project dependency
means everyone always uses the same version automatically.


DEMO 5

typescript is javascript with an extra layer added on top: you can write
down what type of value something is supposed to be (a string, a number, an
object with certain fields), and a separate tool called the "type checker"
reads your whole codebase and tells you if something doesnt match what you
said it should be - before the code ever actually runs. plain javascript
never checks this, it just tries to run whatever you wrote and fails (or
does something weird) at runtime if the types dont actually match.

typecheck means "run the type checker and see if anything is wrong,
without actually building or running the app". the command for that is
tsc --noEmit - tsc is typescripts own compiler, and --noEmit means "just
check for errors, dont produce any output files", since vite is the one
actually building the app, not tsc.

why i wired typescript into both the dev and build scripts (task 3): if
type checking only ever ran inside my editor, it would only catch problems
while i personally have the file open and my editor happens to be
configured right. wiring it into dev and build means the check runs no
matter who is working on the code, no matter what editor they use, and
specifically for build: if there's a type error, the production build now
actually fails and refuses to produce a working dist/ - so a type mistake
can never silently ship, it has to get fixed first.

installed typescript and wrote tsconfig.json by hand instead of copying one
- went with "strict": true and nothing extra beyond it (deliberately
skipped noUncheckedIndexedAccess, which would flag every array[i] access
across the whole codebase as possibly-undefined; this app does that
constantly with plain for loops, and cleaning all of that up is way more
than this one demo needs given the time budget - strict alone is already a
real, defensible line to draw). also set allowJs: true (so the .ts files i
write now can still import the rest of the app's .js files, since most of
it wont be converted until demo 7) and checkJs: false (so tsc doesnt try to
strictly typecheck the untouched .js files internals, only the .ts ones),
noEmit: true since vite is the one actually compiling, tsc is only here to
check types, and moduleResolution: "bundler" which is what actually lets an
import like "../utils/format.js" keep resolving correctly even after the
real file becomes format.ts (confirmed this works myself - didnt have to
touch a single import statement anywhere else in the app).

converted the two files in src/utils/ - format.js and lookups.js, exactly
the "formatting and lookup helpers" example from the task. format.ts was
easy, zero dependencies, just added parameter types and let the return
types infer themselves. lookups.ts was harder since it reads from state.js,
which is still a plain untyped .js file until demo 6/7 give it real types -
so state.allEvidence etc are just [] with no type info, which ts treats as
any[] by default. to keep this file honestly typed (not secretly leaking
any through an untyped import), i wrote three small local interfaces
scoped to exactly what these 4 functions need - WithId, EvidenceLike,
PersonLike - and used those instead. this is deliberately narrow, not the
real domain model demo 6 builds - just enough of a shape for this one file
to be honestly typed today.

how i tested this myself:
1. added a fake line to format.ts: const testTypeError: string = 123;
2. ran npm run typecheck
3. it printed a real error: "Type 'number' is not assignable to type
   'string'" pointing at the exact line
4. deleted the line, ran typecheck again, back to clean

this confirmed the whole point of task 3: typescript actually catches this
kind of mistake through the terminal command, not just visually in the
editor. reran the same 5-view browser check from previous demos afterward
too - identical behavior, zero console errors, so none of this changed how
the app actually works, only what gets checked before it runs.

q: what does strict actually turn on? name two individual checks. did you
keep it on and why?
strict is a bundle of several separate checks turned on at once, not just
one thing. two i can name: noImplicitAny (a value ts cant figure out the
type of, that you also didnt annotate, becomes an error instead of quietly
becoming "any") and strictNullChecks (undefined and null stop being
silently allowed everywhere, so i actually have to handle the case where a
value might be missing). kept strict on - the whole point of this exercise
is real type safety, and noImplicitAny specifically is the one flag that
actually enforces "no any" from task 2 - without it, "no any" is just a
promise nobody is checking.

q: whats the difference between a compile-time type error and the runtime
bugs from exercise 1? could typescript alone have caught any of them?
a type error gets caught by tsc before the code ever runs, just from
reading the shapes of things. a runtime bug only shows up once that exact
line of code actually runs with the exact bad input that triggers it -
which is why exercise 1s bugs needed manual clicking around to even
notice them. could typescript alone have caught them? bug B (sort dropdown
doing nothing) - no, both sides were completely valid arrays, ts has no way
to know the order of function calls was logically wrong. bug D (var in a
loop closing over the wrong value) - also no, thats a scoping bug, not a
type mismatch, var and let have the exact same type. the reference-vs-copy
bug (demo 2) is the closest case - ts wouldnt flag the assignment itself
since both sides are the same type, but strict mode could catch related
bugs downstream if something expected the two arrays to actually be
independent copies. mostly though, these were logic bugs, not type bugs -
typescript checks that your types match up, it doesnt check that your
logic actually does what you meant.

q: what does any do to typescripts checking? why avoid it here even though
it would have been faster?
any turns off typescripts checking completely for that value - once
something is any, ts stops checking anything you do with it, and it
spreads: anything that touches an any value also silently becomes any,
instead of staying contained to one spot. avoided it here because the
whole point of this first pass was proving these files are honestly typed,
not just quiet about it - lookups.ts (reading from state.js's untyped
arrays) was exactly the kind of place where any would have been the easy
shortcut, and writing three small interfaces instead was barely more work,
but kept typescript actually checking these functions instead of just
trusting them blindly.


DEMO 6

before writing any types i actually inspected all 5 json files in public/data/ with a script instead of guessing - dumped one sample record from each file, then checked all records in evidence.json and timeline.json for consistent keys and for the actual set of values each "enum-like" field takes (status, relevance, type, certainty). every file turned out to have exactly one consistent key shape (no optional fields to model), which was good news. but the value check surfaced something real: evidence.json's status field has both "unreviewed" and "Reviewed" (capital r), and relevance has both "unknown" and "Unknown" - inconsistent casing in the actual data. that mattered directly for how i typed those fields (see question 3 below).

wrote src/types.ts with interfaces for CaseInfo, Person, Location, Evidence, and TimelineEvent, matching the real json shapes exactly (field names/types taken from the actual sample records, not from what i assumed the app needed), plus PersonId/LocationId/EvidenceId as string aliases for readability at call sites.

then picked the one genuinely ambiguous field, like the task asked: Evidence.personIds. before writing the CHANGES.md answer i actually checked what's really in there across all 18 evidence items (not just trusting my memory of the code) - and it's a real mix: most entries use the person's id ("patch-vector", "kernel-colt", "nova-byte", ...) but E04 specifically has "Nova Byte" (display name, capitalized, with a space) while E05 has "nova-byte" (the id) for that exact same person. confirmed against people.json: nova-byte's real id is "nova-byte", real name is "Nova Byte" - so E04 and E05 are both genuinely about her, just spelled two different ways. this is exactly why evidenceMentionsPerson (from demo 5) has to check both ev.personIds.indexOf(person.id) and ev.personIds.indexOf(person.name) - it's not defensive-programming paranoia, it's a real workaround for real inconsistent source data.

converted src/data/data.ts (renamed from data.js) to actually use these types: added a small getJson<T>(url) helper (fetch + .json() cast to Promise<T>) so each loader gets a real typed result - state.allPeople = await getJson<Person[]>(...) instead of an untyped await res.json(). hit one real blocker doing this: state.js is still a plain .js file (state.js is demo 7's job, not this one), and typescript infers its empty array properties (allEvidence: [], allPeople: [], etc) as literally never[] since nothing in state.js itself ever pushes to them - so assigning a real Person[] into state.allPeople failed to typecheck. fixed it without touching or renaming state.js: added src/state/state.d.ts, a hand-written "shadow" declaration file next to it that just declares the real shape of the default export. typescript picks the .d.ts over inferring from the .js when both exist for the same module, so data.ts's typed loads now land somewhere real instead of silently widening back to any the moment they touch state. this file goes away once state.js is genuinely converted to state.ts in demo 7.

also went back and updated lookups.ts (from demo 5) to import the real Evidence/Person/Location types from types.ts instead of the three narrow placeholder interfaces i wrote there last demo specifically as a stand-in for this - said i'd do this in the demo 5 commit message, so did it now instead of leaving it.

verified: npx tsc --noEmit clean, npm run build succeeds, npm run dev shows "[TypeScript] No errors" in the terminal, lint and format both still pass, and the same 5-view headless-browser check as every previous demo shows identical behavior with zero console errors - typing the data layer didn't change what the app does.

q: walk through the ambiguous field - how did js get away without deciding on a shape, what did ts force you to commit to?
plain js never has to decide what "should" be in an array, it just calls .indexOf() on whatever's actually there at runtime, so evidenceMentionsPerson checking both id and name "just worked" for every record without anyone ever noticing the inconsistency was there - the loose typing hid the bug in plain sight. giving personIds an actual type (PersonId[], i.e. string[] with intent) forces you to pick one meaning for what belongs in that array. i typed it as PersonId, committing to "this should always be an id" - which doesn't retroactively fix E04's data (ts has no way to validate the contents of a json file at compile time), but it does make the mismatch visible and documented instead of silently tolerated: the type now says one thing, evidenceMentionsPerson's dual .indexOf() check now visibly contradicts it, and i had to write a comment explaining why the "wrong" code is still there instead of just leaving it unremarked like the js version did.

q: is there a data-shape problem here ts's static types cant catch on their own, because the bad data only shows up at runtime from a json file, not your code? what else would you need?
yes, and i hit a second one of these for real while inspecting the files: evidence.json's status field has both "unreviewed" and "Reviewed" (capital r) across different records, and relevance has both "unknown" and "Unknown". if id typed status as a strict union like "unreviewed" | "reviewed" | "flagged", that type would be a straight-up lie about several real evidence records the moment fetch().json() returns them - ts would never catch this, because res.json() returns Promise<any> and casting/annotating that result to a type is something ts trusts you on by construction, it doesnt inspect the actual bytes coming back over the network. thats exactly why i typed status/relevance as plain string instead of a strict union - a strict union here would have been type safety theater, claiming a guarantee the data doesnt keep. what youd actually need to catch this for real is runtime validation - something like zod or a manual shape-check function that runs against the real parsed json after fetch and either normalizes or rejects bad values, instead of trusting a compile-time-only type assertion.

q: difference between an interface and a type alias for an object shape? which did you use, does it matter here?
both can describe the same object shape and for the plain data records here (Person, Evidence, etc) they're functionally interchangeable - the practical differences (interfaces can be reopened/merged across declarations, type aliases can describe unions/primitives/mapped types that interfaces cant) don't come up for a flat "these fields, these types" record. i used interface for the 5 domain shapes (CaseInfo, Person, Location, Evidence, TimelineEvent) and type for the 3 id aliases (PersonId, LocationId, EvidenceId = string), which is really just following the common convention - type for a simple alias to an existing type, interface for an object shape - rather than a decision that changes behavior here. doesnt actually matter for this codebase either way.