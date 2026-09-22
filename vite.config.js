import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// GitHub Pages serves this as a project page under /mystery-road-awe-2026/,
// not at the domain root, so the production build needs assets referenced
// from that subpath. Dev/preview stay at "/" so local URLs don't change.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/mystery-road-awe-2026/" : "/",
  plugins: [checker({ typescript: true })],
}));
