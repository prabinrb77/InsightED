import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves the site from /InsightED-/ instead of the domain root
  base: process.env.GITHUB_PAGES ? "/InsightED-/" : "/",
  plugins: [react()],
});
