import { createRoot } from "react-dom/client";
import App from "./App";
import LoadingOverlay from "./components/LoadingOverlay";
import { loadCaseData } from "./loadCaseData";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No #root element found in react/index.html");
}

const root = createRoot(rootElement);

async function start() {
  // Show the overlay first, then replace it with the app once the data is there
  root.render(<LoadingOverlay message="Loading case file…" />);

  try {
    const data = await loadCaseData();
    root.render(<App data={data} />);
  } catch (error) {
    console.error(error);
    root.render(
      <main className="app-main">
        <p>The case file could not be loaded. Please reload the page.</p>
      </main>,
    );
  }
}

start();
