import type { TimelineEvent } from "../../../types";
import { certaintyBadgeClass, formatDate } from "../../../utils/format";

type TimelineEventItemProps = {
  event: TimelineEvent;
  // Already turned into readable text by the page, e.g. "L01 - Robotics Lab"
  locationNames: string[];
};

function TimelineEventItem(props: TimelineEventItemProps) {
  const event = props.event;

  return (
    <div className={"timeline-event certainty-" + event.certainty}>
      <div className="timeline-time">
        {formatDate(event.time)} &middot;{" "}
        <span className={"badge badge-" + certaintyBadgeClass(event.certainty)}>
          {event.certainty}
        </span>
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {props.locationNames.length > 0 && (
        <p className="evidence-meta">Location: {props.locationNames.join(", ")}</p>
      )}
      {event.evidenceIds.length > 0 && (
        <p className="evidence-meta">Evidence: {event.evidenceIds.join(", ")}</p>
      )}
    </div>
  );
}

export default TimelineEventItem;
