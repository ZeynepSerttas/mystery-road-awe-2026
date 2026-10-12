import type { Evidence, Person } from "../../types";
import type { CaseData } from "../loadCaseData";
import PersonCard from "../components/people/PersonCard";
import LocationCard from "../components/people/LocationCard";

export type PeopleTab = "people" | "locations";

type PeopleLocationsPageProps = {
  data: CaseData;
  activeTab: PeopleTab;
};

// evidence.json is not consistent: most items use the person id ("nova-byte"),
// but some use the display name ("Nova Byte"). So check both.
function countEvidenceForPerson(evidence: Evidence[], person: Person): number {
  let count = 0;
  for (const item of evidence) {
    if (item.personIds.includes(person.id) || item.personIds.includes(person.name)) {
      count++;
    }
  }
  return count;
}

function PeopleLocationsPage(props: PeopleLocationsPageProps) {
  const isPeopleTab = props.activeTab === "people";

  return (
    <section className="view active">
      <h2>People &amp; Locations</h2>

      {/* The tabs are links, so the URL decides which tab is shown */}
      <div className="tab-bar">
        <a href="#people" className={isPeopleTab ? "tab-btn active" : "tab-btn"}>
          People
        </a>
        <a href="#locations" className={isPeopleTab ? "tab-btn" : "tab-btn active"}>
          Locations
        </a>
      </div>

      {isPeopleTab ? (
        <div className="people-grid">
          {props.data.people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              evidenceCount={countEvidenceForPerson(props.data.evidence, person)}
            />
          ))}
        </div>
      ) : (
        <div className="locations-grid">
          {props.data.locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PeopleLocationsPage;
