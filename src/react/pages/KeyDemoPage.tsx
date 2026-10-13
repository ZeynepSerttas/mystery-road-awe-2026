// THROWAWAY DEMO for Exercise 4, Demo 4. Not part of the real app.
// Open it with /react/#key-demo
import { useState } from "react";
import Panel from "../components/Panel";

type DemoItem = {
  id: string;
  name: string;
};

const startItems: DemoItem[] = [
  { id: "nova-byte", name: "Nova Byte" },
  { id: "kernel-colt", name: "Kernel Colt" },
  { id: "patch-vector", name: "Patch Vector" },
  { id: "root-harbor", name: "Root Harbor" },
];

function KeyDemoPage() {
  const [items, setItems] = useState(startItems);

  function reverseOrder() {
    // slice() makes a copy. React needs a new array to notice the change.
    const reversed = items.slice().reverse();
    setItems(reversed);
  }

  return (
    <section className="view active">
      <h2>Key demo (not part of the app)</h2>
      <p className="hint-text">
        Type each person's name into their own box in both lists, then click "Reverse order".
      </p>
      <p>
        <button type="button" className="btn btn-primary" onClick={reverseOrder}>
          Reverse order
        </button>
      </p>

      <div className="workspace-grid">
        <Panel title="Wrong: key={index}">
          {items.map((item, index) => (
            // WRONG on purpose: the key is the position in the list, not the person
            <div key={index} className="mini-list-item">
              <label>
                {item.name} <input type="text" />
              </label>
            </div>
          ))}
        </Panel>

        <Panel title="Right: key={item.id}">
          {items.map((item) => (
            <div key={item.id} className="mini-list-item">
              <label>
                {item.name} <input type="text" />
              </label>
            </div>
          ))}
        </Panel>
      </div>
    </section>
  );
}

export default KeyDemoPage;
