import type { ViewName } from "../../types";
import MainNav from "./MainNav";

type AppHeaderProps = {
  currentView: ViewName;
};

function AppHeader(props: AppHeaderProps) {
  // BASE_URL is "/" in dev and "/mystery-road-awe-2026/" on GitHub Pages
  const logoUrl = import.meta.env.BASE_URL + "assets/logo/logo.svg";

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <img src={logoUrl} alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <h1>Project ReMotion</h1>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>
        <MainNav currentView={props.currentView} />
      </div>
    </header>
  );
}

export default AppHeader;
