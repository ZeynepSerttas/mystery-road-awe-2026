import { useEffect, useState } from "react";
import type { ViewName } from "../types";
import AppHeader from "./components/AppHeader";
import type { CaseData } from "./loadCaseData";
import DashboardPage from "./pages/DashboardPage";
import EvidencePage from "./pages/EvidencePage";
import PeoplePage from "./pages/PeoplePage";
import TimelinePage from "./pages/TimelinePage";
import WorkspacePage from "./pages/WorkspacePage";

const validViews: ViewName[] = ["dashboard", "evidence", "people", "timeline", "workspace"];

// Reads the view from the URL hash, e.g. "#people" -> "people".
// Anything unknown (or no hash at all) falls back to the dashboard.
function getViewFromHash(): ViewName {
  const hash = window.location.hash.replace("#", "");
  for (const view of validViews) {
    if (view === hash) {
      return view;
    }
  }
  return "dashboard";
}

type AppProps = {
  data: CaseData;
};

function App(props: AppProps) {
  const [currentView, setCurrentView] = useState(getViewFromHash());

  // Listen for hash changes (nav clicks, links, back/forward button)
  useEffect(() => {
    function handleHashChange() {
      setCurrentView(getViewFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);

    // Remove the listener again when App is removed from the page
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  let page = <DashboardPage data={props.data} />;
  if (currentView === "evidence") {
    page = <EvidencePage />;
  } else if (currentView === "people") {
    page = <PeoplePage />;
  } else if (currentView === "timeline") {
    page = <TimelinePage />;
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
