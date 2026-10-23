import { defineConfig } from "vite";

export default defineConfig({
  // Relative URLs keep the production build working at /enjaz/ on GitHub Pages.
  base: "./",
  server: {
    host: "0.0.0.0",
    allowedHosts: true
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true
  },
  build: {
    target: "es2022",
    cssCodeSplit: true
  }
});
