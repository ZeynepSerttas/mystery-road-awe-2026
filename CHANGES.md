DEMO 1

For demo 1 i split app.js into separate js modules using type="module", no bundler or build step, just plain files loaded directly by the browser. its a pure refactor, not fixing any bugs or adding anything, the app has to work exactly the same before and after, i checked this in live server after every phase.

i split it into: main.js as the entry point (wires up the event listeners and starts everything), state.js which holds all the state that more than one file needs to know about, navigation.js for the url routing, data.js for the fetch calls, storage.js for everything that touches localStorage, two small utils files for pure helper functions, and one file per page (dashboard, evidence, people, timeline, workspace) for their rendering code. stuff that was only used by one file i just kept local to that file instead of putting it in state.js.

index.html still has old inline onclick attributes and since modules dont expose their functions globally anymore, i had to manually put the ones it needs onto window inside main.js so they still work without touching the html.

theres also a few things i noticed are actually broken (the evidence list gets stuck loading forever, filteredEvidence being literally the same array as allEvidence, hashchange getting registered twice and the json files loading one after another instead of together) that im intentionally not fixing right now because i think i need at least some of these for the later demos.

one thing i did out of the planned order: navigateTo was meant to move into navigation.js at the end together with handleHashChange, but the people, timeline and workspace views all call navigateTo, and i didnt want those view files importing from main.js even temporarily just to get it. so i moved navigateTo into navigation.js first, on its own commit, and left handleHashChange in main.js until the navigation phase like planned.