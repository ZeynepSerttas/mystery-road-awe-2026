import type { TimelineEvent } from "../../../types";
import { formatDate } from "../../../utils/format";

type RecentTimelineListProps = {
  timeline: TimelineEvent[];
};

function RecentTimelineList(props: RecentTimelineListProps) {
  // slice() makes a copy, so reverse() does not change the original array
  const recentEvents = props.timeline.slice(-5).reverse();

  return (
    <div className="dashboard-panel">
      <h3>Recent timeline events</h3>
      {recentEvents.length === 0 && <p>No timeline events loaded yet.</p>}
      {recentEvents.map((event) => (
        <div key={event.id} className="mini-list-item">
          <strong>{formatDate(event.time)}</strong>
          <br />
          {event.title}
        </div>
      ))}
    </div>
  );
}

export default RecentTimelineList;
