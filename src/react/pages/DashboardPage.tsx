import type { CaseData } from "../loadCaseData";
import CaseSummaryCard from "../components/dashboard/CaseSummaryCard";
import StatCard from "../components/dashboard/StatCard";
import ReviewProgress from "../components/dashboard/ReviewProgress";
import RecentEvidenceList from "../components/dashboard/RecentEvidenceList";
import RecentTimelineList from "../components/dashboard/RecentTimelineList";

type DashboardPageProps = {
  data: CaseData;
};

function DashboardPage(props: DashboardPageProps) {
  // Counted fresh on every render, not stored anywhere
  let reviewedCount = 0;
  for (const item of props.data.evidence) {
    if (item.status.toLowerCase() === "reviewed") {
      reviewedCount++;
    }
  }

  return (
    <section className="view active">
      <h2>Case Dashboard</h2>

      <div className="intro-card">
        <h3>How to use this portal</h3>
        <p>
          Everything gathered on the case so far is organised into four working views. Use the
          navigation bar at the top to move between them at any time.
        </p>
        <div className="howto-grid">
          <div className="howto-item">
            <h4>1. Evidence Catalogue</h4>
            <p>
              Search, filter, and sort every evidence item. Open one for full details, related
              people and locations, and to add a private note.
            </p>
            <a href="#evidence" className="btn btn-secondary btn-small">
              Go to Evidence
            </a>
          </div>
          <div className="howto-item">
            <h4>2. People & Locations</h4>
            <p>
              Read profiles and statements from the six team members involved, and look up the six
              key locations in the investigation.
            </p>
            <a href="#people" className="btn btn-secondary btn-small">
              Go to People & Locations
            </a>
          </div>
          <div className="howto-item">
            <h4>3. Timeline</h4>
            <p>
              Walk through events in chronological order, filter by person, location, or type, and
              jump straight to the evidence behind any event.
            </p>
            <a href="#timeline" className="btn btn-secondary btn-small">
              Go to Timeline
            </a>
          </div>
          <div className="howto-item">
            <h4>4. Investigator Workspace</h4>
            <p>
              Your bookmarked evidence and notes collect here. Draft a hypothesis — who you suspect,
              why, and how confident you are — it's saved automatically in your browser.
            </p>
            <a href="#workspace" className="btn btn-secondary btn-small">
              Go to Workspace
            </a>
          </div>
        </div>
      </div>

      <CaseSummaryCard caseInfo={props.data.caseInfo} />

      <div className="stat-grid">
        <StatCard value={props.data.evidence.length} label="Evidence items" />
        <StatCard value={props.data.people.length} label="People" />
        <StatCard value={props.data.locations.length} label="Locations" />
        <StatCard value={props.data.bookmarks.length} label="Bookmarked" />
        <StatCard value={reviewedCount} label="Reviewed" />
      </div>

      <ReviewProgress reviewedCount={reviewedCount} totalCount={props.data.evidence.length} />

      <div className="dashboard-columns">
        <RecentEvidenceList evidence={props.data.evidence} />
        <RecentTimelineList timeline={props.data.timeline} />
      </div>
    </section>
  );
}

export default DashboardPage;
