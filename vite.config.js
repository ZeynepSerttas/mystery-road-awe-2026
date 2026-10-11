import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// GitHub Pages serves this as a project page under /mystery-road-awe-2026/,
// not at the domain root, so the production build needs assets referenced
// from that subpath. Dev/preview stay at "/" so local URLs don't change.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/mystery-road-awe-2026/" : "/",
  plugins: [react(), checker({ typescript: true })],
  build: {
    // Two pages during the migration: the vanilla app stays on index.html,
    // the React version lives on react/index.html (served as /react/).
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        react: resolve(import.meta.dirname, "react/index.html"),
      },
    },
  },
}));
