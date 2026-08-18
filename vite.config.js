import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // Relative base so the same build works whether it's served from a
  // domain root (Netlify/Vercel) or a GitHub Pages project subpath
  // (github.io/user/repo/) — the deploy target isn't known at build time.
  base: "./",
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        dashboard: resolve(import.meta.dirname, "dashboard.html"),
        about: resolve(import.meta.dirname, "about.html"),
      },
    },
  },
});
