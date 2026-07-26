import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  // Relative asset paths: works served from a domain root or a subpath.
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
});
