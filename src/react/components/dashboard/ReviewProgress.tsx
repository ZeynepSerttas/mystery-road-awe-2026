import Panel from "../Panel";

type ReviewProgressProps = {
  reviewedCount: number;
  totalCount: number;
};

function ReviewProgress(props: ReviewProgressProps) {
  // Calculated on every render from the props, so it can never be out of date
  let percent = 0;
  if (props.totalCount > 0) {
    percent = Math.round((props.reviewedCount / props.totalCount) * 100);
  }

  return (
    <Panel title="Review progress">
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: percent + "%" }}></div>
      </div>
      <p>{percent}% of evidence reviewed</p>
    </Panel>
  );
}

export default ReviewProgress;
