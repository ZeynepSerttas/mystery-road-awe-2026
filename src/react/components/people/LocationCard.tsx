import type { Location } from "../../../types";

type LocationCardProps = {
  location: Location;
};

function LocationCard(props: LocationCardProps) {
  const location = props.location;

  return (
    <div className="location-card">
      <h3>
        {location.id} &mdash; {location.name}
      </h3>
      <p>{location.description}</p>
      <p>
        <strong>Contains:</strong>
      </p>
      <ul>
        {location.contains.map((thing) => (
          // No ids here, but each text is unique within one location
          <li key={thing}>{thing}</li>
        ))}
      </ul>
    </div>
  );
}

export default LocationCard;
