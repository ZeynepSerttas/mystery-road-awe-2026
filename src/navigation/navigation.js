// URL-hash routing. navigateTo just sets the hash; handleHashChange
// (still in main.js until the navigation phase) reacts to the change.

export function navigateTo(viewName) {
  window.location.hash = viewName;
  // handleHashChange() will pick this up via the hashchange listener
}
