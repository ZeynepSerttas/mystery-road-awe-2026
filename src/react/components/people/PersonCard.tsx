import type { Person } from "../../../types";

type PersonCardProps = {
  person: Person;
  evidenceCount: number;
};

function PersonCard(props: PersonCardProps) {
  const person = props.person;
  // The avatar path in people.json is relative, so put the base path in front
  const avatarUrl = import.meta.env.BASE_URL + person.avatar;

  return (
    <div className="person-card">
      <div className="person-card-header">
        <img className="person-avatar" src={avatarUrl} alt={"Portrait of " + person.name} />
        <div>
          <h3>{person.name}</h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>
      <ul>
        {person.responsibilities.map((responsibility) => (
          // No ids here, but each text is unique within one person
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>
      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>
      <p>
        {props.evidenceCount} related evidence {props.evidenceCount === 1 ? "item" : "items"}
      </p>
    </div>
  );
}

export default PersonCard;
