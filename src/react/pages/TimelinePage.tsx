import type { Location } from "../../types";
import type { CaseData } from "../loadCaseData";
import TimelineEventItem from "../components/timeline/TimelineEventItem";

type TimelinePageProps = {
  data: CaseData;
};

// Turns location ids into readable text, e.g. "L01 - Robotics Lab".
// If an id is unknown, just show the id.
function getLocationNames(locationIds: string[], locations: Location[]): string[] {
  const names: string[] = [];
  for (const id of locationIds) {
    const location = locations.find((loc) => loc.id === id);
    if (location) {
      names.push(location.id + " - " + location.name);
    } else {
      names.push(id);
    }
  }
  return names;
}

function TimelinePage(props: TimelinePageProps) {
  const events = props.data.timeline;

  // Every event type once, for the type dropdown
  const eventTypes: string[] = [];
  for (const event of events) {
    if (!eventTypes.includes(event.type)) {
      eventTypes.push(event.type);
    }
  }

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>

      {/* The filters are only shown for now. They have no onChange yet,
          so changing them does not filter anything (comes in Exercise 5). */}
      <div className="toolbar">
        <div className="toolbar-row">
          <label htmlFor="timelineOrder" className="visually-hidden">
            Order
          </label>
          <select id="timelineOrder" defaultValue="asc">
            <option value="asc">Oldest first</option>
            <option value="desc">Newest first</option>
          </select>

          <label htmlFor="timelinePersonFilter" className="visually-hidden">
            Filter by person
          </label>
          <select id="timelinePersonFilter" defaultValue="">
            <option value="">All people</option>
            {props.data.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <label htmlFor="timelineLocationFilter" className="visually-hidden">
            Filter by location
          </label>
          <select id="timelineLocationFilter" defaultValue="">
            <option value="">All locations</option>
            {props.data.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.id}
              </option>
            ))}
          </select>

          <label htmlFor="timelineTypeFilter" className="visually-hidden">
            Filter by event type
          </label>
          <select id="timelineTypeFilter" defaultValue="">
            <option value="">All event types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* timeline.json is already sorted oldest first, which matches "Oldest first" */}
      <div className="timeline-container">
        {events.length === 0 && <p>No timeline events match the current filters.</p>}
        {events.map((event) => (
          <TimelineEventItem
            key={event.id}
            event={event}
            locationNames={getLocationNames(event.locationIds, props.data.locations)}
          />
        ))}
      </div>
    </section>
  );
}

export default TimelinePage;
