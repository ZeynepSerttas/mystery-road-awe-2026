import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  // Whatever is written between <Panel> and </Panel>
  children: ReactNode;
};

// A white box with a heading. It does not care what goes inside.
function Panel(props: PanelProps) {
  return (
    <div className="dashboard-panel">
      <h3>{props.title}</h3>
      {props.children}
    </div>
  );
}

export default Panel;
