type StatCardProps = {
  value: number;
  label: string;
};

function StatCard(props: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-value">{props.value}</div>
      <div className="stat-label">{props.label}</div>
    </div>
  );
}

export default StatCard;
