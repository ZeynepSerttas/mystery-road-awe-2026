import type { TimelineEvent } from "../../../types";
import { formatDate } from "../../../utils/format";
import Panel from "../Panel";

type RecentTimelineListProps = {
  timeline: TimelineEvent[];
};

function RecentTimelineList(props: RecentTimelineListProps) {
  // slice() makes a copy, so reverse() does not change the original array
  const recentEvents = props.timeline.slice(-5).reverse();

  return (
    <Panel title="Recent timeline events">
      {recentEvents.length === 0 && <p>No timeline events loaded yet.</p>}
      {recentEvents.map((event) => (
        <div key={event.id} className="mini-list-item">
          <strong>{formatDate(event.time)}</strong>
          <br />
          {event.title}
        </div>
      ))}
    </Panel>
  );
}

export default RecentTimelineList;
