import { useEffect, useState } from "react";
import type { ViewName } from "../types";
import AppHeader from "./components/AppHeader";
import type { CaseData } from "./loadCaseData";
import DashboardPage from "./pages/DashboardPage";
import EvidencePage from "./pages/EvidencePage";
import PeopleLocationsPage from "./pages/PeopleLocationsPage";
import type { PeopleTab } from "./pages/PeopleLocationsPage";
import TimelinePage from "./pages/TimelinePage";
import WorkspacePage from "./pages/WorkspacePage";

const validViews: ViewName[] = ["dashboard", "evidence", "people", "timeline", "workspace"];

// Reads the view from a hash, e.g. "#people" -> "people".
// Anything unknown (or no hash at all) falls back to the dashboard.
function getViewFromHash(hash: string): ViewName {
  const name = hash.replace("#", "");
  // Locations is a tab inside the People & Locations page
  if (name === "locations") {
    return "people";
  }
  for (const view of validViews) {
    if (view === name) {
      return view;
    }
  }
  return "dashboard";
}

type AppProps = {
  data: CaseData;
};

function App(props: AppProps) {
  // The whole hash is kept, not just the view, because "#people" and
  // "#locations" are the same view but different tabs
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Listen for hash changes (nav clicks, links, back/forward button)
  useEffect(() => {
    function handleHashChange() {
      setCurrentHash(window.location.hash);
    }

    window.addEventListener("hashchange", handleHashChange);

    // Remove the listener again when App is removed from the page
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const currentView = getViewFromHash(currentHash);

  let activeTab: PeopleTab = "people";
  if (currentHash === "#locations") {
    activeTab = "locations";
  }

  let page = <DashboardPage data={props.data} />;
  if (currentView === "evidence") {
    page = <EvidencePage />;
  } else if (currentView === "people") {
    page = <PeopleLocationsPage data={props.data} activeTab={activeTab} />;
  } else if (currentView === "timeline") {
    page = <TimelinePage data={props.data} />;
  } else if (currentView === "workspace") {
    page = <WorkspacePage />;
  }

  return (
    <>
      <AppHeader currentView={currentView} />
      <main className="app-main">{page}</main>
      <footer className="app-footer">
        <p>
          Project ReMotion Investigation Portal &mdash; Research Center AI, Software and IT-Security
          of HCW (fictional case study)
        </p>
        <p>React version, migration in progress.</p>
      </footer>
    </>
  );
}

export default App;
