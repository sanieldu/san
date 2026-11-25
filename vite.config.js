import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Each page is its own HTML entry; the React islands are shared.
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: ["index.html", "resume.html", "projects.html", "journal.html"] } },
});
