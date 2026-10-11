import type { CaseInfo } from "../../../types";

type CaseSummaryCardProps = {
  caseInfo: CaseInfo;
};

function CaseSummaryCard(props: CaseSummaryCardProps) {
  return (
    <div className="case-summary-card">
      <h3>{props.caseInfo.title}</h3>
      <p>
        <span className="badge badge-flagged">{props.caseInfo.status.toUpperCase()}</span>
      </p>
      <p>{props.caseInfo.summary}</p>
    </div>
  );
}

export default CaseSummaryCard;
