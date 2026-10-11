import type { ViewName } from "../../types";

type MainNavProps = {
  currentView: ViewName;
};

const navItems: { view: ViewName; label: string }[] = [
  { view: "dashboard", label: "Dashboard" },
  { view: "evidence", label: "Evidence" },
  { view: "people", label: "People & Locations" },
  { view: "timeline", label: "Timeline" },
  { view: "workspace", label: "Workspace" },
];

function MainNav(props: MainNavProps) {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        let className = "nav-btn";
        if (item.view === props.currentView) {
          className = "nav-btn active";
        }

        return (
          <button
            key={item.view}
            type="button"
            className={className}
            // Only change the hash. App listens for hashchange and switches the page.
            onClick={() => {
              window.location.hash = item.view;
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default MainNav;
