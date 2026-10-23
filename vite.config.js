import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "app"),
  publicDir: resolve(projectRoot, "public"),
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
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    target: "es2022",
    cssCodeSplit: true
  }
});
