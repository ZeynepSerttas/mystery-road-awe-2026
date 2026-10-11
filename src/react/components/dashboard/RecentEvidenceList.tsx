import type { Evidence } from "../../../types";
import { getStatusBadgeClass } from "../../../utils/format";

type RecentEvidenceListProps = {
  evidence: Evidence[];
};

function RecentEvidenceList(props: RecentEvidenceListProps) {
  // slice() makes a copy, so reverse() does not change the original array
  const recentEvidence = props.evidence.slice(-5).reverse();

  return (
    <div className="dashboard-panel">
      <h3>Recent evidence</h3>
      {recentEvidence.length === 0 && <p>No evidence loaded yet.</p>}
      {recentEvidence.map((item) => (
        <div key={item.id} className="mini-list-item">
          <strong>{item.id}</strong> &mdash; {item.title}{" "}
          <span className={"badge " + getStatusBadgeClass(item.status)}>{item.status}</span>
        </div>
      ))}
    </div>
  );
}

export default RecentEvidenceList;
